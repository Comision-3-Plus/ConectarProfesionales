"""
Servicio de gestión de usuarios.
Contiene la lógica de negocio para operaciones CRUD de usuarios.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import Usuario
from app.models.professional import Profesional
from app.models.enums import UserRole
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Usuario | None:
    """
    Busca un usuario por su email.
    
    Args:
        db: Sesión de base de datos
        email: Email del usuario a buscar
        
    Returns:
        Usuario si existe, None en caso contrario
    """
    return db.query(Usuario).filter(Usuario.email == email).first()


def create_user(db: Session, user: UserCreate) -> Usuario:
    """
    Crea un nuevo usuario en el sistema.
    Si el rol es PROFESIONAL, también crea el registro en la tabla profesionales.
    
    Args:
        db: Sesión de base de datos
        user: Datos del usuario a crear (schema UserCreate)
        
    Returns:
        Usuario creado
        
    Raises:
        HTTPException: Si el email ya está registrado (400)
    """
    # 1. Verificar si el email ya existe
    existing_user = get_user_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 2. Hashear la contraseña
    password_hash = get_password_hash(user.password)
    
    # 3. Crear el objeto Usuario
    nuevo_usuario = Usuario(
        email=user.email,
        password_hash=password_hash,
        nombre=user.nombre,
        apellido=user.apellido,
        rol=user.rol,
        is_active=True
    )
    
    # 4. Si es profesional, crear también el registro en profesionales
    if user.rol == UserRole.PROFESIONAL:
        nuevo_profesional = Profesional(
            usuario=nuevo_usuario  # SQLAlchemy manejará la relación automáticamente
        )
        # No necesitamos hacer db.add(nuevo_profesional) porque cascade="all, delete-orphan"
        # en la relación hace que se agregue automáticamente
    
    # 5. Agregar a la sesión y hacer commit
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario


def get_user_by_id(db: Session, user_id: str) -> Usuario | None:
    """
    Busca un usuario por su ID.
    
    Args:
        db: Sesión de base de datos
        user_id: UUID del usuario
        
    Returns:
        Usuario si existe, None en caso contrario
    """
    return db.query(Usuario).filter(Usuario.id == user_id).first()


def update_user_status(db: Session, user_id: str, is_active: bool) -> Usuario:
    """
    Actualiza el estado activo/inactivo de un usuario.
    
    Args:
        db: Sesión de base de datos
        user_id: UUID del usuario
        is_active: Nuevo estado
        
    Returns:
        Usuario actualizado
        
    Raises:
        HTTPException: Si el usuario no existe (404)
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    
    return user


def authenticate_user(db: Session, email: str, password: str) -> Usuario | None:
    """
    Autentica un usuario por email y contraseña.
    
    **IMPORTANTE:** Verifica que el usuario esté activo (is_active=True).
    Un usuario baneado (is_active=False) no puede autenticarse.

    Returns:
        Usuario si las credenciales son válidas Y está activo, None si no lo son.
    """
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    
    # ⚠️ VERIFICACIÓN CRÍTICA: Usuario baneado no puede loguearse
    if not user.is_active:
        return None
    
    return user
