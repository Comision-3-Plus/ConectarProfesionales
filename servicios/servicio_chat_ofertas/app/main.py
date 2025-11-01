"""
Servicio de Chat y Ofertas
Gestión de chat (Firestore), ofertas económicas, trabajos y reseñas
"""
import sys
import os
import logging
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

from shared.core.database import get_db
from shared.core.security import get_current_user, get_current_active_user
from shared.models.user import User
from shared.models.professional import Professional
from shared.models.oferta import Oferta
from shared.models.trabajo import Trabajo
from shared.models.resena import Resena
from shared.models.enums import (
    UserRole, OfertaEstado, TrabajoEstado, 
    EscrowEstado, ChatModeracionEstado
)
from shared.schemas.oferta import OfertaCreate, OfertaResponse, OfertaUpdate
from shared.schemas.trabajo import TrabajoCreate, TrabajoResponse, TrabajoUpdate
from shared.schemas.resena import ResenaCreate, ResenaResponse
from shared.schemas.chat import (
    ConversationResponse, MessageCreate, MessageResponse,
    ConversationCreate, ModerateMessageRequest
)
from shared.services.chat_service import ChatService
from shared.services.gamificacion_service import GamificacionService, get_gamificacion_service

app = FastAPI(
    title="Servicio de Chat y Ofertas",
    version="1.0.0",
    description="Chat en tiempo real, ofertas económicas, trabajos y reseñas"
)

# Inicializar servicios
chat_service = ChatService()

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "servicio": "chat_ofertas"}

# ============================================================================
# CHAT ENDPOINTS (Firestore)
# ============================================================================

@app.get("/chat/conversations", response_model=List[ConversationResponse])
async def get_my_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene todas las conversaciones del usuario autenticado"""
    try:
        conversations = await chat_service.get_user_conversations(current_user.id)
        return conversations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener conversaciones: {str(e)}"
        )

@app.post("/chat/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea o obtiene una conversación existente entre dos usuarios"""
    
    # Verificar que el otro usuario existe
    other_user = db.query(User).filter(User.id == conversation_data.other_user_id).first()
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    try:
        conversation = await chat_service.create_or_get_conversation(
            current_user.id,
            conversation_data.other_user_id
        )
        return conversation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear conversación: {str(e)}"
        )

@app.get("/chat/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """Obtiene mensajes de una conversación"""
    try:
        # Verificar que el usuario es parte de la conversación
        conversation = await chat_service.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversación no encontrada"
            )
        
        if current_user.id not in conversation.get('participants', []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a esta conversación"
            )
        
        messages = await chat_service.get_messages(conversation_id, limit)
        return messages
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener mensajes: {str(e)}"
        )

@app.post("/chat/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Envía un mensaje a una conversación"""
    try:
        # Verificar que el usuario es parte de la conversación
        conversation = await chat_service.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversación no encontrada"
            )
        
        if current_user.id not in conversation.get('participants', []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a esta conversación"
            )
        
        message = await chat_service.send_message(
            conversation_id,
            current_user.id,
            message_data.content
        )
        return message
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al enviar mensaje: {str(e)}"
        )

@app.put("/chat/moderation/{message_id}")
async def moderate_message(
    message_id: str,
    moderation_data: ModerateMessageRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Modera un mensaje (solo admin)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden moderar mensajes"
        )
    
    try:
        await chat_service.moderate_message(
            message_id,
            moderation_data.estado,
            moderation_data.razon
        )
        return {"message": "Mensaje moderado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al moderar mensaje: {str(e)}"
        )

# ============================================================================
# OFERTAS ENDPOINTS
# ============================================================================

