"""
Modelos de SQLAlchemy.
Importar aquí todos los modelos para que Alembic los detecte.
"""
from .base import Base
from .enums import UserRole, VerificationStatus, ProfessionalLevel, EstadoEscrow
from .user import Usuario
from .professional import Profesional
from .oficio import Oficio, professional_oficios
from .servicio_instantaneo import ServicioInstantaneo, profesional_servicios_instant
from .portfolio import PortfolioItem, PortfolioImagen
from .oferta import Oferta, EstadoOferta
from .trabajo import Trabajo
from .resena import Resena

__all__ = [
    "Base",
    "UserRole",
    "VerificationStatus", 
    "ProfessionalLevel",
    "EstadoEscrow",
    "Usuario",
    "Profesional",
    "Oficio",
    "professional_oficios",
    "ServicioInstantaneo",
    "profesional_servicios_instant",
    "PortfolioItem",
    "PortfolioImagen",
    "Oferta",
    "EstadoOferta",
    "Trabajo",
    "Resena"
]
