"""
Esquemas Pydantic para servicios instantáneos.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class ServicioInstantaneoBase(BaseModel):
    """Schema base para servicios instantáneos"""
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)


class ServicioInstantaneoCreate(ServicioInstantaneoBase):
    """Schema para crear un servicio instantáneo"""
    oficio_id: UUID = Field(..., description="ID del oficio al que pertenece")


class ServicioInstantaneoRead(ServicioInstantaneoBase):
    """Schema para lectura de servicio instantáneo"""
    id: UUID
    oficio_id: UUID
    fecha_creacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ServicioInstantaneoUpdate(BaseModel):
    """Schema para actualizar un servicio instantáneo"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
