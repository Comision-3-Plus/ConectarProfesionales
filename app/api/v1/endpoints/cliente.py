"""
Endpoints para clientes - Gestión de ofertas recibidas
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import Usuario
from app.models.oferta import Oferta, EstadoOferta
from app.schemas.oferta import OfertaRead
from app.services.firebase_service import firebase_service
from typing import List

router = APIRouter()


# ==========================================
# ENDPOINTS DE OFERTAS PARA CLIENTE
# ==========================================

@router.get(
    "/ofertas",
    response_model=List[OfertaRead],
    summary="Listar ofertas recibidas por el cliente"
)
def list_ofertas_recibidas(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista todas las ofertas que el cliente ha recibido de profesionales.
    Útil para que el cliente vea todas sus propuestas.
    """
    ofertas = (
        db.query(Oferta)
        .filter(Oferta.cliente_id == current_user.id)
        .order_by(Oferta.fecha_creacion.desc())
        .all()
    )
    
    return [OfertaRead.model_validate(o) for o in ofertas]


@router.post(
    "/ofertas/{oferta_id}/accept",
    response_model=OfertaRead,
    summary="Aceptar una oferta recibida"
)
def accept_oferta(
    oferta_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    El cliente acepta una oferta formal de un profesional.
    
    **Este endpoint es el DISPARADOR del Módulo 5 (Pagos).**
    
    Flujo:
    1. Busca la oferta en Postgres
    2. Verifica que pertenezca al cliente actual
    3. Verifica que esté en estado OFERTADO
    4. Cambia estado a ACEPTADO
    5. Guarda en BD
    6. (Opcional) Notifica en el chat de Firestore
    
    La respuesta incluye todos los datos necesarios para iniciar el pago:
    - oferta_id: UUID de la oferta
    - precio_final: Monto a pagar
    - descripcion: Descripción del servicio
    - profesional_id: ID del profesional que recibirá el pago
    
    Args:
        oferta_id: UUID de la oferta a aceptar
        
    Returns:
        La oferta actualizada con estado ACEPTADO
        
    Raises:
        404: Si la oferta no existe
        403: Si la oferta no pertenece al cliente actual
        400: Si la oferta ya fue aceptada/rechazada
    """
    # Buscar la oferta
    oferta = db.query(Oferta).filter(Oferta.id == oferta_id).first()
    
    if not oferta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oferta no encontrada"
        )
    
    # Verificar que la oferta pertenezca al cliente actual
    if str(oferta.cliente_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta oferta no te pertenece"
        )
    
    # Verificar que la oferta esté en estado OFERTADO
    if oferta.estado != EstadoOferta.OFERTADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede aceptar una oferta en estado {oferta.estado.value}"
        )
    
    # Cambiar estado a ACEPTADO
    oferta.estado = EstadoOferta.ACEPTADO
    
    db.add(oferta)
    db.commit()
    db.refresh(oferta)
    
    # Opcional: Notificar en el chat de Firestore
    firebase_service.send_message_to_chat(
        chat_id=oferta.chat_id,
        sender_id=current_user.id,
        text=f"✅ Oferta aceptada: ${oferta.precio_final}",
        message_type="info"
    )
    
    print(f"✅ Oferta {oferta_id} ACEPTADA por cliente {current_user.id}")
    print(f"   💰 Precio: ${oferta.precio_final}")
    print(f"   👷 Profesional: {oferta.profesional_id}")
    print(f"   🚀 Listo para iniciar pago (Módulo 5)")
    
    return OfertaRead.model_validate(oferta)


@router.post(
    "/ofertas/{oferta_id}/reject",
    response_model=OfertaRead,
    summary="Rechazar una oferta recibida"
)
def reject_oferta(
    oferta_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    El cliente rechaza una oferta formal de un profesional.
    
    Flujo:
    1. Busca la oferta en Postgres
    2. Verifica que pertenezca al cliente actual
    3. Verifica que esté en estado OFERTADO
    4. Cambia estado a RECHAZADO
    5. Guarda en BD
    6. Notifica en el chat de Firestore
    
    Args:
        oferta_id: UUID de la oferta a rechazar
        
    Returns:
        La oferta actualizada con estado RECHAZADO
        
    Raises:
        404: Si la oferta no existe
        403: Si la oferta no pertenece al cliente actual
        400: Si la oferta ya fue aceptada/rechazada
    """
    # Buscar la oferta
    oferta = db.query(Oferta).filter(Oferta.id == oferta_id).first()
    
    if not oferta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oferta no encontrada"
        )
    
    # Verificar que la oferta pertenezca al cliente actual
    if str(oferta.cliente_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta oferta no te pertenece"
        )
    
    # Verificar que la oferta esté en estado OFERTADO
    if oferta.estado != EstadoOferta.OFERTADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede rechazar una oferta en estado {oferta.estado.value}"
        )
    
    # Cambiar estado a RECHAZADO
    oferta.estado = EstadoOferta.RECHAZADO
    
    db.add(oferta)
    db.commit()
    db.refresh(oferta)
    
    # Notificar en el chat de Firestore
    firebase_service.send_message_to_chat(
        chat_id=oferta.chat_id,
        sender_id=current_user.id,
        text="❌ La oferta fue rechazada",
        message_type="info"
    )
    
    print(f"❌ Oferta {oferta_id} RECHAZADA por cliente {current_user.id}")
    
    return OfertaRead.model_validate(oferta)


@router.get(
    "/ofertas/{oferta_id}",
    response_model=OfertaRead,
    summary="Obtener detalles de una oferta específica"
)
def get_oferta_detail(
    oferta_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtiene los detalles completos de una oferta específica.
    Solo el cliente que recibió la oferta puede verla.
    
    Útil para mostrar el detalle completo antes de aceptar/rechazar.
    """
    # Buscar la oferta
    oferta = db.query(Oferta).filter(Oferta.id == oferta_id).first()
    
    if not oferta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oferta no encontrada"
        )
    
    # Verificar que la oferta pertenezca al cliente actual
    if str(oferta.cliente_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta oferta no te pertenece"
        )
    
    return OfertaRead.model_validate(oferta)
