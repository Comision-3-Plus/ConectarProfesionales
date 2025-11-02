"""
Schemas Pydantic para preferencias de notificaciones
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID


class NotificationPreferencesUpdate(BaseModel):
    """Schema para actualizar preferencias de notificaciones"""
    email_ofertas: Optional[bool] = None
    email_trabajos: Optional[bool] = None
    email_pagos: Optional[bool] = None
    email_mensajes: Optional[bool] = None
    push_ofertas: Optional[bool] = None
    push_trabajos: Optional[bool] = None
    push_pagos: Optional[bool] = None
    push_mensajes: Optional[bool] = None


class NotificationPreferencesRead(BaseModel):
    """Schema para lectura de preferencias de notificaciones"""
    user_id: UUID
    email_ofertas: bool
    email_trabajos: bool
    email_pagos: bool
    email_mensajes: bool
    push_ofertas: bool
    push_trabajos: bool
    push_pagos: bool
    push_mensajes: bool
    
    model_config = ConfigDict(from_attributes=True)


class NotificationHistoryItem(BaseModel):
    """Schema para un item del historial de notificaciones"""
    id: UUID
    user_id: UUID
    tipo: str
    titulo: str
    mensaje: str
    leido: bool
    fecha_envio: str
    
    model_config = ConfigDict(from_attributes=True)
