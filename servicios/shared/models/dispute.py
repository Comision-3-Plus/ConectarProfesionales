"""
Modelo de Disputa - Resolución de conflictos entre clientes y profesionales
"""
from sqlalchemy import Column, String, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin, UUIDMixin
import enum


class EstadoDisputa(str, enum.Enum):
    """Estados posibles de una disputa"""
    ABIERTA = "ABIERTA"
    EN_REVISION = "EN_REVISION"
    RESUELTA_A_FAVOR_CLIENTE = "RESUELTA_A_FAVOR_CLIENTE"
    RESUELTA_A_FAVOR_PROFESIONAL = "RESUELTA_A_FAVOR_PROFESIONAL"
    RECHAZADA = "RECHAZADA"
    CANCELADA = "CANCELADA"


class TipoDisputa(str, enum.Enum):
    """Tipos de disputas"""
    CALIDAD_TRABAJO = "CALIDAD_TRABAJO"
    NO_REALIZADO = "NO_REALIZADO"
    REEMBOLSO = "REEMBOLSO"
    INCUMPLIMIENTO_TIEMPO = "INCUMPLIMIENTO_TIEMPO"
    OTRO = "OTRO"


class Dispute(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de disputas.
    Gestiona conflictos entre clientes y profesionales sobre trabajos.
    """
    __tablename__ = "disputes"
    
    trabajo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trabajos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del trabajo en disputa"
    )
    
    solicitante_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del usuario que inicia la disputa (cliente o profesional)"
    )
    
    tipo = Column(
        SQLEnum(TipoDisputa, name="tipo_disputa_enum", create_type=True),
        nullable=False,
        index=True,
        comment="Tipo de disputa"
    )
    
    estado = Column(
        SQLEnum(EstadoDisputa, name="estado_disputa_enum", create_type=True),
        nullable=False,
        default=EstadoDisputa.ABIERTA,
        index=True,
        comment="Estado actual de la disputa"
    )
    
    descripcion = Column(
        Text,
        nullable=False,
        comment="Descripción detallada del problema"
    )
    
    evidencia_urls = Column(
        Text,
        nullable=True,
        comment="URLs de evidencias (imágenes, documentos) separadas por comas"
    )
    
    resolucion = Column(
        Text,
        nullable=True,
        comment="Resolución final de la disputa"
    )
    
    admin_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True,
        comment="ID del admin que resolvió la disputa"
    )
    
    # Relaciones
    trabajo = relationship(
        "Trabajo",
        backref="disputes"
    )
    
    solicitante = relationship(
        "Usuario",
        foreign_keys=[solicitante_id],
        backref="disputes_iniciadas"
    )
    
    admin = relationship(
        "Usuario",
        foreign_keys=[admin_id],
        backref="disputes_resueltas"
    )
    
    def __repr__(self):
        return f"<Dispute(id={self.id}, tipo='{self.tipo.value}', estado='{self.estado.value}')>"
