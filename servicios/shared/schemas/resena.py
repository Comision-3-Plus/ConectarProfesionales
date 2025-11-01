"""
Schemas Pydantic para Reseñas
"""
from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional


class ResenaCreate(BaseModel):
    """
    Schema para crear una nueva reseña.
    Usada cuando el cliente califica un trabajo completado.
    """
    rating: int = Field(
        ...,
        ge=1,
        le=5,
        description="Calificación de 1 a 5 estrellas"
    )
    texto_resena: Optional[str] = Field(
        None,
        max_length=2000,
        description="Texto opcional de la reseña"
    )
    
    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v: int) -> int:
        """Validar que el rating esté en el rango correcto"""
        if v < 1 or v > 5:
            raise ValueError('El rating debe estar entre 1 y 5')
        return v


class ResenaRead(BaseModel):
    """
    Schema para leer una reseña existente.
    Incluye todos los datos de la reseña.
    """
    id: UUID
    trabajo_id: UUID
    cliente_id: UUID
    profesional_id: UUID
    rating: int
    texto_resena: Optional[str]
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    model_config = {"from_attributes": True}


class ResenaPublicRead(BaseModel):
    """
    Schema para leer una reseña en el perfil público.
    Incluye el nombre del cliente pero NO su ID ni email (privacidad).
    """
    id: UUID
    rating: int
    texto_resena: Optional[str]
    nombre_cliente: str = Field(
        description="Nombre completo del cliente que dejó la reseña"
    )
    fecha_creacion: datetime
    
    model_config = {"from_attributes": True}
    
    @classmethod
    def from_resena(cls, resena):
        """
        Constructor helper para crear desde un objeto Resena con relación cliente.
        """
        return cls(
            id=resena.id,
            rating=resena.rating,
            texto_resena=resena.texto_resena,
            nombre_cliente=f"{resena.cliente.nombre} {resena.cliente.apellido}",
            fecha_creacion=resena.fecha_creacion,
        )


class ResenaCreateResponse(BaseModel):
    """
    Respuesta al crear una reseña.
    Incluye la reseña creada y el rating actualizado del profesional.
    """
    resena: ResenaRead
    profesional_rating_promedio: float = Field(
        description="Nuevo rating promedio del profesional"
    )
    profesional_total_resenas: int = Field(
        description="Total de reseñas que tiene el profesional"
    )
    mensaje: str


# Alias para compatibilidad
ResenaResponse = ResenaRead
