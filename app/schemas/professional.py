"""
Schemas Pydantic para Profesionales.
"""
from typing import Optional
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import VerificationStatus, ProfessionalLevel


class ProfessionalProfileUpdate(BaseModel):
    """
    Schema para actualización parcial del perfil del profesional.
    Todos los campos son opcionales para permitir actualizaciones parciales (PATCH-style).
    """
    radio_cobertura_km: Optional[int] = Field(
        None,
        ge=1,
        le=500,
        description="Radio de cobertura en kilómetros (1-500 km)"
    )
    acepta_instant: Optional[bool] = Field(
        None,
        description="Si acepta trabajos instantáneos sin agendamiento previo"
    )
    tarifa_por_hora: Optional[Decimal] = Field(
        None,
        ge=0,
        description="Tarifa por hora en moneda local"
    )
    
    model_config = ConfigDict(from_attributes=True)


class ProfessionalProfileRead(BaseModel):
    """
    Schema de lectura del perfil completo del profesional.
    Incluye datos del usuario y del profesional.
    """
    # Datos del profesional
    id: UUID
    usuario_id: UUID
    estado_verificacion: VerificationStatus
    nivel: ProfessionalLevel
    radio_cobertura_km: int
    acepta_instant: bool
    tarifa_por_hora: Optional[Decimal]
    tasa_comision_actual: Decimal
    
    # Datos del usuario relacionado
    nombre: str
    apellido: str
    email: str
    
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def from_professional(cls, professional):
        """
        Constructor helper para crear desde un objeto Profesional con relación usuario.
        """
        return cls(
            # Datos del profesional
            id=professional.id,
            usuario_id=professional.usuario_id,
            estado_verificacion=professional.estado_verificacion,
            nivel=professional.nivel,
            radio_cobertura_km=professional.radio_cobertura_km,
            acepta_instant=professional.acepta_instant,
            tarifa_por_hora=professional.tarifa_por_hora,
            tasa_comision_actual=professional.tasa_comision_actual,
            # Datos del usuario
            nombre=professional.usuario.nombre,
            apellido=professional.usuario.apellido,
            email=professional.usuario.email,
        )


class ProfessionalServiciosInstantUpdate(BaseModel):
    """
    Schema para actualizar los servicios instantáneos de un profesional.
    """
    servicio_ids: list[UUID] = Field(
        ...,
        description="Lista de IDs de servicios instantáneos"
    )


class ProfessionalLocationUpdate(BaseModel):
    """
    Schema para actualizar la ubicación geográfica del profesional.
    """
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitud (coordenada geográfica)"
    )
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitud (coordenada geográfica)"
    )
