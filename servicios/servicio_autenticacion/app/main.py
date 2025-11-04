"""
Servicio de Autenticación
Maneja registro, login y gestión de tokens JWT
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError
from typing import Dict, Any
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

# Importar servicio de Firebase Auth
try:
    from shared.firebase.auth import create_custom_token
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("⚠️ Firebase Admin SDK no disponible - chat sin autenticación")

from shared.middleware.error_handler import add_exception_handlers

app = FastAPI(
    title="Servicio de Autenticación",
    version="1.0.0",
    description="Servicio de autenticación y gestión de tokens JWT"
)

# Agregar exception handlers
add_exception_handlers(app)

# Agregar health checks simples
from shared.core.health import create_simple_health_routes
health_router = create_simple_health_routes(service_name="autenticacion")
app.include_router(health_router)

# Configuración
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Contexto de hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Importar modelos y esquemas (se copiarán del proyecto original)
from app.database import get_db
from app.models import Usuario
from app.schemas import UserCreate, UserRead, Token, TokenData
from app.services import user_service

def get_password_hash(password: str) -> str:
    """Genera hash seguro de contraseña con bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica contraseña contra hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any], expires_minutes: int = None) -> str:
    """Crea JWT firmado con expiración"""
    to_encode = data.copy()
    expire_delta = expires_minutes if expires_minutes else ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/auth/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en el sistema
    - Email único
    - Contraseña hasheada con bcrypt
    - Si es PROFESIONAL, crea perfil automáticamente
    """
    try:
        print(f"📝 Registro - Datos recibidos: {user.model_dump()}")
        nuevo_usuario = user_service.create_user(db=db, user=user)
        print(f"✅ Usuario creado: {nuevo_usuario.email}")
        return nuevo_usuario
    except HTTPException as e:
        print(f"❌ Error HTTP en registro: {e.status_code} - {e.detail}")
        raise
    except Exception as e:
        print(f"❌ Error inesperado en registro: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Autentica usuario y retorna token JWT
    - Verifica credenciales
    - Verifica que usuario esté activo (no baneado)
    - Genera JWT con user_id y rol
    """
    try:
        print(f"🔐 Login - Email: {form_data.username}")
        
        # Verificar si usuario existe
        user_check = db.query(Usuario).filter(Usuario.email == form_data.username).first()
        
        if not user_check:
            print(f"❌ Usuario no encontrado: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if user_check and not user_check.is_active:
            print(f"⛔ Usuario inactivo: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tu cuenta ha sido desactivada. Contacta al administrador.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Autenticar usuario
        user = user_service.authenticate_user(db, email=form_data.username, password=form_data.password)
        if not user:
            print(f"❌ Contraseña incorrecta para: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Crear token
        payload = {"sub": str(user.id), "rol": user.rol.value}
        access_token = create_access_token(data=payload)
        
        print(f"✅ Login exitoso: {user.email}")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error inesperado en login: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@app.post("/auth/validate-token", response_model=TokenData)
def validate_token(token: str):
    """
    Valida un token JWT y retorna los datos del token
    Endpoint interno usado por API Gateway
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        rol = payload.get("rol")
        
        if user_id is None:
            raise credentials_exception
        
        return TokenData(user_id=user_id, rol=rol)
    
    except JWTError:
        raise credentials_exception

@app.post("/auth/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """
    Inicia proceso de recuperación de contraseña
    - Genera token de reset
    - Envía email (en dev: imprime en consola)
    """
    from app.services import password_service
    
    user = db.query(Usuario).filter(Usuario.email == email).first()
    
    if user:
        token = password_service.generate_reset_token(email)
        password_service.send_reset_email(email, token)
    
    return {
        "message": "Si el email existe, recibirás instrucciones para resetear tu contraseña.",
        "success": True
    }

@app.post("/auth/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """
    Resetea contraseña usando token de recuperación
    - Valida token
    - Actualiza contraseña
    """
    from app.services import password_service
    
    email = password_service.verify_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )
    
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.password_hash = get_password_hash(new_password)
    db.commit()
    
    return {
        "message": "Contraseña actualizada exitosamente",
        "success": True
    }

@app.post("/auth/firebase-token")
def get_firebase_token(token_data: TokenData):
    """
    Genera un token personalizado de Firebase para el usuario autenticado.
    Este token permite al frontend autenticarse en Firebase Firestore.
    
    Args:
        token_data: Datos del token JWT del usuario (obtenidos del middleware)
        
    Returns:
        dict: Token personalizado de Firebase
    """
    if not FIREBASE_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase no está configurado"
        )
    
    try:
        # Crear token personalizado para Firebase
        firebase_token = create_custom_token(
            user_id=token_data.user_id,
            additional_claims={"rol": token_data.rol}
        )
        
        return {
            "firebase_token": firebase_token,
            "user_id": token_data.user_id
        }
    except Exception as e:
        print(f"❌ Error al generar token de Firebase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al generar token de Firebase"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
