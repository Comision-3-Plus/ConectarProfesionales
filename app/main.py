"""
FastAPI Application - Marketplace de Profesionales
API RESTful headless con soporte para geolocalización (PostGIS)
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
from app.core.config import settings
from app.api.v1 import api_router

# Crear limiter para rate limiting
limiter = Limiter(key_func=get_remote_address)

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API RESTful para Marketplace de Profesionales con geolocalización",
    docs_url="/docs" if settings.DEBUG else None,  # Deshabilitar docs en producción
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# Agregar limiter al estado de la app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# MIDDLEWARE DE SEGURIDAD

# 1. CORS - Restringido en producción
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://26.224.83.238:3000",  # IP de red local
    "https://conectarprofesionales.com",  # Cambiar por tu dominio
    "https://www.conectarprofesionales.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not settings.DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page", "X-Page-Size"],
)

# 2. Trusted Host - Solo dominios permitidos
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "localhost",
            "127.0.0.1",
            "conectarprofesionales.com",
            "*.conectarprofesionales.com",
        ]
    )

# 3. GZip - Comprimir respuestas
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 4. Headers de seguridad personalizados
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Headers de seguridad
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), payment=(self)"
    
    # Remover headers que revelan información del servidor
    # MutableHeaders no tiene pop(), usar del en try/except
    try:
        del response.headers["Server"]
    except KeyError:
        pass
    try:
        del response.headers["X-Powered-By"]
    except KeyError:
        pass
    
    return response

# 5. Logging y monitoreo de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log (en producción usar un logger profesional)
    if settings.DEBUG:
        print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    
    return response

# Health check en la raíz con rate limit
@app.get("/", tags=["root"])
@limiter.limit("10/minute")
async def root(request: Request):
    """
    Health check básico en la raíz de la API
    """
    return {
        "status": "ok",
        "message": f"Bienvenido a {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else None,
        "security": "enabled"
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
