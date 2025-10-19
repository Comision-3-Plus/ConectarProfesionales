"""
Modelos de SQLAlchemy.
Importar aquí todos los modelos para que Alembic los detecte.
"""
from app.models.base import Base
from app.models.enums import UserRole, VerificationStatus, ProfessionalLevel, EstadoEscrow
from app.models.user import Usuario
from app.models.professional import Profesional
from app.models.oficio import Oficio, professional_oficios
from app.models.servicio_instantaneo import ServicioInstantaneo, profesional_servicios_instant
from app.models.portfolio import PortfolioItem, PortfolioImagen
from app.models.oferta import Oferta, EstadoOferta
from app.models.trabajo import Trabajo
from app.models.resena import Resena

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
