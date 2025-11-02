"""
Schemas Pydantic para transacciones
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class TransactionCreate(BaseModel):
    """Schema para crear una transacción"""
    trabajo_id: Optional[UUID] = None
    from_user_id: Optional[UUID] = None
    to_user_id: Optional[UUID] = None
    tipo: str
    monto: Decimal = Field(..., gt=0)
    descripcion: Optional[str] = None
    mercadopago_id: Optional[str] = None


class TransactionUpdate(BaseModel):
    """Schema para actualizar una transacción"""
    estado: Optional[str] = None
    mercadopago_status: Optional[str] = None
    metadata: Optional[str] = None


class TransactionRead(BaseModel):
    """Schema para lectura de transacción"""
    id: UUID
    trabajo_id: Optional[UUID]
    from_user_id: Optional[UUID]
    to_user_id: Optional[UUID]
    tipo: str
    estado: str
    monto: Decimal
    descripcion: Optional[str]
    mercadopago_id: Optional[str]
    mercadopago_status: Optional[str]
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Alias para compatibilidad
TransactionResponse = TransactionRead
