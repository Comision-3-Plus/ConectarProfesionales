"""
Health checks mejorados para Kubernetes.
Implementa /health/live (liveness) y /health/ready (readiness).
"""
from fastapi import APIRouter, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


def create_health_check_routes(db_dependency, service_name: str = "service"):
    """
    Crea rutas de health check para un servicio.
    
    Args:
        db_dependency: Dependency de FastAPI para obtener sesión DB
        service_name: Nombre del servicio para identificación
    
    Returns:
        APIRouter con las rutas configuradas
    """
    
    @router.get("/health")
    async def health_basic():
        """Health check básico - el servicio está corriendo"""
        return {
            "status": "healthy",
            "service": service_name
        }
    
    @router.get("/health/live")
    async def health_liveness():
        """
        Liveness probe - verifica que el servicio esté vivo.
        Kubernetes usa esto para saber si debe reiniciar el pod.
        No verifica dependencias externas.
        """
        return {
            "status": "alive",
            "service": service_name
        }
    
    @router.get("/health/ready")
    async def health_readiness(response: Response, db: Session = db_dependency):
        """
        Readiness probe - verifica que el servicio esté listo para recibir tráfico.
        Kubernetes usa esto para decidir si enviar requests al pod.
        Verifica dependencias críticas (DB, etc).
        """
        checks = {
            "service": service_name,
            "status": "ready",
            "checks": {}
        }
        
        all_healthy = True
        
        # Check 1: Database connection
        try:
            db.execute(text("SELECT 1"))
            checks["checks"]["database"] = {
                "status": "healthy",
                "message": "Database connection OK"
            }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            checks["checks"]["database"] = {
                "status": "unhealthy",
                "message": f"Database connection failed: {str(e)}"
            }
            all_healthy = False
        
        # Actualizar estado general
        if not all_healthy:
            checks["status"] = "not_ready"
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        
        return checks
    
    return router


def create_simple_health_routes(service_name: str = "service"):
    """
    Crea rutas de health check simples (sin dependencias DB).
    Útil para servicios que no usan base de datos directamente.
    
    Args:
        service_name: Nombre del servicio
    
    Returns:
        APIRouter con las rutas configuradas
    """
    
    @router.get("/health")
    async def health_basic():
        """Health check básico"""
        return {
            "status": "healthy",
            "service": service_name
        }
    
    @router.get("/health/live")
    async def health_liveness():
        """Liveness probe"""
        return {
            "status": "alive",
            "service": service_name
        }
    
    @router.get("/health/ready")
    async def health_readiness():
        """Readiness probe (sin checks externos)"""
        return {
            "status": "ready",
            "service": service_name,
            "checks": {
                "service": {
                    "status": "healthy",
                    "message": "Service is running"
                }
            }
        }
    
    return router
