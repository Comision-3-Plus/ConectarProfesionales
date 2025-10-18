"""
Health check endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint que verifica:
    - Estado de la API
    - Conexión a la base de datos
    - Disponibilidad de PostGIS
    """
    try:
        # Verificar conexión a la base de datos
        db.execute(text("SELECT 1"))
        db_status = "connected"
        
        # Verificar que PostGIS esté disponible
        result = db.execute(text("SELECT PostGIS_Version();"))
        postgis_version = result.scalar()
        postgis_status = "available"
        
    except Exception as e:
        db_status = f"error: {str(e)}"
        postgis_status = "unavailable"
        postgis_version = None
    
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": db_status,
        "postgis": {
            "status": postgis_status,
            "version": postgis_version
        }
    }
