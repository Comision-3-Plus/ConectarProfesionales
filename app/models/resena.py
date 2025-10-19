"""
Modelo de Reseña - Calificaciones de trabajos completados
"""
from sqlalchemy import Column, Integer, Text, ForeignKey, Index, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin, UUIDMixin


class Resena(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de reseñas de trabajos completados.
    
    Restricciones importantes:
    - Un trabajo solo puede tener UNA reseña (trabajo_id unique)
    - El rating debe estar entre 1 y 5
    - Se usa para calcular el rating_promedio denormalizado en Profesional
    """
    __tablename__ = "resenas"
    
    # ==========================================
    # RELACIONES
    # ==========================================
    trabajo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trabajos.id", ondelete="CASCADE"),
        unique=True,  # ¡CLAVE! Un trabajo = una reseña
        nullable=False,
        index=True,
        comment="ID del trabajo calificado (único, un trabajo solo puede tener una reseña)"
    )
    
    cliente_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del cliente que deja la reseña"
    )
    
    profesional_id = Column(
        UUID(as_uuid=True),
        ForeignKey("profesionales.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del profesional que recibe la reseña"
    )
    
    # ==========================================
    # DATOS DE LA RESEÑA
    # ==========================================
    rating = Column(
        Integer,
        nullable=False,
        comment="Calificación de 1 a 5 estrellas"
    )
    
    texto_resena = Column(
        Text,
        nullable=True,
        comment="Texto opcional de la reseña"
    )
    
    # ==========================================
    # RELACIONES ORM
    # ==========================================
    trabajo = relationship(
        "Trabajo",
        backref="resena"
    )
    
    cliente = relationship(
        "Usuario",
        foreign_keys=[cliente_id],
        backref="resenas_dadas"
    )
    
    profesional = relationship(
        "Profesional",
        foreign_keys=[profesional_id],
        backref="resenas_recibidas"
    )
    
    # ==========================================
    # CONSTRAINTS E ÍNDICES
    # ==========================================
    __table_args__ = (
        CheckConstraint(
            'rating >= 1 AND rating <= 5',
            name='check_rating_rango'
        ),
        Index('idx_resena_profesional_rating', profesional_id, rating),
        Index('idx_resena_cliente', cliente_id),
    )
    
    def __repr__(self):
        return (
            f"<Resena(id={self.id}, trabajo_id={self.trabajo_id}, "
            f"rating={self.rating})>"
        )
