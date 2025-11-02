"""
Esquemas Pydantic para servicios instantáneos.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ServicioInstantaneoBase(BaseModel):
    """Schema base para servicios instantáneos"""
    nombre: str = Field(..., min_length=1, max_length=100, description="Título del servicio/proyecto")
    descripcion: Optional[str] = Field(None, max_length=500, description="Descripción del servicio")
    precio_fijo: Decimal = Field(..., gt=0, description="Precio fijo del servicio")


class ServicioInstantaneoCreate(ServicioInstantaneoBase):
    """Schema para crear un servicio instantáneo (profesional crea su proyecto)"""
    oficio_id: UUID = Field(..., description="ID del oficio al que pertenece")


class ServicioInstantaneoRead(ServicioInstantaneoBase):
    """Schema para lectura de servicio instantáneo"""
    id: UUID
    oficio_id: UUID
    profesional_id: UUID
    fecha_creacion: datetime
    
    # Información del profesional (opcional, para cuando se incluya)
    profesional: Optional[dict] = None
    oficio: Optional[dict] = None
    
    model_config = ConfigDict(from_attributes=True)


class ServicioInstantaneoUpdate(BaseModel):
    """Schema para actualizar un servicio instantáneo"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    precio_fijo: Optional[Decimal] = Field(None, gt=0)
