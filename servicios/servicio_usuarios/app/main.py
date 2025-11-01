"""
Servicio de Usuarios
Gestión de perfiles de usuario
"""
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Agregar path para imports compartidos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from shared.models.user import Usuario
from shared.schemas.user import UserRead, UserUpdate, PasswordChange
from shared.core.security import verify_password, get_password_hash, decode_access_token
from shared.schemas.token import TokenData

app = FastAPI(
    title="Servicio de Usuarios",
    version="1.0.0",
    description="Gestión de perfiles de usuario"
)

# Configuración de base de datos
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres.juhdzcctbpmtzvpntjpk:SanLorenzomuertos@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Obtiene sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token_data: TokenData = Depends(decode_access_token),
    db: Session = Depends(get_db),
) -> Usuario:
    """Obtiene el usuario actual a partir del token"""
    user = db.query(Usuario).filter(Usuario.id == token_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user

AVATAR_UPLOAD_DIR = "/app/uploads/avatars"

def ensure_avatar_dir():
    os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)

@app.get("/health")
async def health_check():
    """Health check del servicio"""
    return {"status": "healthy", "servicio": "usuarios"}

@app.get("/users/me", response_model=UserRead)
def read_me(current_user: Usuario = Depends(get_current_user)):
    """
    Obtiene el perfil del usuario actual
    Requiere token JWT en header Authorization
    """
    return current_user

@app.put("/users/me", response_model=UserRead)
def update_me(
    user_update: UserUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Actualiza los datos básicos del usuario actual (nombre y/o apellido).
    Funciona para cualquier rol (CLIENTE, PROFESIONAL, ADMIN).
    """
    # Actualización parcial
    if user_update.nombre is not None:
        current_user.nombre = user_update.nombre
    if user_update.apellido is not None:
        current_user.apellido = user_update.apellido
    
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/avatar", response_model=UserRead)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sube una foto de perfil (avatar) para el usuario actual.
    Funciona para cualquier rol (CLIENTE, PROFESIONAL, ADMIN).
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archivo no proporcionado"
        )
    
    # Validar tipo de archivo
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato no permitido. Usa: {', '.join(allowed_extensions)}"
        )
    
    ensure_avatar_dir()
    
    # Nombre seguro del archivo
    safe_name = f"{current_user.id}{file_ext}"
    dest_path = os.path.join(AVATAR_UPLOAD_DIR, safe_name)
    
    # Guardar archivo
    with open(dest_path, "wb") as out:
        while True:
            chunk = file.file.read(1024 * 1024)  # 1MB chunks
            if not chunk:
                break
            out.write(chunk)
    
    # Actualizar URL en la base de datos
    current_user.avatar_url = f"/uploads/avatars/{safe_name}"
    db.commit()
    db.refresh(current_user)
    
    return current_user

@app.post("/users/me/change-password", response_model=dict)
def change_password(
    password_data: PasswordChange,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cambia la contraseña del usuario actual.
    Requiere la contraseña actual para validación.
    """
    # Verificar que la contraseña actual sea correcta
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )
    
    # Validar que la nueva contraseña sea diferente
    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe ser diferente a la actual"
        )
    
    # Actualizar la contraseña
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {
        "message": "Contraseña actualizada exitosamente",
        "success": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
