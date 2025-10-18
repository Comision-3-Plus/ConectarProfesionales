"""
Dependencias reutilizables de FastAPI para autenticación y autorización.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import decode_access_token
from app.schemas.token import TokenData
from app.models.user import Usuario
from app.models.professional import Profesional
from app.models.enums import UserRole


def get_current_user(
    token_data: TokenData = Depends(decode_access_token),
    db: Session = Depends(get_db),
) -> Usuario:
    """
    Obtiene el usuario actual a partir del token.
    """
    # token_data.user_id puede venir como str; SQLAlchemy acepta UUID(as_uuid=True)
    try:
        user_id: UUID = UUID(str(token_data.user_id))  # normaliza a UUID
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user


_forbidden_prof = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="No tenés permisos de profesional",
)


def get_current_professional(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Profesional:
    """
    Verifica que el usuario actual sea profesional y retorna su perfil.
    """
    if current_user.rol != UserRole.PROFESIONAL:
        raise _forbidden_prof

    prof = db.query(Profesional).filter(Profesional.usuario_id == current_user.id).first()
    if not prof:
        # Usuario con rol profesional pero sin perfil asociado (inconsistencia)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil profesional no encontrado")
    return prof


def get_current_admin_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """
    Asegura que el usuario actual sea ADMIN.
    """
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de Administrador",
        )
    return current_user
