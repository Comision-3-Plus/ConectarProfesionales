"""
Esquemas Pydantic para validación de datos de usuarios.
Estos esquemas se usan en los endpoints de la API.
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
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