@app.post("/ofertas", response_model=OfertaResponse, status_code=status.HTTP_201_CREATED)
async def create_oferta(
    oferta_data: OfertaCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea una oferta económica"""
    
    # Verificar que el profesional existe
    professional = db.query(Professional).filter(
        Professional.id == oferta_data.profesional_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # Crear oferta
    new_oferta = Oferta(
        cliente_id=current_user.id,
        **oferta_data.dict()
    )
    
    db.add(new_oferta)
    db.commit()
    db.refresh(new_oferta)
    
    # Enviar mensaje automático en el chat
    try:
        conversation = await chat_service.create_or_get_conversation(
            current_user.id,
            professional.user_id
        )
        await chat_service.send_system_message(
            conversation['id'],
            f"💼 Nueva oferta económica: ${oferta_data.monto} - {oferta_data.descripcion}"
        )
    except:
        pass  # No fallar si el chat falla
    
    return new_oferta

@app.get("/ofertas", response_model=List[OfertaResponse])
async def get_my_ofertas(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene ofertas del usuario (como cliente o profesional)"""
    
    if current_user.role == UserRole.CLIENTE:
        # Ofertas que hice como cliente
        ofertas = db.query(Oferta).filter(
            Oferta.cliente_id == current_user.id
        ).all()
    elif current_user.role == UserRole.PROFESIONAL:
        # Ofertas que recibí como profesional
        professional = db.query(Professional).filter(
            Professional.user_id == current_user.id
        ).first()
        
        if not professional:
            return []
        
        ofertas = db.query(Oferta).filter(
            Oferta.profesional_id == professional.id
        ).all()
    else:
        ofertas = []
    
    return ofertas

@app.put("/ofertas/{oferta_id}/accept", response_model=TrabajoResponse)
async def accept_oferta(
    oferta_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Acepta una oferta y crea un trabajo"""
    
    oferta = db.query(Oferta).filter(Oferta.id == oferta_id).first()
    
    if not oferta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oferta no encontrada"
        )
    
    # Verificar que el usuario es el profesional
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional or oferta.profesional_id != professional.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el profesional puede aceptar la oferta"
        )
    
    if oferta.estado != OfertaEstado.PENDIENTE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La oferta ya fue procesada"
        )
    
    # Actualizar oferta
    oferta.estado = OfertaEstado.ACEPTADA
    oferta.fecha_respuesta = datetime.utcnow()
    
    # Crear trabajo
    nuevo_trabajo = Trabajo(
        cliente_id=oferta.cliente_id,
        profesional_id=oferta.profesional_id,
        oferta_id=oferta.id,
        descripcion=oferta.descripcion,
        monto_total=oferta.monto,
        estado=TrabajoEstado.PENDIENTE_PAGO,
        escrow_estado=EscrowEstado.PENDIENTE
    )
    
    db.add(nuevo_trabajo)
    db.commit()
    db.refresh(nuevo_trabajo)
    
    # Mensaje automático
    try:
        conversation = await chat_service.create_or_get_conversation(
            oferta.cliente_id,
            current_user.id
        )
        await chat_service.send_system_message(
            conversation['id'],
            f"✅ Oferta aceptada! Trabajo creado. Procede al pago para comenzar."
        )
    except:
        pass
    
    return nuevo_trabajo

@app.delete("/ofertas/{oferta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_oferta(
    oferta_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina una oferta (solo si está pendiente)"""
    
    oferta = db.query(Oferta).filter(Oferta.id == oferta_id).first()
    
    if not oferta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oferta no encontrada"
        )
    
    if oferta.cliente_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el cliente puede eliminar su oferta"
        )
    
    if oferta.estado != OfertaEstado.PENDIENTE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden eliminar ofertas pendientes"
        )
    
    db.delete(oferta)
    db.commit()

# ============================================================================
# TRABAJOS ENDPOINTS
# ============================================================================

