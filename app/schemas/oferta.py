"""
Schemas Pydantic para ofertas económicas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class OfertaCreate(BaseModel):
    """Schema para crear una oferta"""
    cliente_id: UUID = Field(..., description="ID del cliente que recibirá la oferta")
    chat_id: str = Field(..., min_length=1, max_length=255, description="ID de la sala de chat en Firestore")
    descripcion: str = Field(..., min_length=10, description="Descripción detallada del servicio")
    precio_final: Decimal = Field(..., gt=0, description="Precio final en pesos argentinos")


class OfertaUpdate(BaseModel):
    """Schema para actualizar el estado de una oferta"""
    estado: str = Field(..., description="Nuevo estado de la oferta")


class OfertaRead(BaseModel):
    """Schema para lectura de oferta"""
    id: UUID
    profesional_id: UUID
    cliente_id: UUID
    chat_id: str
    descripcion: str
    precio_final: Decimal
    estado: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


class OfertaAcceptResponse(BaseModel):
    """Schema para respuesta de aceptación de oferta con link de pago"""
    oferta: OfertaRead
    trabajo_id: UUID
    payment_preference_id: str
    payment_url: str
    mensaje: str = "Oferta aceptada. Procede al pago para confirmar el trabajo."
