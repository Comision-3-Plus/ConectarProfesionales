"""
Endpoints de administración (Backoffice) protegidos solo para ADMIN.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.dependencies import get_current_admin_user, get_current_user
from app.core.database import get_db
from app.schemas.admin import (
    ProfessionalPendingReview,
    UserSearchResult,
    UserBanResponse,
    UserUnbanResponse,
    FinancialMetricsResponse,
    UserMetricsResponse,
)
from app.schemas.oficio import OficioCreate, OficioRead
from app.schemas.servicio_instantaneo import ServicioInstantaneoCreate, ServicioInstantaneoRead
from app.schemas.trabajo import TrabajoRead, TrabajoCancelarResponse
from app.models.professional import Profesional
from app.models.user import Usuario
from app.models.oficio import Oficio
from app.models.servicio_instantaneo import ServicioInstantaneo
from app.models.trabajo import Trabajo
from app.models.enums import VerificationStatus, ProfessionalLevel, EstadoEscrow
from app.services.mercadopago_service import mercadopago_service


router = APIRouter(
    prefix="",
    tags=["admin"],
)


@router.get(
    "/kyc/pendientes",
    response_model=List[ProfessionalPendingReview],
    summary="Listar profesionales con KYC en revisión",
    dependencies=[Depends(get_current_admin_user)]
)
def list_pending_kyc(db: Session = Depends(get_db)) -> list[ProfessionalPendingReview]:
    profesionales = (
        db.query(Profesional)
        .filter(Profesional.estado_verificacion == VerificationStatus.EN_REVISION)
        .all()
    )
    # Mapear a schema; asumiendo relación joined user, sino hacer join
    result = []
    for p in profesionales:
        # p.usuario está lazy="joined" en el modelo, por lo que debería estar disponible
        u = p.usuario
        result.append(
            ProfessionalPendingReview(
                id=p.id,
                email=u.email,
                nombre=u.nombre,
                apellido=u.apellido,
                fecha_creacion=p.fecha_creacion,
                estado_verificacion=p.estado_verificacion,
            )
        )
    return result


@router.post(
    "/kyc/approve/{profesional_id}",
    summary="Aprobar KYC de un profesional",
    dependencies=[Depends(get_current_admin_user)]
)
def approve_professional(
    profesional_id: UUID,
    db: Session = Depends(get_db),
):
    prof = db.query(Profesional).filter(Profesional.id == profesional_id).first()
    if not prof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profesional no encontrado")

    prof.estado_verificacion = VerificationStatus.APROBADO
    # Bonus: asegurar tasa de comisión default por nivel BRONCE
    if prof.nivel == ProfessionalLevel.BRONCE and (prof.tasa_comision_actual is None or float(prof.tasa_comision_actual) != 0.20):
        prof.tasa_comision_actual = 0.20

    db.add(prof)
    db.commit()

    return {"status": "aprobado", "profesional_id": str(profesional_id)}


@router.post(
    "/kyc/reject/{profesional_id}",
    summary="Rechazar KYC de un profesional",
    dependencies=[Depends(get_current_admin_user)]
)
def reject_professional(
    profesional_id: UUID,
    db: Session = Depends(get_db),
):
    prof = db.query(Profesional).filter(Profesional.id == profesional_id).first()
    if not prof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profesional no encontrado")

    prof.estado_verificacion = VerificationStatus.RECHAZADO
    db.add(prof)
    db.commit()

    return {"status": "rechazado", "profesional_id": str(profesional_id)}


# ==========================================
# ENDPOINTS DE GESTIÓN DE OFICIOS
# ==========================================

@router.post(
    "/oficios",
    response_model=OficioRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo oficio (Admin only)",
    dependencies=[Depends(get_current_admin_user)]
)
def create_oficio(
    oficio_data: OficioCreate,
    db: Session = Depends(get_db),
) -> OficioRead:
    """
    Crea un nuevo oficio en el sistema.
    Solo los administradores pueden crear oficios.
    """
    # Verificar que el nombre no esté duplicado
    existing = db.query(Oficio).filter(Oficio.nombre == oficio_data.nombre).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un oficio con el nombre '{oficio_data.nombre}'"
        )
    
    # Crear el nuevo oficio
    nuevo_oficio = Oficio(
        nombre=oficio_data.nombre,
        descripcion=oficio_data.descripcion
    )
    db.add(nuevo_oficio)
    db.commit()
    db.refresh(nuevo_oficio)
    
    return OficioRead.model_validate(nuevo_oficio)


@router.get(
    "/oficios",
    response_model=List[OficioRead],
    summary="Listar todos los oficios",
    dependencies=[Depends(get_current_user)]
)
def list_oficios(db: Session = Depends(get_db)) -> list[OficioRead]:
    """
    Lista todos los oficios disponibles.
    Los profesionales necesitan ver esta lista para asignarse oficios.
    """
    oficios = db.query(Oficio).order_by(Oficio.nombre).all()
    return [OficioRead.model_validate(o) for o in oficios]


# ==========================================
# ENDPOINTS DE GESTIÓN DE SERVICIOS INSTANTÁNEOS
# ==========================================

@router.post(
    "/servicios-instant",
    response_model=ServicioInstantaneoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo servicio instantáneo (Admin only)",
    dependencies=[Depends(get_current_admin_user)]
)
def create_servicio_instantaneo(
    servicio_data: ServicioInstantaneoCreate,
    db: Session = Depends(get_db),
) -> ServicioInstantaneoRead:
    """
    Crea un nuevo servicio instantáneo en el sistema.
    Solo los administradores pueden crear servicios instantáneos.
    """
    # Verificar que el oficio existe
    oficio = db.query(Oficio).filter(Oficio.id == servicio_data.oficio_id).first()
    if not oficio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe el oficio con ID {servicio_data.oficio_id}"
        )
    
    # Crear el nuevo servicio instantáneo
    nuevo_servicio = ServicioInstantaneo(
        nombre=servicio_data.nombre,
        descripcion=servicio_data.descripcion,
        oficio_id=servicio_data.oficio_id
    )
    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)
    
    return ServicioInstantaneoRead.model_validate(nuevo_servicio)


@router.get(
    "/oficios/{oficio_id}/servicios-instant",
    response_model=List[ServicioInstantaneoRead],
    summary="Listar servicios instantáneos de un oficio",
    dependencies=[Depends(get_current_user)]
)
def list_servicios_instantaneos_por_oficio(
    oficio_id: UUID,
    db: Session = Depends(get_db)
) -> list[ServicioInstantaneoRead]:
    """
    Lista todos los servicios instantáneos de un oficio específico.
    """
    # Verificar que el oficio existe
    oficio = db.query(Oficio).filter(Oficio.id == oficio_id).first()
    if not oficio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe el oficio con ID {oficio_id}"
        )
    
    servicios = (
        db.query(ServicioInstantaneo)
        .filter(ServicioInstantaneo.oficio_id == oficio_id)
        .order_by(ServicioInstantaneo.nombre)
        .all()
    )
    return [ServicioInstantaneoRead.model_validate(s) for s in servicios]


# ==========================================
# ENDPOINTS DE GESTIÓN DE TRABAJOS
# ==========================================

@router.post(
    "/trabajo/{trabajo_id}/cancelar",
    response_model=TrabajoCancelarResponse,
    summary="Cancelar trabajo y reembolsar al cliente",
    dependencies=[Depends(get_current_admin_user)]
)
def cancelar_trabajo(
    trabajo_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Cancela un trabajo y procesa un reembolso completo (100%) al cliente.
    
    **Este endpoint es CRÍTICO para el flujo de devolución de dinero.**
    
    Solo los administradores pueden cancelar trabajos.
    
    Flujo:
    1. Busca el trabajo
    2. Verifica que el dinero esté en escrow (PAGADO_EN_ESCROW)
    3. Valida que haya un payment_id de MercadoPago
    4. Ejecuta refund completo en MercadoPago
    5. Actualiza el trabajo a estado CANCELADO_REEMBOLSADO
    6. Retorna confirmación
    
    **Casos de uso:**
    - Disputa entre cliente y profesional
    - Profesional no cumplió el servicio
    - Fraude detectado
    - Cliente solicita cancelación antes de iniciar trabajo
    
    Args:
        trabajo_id: UUID del trabajo a cancelar
        
    Returns:
        TrabajoCancelarResponse con:
            - trabajo: Datos del trabajo actualizado
            - refund_id: ID del reembolso en MercadoPago
            - mensaje: Confirmación de la operación
        
    Raises:
        404: Si el trabajo no existe
        400: Si el trabajo no está en estado correcto
        400: Si no hay payment_id (no se puede reembolsar)
        500: Si hay error con el refund de MercadoPago
    """
    # 1. Buscar el trabajo
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    # 2. Verificar que el dinero esté en escrow
    if trabajo.estado_escrow != EstadoEscrow.PAGADO_EN_ESCROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar un trabajo en estado {trabajo.estado_escrow.value}. "
                   f"Solo se pueden cancelar trabajos en estado PAGADO_EN_ESCROW."
        )
    
    # 3. Validar que haya payment_id
    if not trabajo.mercadopago_payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede reembolsar: no hay payment_id de MercadoPago asociado"
        )
    
    print("=" * 60)
    print("🚫 CANCELACIÓN DE TRABAJO Y REEMBOLSO")
    print(f"   Trabajo ID: {trabajo.id}")
    print(f"   Cliente: {trabajo.cliente_id}")
    print(f"   Profesional: {trabajo.profesional_id}")
    print(f"   Precio Original: ${trabajo.precio_final}")
    print(f"   Payment ID: {trabajo.mercadopago_payment_id}")
    print("=" * 60)
    
    # 4. Ejecutar refund en MercadoPago (reembolso completo = 100%)
    try:
        refund_response = mercadopago_service.crear_refund(
            payment_id=trabajo.mercadopago_payment_id,
            monto=None,  # None = reembolso total
        )
        
        if not refund_response:
            raise Exception("No se recibió respuesta del servicio de refund")
        
        refund_id = refund_response.get("id")
        refund_status = refund_response.get("status")
        
        print(f"💰 Refund ejecutado:")
        print(f"   Refund ID: {refund_id}")
        print(f"   Status: {refund_status}")
        print(f"   Monto: ${trabajo.precio_final} (100%)")
        
    except Exception as e:
        print(f"❌ Error ejecutando refund: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando reembolso: {str(e)}"
        )
    
    # 5. Actualizar el trabajo en BD
    trabajo.estado_escrow = EstadoEscrow.CANCELADO_REEMBOLSADO
    
    # Limpiar montos ya que se devolvió todo
    trabajo.comision_plataforma = 0
    trabajo.monto_liberado = 0
    
    db.add(trabajo)
    db.commit()
    db.refresh(trabajo)
    
    print("=" * 60)
    print("✅ TRABAJO CANCELADO Y REEMBOLSADO")
    print(f"   Estado: {trabajo.estado_escrow.value}")
    print(f"   Refund ID: {refund_id}")
    print(f"   Cliente recibió: ${trabajo.precio_final}")
    print("=" * 60)
    
    # 6. Retornar respuesta
    return TrabajoCancelarResponse(
        trabajo=TrabajoRead.model_validate(trabajo),
        refund_id=refund_id,
        mensaje=f"Trabajo cancelado. Se reembolsaron ${trabajo.precio_final} al cliente."
    )


