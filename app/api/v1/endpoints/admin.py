"""
Endpoints de administración (Backoffice) protegidos solo para ADMIN.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user, get_current_user
from app.core.database import get_db
from app.schemas.admin import ProfessionalPendingReview
from app.schemas.oficio import OficioCreate, OficioRead
from app.schemas.servicio_instantaneo import ServicioInstantaneoCreate, ServicioInstantaneoRead
from app.models.professional import Profesional
from app.models.oficio import Oficio
from app.models.servicio_instantaneo import ServicioInstantaneo
from app.models.enums import VerificationStatus, ProfessionalLevel


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
