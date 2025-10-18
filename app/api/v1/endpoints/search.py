from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.search import SearchProfessionalsRequest
from app.schemas.professional import ProfessionalProfileRead
from app.services.search_service import search_professionals_by_location

router = APIRouter()


@router.get("/professionals", response_model=List[ProfessionalProfileRead])
def search_professionals(
    params: SearchProfessionalsRequest = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint público para buscar profesionales por oficio y ubicación.
    
    Devuelve profesionales APROBADOS que ofrecen el oficio solicitado
    y que cubren la ubicación del cliente según su radio de cobertura.
    """
    return search_professionals_by_location(db, params)
