from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, List
from decimal import Decimal
from shared.models.enums import ProfessionalLevel


class SearchProfessionalsRequest(BaseModel):
    """Parámetros de búsqueda de profesionales esperados por el frontend."""
    oficio: Optional[str] = Field(None, description="Nombre del oficio (ej: Plomería)")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitud del cliente")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitud del cliente")
    radio_km: int = Field(default=10, ge=1, le=500, description="Radio de búsqueda en KM")
    incluir_fuera_de_radio: bool = Field(default=False)
    solo_disponibles_ahora: Optional[bool] = Field(default=False)
    rating_minimo: Optional[float] = None
    precio_minimo: Optional[Decimal] = None
    precio_maximo: Optional[Decimal] = None
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1, le=1000)
    ordenar_por: Optional[str] = Field(default="rating")

    model_config = ConfigDict(from_attributes=True)


class ProfessionalSearchResult(BaseModel):
    id: UUID
    nombre: str
    apellido: str
    oficio: str
    tarifa_por_hora: Optional[Decimal] = None
    calificacion_promedio: float
    cantidad_resenas: int
    distancia_km: Optional[float] = None
    nivel_profesional: ProfessionalLevel
    puntos_experiencia: int
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SearchResponse(BaseModel):
    total: int
    resultados: List[ProfessionalSearchResult]
    pagina: int
    total_paginas: int

    model_config = ConfigDict(from_attributes=True)


# Alias para compatibilidad
SearchRequest = SearchProfessionalsRequest
