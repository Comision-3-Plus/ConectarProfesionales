"""
Endpoints para clientes - Gestión de ofertas recibidas
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from decimal import Decimal

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.config import settings
from app.models.user import Usuario
from app.models.oferta import Oferta, EstadoOferta
from app.models.trabajo import Trabajo
from app.models.professional import Profesional
from app.models.enums import EstadoEscrow
from app.models.resena import Resena
from app.schemas.oferta import OfertaRead, OfertaAcceptResponse
from app.schemas.trabajo import TrabajoRead, TrabajoFinalizarResponse, TrabajoCancelarResponse
from app.schemas.resena import ResenaCreate, ResenaCreateResponse
from app.services.firebase_service import firebase_service
from app.services.mercadopago_service import mercadopago_service
from app.services import gamification_service
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
    response_model=OfertaAcceptResponse,
    summary="Aceptar una oferta recibida y generar link de pago"
)
def accept_oferta(
    oferta_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    El cliente acepta una oferta formal de un profesional.
    
    **Este endpoint es el DISPARADOR del Módulo 5 (Pagos).**
    
    Flujo completo:
    1. Busca la oferta y valida permisos/estado
    2. Cambia el estado de la oferta a ACEPTADO
    3. Crea un registro de Trabajo en estado PENDIENTE_PAGO
    4. Genera una preferencia de pago en MercadoPago
    5. Retorna el link de pago (init_point) para que el cliente pague
    
    El trabajo queda vinculado al pago mediante external_reference.
    Cuando MP notifique el pago exitoso (webhook), actualizaremos el estado del trabajo.
    
    Args:
        oferta_id: UUID de la oferta a aceptar
        
    Returns:
        OfertaAcceptResponse con:
            - oferta: Datos de la oferta actualizada
            - trabajo_id: ID del trabajo creado
            - payment_preference_id: ID de la preferencia en MP
            - payment_url: URL de pago de MercadoPago
        
    Raises:
        404: Si la oferta no existe
        403: Si la oferta no pertenece al cliente actual
        400: Si la oferta ya fue aceptada/rechazada
        500: Si hay error con MercadoPago
    """
    # 1. Buscar y validar la oferta
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
    
    # 2. Cambiar estado de la oferta a ACEPTADO
    oferta.estado = EstadoOferta.ACEPTADO
    db.add(oferta)
    
    # 3. Crear el Trabajo en estado PENDIENTE_PAGO
    nuevo_trabajo = Trabajo(
        cliente_id=oferta.cliente_id,
        profesional_id=oferta.profesional_id,
        oferta_id=oferta.id,
        servicio_instant_id=None,  # Este es Flujo Pro (no Instant)
        precio_final=oferta.precio_final,
        estado_escrow=EstadoEscrow.PENDIENTE_PAGO,
    )
    
    db.add(nuevo_trabajo)
    db.commit()
    db.refresh(nuevo_trabajo)
    db.refresh(oferta)
    
    print(f"✅ Trabajo creado: {nuevo_trabajo.id}")
    print(f"   Cliente: {oferta.cliente_id}")
    print(f"   Profesional: {oferta.profesional_id}")
    print(f"   Precio: ${oferta.precio_final}")
    
    # 4. Generar preferencia de pago en MercadoPago
    try:
        mp_response = mercadopago_service.crear_preferencia_pago(
            trabajo_id=nuevo_trabajo.id,
            titulo=f"Servicio Profesional",
            descripcion=oferta.descripcion[:255],  # MP limita a 255 chars
            precio_final=oferta.precio_final,
            cliente_email=current_user.email,
        )
        
        payment_url = mp_response.get("init_point")
        preference_id = mp_response.get("preference_id")
        
        print(f"💳 Link de pago generado: {payment_url}")
        
    except Exception as e:
        # Si falla MP, revertir el trabajo (o marcarlo como error)
        print(f"❌ Error generando preferencia de MP: {e}")
        db.delete(nuevo_trabajo)
        oferta.estado = EstadoOferta.OFERTADO  # Revertir
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generando link de pago: {str(e)}"
        )
    
    # 5. Notificar en el chat de Firestore
    firebase_service.send_message_to_chat(
        chat_id=oferta.chat_id,
        sender_id=current_user.id,
        text=f"✅ Oferta aceptada: ${oferta.precio_final}. Procesando pago...",
        message_type="info"
    )
    
    # 6. Retornar respuesta con link de pago
    return OfertaAcceptResponse(
        oferta=OfertaRead.model_validate(oferta),
        trabajo_id=nuevo_trabajo.id,
        payment_preference_id=preference_id,
        payment_url=payment_url,
    )


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


