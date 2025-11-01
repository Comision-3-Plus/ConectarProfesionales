"""
Modelo de Servicio Instantáneo - Servicios rápidos predefinidos.
"""
from sqlalchemy import Column, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin, UUIDMixin


# Tabla de asociación M2M entre Profesional y ServicioInstantaneo
profesional_servicios_instant = Table(
    'profesional_servicios_instant',
    Base.metadata,
    Column(
        'profesional_id',
        UUID(as_uuid=True),
        ForeignKey('profesionales.id', ondelete='CASCADE'),
        primary_key=True,
        comment='ID del profesional'
    ),
    Column(
        'servicio_id',
        UUID(as_uuid=True),
        ForeignKey('servicios_instantaneos.id', ondelete='CASCADE'),
        primary_key=True,
        comment='ID del servicio instantáneo'
    )
)


class ServicioInstantaneo(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de servicios instantáneos/rápidos predefinidos.
    Los administradores gestionan esta tabla.
    Cada servicio está asociado a un oficio específico.
    Los profesionales pueden adherirse a múltiples servicios instantáneos.
    """
    __tablename__ = "servicios_instantaneos"
    
    nombre = Column(
        String(100),
        nullable=False,
        index=True,
        comment="Nombre del servicio instantáneo (ej: Colgar un cuadro)"
    )
    
    descripcion = Column(
        String(500),
        nullable=True,
        comment="Descripción del servicio instantáneo"
    )
    
    # Relación con Oficio (un servicio pertenece a un oficio)
    oficio_id = Column(
        UUID(as_uuid=True),
        ForeignKey('oficios.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment='ID del oficio al que pertenece este servicio'
    )
    
    # Relación con Oficio
    oficio = relationship(
        "Oficio",
        backref="servicios_instantaneos"
    )
    
    # Relación M2M con Profesionales
    profesionales = relationship(
        "Profesional",
        secondary=profesional_servicios_instant,
        back_populates="servicios_instantaneos"
    )
    
    def __repr__(self):
        return f"<ServicioInstantaneo(id={self.id}, nombre='{self.nombre}', oficio_id={self.oficio_id})>"
