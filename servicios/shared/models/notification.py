"""
Modelo de Notificación - Sistema de notificaciones en la base de datos
"""
from sqlalchemy import Column, String, Text, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin, UUIDMixin
import enum


class TipoNotificacion(str, enum.Enum):
    """Tipos de notificaciones"""
    OFERTA_RECIBIDA = "OFERTA_RECIBIDA"
    OFERTA_ACEPTADA = "OFERTA_ACEPTADA"
    OFERTA_RECHAZADA = "OFERTA_RECHAZADA"
    TRABAJO_CREADO = "TRABAJO_CREADO"
    PAGO_RECIBIDO = "PAGO_RECIBIDO"
    TRABAJO_COMPLETADO = "TRABAJO_COMPLETADO"
    RESENA_RECIBIDA = "RESENA_RECIBIDA"
    MENSAJE_NUEVO = "MENSAJE_NUEVO"
    SISTEMA = "SISTEMA"


class Notification(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de notificaciones del sistema.
    Almacena notificaciones enviadas a usuarios.
    """
    __tablename__ = "notifications"
    
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del usuario que recibe la notificación"
    )
    
    tipo = Column(
        SQLEnum(TipoNotificacion, name="tipo_notificacion_enum", create_type=True),
        nullable=False,
        index=True,
        comment="Tipo de notificación"
    )
    
    titulo = Column(
        String(200),
        nullable=False,
        comment="Título de la notificación"
    )
    
    mensaje = Column(
        Text,
        nullable=False,
        comment="Contenido del mensaje"
    )
    
    leido = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
        comment="Si la notificación fue leída"
    )
    
    enviado_email = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Si se envió por email"
    )
    
    enviado_push = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Si se envió push notification"
    )
    
    # Metadata opcional (JSON)
    metadata = Column(
        Text,
        nullable=True,
        comment="Datos adicionales en formato JSON"
    )
    
    # Relación con usuario
    user = relationship(
        "Usuario",
        backref="notifications"
    )
    
    def __repr__(self):
        return f"<Notification(id={self.id}, tipo='{self.tipo.value}', user_id={self.user_id})>"


class NotificationPreferences(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de preferencias de notificaciones por usuario.
    """
    __tablename__ = "notification_preferences"
    
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
        comment="ID del usuario"
    )
    
    # Preferencias de email
    email_ofertas = Column(Boolean, nullable=False, default=True)
    email_trabajos = Column(Boolean, nullable=False, default=True)
    email_pagos = Column(Boolean, nullable=False, default=True)
    email_mensajes = Column(Boolean, nullable=False, default=True)
    
    # Preferencias de push
    push_ofertas = Column(Boolean, nullable=False, default=True)
    push_trabajos = Column(Boolean, nullable=False, default=True)
    push_pagos = Column(Boolean, nullable=False, default=True)
    push_mensajes = Column(Boolean, nullable=False, default=False)
    
    # Relación con usuario
    user = relationship(
        "Usuario",
        backref="notification_preferences"
    )
    
    def __repr__(self):
        return f"<NotificationPreferences(user_id={self.user_id})>"