# ==========================================
# ENDPOINTS DE TRABAJOS (ESCROW Y PAGOS)
# ==========================================

@router.get(
    "/trabajos",
    response_model=List[TrabajoRead],
    summary="Listar trabajos del cliente"
)
def list_trabajos(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista todos los trabajos (contratos) del cliente.
    Incluye información del estado de escrow y montos.
    """
    trabajos = (
        db.query(Trabajo)
        .filter(Trabajo.cliente_id == current_user.id)
        .order_by(Trabajo.fecha_creacion.desc())
        .all()
    )
    
    return [TrabajoRead.model_validate(t) for t in trabajos]


@router.get(
    "/trabajo/{trabajo_id}",
    response_model=TrabajoRead,
    summary="Obtener detalles de un trabajo"
)
def get_trabajo(
    trabajo_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtiene los detalles completos de un trabajo específico.
    Solo el cliente dueño del trabajo puede verlo.
    """
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    if str(trabajo.cliente_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este trabajo no te pertenece"
        )
    
    return TrabajoRead.model_validate(trabajo)


@router.post(
    "/trabajo/{trabajo_id}/finalizar",
    response_model=TrabajoFinalizarResponse,
    summary="Finalizar trabajo y liberar fondos al profesional"
)
def finalizar_trabajo(
    trabajo_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    El cliente marca un trabajo como completado y libera los fondos al profesional.
    
    **Este endpoint es CRÍTICO para el flujo de dinero (liberación de escrow).**
    
    Flujo completo:
    1. Busca el trabajo y valida permisos
    2. Verifica que el dinero esté en escrow (PAGADO_EN_ESCROW)
    3. Busca al profesional y valida que tenga payout_account configurado
    4. Calcula comisión de la plataforma según el nivel del profesional
    5. Calcula monto a liberar (precio - comisión)
    6. Actualiza el trabajo en BD (estado LIBERADO)
    7. Ejecuta payout en MercadoPago al profesional
    8. Retorna confirmación
    
    Validaciones de seguridad:
    - Solo el cliente dueño del trabajo puede finalizarlo
    - El trabajo debe estar en estado PAGADO_EN_ESCROW
    - El profesional debe tener configurado su payout_account
    
    Args:
        trabajo_id: UUID del trabajo a finalizar
        
    Returns:
        TrabajoFinalizarResponse con:
            - trabajo: Datos del trabajo actualizado
            - payout_id: ID del payout en MercadoPago
            - mensaje: Confirmación de la operación
        
    Raises:
        404: Si el trabajo no existe
        403: Si el trabajo no pertenece al cliente actual
        400: Si el trabajo no está en estado correcto
        400: Si el profesional no tiene payout_account configurado
        500: Si hay error con MercadoPago Payout
    """
    # 1. Buscar el trabajo
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # 2. Verificar que el trabajo pertenezca al cliente actual
    if str(trabajo.cliente_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este trabajo no te pertenece"
        )
    
    # 3. Verificar que el dinero esté en escrow
    if trabajo.estado_escrow != EstadoEscrow.PAGADO_EN_ESCROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede finalizar un trabajo en estado {trabajo.estado_escrow.value}. "
                   f"El trabajo debe estar en estado PAGADO_EN_ESCROW."
        )
    
    # 4. Buscar al profesional (con join eager loading para tener usuario)
    profesional = (
        db.query(Profesional)
        .filter(Profesional.usuario_id == trabajo.profesional_id)
        .first()
    )
    
    if not profesional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # 5. Validar que el profesional tenga payout_account configurado
    if not profesional.payout_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El profesional no ha configurado su cuenta de pago. "
                   "No se pueden liberar los fondos."
        )
    
    # 6. Calcular comisión y monto a liberar
    # Usar la tasa de comisión del profesional (según su nivel de gamificación)
    tasa_comision = profesional.tasa_comision_actual
    comision_nuestra = trabajo.precio_final * Decimal(str(tasa_comision))
    monto_a_liberar = trabajo.precio_final - comision_nuestra
    
    print("=" * 60)
    print("💰 CÁLCULO DE LIBERACIÓN DE FONDOS")
    print(f"   Precio Final: ${trabajo.precio_final}")
    print(f"   Tasa Comisión: {float(tasa_comision) * 100}% (Nivel: {profesional.nivel.value})")
    print(f"   Comisión Plataforma: ${comision_nuestra}")
    print(f"   Monto a Liberar: ${monto_a_liberar}")
    print(f"   Destino: {profesional.payout_account}")
    print("=" * 60)
    
    # 7. Actualizar el trabajo en BD (¡PRIMERO antes de llamar a MP!)
    trabajo.estado_escrow = EstadoEscrow.LIBERADO
    trabajo.comision_plataforma = comision_nuestra
    trabajo.monto_liberado = monto_a_liberar
    
    # 7.1 Otorgar puntos al profesional por trabajo completado
    profesional.puntos_experiencia += settings.PUNTOS_POR_TRABAJO
    
    # 7.2 Verificar si el profesional subió de nivel (Módulo 7)
    subio_de_nivel = gamification_service.check_for_level_up(profesional)
    
    db.add(trabajo)
    db.add(profesional)
    db.commit()
    db.refresh(trabajo)
    db.refresh(profesional)
    
    print(f"✅ Trabajo actualizado en BD:")
    print(f"   Estado: {trabajo.estado_escrow.value}")
    print(f"   Comisión guardada: ${trabajo.comision_plataforma}")
    print(f"   Monto liberado: ${trabajo.monto_liberado}")
    print(f"🎮 Puntos otorgados: +{settings.PUNTOS_POR_TRABAJO} (Total: {profesional.puntos_experiencia})")
    if subio_de_nivel:
        print(f"🎉 ¡NIVEL ACTUALIZADO! Ahora es {profesional.nivel.value} (Comisión: {float(profesional.tasa_comision_actual) * 100}%)")
    
    # 8. Ejecutar payout en MercadoPago
    try:
        payout_response = mercadopago_service.crear_payout(
            monto=monto_a_liberar,
            destino_cvu_alias=profesional.payout_account,
            concepto=f"Pago por servicio - Trabajo {trabajo.id}",
            referencia_externa=str(trabajo.id),
        )
        
        if not payout_response:
            raise Exception("No se recibió respuesta del servicio de payout")
        
        payout_id = payout_response.get("id")
        payout_status = payout_response.get("status")
        
        print(f"💸 Payout ejecutado:")
        print(f"   Payout ID: {payout_id}")
        print(f"   Status: {payout_status}")
        
        # Opcional: Guardar el payout_id en el trabajo para trazabilidad
        # trabajo.mercadopago_payout_id = payout_id
        # db.commit()
        
    except Exception as e:
        # Si falla el payout, loguear pero no revertir (el trabajo ya está marcado como LIBERADO)
        # En producción, deberías tener un sistema de retry o notificación
        print(f"❌ Error ejecutando payout: {e}")
        
        # Podrías crear una tabla de "payouts_pendientes" para reintentar después
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error liberando fondos: {str(e)}. El trabajo fue marcado como LIBERADO pero el payout falló."
        )
    
    # 9. Notificar en el chat (opcional)
    if trabajo.oferta:
        firebase_service.send_message_to_chat(
            chat_id=trabajo.oferta.chat_id,
            sender_id=current_user.id,
            text=f"✅ Trabajo finalizado. Fondos liberados al profesional: ${monto_a_liberar}",
            message_type="info"
        )
    
    print("=" * 60)
    print("🎉 TRABAJO FINALIZADO Y FONDOS LIBERADOS")
    print(f"   Trabajo ID: {trabajo.id}")
    print(f"   Cliente: {trabajo.cliente_id}")
    print(f"   Profesional: {trabajo.profesional_id}")
    print(f"   Payout ID: {payout_id}")
    print("=" * 60)
    
    # 10. Retornar respuesta
    return TrabajoFinalizarResponse(
        trabajo=TrabajoRead.model_validate(trabajo),
        payout_id=payout_id,
        mensaje=f"Trabajo finalizado exitosamente. Se liberaron ${monto_a_liberar} al profesional."
    )


@router.post(
    "/trabajo/{trabajo_id}/cancelar",
    response_model=TrabajoCancelarResponse,
    summary="Cancelar trabajo y solicitar reembolso"
)
def cancelar_trabajo_cliente(
    trabajo_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    El cliente cancela un trabajo y solicita un reembolso completo.
    
    **Flujo de cancelación:**
    1. Solo se pueden cancelar trabajos en estado PAGADO_EN_ESCROW
    2. Se ejecuta un refund completo (100%) en MercadoPago
    3. El trabajo pasa a estado CANCELADO_REEMBOLSADO
    
    **Casos de uso:**
    - El profesional no puede realizar el trabajo
    - Cambio de planes del cliente
    - Acuerdo mutuo de cancelación
    
    Args:
        trabajo_id: UUID del trabajo a cancelar
        
    Returns:
        TrabajoCancelarResponse con datos del reembolso
        
    Raises:
        404: Si el trabajo no existe
        403: Si el trabajo no pertenece al cliente
        400: Si el trabajo no puede ser cancelado (estado incorrecto)
    """
    # 1. Buscar el trabajo
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # 2. Verificar que el trabajo pertenezca al cliente actual
    if str(trabajo.cliente_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este trabajo no te pertenece"
        )
    
    # 3. Verificar que el dinero esté en escrow
    if trabajo.estado_escrow != EstadoEscrow.PAGADO_EN_ESCROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar un trabajo en estado {trabajo.estado_escrow.value}. "
                   f"Solo se pueden cancelar trabajos en estado PAGADO_EN_ESCROW."
        )
    
    # 4. Validar que haya payment_id
    if not trabajo.mercadopago_payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede reembolsar: no hay payment_id de MercadoPago asociado"
        )
    
    print("=" * 60)
    print("🚫 CANCELACIÓN SOLICITADA POR CLIENTE")
    print(f"   Trabajo ID: {trabajo.id}")
    print(f"   Cliente: {trabajo.cliente_id}")
    print(f"   Precio Original: ${trabajo.precio_final}")
    print("=" * 60)
    
    # 5. Ejecutar refund en MercadoPago
    try:
        refund_response = mercadopago_service.crear_refund(
            payment_id=trabajo.mercadopago_payment_id,
            monto=None,  # None = reembolso total
        )
        
        if not refund_response:
            raise Exception("No se recibió respuesta del servicio de refund")
        
        refund_id = refund_response.get("id")
        
        print(f"💰 Refund ejecutado: {refund_id}")
        
    except Exception as e:
        print(f"❌ Error ejecutando refund: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando reembolso: {str(e)}"
        )
    
    # 6. Actualizar el trabajo en BD
    trabajo.estado_escrow = EstadoEscrow.CANCELADO_REEMBOLSADO
    trabajo.comision_plataforma = 0
    trabajo.monto_liberado = 0
    
    db.add(trabajo)
    db.commit()
    db.refresh(trabajo)
    
    # 7. Notificar en el chat
    if trabajo.oferta:
        firebase_service.send_message_to_chat(
            chat_id=trabajo.oferta.chat_id,
            sender_id=current_user.id,
            text=f"🚫 Trabajo cancelado. Reembolso de ${trabajo.precio_final} procesado.",
            message_type="info"
        )
    
    print(f"✅ Trabajo cancelado y reembolsado: ${trabajo.precio_final}")
    
    return TrabajoCancelarResponse(
        trabajo=TrabajoRead.model_validate(trabajo),
        refund_id=refund_id,
        mensaje=f"Trabajo cancelado. Se reembolsaron ${trabajo.precio_final} a tu cuenta."
    )


