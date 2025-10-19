"""
Modelo de Trabajo - Contrato en ejecución que rastrea el dinero
"""
from sqlalchemy import Column, String, Numeric, Enum as SQLEnum, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import EstadoEscrow


class Trabajo(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de trabajos (contratos en ejecución).
    
    Representa el contrato real entre cliente y profesional.
    Rastrea el flujo de dinero desde el pago hasta la liberación.
    
    Puede originarse de dos formas:
    1. Flujo Pro: Cliente acepta una oferta formal
    2. Flujo Instant: Cliente contrata un servicio instantáneo
    """
    __tablename__ = "trabajos"
    
    # ==========================================
    # RELACIONES CON USUARIOS
    # ==========================================
    cliente_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del cliente que contrata el servicio"
    )
    profesional_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del profesional que ejecuta el servicio"
    )
    
    # ==========================================
    # ORIGEN DEL TRABAJO (mutuamente excluyente)
    # ==========================================
    oferta_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ofertas.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="ID de la oferta aceptada (Flujo Pro)"
    )
    servicio_instant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("servicios_instantaneos.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="ID del servicio instantáneo contratado (Flujo Instant)"
    )
    
    # ==========================================
    # CAMPOS DE DINERO
    # ==========================================
    precio_final = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Monto total que pagó el cliente"
    )
    comision_plataforma = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Comisión que se queda la plataforma"
    )
    monto_liberado = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Monto que se le pagó al profesional"
    )
    
    # ==========================================
    # ESTADO DEL ESCROW
    # ==========================================
    estado_escrow = Column(
        SQLEnum(EstadoEscrow, name="estado_escrow_enum", create_type=True),
        nullable=False,
        default=EstadoEscrow.PENDIENTE_PAGO,
        index=True,
        comment="Estado actual del dinero en el sistema de escrow"
    )
    
    # ==========================================
    # INTEGRACIÓN CON MERCADO PAGO
    # ==========================================
    mercadopago_payment_id = Column(
        String(255),
        nullable=True,
        index=True,
        unique=True,
        comment="ID del pago en Mercado Pago"
    )
    
    # ==========================================
    # RELACIONES
    # ==========================================
    cliente = relationship(
        "Usuario",
        foreign_keys=[cliente_id],
        backref="trabajos_contratados"
    )
    profesional = relationship(
        "Usuario",
        foreign_keys=[profesional_id],
        backref="trabajos_realizados"
    )
    oferta = relationship(
        "Oferta",
        foreign_keys=[oferta_id],
        backref="trabajo"
    )
    servicio_instantaneo = relationship(
        "ServicioInstantaneo",
        foreign_keys=[servicio_instant_id],
        backref="trabajos"
    )
    
    # ==========================================
    # ÍNDICES COMPUESTOS
    # ==========================================
    __table_args__ = (
        Index('idx_trabajo_estado_escrow', estado_escrow),
        Index('idx_trabajo_mp_payment', mercadopago_payment_id),
        Index('idx_trabajo_cliente_estado', cliente_id, estado_escrow),
        Index('idx_trabajo_profesional_estado', profesional_id, estado_escrow),
    )
    
    def __repr__(self):
        return (
            f"<Trabajo(id={self.id}, precio={self.precio_final}, "
            f"estado='{self.estado_escrow.value}')>"
        )
    
    @property
    def es_flujo_pro(self):
        """Verifica si el trabajo se originó de una oferta formal"""
        return self.oferta_id is not None
    
    @property
    def es_flujo_instant(self):
        """Verifica si el trabajo se originó de un servicio instantáneo"""
        return self.servicio_instant_id is not None
    
    @property
    def esta_pagado(self):
        """Verifica si el dinero ya está en escrow"""
        return self.estado_escrow in [
            EstadoEscrow.PAGADO_EN_ESCROW,
            EstadoEscrow.LIBERADO
        ]
    
    @property
    def puede_liberarse(self):
        """Verifica si el dinero puede ser liberado al profesional"""
        return self.estado_escrow == EstadoEscrow.PAGADO_EN_ESCROW
