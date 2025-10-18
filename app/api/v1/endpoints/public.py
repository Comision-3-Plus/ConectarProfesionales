"""
Endpoints públicos (sin autenticación requerida).
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.portfolio import PortfolioItem
from app.models.professional import Profesional
from app.schemas.portfolio import PortfolioItemRead

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