@app.get("/trabajos", response_model=List[TrabajoResponse])
async def get_my_trabajos(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene trabajos del usuario"""
    
    if current_user.role == UserRole.CLIENTE:
        trabajos = db.query(Trabajo).filter(
            Trabajo.cliente_id == current_user.id
        ).all()
    elif current_user.role == UserRole.PROFESIONAL:
        professional = db.query(Professional).filter(
            Professional.user_id == current_user.id
        ).first()
        
        if not professional:
            return []
        
        trabajos = db.query(Trabajo).filter(
            Trabajo.profesional_id == professional.id
        ).all()
    else:
        trabajos = []
    
    return trabajos

@app.get("/trabajos/{trabajo_id}", response_model=TrabajoResponse)
async def get_trabajo(
    trabajo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene detalles de un trabajo"""
    
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # Verificar permisos
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    is_cliente = trabajo.cliente_id == current_user.id
    is_profesional = professional and trabajo.profesional_id == professional.id
    is_admin = current_user.role == UserRole.ADMIN
    
    if not (is_cliente or is_profesional or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este trabajo"
        )
    
    return trabajo

@app.put("/trabajos/{trabajo_id}/status")
async def update_trabajo_status(
    trabajo_id: int,
    status_update: TrabajoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza el estado de un trabajo"""
    
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # Lógica de cambio de estado
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    is_cliente = trabajo.cliente_id == current_user.id
    is_profesional = professional and trabajo.profesional_id == professional.id
    
    # Solo el profesional puede marcar como completado
    if status_update.estado == TrabajoEstado.COMPLETADO:
        if not is_profesional:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el profesional puede marcar el trabajo como completado"
            )
        
        trabajo.estado = TrabajoEstado.COMPLETADO
        trabajo.fecha_fin = datetime.utcnow()
    
    # Solo el cliente puede aprobar
    elif status_update.estado == TrabajoEstado.APROBADO:
        if not is_cliente:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el cliente puede aprobar el trabajo"
            )
        
        if trabajo.estado != TrabajoEstado.COMPLETADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El trabajo debe estar completado antes de aprobarlo"
            )
        
        trabajo.estado = TrabajoEstado.APROBADO
        trabajo.escrow_estado = EscrowEstado.LIBERADO
        
        # Aquí se liberaría el dinero del escrow al profesional
        # (integración con servicio de pagos)
        
        # Otorgar puntos de gamificación
        try:
            gamif_service = get_gamificacion_service(db)
            gamif_service.agregar_puntos_trabajo(trabajo.profesional, trabajo.monto_total)
        except Exception as e:
            logger.warning(f"Error al otorgar puntos: {e}")
            pass
    
    db.commit()
    db.refresh(trabajo)
    
    return trabajo

@app.put("/trabajos/{trabajo_id}/cancel")
async def cancel_trabajo(
    trabajo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancela un trabajo"""
    
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    is_cliente = trabajo.cliente_id == current_user.id
    is_profesional = professional and trabajo.profesional_id == professional.id
    
    if not (is_cliente or is_profesional):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el cliente o el profesional pueden cancelar el trabajo"
        )
    
    if trabajo.estado in [TrabajoEstado.COMPLETADO, TrabajoEstado.APROBADO]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede cancelar un trabajo completado o aprobado"
        )
    
    trabajo.estado = TrabajoEstado.CANCELADO
    trabajo.escrow_estado = EscrowEstado.REEMBOLSADO
    trabajo.fecha_fin = datetime.utcnow()
    
    # Aquí se haría el reembolso (integración con servicio de pagos)
    
    db.commit()
    
    return {"message": "Trabajo cancelado y reembolsado"}

# ============================================================================
# RESEÑAS ENDPOINTS
# ============================================================================

@app.post("/resenas", response_model=ResenaResponse, status_code=status.HTTP_201_CREATED)
async def create_resena(
    resena_data: ResenaCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea una reseña para un profesional"""
    
    # Verificar que el trabajo existe y está aprobado
    trabajo = db.query(Trabajo).filter(Trabajo.id == resena_data.trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    if trabajo.cliente_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el cliente puede dejar una reseña"
        )
    
    if trabajo.estado != TrabajoEstado.APROBADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden reseñar trabajos aprobados"
        )
    
    # Verificar que no exista ya una reseña
    existing_resena = db.query(Resena).filter(
        Resena.trabajo_id == resena_data.trabajo_id
    ).first()
    
    if existing_resena:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una reseña para este trabajo"
        )
    
    # Crear reseña
    nueva_resena = Resena(
        cliente_id=current_user.id,
        profesional_id=trabajo.profesional_id,
        **resena_data.dict()
    )
    
    db.add(nueva_resena)
    db.commit()
    db.refresh(nueva_resena)
    
    # Actualizar rating promedio del profesional
    professional = db.query(Professional).filter(
        Professional.id == trabajo.profesional_id
    ).first()
    
    if professional:
        resenas = db.query(Resena).filter(
            Resena.profesional_id == professional.id
        ).all()
        
        total_rating = sum(r.rating for r in resenas)
        professional.rating_promedio = total_rating / len(resenas)
        professional.total_resenas = len(resenas)
        
        db.commit()
    
    # Otorgar puntos por reseña
    try:
        gamif_service = get_gamificacion_service(db)
        gamif_service.agregar_puntos_resena(professional, resena_data.rating)
    except Exception as e:
        logger.warning(f"Error al otorgar puntos por reseña: {e}")
        pass
    
    return nueva_resena

@app.get("/resenas/professional/{prof_id}", response_model=List[ResenaResponse])
async def get_professional_resenas(
    prof_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene todas las reseñas de un profesional"""
    
    resenas = db.query(Resena).filter(
        Resena.profesional_id == prof_id
    ).order_by(Resena.created_at.desc()).all()
    
    return resenas

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
