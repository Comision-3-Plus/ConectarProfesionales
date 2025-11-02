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
from shared.middleware.error_handler import add_exception_handlers
from shared.core.health import create_health_check_routes

app = FastAPI(
    title="Servicio de Usuarios",
    version="1.0.0",
    description="Gestión de perfiles de usuario"
)

# Agregar exception handlers
add_exception_handlers(app)

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

# Agregar health checks mejorados
health_router = create_health_check_routes(
    db_dependency=Depends(get_db),
    service_name="usuarios"
)
app.include_router(health_router)

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

# ============================================================================
# ADMIN - GESTIÓN DE USUARIOS
# ============================================================================

@app.get("/admin/users")
def list_all_users(
    page: int = 1,
    limit: int = 10,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos los usuarios de forma paginada (solo admin)
    """
    from shared.models.enums import UserRole
    
    # Verificar que sea admin
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden listar usuarios"
        )
    
    # Calcular offset
    offset = (page - 1) * limit
    
    # Obtener total de usuarios
    total = db.query(Usuario).count()
    
    # Obtener usuarios paginados
    users = db.query(Usuario).offset(offset).limit(limit).all()
    
    # Calcular total de páginas
    total_pages = (total + limit - 1) // limit
    
    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "nombre": u.nombre,
                "apellido": u.apellido,
                "rol": u.rol.value,
                "is_active": u.is_active,
                "fecha_creacion": u.fecha_creacion.isoformat() if u.fecha_creacion else None
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }

@app.get("/admin/users/search")
def search_users(
    email: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Busca usuarios por email (solo admin)
    """
    from shared.models.enums import UserRole
    
    # Verificar que sea admin
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden buscar usuarios"
        )
    
    # Buscar usuarios por email (búsqueda parcial)
    users = db.query(Usuario).filter(
        Usuario.email.ilike(f"%{email}%")
    ).limit(10).all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "nombre": u.nombre,
            "apellido": u.apellido,
            "rol": u.rol.value,
            "is_active": u.is_active
        }
        for u in users
    ]

@app.post("/admin/users/{user_id}/ban")
def ban_user(
    user_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Banea (desactiva) un usuario (solo admin)
    """
    from shared.models.enums import UserRole
    from uuid import UUID
    
    # Verificar que sea admin
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden banear usuarios"
        )
    
    # Buscar usuario
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )
    
    user = db.query(Usuario).filter(Usuario.id == user_uuid).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # No permitir banear a otros admins
    if user.rol == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se puede banear a un administrador"
        )
    
    # Banear usuario
    user.is_active = False
    db.commit()
    
    return {
        "message": "Usuario baneado exitosamente",
        "user_id": user_id,
        "email": user.email
    }

@app.post("/admin/users/{user_id}/unban")
def unban_user(
    user_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Desbanea (reactiva) un usuario (solo admin)
    """
    from shared.models.enums import UserRole
    from uuid import UUID
    
    # Verificar que sea admin
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden desbanear usuarios"
        )
    
    # Buscar usuario
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )
    
    user = db.query(Usuario).filter(Usuario.id == user_uuid).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Desbanear usuario
    user.is_active = True
    db.commit()
    
    return {
        "message": "Usuario desbaneado exitosamente",
        "user_id": user_id,
        "email": user.email
    }

# ============================================================================
# ADMIN - MÉTRICAS DE USUARIOS
# ============================================================================

@app.get("/admin/metrics/users")
def get_user_metrics(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene métricas de usuarios (solo admin)
    Devuelve conteos de clientes, profesionales y estados de KYC
    """
    from shared.models.enums import UserRole, VerificationStatus
    from shared.models.professional import Profesional
    from sqlalchemy import func
    
    # Verificar que sea admin
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden ver las métricas"
        )
    
    # Contar clientes
    total_clientes = db.query(func.count(Usuario.id)).filter(
        Usuario.rol == UserRole.CLIENTE
    ).scalar() or 0
    
    # Contar profesionales
    total_profesionales = db.query(func.count(Usuario.id)).filter(
        Usuario.rol == UserRole.PROFESIONAL
    ).scalar() or 0
    
    # Contar profesionales pendientes de KYC
    total_pro_pendientes_kyc = db.query(func.count(Profesional.id)).filter(
        Profesional.estado_verificacion.in_([
            VerificationStatus.PENDIENTE,
            VerificationStatus.EN_REVISION
        ])
    ).scalar() or 0
    
    # Contar profesionales aprobados
    total_pro_aprobados = db.query(func.count(Profesional.id)).filter(
        Profesional.estado_verificacion == VerificationStatus.APROBADO
    ).scalar() or 0
    
    return {
        "total_clientes": total_clientes,
        "total_profesionales": total_profesionales,
        "total_pro_pendientes_kyc": total_pro_pendientes_kyc,
        "total_pro_aprobados": total_pro_aprobados
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
