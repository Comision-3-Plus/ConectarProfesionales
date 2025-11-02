"""
Schemas Pydantic para disputas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class DisputeCreate(BaseModel):
    """Schema para crear una disputa"""
    trabajo_id: UUID
    tipo: str = Field(..., description="Tipo de disputa")
    descripcion: str = Field(..., min_length=20, max_length=2000)
    evidencia_urls: Optional[List[str]] = None


class DisputeUpdate(BaseModel):
    """Schema para actualizar una disputa (admin)"""
    estado: Optional[str] = None
    resolucion: Optional[str] = None


class DisputeRead(BaseModel):
    """Schema para lectura de disputa"""
    id: UUID
    trabajo_id: UUID
    solicitante_id: UUID
    tipo: str
    estado: str
    descripcion: str
    evidencia_urls: Optional[str]
    resolucion: Optional[str]
    admin_id: Optional[UUID]
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Alias para compatibilidad
DisputeResponse = DisputeRead
