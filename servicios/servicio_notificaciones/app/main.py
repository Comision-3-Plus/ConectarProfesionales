"""
Servicio de Notificaciones
Emails, push notifications y gamificación
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr

from shared.core.database import get_db
from shared.core.security import get_current_user, get_current_active_user
from shared.models.user import User
from shared.models.professional import Professional
from shared.services.email_service import EmailService
from shared.services.gamificacion_service import GamificacionService, get_gamificacion_service

app = FastAPI(
    title="Servicio de Notificaciones",
    version="1.0.0",
    description="Emails, push notifications y gamificación"
)

email_service = EmailService()

# ============================================================================
# SCHEMAS
# ============================================================================

class EmailNotification(BaseModel):
    to_email: EmailStr
    subject: str
    body: str
    html: Optional[str] = None

class PushNotification(BaseModel):
    user_id: int
    title: str
    body: str
    data: Optional[dict] = None

class GamificationEvent(BaseModel):
    user_id: int
    event_type: str  # "trabajo_completado", "resena_5_estrellas", etc.
    metadata: Optional[dict] = None

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "servicio": "notificaciones"}

# ============================================================================
# EMAIL ENDPOINTS
# ============================================================================

@app.post("/notifications/email/send")
async def send_email(
    email_data: EmailNotification,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user)
):
    """Envía un email (solo admin o sistema)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden enviar emails"
        )
    
    try:
        # Enviar en background para no bloquear
        background_tasks.add_task(
            email_service.send_email,
            to_email=email_data.to_email,
            subject=email_data.subject,
            body=email_data.body,
            html=email_data.html
        )
        
        return {"message": "Email programado para envío"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al programar email: {str(e)}"
        )

@app.post("/notifications/email/welcome")
async def send_welcome_email(
    user_email: EmailStr,
    user_name: str,
    background_tasks: BackgroundTasks
):
    """Envía email de bienvenida a un nuevo usuario"""
    
    try:
        background_tasks.add_task(
            email_service.send_welcome_email,
            to_email=user_email,
            user_name=user_name
        )
        
        return {"message": "Email de bienvenida programado"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al programar email de bienvenida: {str(e)}"
        )

@app.post("/notifications/email/password-reset")
async def send_password_reset_email(
    user_email: EmailStr,
    reset_token: str,
    background_tasks: BackgroundTasks
):
    """Envía email de recuperación de contraseña"""
    
    try:
        background_tasks.add_task(
            email_service.send_password_reset_email,
            to_email=user_email,
            reset_token=reset_token
        )
        
        return {"message": "Email de reset programado"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al programar email de reset: {str(e)}"
        )

@app.post("/notifications/email/trabajo-created")
async def send_trabajo_created_email(
    cliente_email: EmailStr,
    profesional_email: EmailStr,
    trabajo_id: int,
    monto: float,
    background_tasks: BackgroundTasks
):
    """Envía notificación de nuevo trabajo creado"""
    
    try:
        # Email al cliente
        background_tasks.add_task(
            email_service.send_email,
            to_email=cliente_email,
            subject="✅ Trabajo creado - Procede al pago",
            body=f"Tu trabajo #{trabajo_id} ha sido creado. Monto: ${monto}. Procede al pago para que el profesional comience."
        )
        
        # Email al profesional
        background_tasks.add_task(
            email_service.send_email,
            to_email=profesional_email,
            subject="🎉 Nuevo trabajo asignado",
            body=f"Te han asignado un nuevo trabajo #{trabajo_id}. Monto: ${monto}. Espera a que el cliente realice el pago."
        )
        
        return {"message": "Emails de trabajo creado programados"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al programar emails: {str(e)}"
        )

# ============================================================================
# PUSH NOTIFICATIONS ENDPOINTS
# ============================================================================

@app.post("/notifications/push/send")
async def send_push_notification(
    push_data: PushNotification,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Envía una notificación push (solo admin)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden enviar push notifications"
        )
    
    # Aquí iría la integración con Firebase Cloud Messaging (FCM)
    # o el servicio de push notifications que estés usando
    
    try:
        # Por ahora solo registramos
        print(f"📱 Push notification to user {push_data.user_id}: {push_data.title}")
        
        return {
            "message": "Push notification enviada",
            "user_id": push_data.user_id,
            "title": push_data.title
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al enviar push: {str(e)}"
        )

# ============================================================================
# GAMIFICACIÓN ENDPOINTS
# ============================================================================

