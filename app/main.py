"""
FastAPI Application - Marketplace de Profesionales
API RESTful headless con soporte para geolocalización (PostGIS)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API RESTful para Marketplace de Profesionales con geolocalización",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configurar CORS (ajustar según necesidades de producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check en la raíz
@app.get("/", tags=["root"])
async def root():
    """
    Health check básico en la raíz de la API
    """
    return {
        "status": "ok",
        "message": f"Bienvenido a {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

# Incluir los routers de la API v1
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Event handlers
@app.on_event("startup")
async def startup_event():
    """Acciones al iniciar la aplicación"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} iniciado")
    print(f"📍 PostGIS habilitado para geolocalización")
    print(f"📚 Documentación disponible en: http://localhost:8000/docs")

@app.on_event("shutdown")
async def shutdown_event():
    """Acciones al cerrar la aplicación"""
    print(f"👋 {settings.APP_NAME} detenido")
