"""
Schemas Pydantic para autenticación basada en JWT.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
from app.models.enums import UserRole


class Token(BaseModel):
    """Respuesta de token de acceso"""
    access_token: str
    token_type: str = Field(default="bearer")


class TokenData(BaseModel):
    """Datos internos contenidos en el token"""
    user_id: Optional[UUID] = None
    rol: Optional[UserRole] = None

    model_config = ConfigDict(from_attributes=True)
