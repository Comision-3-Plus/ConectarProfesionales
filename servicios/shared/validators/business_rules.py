"""
Validadores de reglas de negocio compartidas.
Funciones centralizadas de validación para todo el sistema.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session

from shared.models.user import User
from shared.models.professional import Professional
from shared.models.trabajo import Trabajo
from shared.models.oferta import Oferta
from shared.models.enums import UserRole, KYCStatus, EstadoEscrow, EstadoOferta


class ValidationError(Exception):
    """Excepción para errores de validación de negocio"""
    def __init__(self, message: str, error_code: str = "VALIDATION_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


# ============================================================================
# VALIDACIONES DE USUARIO
# ============================================================================

def validate_user_is_active(user: User) -> bool:
    """Valida que el usuario esté activo"""
    if not user.activo:
        raise ValidationError(
            "El usuario está inactivo. Contacta al soporte.",
            error_code="USER_INACTIVE"
        )
    return True


def validate_user_role(user: User, required_role: UserRole) -> bool:
    """Valida que el usuario tenga el rol requerido"""
    if user.rol != required_role:
        raise ValidationError(
            f"Se requiere rol {required_role.value}",
            error_code="INVALID_ROLE"
        )
    return True


def validate_user_is_professional(user: User, db: Session) -> Professional:
    """Valida que el usuario sea un profesional y retorna el perfil"""
    if user.rol != UserRole.PROFESIONAL:
        raise ValidationError(
            "Solo los profesionales pueden realizar esta acción",
            error_code="NOT_A_PROFESSIONAL"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == user.id
    ).first()
    
    if not professional:
        raise ValidationError(
            "Perfil profesional no encontrado",
            error_code="PROFESSIONAL_PROFILE_NOT_FOUND"
        )
    
    return professional


# ============================================================================
# VALIDACIONES DE KYC
# ============================================================================

def validate_kyc_approved(professional: Professional) -> bool:
    """Valida que el profesional tenga KYC aprobado"""
    if professional.kyc_status != KYCStatus.APROBADO:
        raise ValidationError(
            f"KYC no aprobado. Estado actual: {professional.kyc_status.value}",
            error_code="KYC_NOT_APPROVED"
        )
    return True


def validate_can_submit_kyc(professional: Professional) -> bool:
    """Valida que el profesional pueda enviar KYC"""
    if professional.kyc_status == KYCStatus.APROBADO:
        raise ValidationError(
            "El KYC ya está aprobado",
            error_code="KYC_ALREADY_APPROVED"
        )
    
    if professional.kyc_status == KYCStatus.EN_REVISION:
        raise ValidationError(
            "El KYC ya está en revisión",
            error_code="KYC_IN_REVIEW"
        )
    
    return True


# ============================================================================
# VALIDACIONES DE OFERTAS
# ============================================================================

def validate_oferta_ownership(oferta: Oferta, user_id: int, as_professional: bool = True) -> bool:
    """
    Valida que el usuario sea dueño de la oferta.
    
    Args:
        oferta: La oferta a validar
        user_id: ID del usuario
        as_professional: Si True, valida como profesional. Si False, como cliente.
    """
    if as_professional and oferta.profesional_id != user_id:
        raise ValidationError(
            "No eres el profesional de esta oferta",
            error_code="NOT_OFERTA_OWNER"
        )
    
    if not as_professional and oferta.cliente_id != user_id:
        raise ValidationError(
            "No eres el cliente de esta oferta",
            error_code="NOT_OFERTA_OWNER"
        )
    
    return True


def validate_oferta_can_be_accepted(oferta: Oferta) -> bool:
    """Valida que una oferta pueda ser aceptada"""
    if oferta.estado != EstadoOferta.OFERTADO:
        raise ValidationError(
            f"La oferta no puede ser aceptada. Estado actual: {oferta.estado.value}",
            error_code="OFERTA_CANNOT_BE_ACCEPTED"
        )
    return True


def validate_oferta_can_be_updated(oferta: Oferta) -> bool:
    """Valida que una oferta pueda ser actualizada"""
    if oferta.estado != EstadoOferta.OFERTADO:
        raise ValidationError(
            "Solo se pueden actualizar ofertas en estado OFERTADO",
            error_code="OFERTA_CANNOT_BE_UPDATED"
        )
    return True


# ============================================================================
# VALIDACIONES DE TRABAJOS
# ============================================================================

def validate_trabajo_ownership(trabajo: Trabajo, user_id: int, as_professional: bool = True) -> bool:
    """
    Valida que el usuario sea parte del trabajo.
    
    Args:
        trabajo: El trabajo a validar
        user_id: ID del usuario
        as_professional: Si True, valida como profesional. Si False, como cliente.
    """
    if as_professional and trabajo.profesional_id != user_id:
        raise ValidationError(
            "No eres el profesional de este trabajo",
            error_code="NOT_TRABAJO_OWNER"
        )
    
    if not as_professional and trabajo.cliente_id != user_id:
        raise ValidationError(
            "No eres el cliente de este trabajo",
            error_code="NOT_TRABAJO_OWNER"
        )
    
    return True


def validate_trabajo_can_be_paid(trabajo: Trabajo) -> bool:
    """Valida que un trabajo pueda ser pagado"""
    if trabajo.estado_escrow != EstadoEscrow.PENDIENTE_PAGO:
        raise ValidationError(
            f"El trabajo no está pendiente de pago. Estado: {trabajo.estado_escrow.value}",
            error_code="TRABAJO_NOT_PAYABLE"
        )
    return True


def validate_trabajo_can_be_released(trabajo: Trabajo) -> bool:
    """Valida que el dinero de un trabajo pueda ser liberado"""
    if trabajo.estado_escrow != EstadoEscrow.PAGADO_EN_ESCROW:
        raise ValidationError(
            f"El trabajo no tiene dinero en escrow. Estado: {trabajo.estado_escrow.value}",
            error_code="TRABAJO_NOT_RELEASABLE"
        )
    return True


def validate_trabajo_can_be_refunded(trabajo: Trabajo) -> bool:
    """Valida que un trabajo pueda ser reembolsado"""
    if trabajo.estado_escrow not in [EstadoEscrow.PENDIENTE_PAGO, EstadoEscrow.PAGADO_EN_ESCROW]:
        raise ValidationError(
            f"El trabajo no puede ser reembolsado. Estado: {trabajo.estado_escrow.value}",
            error_code="TRABAJO_NOT_REFUNDABLE"
        )
    return True


# ============================================================================
# VALIDACIONES DE MONTOS
# ============================================================================

def validate_minimum_amount(amount: Decimal, minimum: Decimal = Decimal("100.00")) -> bool:
    """Valida que el monto sea mayor al mínimo permitido"""
    if amount < minimum:
        raise ValidationError(
            f"El monto mínimo permitido es ${minimum}",
            error_code="AMOUNT_TOO_LOW"
        )
    return True


def validate_maximum_amount(amount: Decimal, maximum: Decimal = Decimal("1000000.00")) -> bool:
    """Valida que el monto no exceda el máximo permitido"""
    if amount > maximum:
        raise ValidationError(
            f"El monto máximo permitido es ${maximum}",
            error_code="AMOUNT_TOO_HIGH"
        )
    return True


def validate_amount_range(amount: Decimal, minimum: Decimal = Decimal("100.00"), maximum: Decimal = Decimal("1000000.00")) -> bool:
    """Valida que el monto esté en el rango permitido"""
    validate_minimum_amount(amount, minimum)
    validate_maximum_amount(amount, maximum)
    return True


# ============================================================================
# VALIDACIONES DE FECHAS
# ============================================================================

def validate_date_not_in_past(date: datetime, field_name: str = "fecha") -> bool:
    """Valida que una fecha no esté en el pasado"""
    if date < datetime.utcnow():
        raise ValidationError(
            f"La {field_name} no puede estar en el pasado",
            error_code="DATE_IN_PAST"
        )
    return True


def validate_date_within_range(date: datetime, days_ahead: int = 30, field_name: str = "fecha") -> bool:
    """Valida que una fecha esté dentro de un rango de días"""
    max_date = datetime.utcnow() + timedelta(days=days_ahead)
    if date > max_date:
        raise ValidationError(
            f"La {field_name} no puede ser más de {days_ahead} días en el futuro",
            error_code="DATE_TOO_FAR"
        )
    return True


# ============================================================================
# VALIDACIONES DE TEXTO
# ============================================================================

def validate_text_length(text: str, min_length: int, max_length: int, field_name: str = "texto") -> bool:
    """Valida que un texto tenga la longitud correcta"""
    text_length = len(text.strip())
    
    if text_length < min_length:
        raise ValidationError(
            f"El {field_name} debe tener al menos {min_length} caracteres",
            error_code="TEXT_TOO_SHORT"
        )
    
    if text_length > max_length:
        raise ValidationError(
            f"El {field_name} no puede tener más de {max_length} caracteres",
            error_code="TEXT_TOO_LONG"
        )
    
    return True


def validate_not_empty(text: Optional[str], field_name: str = "campo") -> bool:
    """Valida que un texto no esté vacío"""
    if not text or not text.strip():
        raise ValidationError(
            f"El {field_name} no puede estar vacío",
            error_code="FIELD_EMPTY"
        )
    return True


# ============================================================================
# VALIDACIONES DE RATING
# ============================================================================

def validate_rating_range(rating: float) -> bool:
    """Valida que el rating esté entre 1 y 5"""
    if rating < 1 or rating > 5:
        raise ValidationError(
            "El rating debe estar entre 1 y 5",
            error_code="INVALID_RATING"
        )
    return True


# ============================================================================
# VALIDACIONES DE PORTFOLIO
# ============================================================================

def validate_portfolio_images_limit(current_count: int, max_images: int = 10) -> bool:
    """Valida que no se exceda el límite de imágenes en portfolio"""
    if current_count >= max_images:
        raise ValidationError(
            f"Límite de {max_images} imágenes alcanzado",
            error_code="PORTFOLIO_IMAGES_LIMIT"
        )
    return True


# ============================================================================
# VALIDACIONES COMPUESTAS
# ============================================================================

def validate_can_create_oferta(professional: Professional, monto: Decimal) -> bool:
    """Validación completa para crear una oferta"""
    validate_kyc_approved(professional)
    validate_amount_range(monto)
    return True


def validate_can_accept_oferta(oferta: Oferta, professional: Professional) -> bool:
    """Validación completa para aceptar una oferta"""
    validate_oferta_can_be_accepted(oferta)
    validate_kyc_approved(professional)
    return True


def validate_can_complete_trabajo(trabajo: Trabajo) -> bool:
    """Validación completa para completar un trabajo"""
    validate_trabajo_can_be_released(trabajo)
    return True