@router.get(
    "/trabajos",
    response_model=List[TrabajoRead],
    summary="Listar todos los trabajos (admin)",
    dependencies=[Depends(get_current_admin_user)]
)
def list_all_trabajos(
    db: Session = Depends(get_db),
):
    """
    Lista todos los trabajos del sistema.
    Útil para monitoreo y administración.
    """
    trabajos = (
        db.query(Trabajo)
        .order_by(Trabajo.fecha_creacion.desc())
        .all()
    )
    
    return [TrabajoRead.model_validate(t) for t in trabajos]


@router.post(
    "/trabajo/{trabajo_id}/simular-pago",
    response_model=TrabajoRead,
    summary="[TESTING] Simular pago completado",
    dependencies=[Depends(get_current_admin_user)]
)
def simular_pago_completado(
    trabajo_id: UUID,
    db: Session = Depends(get_db),
):
    """
    **SOLO PARA TESTING**: Simula que el pago se completó, actualizando
    el estado del trabajo a PAGADO_EN_ESCROW.
    
    En producción, esto lo hace automáticamente el webhook de MercadoPago.
    """
    trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
    
    if not trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo no encontrado"
        )
    
    if trabajo.estado_escrow != EstadoEscrow.PENDIENTE_PAGO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El trabajo debe estar en PENDIENTE_PAGO. Estado actual: {trabajo.estado_escrow.value}"
        )
    
    # Actualizar estado
    trabajo.estado_escrow = EstadoEscrow.PAGADO_EN_ESCROW
    trabajo.mercadopago_payment_id = f"MOCK-PAYMENT-{str(trabajo_id)[:8]}"
    
    db.commit()
    db.refresh(trabajo)
    
    print(f"🧪 [TESTING] Trabajo {trabajo_id} actualizado a PAGADO_EN_ESCROW")
    
    return TrabajoRead.model_validate(trabajo)


