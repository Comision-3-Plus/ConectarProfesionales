"""
Schemas Pydantic para el modelo Oficio.
"""
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID


class OficioCreate(BaseModel):
    """Schema para crear un nuevo oficio (Admin only)"""
    nombre: str = Field(..., min_length=3, max_length=100, description="Nombre del oficio")
    descripcion: str | None = Field(None, max_length=500, description="Descripción del oficio")


class OficioRead(BaseModel):
    """Schema para leer un oficio"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    nombre: str
    descripcion: str | None


class ProfessionalOficiosUpdate(BaseModel):
    """Schema para que un profesional actualice sus oficios"""
    oficio_ids: list[UUID] = Field(..., description="Lista de IDs de oficios que ofrece el profesional")
