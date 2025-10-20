"""
Endpoints de autenticación.
Maneja registro, login y gestión de tokens.
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserRead
from app.schemas.token import Token
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
from app.services import user_service
from app.services import password_service
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.core.security import create_access_token
from app.models.user import Usuario

# Crear el router para autenticación
router = APIRouter()

# OAuth2 scheme (Bearer token) for protected endpoints
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario",
    description="""
    Registra un nuevo usuario en el sistema.
    
    - **email**: Email único del usuario (será validado)
    - **password**: Contraseña con mínimo 8 caracteres (será hasheada con bcrypt)
    - **nombre**: Nombre del usuario
    - **apellido**: Apellido del usuario
    - **rol**: CLIENTE o PROFESIONAL (por defecto CLIENTE)
    
    Si el rol es PROFESIONAL, se creará automáticamente un perfil de profesional asociado.
    
    **Seguridad**: La contraseña nunca se almacena en texto plano, solo su hash bcrypt.
    """
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
) -> UserRead:
    """
    Crea un nuevo usuario en el sistema.
    
    Args:
        user: Datos del usuario a registrar (email, password, nombre, apellido, rol)
        db: Sesión de base de datos (inyectada automáticamente)
        
    Returns:
        Usuario creado (sin el password_hash)
        
    Raises:
        HTTPException 400: Si el email ya está registrado
    """
    nuevo_usuario = user_service.create_user(db=db, user=user)
    return nuevo_usuario


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Login de usuario (OAuth2)",
    description="""
    Autentica a un usuario (cliente o profesional) y retorna un token JWT de acceso.

    Usa OAuth2PasswordRequestForm, por lo que se espera `username` y `password` como form fields.
    El token contendrá `sub` (UUID del usuario) y `rol` (CLIENTE/PROFESIONAL/ADMIN).
    
    **Seguridad:** Los usuarios baneados (is_active=False) no pueden iniciar sesión.
    """
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Token:
    # Primero verificar si el usuario existe para dar mensaje específico si está baneado
    user_check = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if user_check and not user_check.is_active:
        # Usuario existe pero está baneado
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu cuenta ha sido desactivada. Contacta al administrador para más información.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Autenticar normalmente (ya incluye verificación de is_active)
    user = user_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = {"sub": str(user.id), "rol": user.rol.value}
    access_token = create_access_token(data=payload)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/forgot-password",
    response_model=PasswordResetResponse,
    status_code=status.HTTP_200_OK,
    summary="Solicitar recuperación de contraseña",
    description="""
    Inicia el proceso de recuperación de contraseña.
    
    - Genera un token único de recuperación
    - Envía un email con el link de reseteo (en dev: imprime en consola)
    - El token expira en 1 hora
    
    **Nota**: Por seguridad, siempre retorna 200 OK incluso si el email no existe.
    """
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
) -> PasswordResetResponse:
    """
    Solicita un token de recuperación de contraseña.
    
    Si el email existe en el sistema, se genera un token y se envía un email.
    Por seguridad, siempre retorna éxito (no revela si el email existe o no).
    """
    # Verificar si el usuario existe
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    
    if user:
        # Generar token
        token = password_service.generate_reset_token(request.email)
        
        # Enviar email (en dev: imprime en consola)
        password_service.send_reset_email(request.email, token)
    
    # Siempre retornar éxito por seguridad
    return PasswordResetResponse(
        message="Si el email existe, recibirás instrucciones para resetear tu contraseña.",
        success=True
    )


@router.post(
    "/reset-password",
    response_model=PasswordResetResponse,
    status_code=status.HTTP_200_OK,
    summary="Resetear contraseña con token",
    description="""
    Resetea la contraseña usando un token válido.
    
    - Valida el token de recuperación
    - Verifica que no haya expirado
    - Actualiza la contraseña del usuario
    - Invalida el token
    """
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
) -> PasswordResetResponse:
    """
    Resetea la contraseña de un usuario usando un token válido.
    """
    success = password_service.reset_user_password(
        db=db,
        token=request.token,
        new_password=request.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )
    
    return PasswordResetResponse(
        message="Contraseña actualizada exitosamente. Ya puedes iniciar sesión.",
        success=True
    )
