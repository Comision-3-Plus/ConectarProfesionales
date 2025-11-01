from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from shared.models.enums import ProfessionalLevel


class SearchProfessionalsRequest(BaseModel):
    """Query parameters para búsqueda de profesionales"""
    oficio_id: UUID = Field(..., description="ID del oficio buscado")
    lat: float = Field(..., ge=-90, le=90, description="Latitud del cliente")
    lng: float = Field(..., ge=-180, le=180, description="Longitud del cliente")
    
    # Filtros opcionales
    nivel: Optional[ProfessionalLevel] = Field(None, description="Filtrar por nivel (BRONCE, PLATA, ORO, DIAMANTE)")
    acepta_instant: Optional[bool] = Field(None, description="Filtrar por aceptación de Instant Booking")
    sort_by: Optional[str] = Field(None, description="Ordenar por campo (rating, nivel)")


# Alias para compatibilidad
SearchRequest = SearchProfessionalsRequest
SearchResponse = list  # Lista de ProfessionalSearchResult
ProfessionalSearchResult = dict  # Dict con datos del profesional
