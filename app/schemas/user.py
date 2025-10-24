"""
Esquemas Pydantic para validación de datos de usuarios.
Estos esquemas se usan en los endpoints de la API.
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict, computed_field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.enums import UserRole


class UserBase(BaseModel):
    """Schema base para usuarios"""
    email: EmailStr
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """
    Schema para crear un usuario.
    Se usa en el endpoint de registro.
    """
    password: str = Field(..., min_length=8, description="Contraseña con mínimo 8 caracteres")
    rol: UserRole = Field(default=UserRole.CLIENTE, description="Rol del usuario en el sistema")


class UserUpdate(BaseModel):
    """Schema para actualización parcial de datos básicos del usuario"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)


class UserRead(UserBase):
    """
    Schema para lectura de usuario (respuesta de API).
    NUNCA incluye el password_hash por seguridad.
    """
    id: UUID
    rol: UserRole
    is_active: bool
    fecha_creacion: datetime
    avatar_url: Optional[str] = None
    infracciones_chat: int = 0
    is_chat_banned: bool = False
    
    # Helper computed fields para el frontend (se incluyen automáticamente en la serialización)
    @computed_field  # type: ignore[prop-decorator]
    @property
    def es_admin(self) -> bool:
        """Retorna True si el usuario es administrador"""
        return self.rol == UserRole.ADMIN
    
    @computed_field  # type: ignore[prop-decorator]
    @property
    def es_profesional(self) -> bool:
        """Retorna True si el usuario es profesional"""
        return self.rol == UserRole.PROFESIONAL
    
    @computed_field  # type: ignore[prop-decorator]
    @property
    def es_cliente(self) -> bool:
        """Retorna True si el usuario es cliente"""
        return self.rol == UserRole.CLIENTE
    
    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserBase):
    """Schema para usuario en la base de datos (interno)"""
    id: UUID
    rol: UserRole
    password_hash: str
    is_active: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    model_config = ConfigDict(from_attributes=True)