# ==========================================
# ENDPOINTS DE MODERACIÓN DE USUARIOS
# ==========================================

@router.get(
    "/users",
    response_model=dict,
    summary="Listar todos los usuarios (paginado)",
    description="""
    Lista todos los usuarios del sistema de forma paginada.
    
    **Paginación:**
    - page: Número de página (default: 1)
    - limit: Usuarios por página (default: 10, max: 100)
    
    **Respuesta:**
    ```json
    {
        "users": [...],
        "total": 150,
        "page": 1,
        "limit": 10,
        "totalPages": 15
    }
    ```
    
    **Uso:** Panel de administración para ver todos los usuarios registrados.
    """,
    dependencies=[Depends(get_current_admin_user)]
)
def list_all_users(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Lista todos los usuarios del sistema con paginación.
    
    Args:
        page: Número de página (mínimo 1)
        limit: Cantidad de resultados por página (máximo 100)
        
    Returns:
        Diccionario con users, total, page, limit y totalPages
    """
    # Validaciones
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    if limit > 100:
        limit = 100
    
    # Calcular offset
    offset = (page - 1) * limit
    
    # Query para contar total de usuarios
    total = db.query(Usuario).count()
    
    # Query para obtener usuarios paginados
    usuarios = (
        db.query(Usuario)
        .order_by(Usuario.fecha_creacion.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    # Calcular total de páginas
    import math
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    print(f"📋 Admin listando usuarios: página {page}/{total_pages} ({len(usuarios)} usuarios)")
    
    return {
        "users": [UserSearchResult.model_validate(u) for u in usuarios],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }


@router.get(
    "/users/search",
    response_model=List[UserSearchResult],
    summary="Buscar usuarios por email",
    description="""
    Busca usuarios en el sistema por email (búsqueda parcial).
    
    **Uso:** El admin busca usuarios para obtener su user_id antes de banear/desbanear.
    
    **Ejemplo:** Si buscas "juan", encontrará "juan@example.com", "juanperez@gmail.com", etc.
    """,
    dependencies=[Depends(get_current_admin_user)]
)
def search_users(
    email: str,
    db: Session = Depends(get_db)
) -> List[UserSearchResult]:
    """
    Busca usuarios por email (búsqueda parcial case-insensitive).
    
    Args:
        email: Término de búsqueda (ej: "juan", "example.com", etc.)
        
    Returns:
        Lista de usuarios que coinciden con la búsqueda
        
    Example:
        GET /api/v1/admin/users/search?email=juan
    """
    if not email or len(email) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El término de búsqueda debe tener al menos 2 caracteres"
        )
    
    # Búsqueda case-insensitive con ILIKE
    usuarios = (
        db.query(Usuario)
        .filter(Usuario.email.ilike(f"%{email}%"))
        .order_by(Usuario.fecha_creacion.desc())
        .limit(50)  # Limitar resultados para evitar sobrecarga
        .all()
    )
    
    print(f"🔍 Admin buscó usuarios con email '{email}': {len(usuarios)} resultados")
    
    return [UserSearchResult.model_validate(u) for u in usuarios]


@router.post(
    "/users/{user_id}/ban",
    response_model=UserBanResponse,
    summary="Banear usuario (desactivar cuenta)",
    description="""
    **MODERACIÓN CRÍTICA:** Desactiva completamente la cuenta de un usuario.
    
    El usuario baneado:
    - ❌ NO podrá iniciar sesión
    - ❌ NO podrá acceder a ningún endpoint protegido
    - ❌ Sus sesiones activas quedan invalidadas (is_active=False)
    
    **Casos de uso:**
    - Usuarios que violan términos de servicio
    - Fraude detectado
    - Spam o abuso del sistema
    - Solicitud del usuario de cerrar su cuenta
    
    **IMPORTANTE:** Esta acción NO elimina los datos del usuario (RGPD compliance).
    Solo desactiva el acceso a la plataforma.
    """,
    dependencies=[Depends(get_current_admin_user)]
)
def ban_user(
    user_id: UUID,
    admin_user: Usuario = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> UserBanResponse:
    """
    Banea (desactiva) un usuario del sistema.
    
    Args:
        user_id: UUID del usuario a banear
        
    Returns:
        Confirmación del baneo con datos del usuario
        
    Raises:
        404: Si el usuario no existe
        400: Si se intenta banear a un admin
        400: Si el usuario ya está baneado
    """
    # Buscar el usuario
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Prevenir baneo de admins (seguridad)
    if usuario.rol.value == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede banear a un administrador"
        )
    
    # Verificar si ya está baneado
    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario {usuario.email} ya está baneado"
        )
    
    # BANEAR: Desactivar cuenta
    usuario.is_active = False
    db.commit()
    db.refresh(usuario)
    
    print("=" * 70)
    print("🚫 USUARIO BANEADO")
    print(f"   Admin: {admin_user.email}")
    print(f"   Usuario baneado: {usuario.email} (ID: {usuario.id})")
    print(f"   Rol: {usuario.rol.value}")
    print(f"   is_active: {usuario.is_active}")
    print("=" * 70)
    
    return UserBanResponse(
        user_id=usuario.id,
        email=usuario.email,
        is_active=usuario.is_active,
        mensaje=f"Usuario {usuario.email} ha sido baneado exitosamente. No podrá iniciar sesión."
    )


@router.post(
    "/users/{user_id}/unban",
    response_model=UserUnbanResponse,
    summary="Desbanear usuario (reactivar cuenta)",
    description="""
    **MODERACIÓN:** Reactiva la cuenta de un usuario previamente baneado.
    
    El usuario desbaneado:
    - ✅ Podrá iniciar sesión nuevamente
    - ✅ Recupera acceso completo a la plataforma
    - ✅ Mantiene todos sus datos históricos (trabajos, reseñas, etc.)
    
    **Casos de uso:**
    - Reversión de baneo erróneo
    - Usuario apeló y fue aceptado
    - Baneo temporal que ya expiró
    - Usuario pagó multa o completó proceso de rehabilitación
    """,
    dependencies=[Depends(get_current_admin_user)]
)
def unban_user(
    user_id: UUID,
    admin_user: Usuario = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> UserUnbanResponse:
    """
    Desbanea (reactiva) un usuario del sistema.
    
    Args:
        user_id: UUID del usuario a desbanear
        
    Returns:
        Confirmación del desbaneo con datos del usuario
        
    Raises:
        404: Si el usuario no existe
        400: Si el usuario ya está activo (no baneado)
    """
    # Buscar el usuario
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar si ya está activo
    if usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario {usuario.email} ya está activo (no está baneado)"
        )
    
    # DESBANEAR: Reactivar cuenta
    usuario.is_active = True
    db.commit()
    db.refresh(usuario)
    
    print("=" * 70)
    print("✅ USUARIO DESBANEADO")
    print(f"   Admin: {admin_user.email}")
    print(f"   Usuario desbaneado: {usuario.email} (ID: {usuario.id})")
    print(f"   Rol: {usuario.rol.value}")
    print(f"   is_active: {usuario.is_active}")
    print("=" * 70)
    
    return UserUnbanResponse(
        user_id=usuario.id,
        email=usuario.email,
        is_active=usuario.is_active,
        mensaje=f"Usuario {usuario.email} ha sido desbaneado exitosamente. Puede iniciar sesión nuevamente."
    )


# ==========================================
# ENDPOINTS DE MÉTRICAS Y DASHBOARD
# ==========================================

@router.get(
    "/metrics/financials",
    response_model=FinancialMetricsResponse,
    summary="Obtener métricas financieras del negocio",
    description="""
    **Dashboard de Admin:** Muestra las métricas financieras clave del negocio.
    
    **Métricas calculadas:**
    - **total_facturado**: Suma de todos los precios finales de trabajos LIBERADOS
    - **comision_total**: Suma de todas las comisiones cobradas por la plataforma
    - **trabajos_completados**: Cantidad de trabajos finalizados exitosamente
    
    **Importante:** Solo se cuentan trabajos en estado LIBERADO (dinero ya transferido al profesional).
    
    Los trabajos en otros estados (PENDIENTE_PAGO, PAGADO_EN_ESCROW, CANCELADO) NO se incluyen.
    
    **Uso:** El admin ve estas métricas al entrar al panel de control para monitorear
    el volumen de negocio y la salud financiera de la plataforma.
    """,
    dependencies=[Depends(get_current_admin_user)]
)
def get_financial_metrics(
    db: Session = Depends(get_db)
) -> FinancialMetricsResponse:
    """
    Calcula y retorna las métricas financieras del negocio.
    
    **Queries de agregación con SQLAlchemy:**
    - func.sum() para calcular totales
    - func.count() para contar trabajos
    - Filtrado por estado_escrow = LIBERADO
    
    Returns:
        FinancialMetricsResponse con:
            - total_facturado: Suma de precio_final de trabajos liberados
            - comision_total: Suma de comisiones cobradas
            - trabajos_completados: Cantidad de trabajos liberados
            
    Example:
        >>> GET /api/v1/admin/metrics/financials
        {
            "total_facturado": 150000.50,
            "comision_total": 30000.10,
            "trabajos_completados": 42
        }
    """
    print("=" * 70)
    print("📊 CALCULANDO MÉTRICAS FINANCIERAS")
    print("=" * 70)
    
    # Query 1: Total facturado (suma de precios finales de trabajos LIBERADOS)
    total_facturado = (
        db.query(func.sum(Trabajo.precio_final))
        .filter(Trabajo.estado_escrow == EstadoEscrow.LIBERADO)
        .scalar()
    ) or 0
    
    # Query 2: Comisión total (suma de comisiones cobradas)
    comision_total = (
        db.query(func.sum(Trabajo.comision_plataforma))
        .filter(Trabajo.estado_escrow == EstadoEscrow.LIBERADO)
        .scalar()
    ) or 0
    
    # Query 3: Trabajos completados (cantidad de trabajos LIBERADOS)
    trabajos_completados = (
        db.query(func.count(Trabajo.id))
        .filter(Trabajo.estado_escrow == EstadoEscrow.LIBERADO)
        .scalar()
    ) or 0
    
    print(f"💰 Total Facturado: ${total_facturado}")
    print(f"💵 Comisión Total: ${comision_total}")
    print(f"✅ Trabajos Completados: {trabajos_completados}")
    print("=" * 70)
    
    # Convertir Decimal a float para el schema
    return FinancialMetricsResponse(
        total_facturado=float(total_facturado),
        comision_total=float(comision_total),
        trabajos_completados=trabajos_completados
    )


@router.get(
    "/metrics/users",
    response_model=UserMetricsResponse,
    summary="Obtener métricas de crecimiento de usuarios",
    description="""
    **Dashboard de Admin:** Muestra las métricas de crecimiento de usuarios.
    
    **Métricas calculadas:**
    - **total_clientes**: Cantidad de usuarios con rol CLIENTE
    - **total_profesionales**: Cantidad de usuarios con rol PROFESIONAL
    - **total_pro_pendientes_kyc**: Profesionales con KYC en revisión (EN_REVISION)
    - **total_pro_aprobados**: Profesionales verificados y aprobados (APROBADO)
    
    **Uso:** El admin ve estas métricas para monitorear el crecimiento de la plataforma
    y el estado del proceso de verificación KYC.
    """,
    dependencies=[Depends(get_current_admin_user)]
)
def get_user_metrics(
    db: Session = Depends(get_db)
) -> UserMetricsResponse:
    """
    Calcula y retorna las métricas de usuarios de la plataforma.
    
    Returns:
        UserMetricsResponse con:
            - total_clientes: Cantidad de usuarios CLIENTE
            - total_profesionales: Cantidad de usuarios PROFESIONAL
            - total_pro_pendientes_kyc: Profesionales en revisión
            - total_pro_aprobados: Profesionales verificados
    """
    from app.models.enums import UserRole
    
    print("=" * 70)
    print("👥 CALCULANDO MÉTRICAS DE USUARIOS")
    print("=" * 70)
    
    # Query 1: Total de clientes
    total_clientes = (
        db.query(Usuario)
        .filter(Usuario.rol == UserRole.CLIENTE)
        .count()
    )
    
    # Query 2: Total de profesionales
    total_profesionales = (
        db.query(Usuario)
        .filter(Usuario.rol == UserRole.PROFESIONAL)
        .count()
    )
    
    # Query 3: Profesionales con KYC pendiente de revisión
    total_pro_pendientes_kyc = (
        db.query(Profesional)
        .filter(Profesional.estado_verificacion == VerificationStatus.EN_REVISION)
        .count()
    )
    
    # Query 4: Profesionales aprobados
    total_pro_aprobados = (
        db.query(Profesional)
        .filter(Profesional.estado_verificacion == VerificationStatus.APROBADO)
        .count()
    )
    
    print(f"👤 Total Clientes: {total_clientes}")
    print(f"👨‍💼 Total Profesionales: {total_profesionales}")
    print(f"📋 Profesionales Pendientes KYC: {total_pro_pendientes_kyc}")
    print(f"✅ Profesionales Aprobados: {total_pro_aprobados}")
    print("=" * 70)
    
    return UserMetricsResponse(
        total_clientes=total_clientes,
        total_profesionales=total_profesionales,
        total_pro_pendientes_kyc=total_pro_pendientes_kyc,
        total_pro_aprobados=total_pro_aprobados
    )
