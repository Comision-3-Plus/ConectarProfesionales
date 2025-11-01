"""
Modelos de Portfolio - Trabajos anteriores de profesionales.
"""
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin, UUIDMixin


class PortfolioItem(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de items de portfolio (trabajos anteriores del profesional).
    Cada item puede tener múltiples imágenes asociadas.
    """
    __tablename__ = "portfolio_items"
    
    profesional_id = Column(
        UUID(as_uuid=True),
        ForeignKey('profesionales.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment='ID del profesional dueño del portfolio'
    )
    
    titulo = Column(
        String(200),
        nullable=False,
        comment='Título del trabajo realizado'
    )
    
    descripcion = Column(
        String(1000),
        nullable=True,
        comment='Descripción detallada del trabajo'
    )
    
    # Relación con Profesional
    profesional = relationship(
        "Profesional",
        backref="portfolio_items"
    )
    
    # Relación con imágenes
    imagenes = relationship(
        "PortfolioImagen",
        back_populates="portfolio_item",
        cascade="all, delete-orphan",
        order_by="PortfolioImagen.orden"
    )
    
    def __repr__(self):
        return f"<PortfolioItem(id={self.id}, titulo='{self.titulo}', profesional_id={self.profesional_id})>"


class PortfolioImagen(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de imágenes asociadas a items de portfolio.
    Cada imagen pertenece a un PortfolioItem específico.
    """
    __tablename__ = "portfolio_imagenes"
    
    portfolio_item_id = Column(
        UUID(as_uuid=True),
        ForeignKey('portfolio_items.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment='ID del item de portfolio al que pertenece'
    )
    
    imagen_url = Column(
        String(500),
        nullable=False,
        comment='URL o ruta de la imagen'
    )
    
    orden = Column(
        Integer,
        nullable=False,
        default=0,
        comment='Orden de visualización de la imagen'
    )
    
    # Relación con PortfolioItem
    portfolio_item = relationship(
        "PortfolioItem",
        back_populates="imagenes"
    )
    
    def __repr__(self):
        return f"<PortfolioImagen(id={self.id}, portfolio_item_id={self.portfolio_item_id}, orden={self.orden})>"
