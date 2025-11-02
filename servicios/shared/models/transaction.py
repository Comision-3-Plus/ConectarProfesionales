"""
Modelo de Transaction - Registro de transacciones financieras
"""
from sqlalchemy import Column, String, Numeric, Enum as SQLEnum, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin, UUIDMixin
import enum


class TipoTransaccion(str, enum.Enum):
    """Tipos de transacciones"""
    PAGO_CLIENTE = "PAGO_CLIENTE"
    LIBERACION_PROFESIONAL = "LIBERACION_PROFESIONAL"
    REEMBOLSO_CLIENTE = "REEMBOLSO_CLIENTE"
    COMISION_PLATAFORMA = "COMISION_PLATAFORMA"
    PAYOUT_PROFESIONAL = "PAYOUT_PROFESIONAL"
    AJUSTE_MANUAL = "AJUSTE_MANUAL"


class EstadoTransaccion(str, enum.Enum):
    """Estados de una transacción"""
    PENDIENTE = "PENDIENTE"
    PROCESANDO = "PROCESANDO"
    COMPLETADA = "COMPLETADA"
    FALLIDA = "FALLIDA"
    CANCELADA = "CANCELADA"
    REVERTIDA = "REVERTIDA"


class Transaction(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de transacciones financieras.
    Registra todos los movimientos de dinero en la plataforma.
    """
    __tablename__ = "transactions"
    
    # Relación con trabajo (opcional, puede ser un ajuste manual)
    trabajo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trabajos.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="ID del trabajo relacionado (si aplica)"
    )
    
    # Usuario origen y destino
    from_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="ID del usuario que origina la transacción"
    )
    
    to_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="ID del usuario que recibe la transacción"
    )
    
    # Detalles de la transacción
    tipo = Column(
        SQLEnum(TipoTransaccion, name="tipo_transaccion_enum", create_type=True),
        nullable=False,
        index=True,
        comment="Tipo de transacción"
    )
    
    estado = Column(
        SQLEnum(EstadoTransaccion, name="estado_transaccion_enum", create_type=True),
        nullable=False,
        default=EstadoTransaccion.PENDIENTE,
        index=True,
        comment="Estado de la transacción"
    )
    
    monto = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Monto de la transacción en pesos argentinos"
    )
    
    descripcion = Column(
        String(500),
        nullable=True,
        comment="Descripción de la transacción"
    )
    
    # Integración con MercadoPago
    mercadopago_id = Column(
        String(255),
        nullable=True,
        index=True,
        comment="ID de la transacción en MercadoPago"
    )
    
    mercadopago_status = Column(
        String(50),
        nullable=True,
        comment="Estado en MercadoPago"
    )
    
    # Metadata
    metadata = Column(
        String(1000),
        nullable=True,
        comment="Datos adicionales en formato JSON"
    )
    
    # Relaciones
    trabajo = relationship(
        "Trabajo",
        backref="transactions"
    )
    
    from_user = relationship(
        "Usuario",
        foreign_keys=[from_user_id],
        backref="transactions_sent"
    )
    
    to_user = relationship(
        "Usuario",
        foreign_keys=[to_user_id],
        backref="transactions_received"
    )
    
    # Índices compuestos
    __table_args__ = (
        Index('idx_transaction_tipo_estado', tipo, estado),
        Index('idx_transaction_from_user', from_user_id, tipo),
        Index('idx_transaction_to_user', to_user_id, tipo),
        Index('idx_transaction_mercadopago', mercadopago_id),
    )
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, tipo='{self.tipo.value}', monto={self.monto}, estado='{self.estado.value}')>"
