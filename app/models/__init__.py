"""
Modelos de SQLAlchemy.
Importar aquí todos los modelos para que Alembic los detecte.
"""
from app.models.base import Base
from app.models.enums import UserRole, VerificationStatus, ProfessionalLevel
from app.models.user import Usuario
from app.models.professional import Profesional
from app.models.oficio import Oficio, professional_oficios
from app.models.servicio_instantaneo import ServicioInstantaneo, profesional_servicios_instant
from app.models.portfolio import PortfolioItem, PortfolioImagen

__all__ = [
    "Base",
    "UserRole",
    "VerificationStatus", 
    "ProfessionalLevel",
    "Usuario",
    "Profesional",
    "Oficio",
    "professional_oficios",
    "ServicioInstantaneo",
    "profesional_servicios_instant",
    "PortfolioItem",
    "PortfolioImagen"
]
