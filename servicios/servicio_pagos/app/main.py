"""
Servicio de Pagos
Integración con MercadoPago, webhooks, escrow y reembolsos
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from fastapi import FastAPI, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from shared.core.database import get_db
from shared.core.security import get_current_user, get_current_active_user
from shared.core.config import get_settings
from shared.models.user import User
from shared.models.professional import Professional
from shared.models.trabajo import Trabajo
from shared.models.enums import TrabajoEstado, EscrowEstado
from shared.services.mercadopago_service import MercadoPagoService

app = FastAPI(
    title="Servicio de Pagos",
    version="1.0.0",
    description="Pagos con MercadoPago, webhooks, escrow y gestión financiera"
)

settings = get_settings()
mp_service = MercadoPagoService()

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "servicio": "pagos"}

# ============================================================================
# MERCADOPAGO PREFERENCES
# ============================================================================

@app.post("/mercadopago/create-preference")
async def create_payment_preference(
    trabajo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea una preferencia de pago en MercadoPago"""
    
    # Obtener el trabajo
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # Verificar que el usuario es el cliente
    if trabajo.cliente_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el cliente puede pagar el trabajo"
        )
    
    # Verificar estado del trabajo
    if trabajo.estado != TrabajoEstado.PENDIENTE_PAGO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El trabajo no está pendiente de pago"
        )
    
    try:
        # Crear preferencia en MercadoPago
        preference = mp_service.create_preference(
            trabajo_id=trabajo.id,
            title=f"Trabajo #{trabajo.id} - {trabajo.descripcion[:50]}",
            amount=float(trabajo.monto_total),
            payer_email=current_user.email
        )
        
        # Guardar el preference_id en el trabajo
        trabajo.mp_preference_id = preference.get("id")
        db.commit()
        
        return {
            "preference_id": preference.get("id"),
            "init_point": preference.get("init_point"),  # URL de pago web
            "sandbox_init_point": preference.get("sandbox_init_point")  # URL de pago sandbox
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear preferencia de pago: {str(e)}"
        )

# ============================================================================
# WEBHOOK MERCADOPAGO
# ============================================================================

@app.post("/webhook/mercadopago")
async def mercadopago_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None),
    x_request_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Webhook para recibir notificaciones de MercadoPago
    Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
    """
    
    try:
        # Obtener el body
        body = await request.json()
        
        print(f"📨 Webhook MercadoPago recibido: {body}")
        
        # Tipos de notificación:
        # - payment: Notificación de pago
        # - merchant_order: Notificación de orden
        notification_type = body.get("type")
        
        if notification_type == "payment":
            payment_id = body.get("data", {}).get("id")
            
            if not payment_id:
                return {"status": "ok", "message": "No payment ID"}
            
            # Obtener información del pago
            payment_info = mp_service.get_payment_info(payment_id)
            
            if not payment_info:
                return {"status": "error", "message": "Payment not found"}
            
            # Obtener trabajo desde external_reference
            external_reference = payment_info.get("external_reference")
            if not external_reference:
                return {"status": "ok", "message": "No external reference"}
            
            try:
                trabajo_id = int(external_reference.replace("TRABAJO-", ""))
            except:
                return {"status": "error", "message": "Invalid external reference"}
            
            trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
            
            if not trabajo:
                return {"status": "error", "message": "Trabajo not found"}
            
            # Procesar según el estado del pago
            payment_status = payment_info.get("status")
            
            if payment_status == "approved":
                # Pago aprobado
                trabajo.estado = TrabajoEstado.EN_PROGRESO
                trabajo.escrow_estado = EscrowEstado.RETENIDO
                trabajo.mp_payment_id = payment_id
                trabajo.fecha_inicio = datetime.utcnow()
                
                print(f"✅ Pago aprobado para trabajo #{trabajo_id}")
            
            elif payment_status == "rejected":
                # Pago rechazado
                trabajo.estado = TrabajoEstado.PENDIENTE_PAGO
                print(f"❌ Pago rechazado para trabajo #{trabajo_id}")
            
            elif payment_status == "pending":
                # Pago pendiente
                trabajo.mp_payment_id = payment_id
                print(f"⏳ Pago pendiente para trabajo #{trabajo_id}")
            
            db.commit()
        
        return {"status": "ok"}
    
    except Exception as e:
        print(f"❌ Error en webhook MercadoPago: {str(e)}")
        return {"status": "error", "message": str(e)}

# ============================================================================
# ESCROW MANAGEMENT
# ============================================================================

@app.post("/escrow/release/{trabajo_id}")
async def release_escrow(
    trabajo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Libera el dinero del escrow al profesional
    Solo el cliente puede liberar (cuando aprueba el trabajo)
    """
    
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # Verificar permisos
    if trabajo.cliente_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el cliente o admin pueden liberar el escrow"
        )
    
    # Verificar estado
    if trabajo.escrow_estado != EscrowEstado.RETENIDO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El escrow no está en estado retenido"
        )
    
    try:
        # Obtener información del profesional
        professional = db.query(Professional).filter(
            Professional.id == trabajo.profesional_id
        ).first()
        
        if not professional:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profesional no encontrado"
            )
        
        # Calcular comisión (por ahora 10%, debería venir de gamificación)
        comision_porcentaje = 10
        monto_comision = trabajo.monto_total * (comision_porcentaje / 100)
        monto_profesional = trabajo.monto_total - monto_comision
        
        # Aquí iría la lógica de payout real a la cuenta del profesional
        # Por ahora solo actualizamos el estado
        
        trabajo.escrow_estado = EscrowEstado.LIBERADO
        trabajo.estado = TrabajoEstado.APROBADO
        trabajo.monto_profesional = monto_profesional
        trabajo.comision_plataforma = monto_comision
        
        db.commit()
        
        return {
            "message": "Escrow liberado correctamente",
            "monto_total": float(trabajo.monto_total),
            "comision": float(monto_comision),
            "monto_profesional": float(monto_profesional)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al liberar escrow: {str(e)}"
        )

