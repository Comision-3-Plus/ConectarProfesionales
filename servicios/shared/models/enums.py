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


class EstadoEscrow(str, enum.Enum):
    """Estados del escrow de dinero en un trabajo"""
    PENDIENTE_PAGO = "PENDIENTE_PAGO"
    PAGADO_EN_ESCROW = "PAGADO_EN_ESCROW"
    LIBERADO = "LIBERADO"
    CANCELADO_REEMBOLSADO = "CANCELADO_REEMBOLSADO"


# Alias para compatibilidad
EscrowEstado = EstadoEscrow


class KYCStatus(str, enum.Enum):
    """Estados del proceso de verificación KYC (alias de VerificationStatus)"""
    PENDIENTE = "PENDIENTE"
    EN_REVISION = "EN_REVISION"
    APROBADO = "APROBADO"
    RECHAZADO = "RECHAZADO"


class OfertaEstado(str, enum.Enum):
    """Estados de una oferta"""
    PENDIENTE = "PENDIENTE"
    ACEPTADA = "ACEPTADA"
    RECHAZADA = "RECHAZADA"
    CANCELADA = "CANCELADA"


class TrabajoEstado(str, enum.Enum):
    """Estados de un trabajo"""
    ABIERTO = "ABIERTO"
    ASIGNADO = "ASIGNADO"
    EN_PROGRESO = "EN_PROGRESO"
    COMPLETADO = "COMPLETADO"
    CANCELADO = "CANCELADO"
    DISPUTADO = "DISPUTADO"


class ChatModeracionEstado(str, enum.Enum):
    """Estados de moderación de mensajes de chat"""
    PENDIENTE = "PENDIENTE"
    APROBADO = "APROBADO"
    RECHAZADO = "RECHAZADO"
    BLOQUEADO = "BLOQUEADO"
