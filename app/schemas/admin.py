"""
Schemas para endpoints de administración (Backoffice).
"""
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from app.models.enums import VerificationStatus


class ProfessionalPendingReview(BaseModel):
    id: UUID
    email: EmailStr
    nombre: str
    apellido: str
    fecha_creacion: datetime
    estado_verificacion: VerificationStatus

    model_config = ConfigDict(from_attributes=True)
