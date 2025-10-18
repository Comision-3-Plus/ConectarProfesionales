"""
Endpoints públicos (sin autenticación requerida).
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.portfolio import PortfolioItem, PortfolioImagen
from app.models.professional import Profesional
from app.models.user import Usuario
from app.models.enums import VerificationStatus
from app.schemas.portfolio import PortfolioItemRead
from app.schemas.professional import PublicProfileResponse

router = APIRouter()


@router.get(
    "/professional/{prof_id}/portfolio",
    response_model=List[PortfolioItemRead],
    summary="Ver portfolio de un profesional (público)"
)
def get_professional_portfolio(
    prof_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Obtiene el portfolio completo de un profesional.
    Endpoint público, no requiere autenticación.
    Retorna todos los items de portfolio con sus imágenes ordenadas.
    """
    # Verificar que el profesional existe
    profesional = db.query(Profesional).filter(Profesional.id == prof_id).first()
    if not profesional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # Obtener todos los items de portfolio del profesional
    portfolio_items = (
        db.query(PortfolioItem)
        .filter(PortfolioItem.profesional_id == prof_id)
        .order_by(PortfolioItem.fecha_creacion.desc())
        .all()
    )
    
    return [PortfolioItemRead.model_validate(item) for item in portfolio_items]


@router.get(
    "/professional/{profesional_id}",
    response_model=PublicProfileResponse,
    summary="Ver perfil público completo de un profesional"
)
def get_professional_public_profile(
    profesional_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Obtiene el perfil público completo y detallado de un profesional.
    
    Este endpoint es la "página de producto" del profesional.
    Incluye:
    - Datos básicos (nombre, apellido, avatar)
    - Datos profesionales (nivel, radio, tarifa, acepta_instant)
    - Oficios que ofrece
    - Portfolio completo con imágenes
    
    Endpoint público, no requiere autenticación.
    Solo muestra profesionales APROBADOS.
    """
    # Query optimizada con joinedload para evitar N+1 queries
    profesional = (
        db.query(Profesional)
        .options(
            joinedload(Profesional.usuario),
            joinedload(Profesional.oficios),
            joinedload(Profesional.portfolio_items).joinedload(PortfolioItem.imagenes)
        )
        .filter(Profesional.id == profesional_id)
        .first()
    )
    
    # Verificar existencia
    if not profesional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # Solo mostrar profesionales aprobados
    if profesional.estado_verificacion != VerificationStatus.APROBADO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no disponible"
        )
    
    # Convertir a schema público (sin info sensible)
    return PublicProfileResponse.from_professional(profesional)
