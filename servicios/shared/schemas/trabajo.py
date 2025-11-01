"""
Schemas Pydantic para trabajos (contratos en ejecución)
"""
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from typing import Optional


class TrabajoCreate(BaseModel):
    """Schema para crear un trabajo"""
    cliente_id: UUID
    profesional_id: UUID
    oferta_id: Optional[UUID] = None
    servicio_instant_id: Optional[UUID] = None
    precio_final: Decimal = Field(..., gt=0)
    comision_plataforma: Optional[Decimal] = None
    
    model_config = ConfigDict(from_attributes=True)


class TrabajoUpdate(BaseModel):
    """Schema para actualizar un trabajo"""
    estado: Optional[str] = None
    estado_escrow: Optional[str] = None
    monto_liberado: Optional[Decimal] = None
    mercadopago_payment_id: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class TrabajoRead(BaseModel):
    """Schema para lectura de trabajo"""
    id: UUID
    cliente_id: UUID
    profesional_id: UUID
    oferta_id: Optional[UUID]
    servicio_instant_id: Optional[UUID]
    precio_final: Decimal
    comision_plataforma: Optional[Decimal]
    monto_liberado: Optional[Decimal]
    estado_escrow: str
    mercadopago_payment_id: Optional[str]
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TrabajoFinalizarResponse(BaseModel):
    """Schema para respuesta de finalización de trabajo"""
    trabajo: TrabajoRead
    payout_id: str
    mensaje: str = "Trabajo finalizado y fondos liberados al profesional"


class TrabajoCancelarResponse(BaseModel):
    """Schema para respuesta de cancelación de trabajo"""
    trabajo: TrabajoRead
    refund_id: str
    mensaje: str = "Trabajo cancelado y reembolso procesado"


# Alias para compatibilidad
TrabajoResponse = TrabajoRead
