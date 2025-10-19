"""
Schemas Pydantic para Profesionales.
"""
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import VerificationStatus, ProfessionalLevel

if TYPE_CHECKING:
    from app.schemas.oficio import OficioRead
    from app.schemas.portfolio import PortfolioItemRead


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


class PayoutInfoUpdate(BaseModel):
    """
    Schema para actualizar la información de pago del profesional.
    """
    payout_account: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="CVU, CBU o Alias de Mercado Pago"
    )


class PublicProfileResponse(BaseModel):
    """
    Schema para el perfil público detallado del profesional.
    Incluye todos los datos visibles para clientes potenciales.
    NO incluye información sensible como email o estado de verificación.
    """
    # Datos básicos del profesional
    id: UUID
    nombre: str
    apellido: str
    avatar_url: Optional[str]
    
    # Datos profesionales
    nivel: ProfessionalLevel
    radio_cobertura_km: int
    acepta_instant: bool
    tarifa_por_hora: Optional[Decimal]
    
    # Estadísticas de reseñas (denormalizadas)
    rating_promedio: float = Field(
        description="Rating promedio del profesional"
    )
    total_resenas: int = Field(
        description="Cantidad total de reseñas recibidas"
    )
    
    # Relaciones anidadas
    oficios: List = []
    portfolio: List = []
    resenas: List = []
    
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def from_professional(cls, professional):
        """
        Constructor helper para crear desde un objeto Profesional con todas sus relaciones cargadas.
        """
        from app.schemas.oficio import OficioRead
        from app.schemas.portfolio import PortfolioItemRead
        from app.schemas.resena import ResenaPublicRead
        
        return cls(
            # Datos básicos
            id=professional.id,
            nombre=professional.usuario.nombre,
            apellido=professional.usuario.apellido,
            avatar_url=professional.usuario.avatar_url,
            # Datos profesionales
            nivel=professional.nivel,
            radio_cobertura_km=professional.radio_cobertura_km,
            acepta_instant=professional.acepta_instant,
            tarifa_por_hora=professional.tarifa_por_hora,
            # Estadísticas de reseñas
            rating_promedio=float(professional.rating_promedio),
            total_resenas=professional.total_resenas,
            # Relaciones
            oficios=[OficioRead.model_validate(oficio) for oficio in professional.oficios],
            portfolio=[PortfolioItemRead.model_validate(item) for item in professional.portfolio_items],
            resenas=[ResenaPublicRead.from_resena(resena) for resena in professional.resenas_recibidas]
        )