# ==========================================
# ENDPOINTS DE RESEÑAS (MÓDULO 6)
# ==========================================

@router.post(
    "/trabajo/{trabajo_id}/resena",
    response_model=ResenaCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear reseña de un trabajo finalizado"
)
def crear_resena(
    trabajo_id: UUID,
    resena_data: ResenaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    El cliente crea una reseña para un trabajo finalizado.
    
    **Este endpoint es el DISPARADOR del Módulo 6 (Sistema de Reseñas).**
    
    Flujo completo:
    1. Valida que el trabajo pertenezca al cliente actual
    2. Valida que el trabajo esté LIBERADO (dinero ya entregado al profesional)
    3. Valida que no exista ya una reseña para este trabajo
    4. Crea la nueva reseña en la BD
    5. **RECALCULA el rating_promedio del profesional (denormalizado)**
    6. Actualiza total_resenas del profesional
    7. Guarda todo en una sola transacción (atomicidad)
    8. Retorna la reseña creada y el nuevo rating del profesional
    
    **Restricciones importantes:**
    - Un trabajo solo puede tener UNA reseña (constraint en BD)
    - Solo se pueden reseñar trabajos LIBERADOS
    - El rating debe estar entre 1 y 5
    
    **Denormalización clave:**
    El rating_promedio se guarda en la tabla profesionales para evitar
    calcular AVG() en cada búsqueda (performance del Módulo 3).
    
    Fórmula del recálculo:
    nuevo_promedio = ((viejo_promedio * viejo_total) + nuevo_rating) / (viejo_total + 1)
    
    Args:
        trabajo_id: UUID del trabajo a reseñar
        resena_data: Datos de la reseña (rating y texto opcional)
        
    Returns:
        ResenaCreateResponse con:
            - resena: La reseña creada
            - profesional_rating_promedio: Nuevo rating del profesional
            - profesional_total_resenas: Total de reseñas del profesional
            - mensaje: Confirmación de la operación
        
    Raises:
        404: Si el trabajo no existe
        403: Si el trabajo no pertenece al cliente actual
        400: Si el trabajo no está LIBERADO
        400: Si ya existe una reseña para este trabajo
    """
    # 1. Buscar el trabajo
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # 2. Verificar que el trabajo pertenezca al cliente actual
    if str(trabajo.cliente_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este trabajo no te pertenece"
        )
    
    # 3. Verificar que el trabajo esté LIBERADO
    if trabajo.estado_escrow != EstadoEscrow.LIBERADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede reseñar un trabajo en estado {trabajo.estado_escrow.value}. "
                   f"Solo se pueden reseñar trabajos LIBERADOS."
        )
    
    # 4. Verificar que no exista ya una reseña para este trabajo
    resena_existente = db.query(Resena).filter(Resena.trabajo_id == trabajo_id).first()
    
    if resena_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este trabajo ya tiene una reseña. No se puede calificar dos veces."
        )
    
    # 5. Buscar al profesional para recalcular su rating
    profesional = (
        db.query(Profesional)
        .filter(Profesional.usuario_id == trabajo.profesional_id)
        .first()
    )
    
    if not profesional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    print("=" * 60)
    print("⭐ CREANDO RESEÑA Y RECALCULANDO RATING")
    print(f"   Trabajo ID: {trabajo.id}")
    print(f"   Cliente: {trabajo.cliente_id}")
    print(f"   Profesional: {trabajo.profesional_id}")
    print(f"   Nuevo Rating: {resena_data.rating} estrellas")
    print("=" * 60)
    print(f"📊 ESTADO ACTUAL DEL PROFESIONAL:")
    print(f"   Rating Promedio: {float(profesional.rating_promedio)}")
    print(f"   Total Reseñas: {profesional.total_resenas}")
    print("=" * 60)
    
    # 6. RECALCULAR EL RATING PROMEDIO (FÓRMULA CLAVE)
    viejo_promedio = float(profesional.rating_promedio)
    viejo_total = profesional.total_resenas
    nuevo_rating = resena_data.rating
    
    # Fórmula: ((viejo_promedio * viejo_total) + nuevo_rating) / (viejo_total + 1)
    if viejo_total == 0:
        # Primera reseña del profesional
        nuevo_promedio = float(nuevo_rating)
    else:
        # Recalcular con la fórmula
        suma_total_ratings = (viejo_promedio * viejo_total) + nuevo_rating
        nuevo_total = viejo_total + 1
        nuevo_promedio = suma_total_ratings / nuevo_total
    
    # Redondear a 2 decimales para que coincida con Numeric(3, 2)
    nuevo_promedio = round(nuevo_promedio, 2)
    
    print(f"🧮 CÁLCULO DEL NUEVO PROMEDIO:")
    print(f"   ({viejo_promedio} * {viejo_total}) + {nuevo_rating} = {viejo_promedio * viejo_total + nuevo_rating}")
    print(f"   {viejo_promedio * viejo_total + nuevo_rating} / {viejo_total + 1} = {nuevo_promedio}")
    print("=" * 60)
    
    # 7. Crear la reseña
    nueva_resena = Resena(
        trabajo_id=trabajo_id,
        cliente_id=trabajo.cliente_id,
        profesional_id=profesional.id,
        rating=resena_data.rating,
        texto_resena=resena_data.texto_resena,
    )
    
    # 7.1 Otorgar puntos al profesional según el rating recibido
    puntos_otorgados = 0
    if resena_data.rating == 5:
        puntos_otorgados = settings.PUNTOS_REVIEW_5_ESTRELLAS
        profesional.puntos_experiencia += puntos_otorgados
    elif resena_data.rating == 4:
        puntos_otorgados = settings.PUNTOS_REVIEW_4_ESTRELLAS
        profesional.puntos_experiencia += puntos_otorgados
    
    # 8. Actualizar el profesional (denormalización)
    profesional.rating_promedio = Decimal(str(nuevo_promedio))
    profesional.total_resenas = viejo_total + 1
    
    # 8.1 Verificar si el profesional subió de nivel (Módulo 7)
    subio_de_nivel = gamification_service.check_for_level_up(profesional)
    
    # 9. Guardar todo en una sola transacción (ATOMICIDAD)
    db.add(nueva_resena)
    db.add(profesional)
    
    try:
        db.commit()
        db.refresh(nueva_resena)
        db.refresh(profesional)
    except Exception as e:
        db.rollback()
        print(f"❌ Error guardando reseña y actualizando profesional: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error guardando la reseña: {str(e)}"
        )
    
    print(f"✅ RESEÑA CREADA EXITOSAMENTE")
    print(f"   Reseña ID: {nueva_resena.id}")
    print(f"   Rating dado: {nueva_resena.rating} estrellas")
    if puntos_otorgados > 0:
        print(f"🎮 Puntos otorgados: +{puntos_otorgados} (Total: {profesional.puntos_experiencia})")
    if subio_de_nivel:
        print(f"🎉 ¡NIVEL ACTUALIZADO! Ahora es {profesional.nivel.value}")
    print("=" * 60)
    print(f"📊 NUEVO ESTADO DEL PROFESIONAL:")
    print(f"   Rating Promedio: {float(profesional.rating_promedio)} ⭐")
    print(f"   Total Reseñas: {profesional.total_resenas}")
    print(f"   Nivel: {profesional.nivel.value}")
    print(f"   Comisión: {float(profesional.tasa_comision_actual) * 100}%")
    print("=" * 60)
    
    # 10. Notificar en el chat (opcional)
    if trabajo.oferta:
        firebase_service.send_message_to_chat(
            chat_id=trabajo.oferta.chat_id,
            sender_id=current_user.id,
            text=f"⭐ Nueva reseña: {resena_data.rating} estrellas",
            message_type="info"
        )
    
    # 11. Retornar respuesta
    from app.schemas.resena import ResenaRead
    
    return ResenaCreateResponse(
        resena=ResenaRead.model_validate(nueva_resena),
        profesional_rating_promedio=float(profesional.rating_promedio),
        profesional_total_resenas=profesional.total_resenas,
        mensaje=f"Reseña creada exitosamente. El profesional ahora tiene un rating de "
                f"{float(profesional.rating_promedio)} estrellas ({profesional.total_resenas} reseñas)."
    )
