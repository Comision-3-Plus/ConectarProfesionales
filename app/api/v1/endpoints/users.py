"""
Endpoints de usuarios protegidos.
"""
import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.schemas.user import UserRead, UserUpdate
from app.models.user import Usuario

router = APIRouter()

AVATAR_UPLOAD_DIR = "/app/uploads/avatars"


def ensure_avatar_dir():
    os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)


@router.get("/me", response_model=UserRead)
def read_me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
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


@router.post("/me/avatar", response_model=UserRead)
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
    
    # Validar tipo de archivo (opcional pero recomendado)
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
