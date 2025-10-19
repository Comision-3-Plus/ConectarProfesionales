"""
Modelo de Oferta - Ofertas económicas formales del profesional al cliente
"""
from sqlalchemy import Column, String, Text, Numeric, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDMixin
import enum


class EstadoOferta(str, enum.Enum):
    """Estados posibles de una oferta"""
    OFERTADO = "OFERTADO"
    ACEPTADO = "ACEPTADO"
    RECHAZADO = "RECHAZADO"
    PAGADO = "PAGADO"


class Oferta(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de ofertas económicas formales.
    Representa una propuesta de servicio con precio del profesional al cliente.
    """
    __tablename__ = "ofertas"
    
    # Relaciones con usuarios
    profesional_id = Column(
        String(36),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del profesional que hace la oferta"
    )
    cliente_id = Column(
        String(36),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del cliente que recibe la oferta"
    )
    
    # Referencia al chat de Firestore
    chat_id = Column(
        String(255),
        nullable=False,
        index=True,
        comment="ID de la sala de chat en Firestore donde se envió la oferta"
    )
    
    # Detalles de la oferta
    descripcion = Column(
        Text,
        nullable=False,
        comment="Descripción detallada del servicio ofertado"
    )
    precio_final = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Precio final de la oferta en pesos argentinos"
    )
    
    # Estado de la oferta
    estado = Column(
        SQLEnum(EstadoOferta, name="estado_oferta_enum", create_type=True),
        nullable=False,
        default=EstadoOferta.OFERTADO,
        index=True,
        comment="Estado actual de la oferta"
    )
    
    # Relaciones
    profesional = relationship(
        "Usuario",
        foreign_keys=[profesional_id],
        backref="ofertas_enviadas"
    )
    cliente = relationship(
        "Usuario",
        foreign_keys=[cliente_id],
        backref="ofertas_recibidas"
    )
    
    def __repr__(self):
        return f"<Oferta(id={self.id}, precio={self.precio_final}, estado='{self.estado.value}')>"
