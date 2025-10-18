"""
Enumeraciones para los modelos del dominio.
Centralizar los enums aquí para reutilización en modelos y schemas.
"""
import enum


class UserRole(str, enum.Enum):
    """Roles de usuario en el sistema"""
    CLIENTE = "CLIENTE"
    PROFESIONAL = "PROFESIONAL"
    ADMIN = "ADMIN"


class VerificationStatus(str, enum.Enum):
    """Estados del proceso de verificación KYC"""
    PENDIENTE = "PENDIENTE"
    EN_REVISION = "EN_REVISION"
    APROBADO = "APROBADO"
    RECHAZADO = "RECHAZADO"


class ProfessionalLevel(str, enum.Enum):
    """Niveles de gamificación para profesionales"""
    BRONCE = "BRONCE"
    PLATA = "PLATA"
    ORO = "ORO"
    DIAMANTE = "DIAMANTE"
