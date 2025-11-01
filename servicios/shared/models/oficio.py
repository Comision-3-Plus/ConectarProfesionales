"""
Modelo de Oficio - Servicios que puede ofrecer un profesional.
"""
from sqlalchemy import Column, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin, UUIDMixin


# Tabla de asociación M2M entre Profesional y Oficio
professional_oficios = Table(
    'profesional_oficios',
    Base.metadata,
    Column(
        'profesional_id',
        UUID(as_uuid=True),
        ForeignKey('profesionales.id', ondelete='CASCADE'),
        primary_key=True,
        comment='ID del profesional'
    ),
    Column(
        'oficio_id',
        UUID(as_uuid=True),
        ForeignKey('oficios.id', ondelete='CASCADE'),
        primary_key=True,
        comment='ID del oficio'
    )
)


class Oficio(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de oficios/servicios predefinidos.
    Los administradores gestionan esta tabla.
    Los profesionales pueden asignarse múltiples oficios.
    """
    __tablename__ = "oficios"
    
    nombre = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="Nombre del oficio (ej: Plomería, Electricidad)"
    )
    
    descripcion = Column(
        String(500),
        nullable=True,
        comment="Descripción del oficio"
    )
    
    # Relación M2M con Profesionales
    profesionales = relationship(
        "Profesional",
        secondary=professional_oficios,
        back_populates="oficios"
    )
    
    def __repr__(self):
        return f"<Oficio(id={self.id}, nombre='{self.nombre}')>"
