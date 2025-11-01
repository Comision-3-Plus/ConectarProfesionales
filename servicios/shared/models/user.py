"""
Modelo de Usuario - Entidad base para todos los usuarios del sistema.
"""
from sqlalchemy import Column, String, Boolean, Enum, Integer
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, UUIDMixin
from .enums import UserRole


class Usuario(Base, UUIDMixin, TimestampMixin):
    """
    Tabla de usuarios del sistema.
    Representa tanto clientes como profesionales (discriminado por 'rol').
    """
    __tablename__ = "usuarios"
    
    # Información de autenticación
    email = Column(
        String(255), 
        unique=True, 
        nullable=False, 
        index=True,
        comment="Email único del usuario (usado para login)"
    )
    password_hash = Column(
        String(255), 
        nullable=False,
        comment="Hash bcrypt de la contraseña"
    )
    
    # Información personal
    nombre = Column(
        String(100), 
        nullable=False,
        comment="Nombre del usuario"
    )
    apellido = Column(
        String(100), 
        nullable=False,
        comment="Apellido del usuario"
    )
    avatar_url = Column(
        String(500),
        nullable=True,
        comment="URL o ruta del avatar del usuario"
    )
    
    # Rol y estado
    rol = Column(
        Enum(UserRole, name="user_role_enum", create_type=True),
        nullable=False,
        default=UserRole.CLIENTE,
        index=True,
        comment="Rol del usuario en el sistema"
    )
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        index=True,
        comment="Indica si el usuario está activo"
    )
    
    # Sistema de moderación de chat
    infracciones_chat = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Contador de infracciones en el chat (intento de pasar datos de contacto)"
    )
    is_chat_banned = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        comment="Indica si el usuario está baneado del chat por infracciones"
    )
    
    # Relaciones
    profesional_info = relationship(
        "Profesional",
        back_populates="usuario",
        uselist=False,  # Relación 1-a-1
        cascade="all, delete-orphan",
        lazy="joined"  # Cargar automáticamente cuando se consulta el usuario
    )
    
    def __repr__(self):
        return f"<Usuario(id={self.id}, email='{self.email}', rol='{self.rol.value}')>"
    
    @property
    def nombre_completo(self):
        """Propiedad de conveniencia para obtener el nombre completo"""
        return f"{self.nombre} {self.apellido}"
    
    @property
    def es_profesional(self):
        """Verifica si el usuario tiene perfil de profesional"""
        return self.rol == UserRole.PROFESIONAL and self.profesional_info is not None


# Alias para compatibilidad con código que usa 'User' en lugar de 'Usuario'
User = Usuario
