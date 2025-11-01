"""
Schemas para endpoints de administración (Backoffice).
"""
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from shared.models.enums import VerificationStatus, UserRole
from typing import Optional


class ProfessionalPendingReview(BaseModel):
    id: UUID
    email: EmailStr
    nombre: str
    apellido: str
    fecha_creacion: datetime
    estado_verificacion: VerificationStatus

    model_config = ConfigDict(from_attributes=True)


class KYCApproveRequest(BaseModel):
    """Schema para aprobar KYC de un profesional"""
    profesional_id: UUID
    aprobar: bool = True
    razon: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS PARA MODERACIÓN DE USUARIOS
# ==========================================

class UserBanRequest(BaseModel):
    """Schema para banear/desbanear un usuario"""
    user_id: UUID
    razon: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserSearchResult(BaseModel):
    """Resultado de búsqueda de usuarios (para encontrar user_id)"""
    id: UUID
    email: EmailStr
    nombre: str
    apellido: str
    rol: UserRole
    is_active: bool
    fecha_creacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserBanResponse(BaseModel):
    """Respuesta al banear un usuario"""
    user_id: UUID
    email: EmailStr
    is_active: bool
    mensaje: str


class UserUnbanResponse(BaseModel):
    """Respuesta al desbanear un usuario"""
    user_id: UUID
    email: EmailStr
    is_active: bool
    mensaje: str


# ==========================================
# SCHEMAS PARA MÉTRICAS Y DASHBOARD
# ==========================================

class FinancialMetricsResponse(BaseModel):
    """Métricas financieras del negocio (solo trabajos LIBERADOS)"""
    total_facturado: float
    comision_total: float
    trabajos_completados: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_facturado": 150000.50,
                "comision_total": 30000.10,
                "trabajos_completados": 42
            }
        }


class UserMetricsResponse(BaseModel):
    """Métricas de crecimiento de usuarios"""
    total_clientes: int
    total_profesionales: int
    total_pro_pendientes_kyc: int
    total_pro_aprobados: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_clientes": 450,
                "total_profesionales": 180,
                "total_pro_pendientes_kyc": 25,
                "total_pro_aprobados": 155
            }
        }

