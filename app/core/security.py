"""
Módulo de seguridad para hashing de contraseñas y manejo de JWT.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.schemas.token import TokenData
from app.models.enums import UserRole
from uuid import UUID

# Configuración del contexto de hashing con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro de la contraseña usando bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con su hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_minutes: int | None = None) -> str:
    """
    Crea un JWT firmado con expiración.

    Args:
        data: Payload a incluir en el token (se copiará internamente)
        expires_minutes: Minutos hasta la expiración; si no se provee, usa settings.ACCESS_TOKEN_EXPIRE_MINUTES

    Returns:
        Token JWT como string
    """
    to_encode = data.copy()
    expire_delta = expires_minutes if expires_minutes is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token_payload(token: str) -> Dict[str, Any]:
    """
    Decodifica y valida un JWT y retorna el payload como dict.
    Lanza JWTError si es inválido o expiró.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def decode_access_token(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")),
) -> TokenData:
    """
    Dependencia de FastAPI que extrae y valida el token Bearer y devuelve TokenData.
    Maneja errores devolviendo HTTP 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token_payload(token)
        sub = payload.get("sub")
        rol = payload.get("rol")
        if sub is None:
            raise credentials_exception
        # Normalizar tipos
        user_uuid: UUID | None = None
        try:
            user_uuid = UUID(str(sub))
        except Exception:
            raise credentials_exception

        role_enum: UserRole | None = None
        if rol is not None:
            try:
                role_enum = UserRole(rol)
            except Exception:
                role_enum = None

        return TokenData(user_id=user_uuid, rol=role_enum)
    except JWTError:
        raise credentials_exception
