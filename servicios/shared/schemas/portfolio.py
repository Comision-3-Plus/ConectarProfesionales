"""
Esquemas Pydantic para portfolio de profesionales.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class PortfolioImagenRead(BaseModel):
    """Schema para lectura de imágenes de portfolio"""
    id: UUID
    imagen_url: str
    orden: int
    
    model_config = ConfigDict(from_attributes=True)


class PortfolioItemCreate(BaseModel):
    """Schema para crear un item de portfolio"""
    titulo: str = Field(..., min_length=1, max_length=200)
    descripcion: Optional[str] = Field(None, max_length=1000)


class PortfolioItemRead(BaseModel):
    """Schema para lectura de item de portfolio"""
    id: UUID
    profesional_id: UUID
    titulo: str
    descripcion: Optional[str]
    fecha_creacion: datetime
    imagenes: list[PortfolioImagenRead] = []
    
    model_config = ConfigDict(from_attributes=True)


class PortfolioItemUpdate(BaseModel):
    """Schema para actualizar un item de portfolio"""
    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    descripcion: Optional[str] = Field(None, max_length=1000)


# Alias para compatibilidad
PortfolioCreate = PortfolioItemCreate
PortfolioResponse = PortfolioItemRead
