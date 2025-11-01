"""
Modelo base y mixins reutilizables.
"""
from sqlalchemy import Column, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid

Base = declarative_base()


class TimestampMixin:
    """Mixin para agregar timestamps automáticos a los modelos"""
    fecha_creacion = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        comment="Fecha de creación del registro"
    )
    fecha_actualizacion = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False,
        comment="Fecha de última actualización del registro"
    )


class UUIDMixin:
    """Mixin para usar UUID como Primary Key"""
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        unique=True, 
        nullable=False,
        comment="Identificador único universal"
    )
