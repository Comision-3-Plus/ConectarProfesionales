"""
Esquemas Pydantic para autenticación y recuperación de contraseña.
"""
from pydantic import BaseModel, EmailStr, Field


class ForgotPasswordRequest(BaseModel):
    """Schema para solicitud de recuperación de contraseña"""
    email: EmailStr = Field(..., description="Email del usuario")


class ResetPasswordRequest(BaseModel):
    """Schema para resetear contraseña con token"""
    token: str = Field(..., description="Token de recuperación")
    new_password: str = Field(
        ..., 
        min_length=8, 
        description="Nueva contraseña (mínimo 8 caracteres)"
    )


class PasswordResetResponse(BaseModel):
    """Schema de respuesta para operaciones de password"""
    message: str
    success: bool
