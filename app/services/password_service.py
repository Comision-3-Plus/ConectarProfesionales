"""
Servicio de recuperación de contraseña.
Maneja la generación de tokens y el envío de emails.
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import Usuario
from app.core.security import get_password_hash


# Almacenamiento temporal de tokens (en producción usar Redis o BD)
_password_reset_tokens = {}


def generate_reset_token(email: str) -> str:
    """
    Genera un token único para recuperación de contraseña.
    El token expira en 1 hora.
    """
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    _password_reset_tokens[token] = {
        "email": email,
        "expires_at": expires_at
    }
    
    return token


def validate_reset_token(token: str) -> Optional[str]:
    """
    Valida un token de recuperación y retorna el email asociado.
    Retorna None si el token no existe o expiró.
    """
    token_data = _password_reset_tokens.get(token)
    
    if not token_data:
        return None
    
    if datetime.utcnow() > token_data["expires_at"]:
        # Token expirado, eliminar
        del _password_reset_tokens[token]
        return None
    
    return token_data["email"]


def invalidate_reset_token(token: str):
    """Invalida un token después de ser usado."""
    if token in _password_reset_tokens:
        del _password_reset_tokens[token]


def reset_user_password(db: Session, token: str, new_password: str) -> bool:
    """
    Resetea la contraseña de un usuario usando un token válido.
    Retorna True si fue exitoso, False si el token es inválido.
    """
    email = validate_reset_token(token)
    
    if not email:
        return False
    
    # Buscar usuario
    user = db.query(Usuario).filter(Usuario.email == email).first()
    
    if not user:
        return False
    
    # Actualizar contraseña
    user.password_hash = get_password_hash(new_password)
    db.commit()
    
    # Invalidar el token
    invalidate_reset_token(token)
    
    return True


def send_reset_email(email: str, token: str):
    """
    Envía el email de recuperación de contraseña.
    
    En producción, aquí se integraría con un servicio de email
    (SendGrid, AWS SES, Mailgun, etc.)
    
    Por ahora solo imprime el link en consola para desarrollo.
    """
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    # TODO: Integrar con servicio de email real
    print(f"\n{'='*60}")
    print(f"PASSWORD RESET EMAIL")
    print(f"{'='*60}")
    print(f"To: {email}")
    print(f"Subject: Recuperación de Contraseña")
    print(f"\nHaz clic en el siguiente enlace para resetear tu contraseña:")
    print(f"{reset_link}")
    print(f"\nEste enlace expira en 1 hora.")
    print(f"{'='*60}\n")
