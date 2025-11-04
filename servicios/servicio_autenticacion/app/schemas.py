"""
Esquemas Pydantic para validación
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
import enum

class UserRole(str, enum.Enum):
    """Roles de usuario"""
    CLIENTE = "CLIENTE"
    PROFESIONAL = "PROFESIONAL"
    ADMIN = "ADMIN"

class UserCreate(BaseModel):
    """Schema para crear usuario"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    rol: UserRole = UserRole.CLIENTE
    oficio_id: Optional[str] = None  # UUID del oficio (solo para profesionales)
    
    class Config:
        extra = "ignore"  # Ignorar campos adicionales en lugar de rechazarlos

class UserRead(BaseModel):
    """Schema para leer usuario"""
    id: UUID
    email: EmailStr
    nombre: str
    apellido: str
    rol: UserRole
    is_active: bool
    avatar_url: Optional[str] = None
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """Schema de token JWT"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Datos contenidos en el token"""
    user_id: Optional[UUID] = None
    rol: Optional[str] = None
