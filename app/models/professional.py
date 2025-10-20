"""
Modelo de Profesional - Extiende Usuario con información específica de profesionales.
"""
from sqlalchemy import Column, Integer, Numeric, Boolean, Enum, ForeignKey, Index, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import VerificationStatus, ProfessionalLevel


class Profesional(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de profesionales.
    Extiende la información de Usuario con datos específicos del negocio:
    - KYC (Know Your Customer)
    - Geolocalización
    - Gamificación
    """
    __tablename__ = "profesionales"
    
    # Relación 1-a-1 con Usuario
    usuario_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        comment="Referencia única al usuario asociado"
    )
    
    # ==========================================
    # CAMPOS KYC (Know Your Customer)
    # ==========================================
    estado_verificacion = Column(
        Enum(VerificationStatus, name="verification_status_enum", create_type=True),
        nullable=False,
        default=VerificationStatus.PENDIENTE,
        index=True,
        comment="Estado del proceso de verificación de identidad"
    )
    
    # ==========================================
    # CAMPOS DE GEOLOCALIZACIÓN (PostGIS)
    # ==========================================
    base_location = Column(
        Geography(geometry_type='POINT', srid=4326, spatial_index=True),
        nullable=True,  # Puede ser null hasta que el profesional configure su ubicación
        comment="Ubicación base del profesional (punto geográfico en WGS84)"
    )
    
    radio_cobertura_km = Column(
        Integer,
        default=10,
        nullable=False,
        comment="Radio de cobertura en kilómetros desde la ubicación base"
    )
    
    # ==========================================
    # CAMPOS DE CONFIGURACIÓN DE SERVICIO
    # ==========================================
    acepta_instant = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Si el profesional acepta trabajos instantáneos (sin agendamiento previo)"
    )
    
    tarifa_por_hora = Column(
        Numeric(10, 2),  # 10 dígitos totales, 2 decimales (ej: 50000.00)
        nullable=True,
        comment="Tarifa por hora del profesional (en moneda local, puede ser null si no configurada)"
    )
    
    # ==========================================
    # CAMPOS DE PAGO
    # ==========================================
    payout_account = Column(
        String(255),
        nullable=True,
        comment="CVU, CBU o Alias de Mercado Pago para pagos al profesional"
    )
    
    # ==========================================
    # CAMPOS DE GAMIFICACIÓN
    # ==========================================
    nivel = Column(
        Enum(ProfessionalLevel, name="professional_level_enum", create_type=True),
        nullable=False,
        default=ProfessionalLevel.BRONCE,
        index=True,
        comment="Nivel de gamificación del profesional"
    )
    
    puntos_experiencia = Column(
        Integer,
        default=0,
        nullable=False,
        index=True,
        comment="Puntos de experiencia acumulados por el profesional"
    )
    
    tasa_comision_actual = Column(
        Numeric(5, 2),  # 5 dígitos totales, 2 decimales (ej: 0.20 = 20%)
        default=0.20,
        nullable=False,
        comment="Tasa de comisión actual (0.00 a 1.00, donde 0.20 = 20%)"
    )
    
    # ==========================================
    # CAMPOS DE RESEÑAS (DENORMALIZADOS)
    # ==========================================
    rating_promedio = Column(
        Numeric(3, 2),  # 3 dígitos totales, 2 decimales (ej: 4.75)
        default=0.00,
        nullable=False,
        comment="Rating promedio denormalizado (evita calcular AVG en cada búsqueda)"
    )
    
    total_resenas = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Total de reseñas recibidas (denormalizado para performance)"
    )
    
    # Relación inversa con Usuario
    usuario = relationship(
        "Usuario",
        back_populates="profesional_info",
        lazy="joined"
    )
    
    # Relación M2M con Oficios
    oficios = relationship(
        "Oficio",
        secondary="profesional_oficios",
        back_populates="profesionales"
    )
    
    # Relación M2M con Servicios Instantáneos
    servicios_instantaneos = relationship(
        "ServicioInstantaneo",
        secondary="profesional_servicios_instant",
        back_populates="profesionales"
    )
    
    # Índices para optimizar queries geoespaciales
    __table_args__ = (
        Index(
            'idx_profesional_location_gist',
            base_location,
            postgresql_using='gist'
        ),
        Index(
            'idx_profesional_estado_nivel',
            estado_verificacion,
            nivel
        ),
    )
    
    def __repr__(self):
        return (
            f"<Profesional(id={self.id}, usuario_id={self.usuario_id}, "
            f"nivel='{self.nivel.value}', estado='{self.estado_verificacion.value}')>"
        )
    
    @property
    def esta_verificado(self):
        """Verifica si el profesional está aprobado"""
        return self.estado_verificacion == VerificationStatus.APROBADO
    
    @property
    def puede_recibir_trabajos(self):
        """Verifica si el profesional puede recibir trabajos"""
        return (
            self.esta_verificado and 
            self.usuario.is_active and 
            self.base_location is not None
        )
    
    @property
    def comision_porcentaje(self):
        """Retorna la comisión como porcentaje (ej: 20.0 para 20%)"""
        return float(self.tasa_comision_actual) * 100
