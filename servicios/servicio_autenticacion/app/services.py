"""
Servicios de lógica de negocio
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from passlib.context import CryptContext
from app.models import Usuario, UserRole
from app.schemas import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    """Servicio de gestión de usuarios"""
    
    def create_user(self, db: Session, user: UserCreate) -> Usuario:
        """Crea nuevo usuario"""
        # Verificar si email ya existe
        existing_user = db.query(Usuario).filter(Usuario.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Crear usuario
        db_user = Usuario(
            email=user.email,
            password_hash=pwd_context.hash(user.password),
            nombre=user.nombre,
            apellido=user.apellido,
            rol=user.rol,
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Si es profesional, crear perfil (esto lo hará el servicio de profesionales via evento)
        
        return db_user
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Usuario | None:
        """Autentica usuario"""
        user = db.query(Usuario).filter(Usuario.email == email).first()
        
        if not user:
            return None
        
        if not user.is_active:
            return None
        
        if not pwd_context.verify(password, user.password_hash):
            return None
        
        return user

# Instancia global
user_service = UserService()

class PasswordService:
    """Servicio de recuperación de contraseña"""
    
    def generate_reset_token(self, email: str) -> str:
        """Genera token de reset"""
        from jose import jwt
        from datetime import datetime, timedelta, timezone
        import os
        
        SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-min-32-chars")
        payload = {
            "sub": email,
            "exp": datetime.now(timezone.utc) + timedelta(hours=1)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    def verify_reset_token(self, token: str) -> str | None:
        """Verifica token de reset"""
        from jose import jwt, JWTError
        import os
        
        SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-min-32-chars")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            email = payload.get("sub")
            return email
        except JWTError:
            return None
    
    def send_reset_email(self, email: str, token: str):
        """Envía email de reset (en dev: imprime en consola)"""
        reset_url = f"http://localhost:3000/reset-password?token={token}"
        print(f"📧 Email de reset para {email}: {reset_url}")

# Instancia global
password_service = PasswordService()