@app.post("/gamification/event")
async def process_gamification_event(
    event: GamificationEvent,
    db: Session = Depends(get_db)
):
    """Procesa un evento de gamificación"""
    
    try:
        result = {}
        gamif_service = get_gamificacion_service(db)
        
        if event.event_type == "trabajo_completado":
            # Otorgar puntos por trabajo completado
            monto = event.metadata.get("monto", 0)
            user = db.query(User).filter(User.id == event.user_id).first()
            if user and user.professional:
                puntos = gamif_service.agregar_puntos_trabajo(user.professional, monto)
                result = {"puntos_agregados": puntos, "puntos_totales": user.professional.puntos_totales}
        
        elif event.event_type == "resena_recibida":
            # Otorgar puntos por reseña
            rating = event.metadata.get("rating", 0)
            user = db.query(User).filter(User.id == event.user_id).first()
            if user and user.professional:
                puntos = gamif_service.agregar_puntos_resena(user.professional, rating)
                result = {"puntos_agregados": puntos, "puntos_totales": user.professional.puntos_totales}
        
        elif event.event_type == "nivel_subido":
            # Notificar al usuario que subió de nivel
            user = db.query(User).filter(User.id == event.user_id).first()
            if user:
                professional = db.query(Professional).filter(
                    Professional.user_id == user.id
                ).first()
                
                if professional:
                    result = {
                        "message": f"¡Felicitaciones! Subiste a nivel {professional.nivel}",
                        "nivel": professional.nivel,
                        "puntos": professional.puntos_totales
                    }
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar evento de gamificación: {str(e)}"
        )

@app.get("/gamification/leaderboard")
async def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Obtiene el ranking de profesionales por puntos"""
    
    try:
        top_professionals = db.query(Professional).join(User).filter(
            User.is_active == True
        ).order_by(
            Professional.puntos_experiencia.desc()
        ).limit(limit).all()
        
        leaderboard = []
        for i, prof in enumerate(top_professionals, 1):
            user = db.query(User).filter(User.id == prof.user_id).first()
            leaderboard.append({
                "posicion": i,
                "nombre": prof.nombre_completo,
                "puntos": prof.puntos_experiencia,
                "nivel": prof.nivel,
                "rating": float(prof.rating_promedio) if prof.rating_promedio else 0,
                "trabajos_completados": prof.trabajos_completados or 0
            })
        
        return leaderboard
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener leaderboard: {str(e)}"
        )

@app.get("/gamification/user/{user_id}")
async def get_user_gamification_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene las estadísticas de gamificación de un usuario"""
    
    try:
        professional = db.query(Professional).filter(
            Professional.user_id == user_id
        ).first()
        
        if not professional:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profesional no encontrado"
            )
        
        # Calcular próximo nivel
        nivel_actual = professional.nivel
        puntos_actuales = professional.puntos_experiencia or 0
        
        # Niveles: Bronce (0-999), Plata (1000-4999), Oro (5000-9999), Diamante (10000+)
        niveles_config = {
            "Bronce": {"min": 0, "max": 999},
            "Plata": {"min": 1000, "max": 4999},
            "Oro": {"min": 5000, "max": 9999},
            "Diamante": {"min": 10000, "max": 999999}
        }
        
        proximo_nivel = None
        puntos_para_proximo = None
        
        if nivel_actual == "Bronce":
            proximo_nivel = "Plata"
            puntos_para_proximo = 1000 - puntos_actuales
        elif nivel_actual == "Plata":
            proximo_nivel = "Oro"
            puntos_para_proximo = 5000 - puntos_actuales
        elif nivel_actual == "Oro":
            proximo_nivel = "Diamante"
            puntos_para_proximo = 10000 - puntos_actuales
        elif nivel_actual == "Diamante":
            proximo_nivel = "Máximo"
            puntos_para_proximo = 0
        
        return {
            "nivel_actual": nivel_actual,
            "puntos_experiencia": puntos_actuales,
            "proximo_nivel": proximo_nivel,
            "puntos_para_proximo_nivel": max(0, puntos_para_proximo) if puntos_para_proximo else 0,
            "trabajos_completados": professional.trabajos_completados or 0,
            "rating_promedio": float(professional.rating_promedio) if professional.rating_promedio else 0,
            "total_resenas": professional.total_resenas or 0,
            "comision_actual": 0.15  # Comisión por defecto, ajustar según nivel
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )

# ============================================================================
# SYSTEM EVENTS
# ============================================================================

@app.post("/system/event/log")
async def log_system_event(
    event_type: str,
    event_data: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Registra un evento del sistema (para auditoría)"""
    
    try:
        # Aquí podrías guardar en una tabla de logs o enviar a un servicio de logging
        print(f"📊 System Event [{event_type}]: {event_data} - User: {current_user.email}")
        
        return {"message": "Evento registrado"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar evento: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
