"""
Schemas Pydantic para trabajos (contratos en ejecución)
"""
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from typing import Optional


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