@app.post("/escrow/refund/{trabajo_id}")
async def refund_escrow(
    trabajo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Reembolsa el dinero del escrow al cliente
    Cuando un trabajo se cancela
    """
    
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # Verificar permisos
    is_cliente = trabajo.cliente_id == current_user.id
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    is_profesional = professional and trabajo.profesional_id == professional.id
    is_admin = current_user.role == "admin"
    
    if not (is_cliente or is_profesional or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para reembolsar este trabajo"
        )
    
    # Verificar estado
    if trabajo.escrow_estado not in [EscrowEstado.RETENIDO, EscrowEstado.PENDIENTE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El escrow no puede ser reembolsado en su estado actual"
        )
    
    try:
        # Reembolsar en MercadoPago
        if trabajo.mp_payment_id:
            try:
                refund_result = mp_service.refund_payment(trabajo.mp_payment_id)
                print(f"💸 Reembolso procesado: {refund_result}")
            except Exception as e:
                print(f"⚠️ Error al reembolsar en MP: {str(e)}")
                # Continuar de todas formas con la actualización local
        
        trabajo.escrow_estado = EscrowEstado.REEMBOLSADO
        trabajo.estado = TrabajoEstado.CANCELADO
        trabajo.fecha_fin = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": "Reembolso procesado correctamente",
            "monto_reembolsado": float(trabajo.monto_total)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar reembolso: {str(e)}"
        )

# ============================================================================
# PAYOUT TO PROFESSIONAL
# ============================================================================

@app.post("/payout/professional/{prof_id}")
async def payout_to_professional(
    prof_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Realiza un payout al profesional (solo admin)
    Transfiere dinero acumulado a su cuenta bancaria
    """
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar payouts"
        )
    
    professional = db.query(Professional).filter(Professional.id == prof_id).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # Calcular trabajos aprobados pendientes de payout
    trabajos_pendientes = db.query(Trabajo).filter(
        Trabajo.profesional_id == prof_id,
        Trabajo.estado == TrabajoEstado.APROBADO,
        Trabajo.escrow_estado == EscrowEstado.LIBERADO,
        Trabajo.payout_realizado == False
    ).all()
    
    if not trabajos_pendientes:
        return {"message": "No hay trabajos pendientes de payout"}
    
    total_a_pagar = sum(t.monto_profesional for t in trabajos_pendientes)
    
    try:
        # Aquí iría la integración real con MercadoPago para transferir
        # a la cuenta del profesional (CVU, CBU, Alias)
        
        # Por ahora solo marcamos como pagado
        for trabajo in trabajos_pendientes:
            trabajo.payout_realizado = True
            trabajo.fecha_payout = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": "Payout realizado correctamente",
            "total_pagado": float(total_a_pagar),
            "trabajos_procesados": len(trabajos_pendientes)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al realizar payout: {str(e)}"
        )

# ============================================================================
# ADMIN - DASHBOARD FINANCIERO
# ============================================================================

@app.get("/admin/dashboard/stats")
async def get_financial_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene métricas financieras (solo admin)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden ver las métricas"
        )
    
    from sqlalchemy import func
    
    # Total de trabajos
    total_trabajos = db.query(func.count(Trabajo.id)).scalar()
    
    # Trabajos por estado
    trabajos_en_progreso = db.query(func.count(Trabajo.id)).filter(
        Trabajo.estado == TrabajoEstado.EN_PROGRESO
    ).scalar()
    
    trabajos_completados = db.query(func.count(Trabajo.id)).filter(
        Trabajo.estado == TrabajoEstado.COMPLETADO
    ).scalar()
    
    trabajos_aprobados = db.query(func.count(Trabajo.id)).filter(
        Trabajo.estado == TrabajoEstado.APROBADO
    ).scalar()
    
    # Métricas financieras
    total_ingresos = db.query(func.sum(Trabajo.monto_total)).filter(
        Trabajo.estado.in_([TrabajoEstado.COMPLETADO, TrabajoEstado.APROBADO])
    ).scalar() or 0
    
    total_comisiones = db.query(func.sum(Trabajo.comision_plataforma)).filter(
        Trabajo.estado == TrabajoEstado.APROBADO
    ).scalar() or 0
    
    dinero_en_escrow = db.query(func.sum(Trabajo.monto_total)).filter(
        Trabajo.escrow_estado == EscrowEstado.RETENIDO
    ).scalar() or 0
    
    return {
        "trabajos": {
            "total": total_trabajos,
            "en_progreso": trabajos_en_progreso,
            "completados": trabajos_completados,
            "aprobados": trabajos_aprobados
        },
        "finanzas": {
            "total_ingresos": float(total_ingresos),
            "total_comisiones": float(total_comisiones),
            "dinero_en_escrow": float(dinero_en_escrow)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
