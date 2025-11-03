"""
API Gateway - Puerta de Enlace
Punto único de entrada para todos los microservicios
"""
from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from typing import Optional
import time
import sys

# Agregar path de shared para importar Firebase endpoints
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared'))

app = FastAPI(
    title="ConectarProfesionales - API Gateway",
    version="2.0.0",
    description="Puerta de enlace para arquitectura de microservicios"
)

# ============================================================================
# API VERSIONING CONFIGURATION
# ============================================================================

SUPPORTED_VERSIONS = ["v1", "v2"]
DEFAULT_VERSION = "v1"

# Configuración de servicios backend
SERVICIOS = {
    "autenticacion": os.getenv("SERVICIO_AUTENTICACION_URL", "http://servicio-autenticacion:8001"),
    "usuarios": os.getenv("SERVICIO_USUARIOS_URL", "http://servicio-usuarios:8002"),
    "profesionales": os.getenv("SERVICIO_PROFESIONALES_URL", "http://servicio-profesionales:8003"),
    "chat": os.getenv("SERVICIO_CHAT_URL", "http://servicio-chat-ofertas:8004"),
    "pagos": os.getenv("SERVICIO_PAGOS_URL", "http://servicio-pagos:8005"),
    "notificaciones": os.getenv("SERVICIO_NOTIFICACIONES_URL", "http://servicio-notificaciones:8006"),
}

# CORS - Configuración
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://conectarprofesionales.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page", "X-Page-Size"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Cliente HTTP reutilizable
http_client = httpx.AsyncClient(timeout=30.0)

# Middleware de logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    print(f"📡 {request.method} {request.url.path} - {response.status_code} - {process_time:.2f}s")
    
    return response

# Health check
@app.get("/health")
async def health_check():
    """Verifica el estado del gateway y todos los servicios"""
    servicios_estado = {}
    
    for nombre, url in SERVICIOS.items():
        try:
            response = await http_client.get(f"{url}/health", timeout=5.0)
            servicios_estado[nombre] = {
                "estado": "healthy" if response.status_code == 200 else "unhealthy",
                "url": url
            }
        except Exception as e:
            servicios_estado[nombre] = {
                "estado": "down",
                "url": url,
                "error": str(e)
            }
    
    todos_ok = all(s["estado"] == "healthy" for s in servicios_estado.values())
    
    return {
        "gateway": "healthy",
        "version": "2.0.0",
        "api_versions": SUPPORTED_VERSIONS,
        "default_version": DEFAULT_VERSION,
        "servicios": servicios_estado,
        "estado_general": "healthy" if todos_ok else "degraded"
    }

@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "name": "ConectarProfesionales API Gateway",
        "version": "2.0.0",
        "api_versions": SUPPORTED_VERSIONS,
        "default_version": DEFAULT_VERSION,
        "endpoints": {
            "health": "/health",
            "v1_base": "/api/v1",
            "v2_base": "/api/v2"
        },
        "documentation": {
            "swagger_v1": "/api/v1/docs",
            "swagger_v2": "/api/v2/docs"
        },
        "deprecation_notice": "API v1 será deprecada en 6 meses. Migre a v2."
    }

# Mapeo de rutas a servicios
RUTAS_SERVICIO = {
    # Autenticación
    "/auth": "autenticacion",
    
    # Usuarios
    "/users": "usuarios",
    "/usuario": "usuarios",
    
    # Profesionales
    "/professional": "profesionales",
    "/profesional": "profesionales",
    "/search": "profesionales",
    "/buscar": "profesionales",
    "/public": "profesionales",
    "/publico": "profesionales",
    
    # Admin - Rutas específicas primero (más específico gana)
    "/admin/metrics/users": "usuarios",  # Métricas de usuarios en servicio_usuarios
    "/admin/dashboard": "pagos",  # Dashboard financiero en servicio_pagos
    "/admin/trabajo": "pagos",    # Admin trabajos en servicio_pagos
    "/admin/kyc": "profesionales", # KYC en profesionales
    "/admin/users": "usuarios",    # Gestión usuarios
    "/admin/oficios": "profesionales", # Oficios
    "/admin/servicios": "profesionales", # Servicios instantáneos
    "/admin": "profesionales",    # Otros admin endpoints (fallback)
    
    # Chat y Ofertas
    "/chat": "chat",
    "/cliente": "chat",
    "/ofertas": "chat",
    "/trabajos": "chat",
    "/resenas": "chat",
    "/trabajo": "chat",
    
    # Pagos
    "/payment": "pagos",
    "/pagos": "pagos",
    "/webhook": "pagos",
    
    # Notificaciones
    "/notify": "notificaciones",
    "/notificar": "notificaciones",
}

# Rutas específicas para API v2 (con cambios)
RUTAS_SERVICIO_V2 = {
    # En v2, autenticación usa OAuth2 mejorado
    "/auth": "autenticacion",  # Podría apuntar a "autenticacion_v2" si existiera
    
    # Resto igual que v1 por ahora
    **RUTAS_SERVICIO
}

def get_version_from_path(path: str) -> tuple[str, str]:
    """
    Extrae la versión de API del path.
    
    Args:
        path: Path completo (ej: /api/v2/users/me)
        
    Returns:
        Tupla (version, path_sin_version)
        
    Examples:
        "/api/v1/users/me" -> ("v1", "/users/me")
        "/api/v2/auth/login" -> ("v2", "/auth/login")
        "/users/me" -> ("v1", "/users/me")  # Default v1
    """
    # Normalizar path
    full_path = f"/{path}" if not path.startswith("/") else path
    
    # Verificar si tiene prefijo /api/vX
    for version in SUPPORTED_VERSIONS:
        version_prefix = f"/api/{version}"
        if full_path.startswith(version_prefix + "/"):
            return version, full_path[len(version_prefix):]
        elif full_path == version_prefix:
            return version, "/"
    
    # Verificar prefijo /api sin versión (usar default)
    if full_path.startswith("/api/"):
        return DEFAULT_VERSION, full_path[4:]
    elif full_path == "/api":
        return DEFAULT_VERSION, "/"
    
    # Sin prefijo de versión, usar default
    return DEFAULT_VERSION, full_path

def obtener_servicio_destino(path: str, version: str = "v1") -> Optional[str]:
    """
    Determina a qué servicio debe ir la petición basándose en la ruta y versión.
    Ordena las rutas por longitud (más largas primero) para que las más específicas tengan prioridad.
    
    Args:
        path: Path sin versión
        version: Versión de API (v1, v2, etc.)
        
    Returns:
        Nombre del servicio o None
    """
    # Seleccionar rutas según versión
    rutas = RUTAS_SERVICIO_V2 if version == "v2" else RUTAS_SERVICIO
    
    # Ordenar rutas por longitud descendente para que las más específicas se evalúen primero
    rutas_ordenadas = sorted(rutas.items(), key=lambda x: len(x[0]), reverse=True)
    
    for ruta_prefijo, servicio in rutas_ordenadas:
        if path.startswith(ruta_prefijo):
            return servicio
    return None

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def gateway_route(path: str, request: Request):
    """
    Enruta todas las peticiones a los microservicios correspondientes.
    Soporta versionado de API: /api/v1/... y /api/v2/...
    """
    # Extraer versión y normalizar path
    version, normalized_path = get_version_from_path(f"/{path}")
    
    # Validar versión soportada
    if version not in SUPPORTED_VERSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Versión de API no soportada: {version}. Versiones disponibles: {', '.join(SUPPORTED_VERSIONS)}"
        )
    
    # Determinar servicio destino
    servicio_nombre = obtener_servicio_destino(normalized_path, version)
    
    if not servicio_nombre:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró un servicio para la ruta: {normalized_path} (API {version})"
        )
    
    servicio_url = SERVICIOS.get(servicio_nombre)
    
    if not servicio_url:
        raise HTTPException(
            status_code=503,
            detail=f"Servicio {servicio_nombre} no disponible"
        )
    
    # Construir URL completa del servicio destino
    url_destino = f"{servicio_url}{normalized_path}"
    
    # Agregar header de versión para que el servicio sepa la versión solicitada
    headers = dict(request.headers)
    headers_filtrados = {
        k: v for k, v in headers.items() 
        if k.lower() not in ['host', 'content-length']
    }
    headers_filtrados['X-API-Version'] = version
    
    # Obtener query params
    query_params = dict(request.query_params)
    
    # Obtener body si existe
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.json()
        except:
            try:
                body = await request.body()
            except:
                body = None
    
    try:
        # Hacer la petición al microservicio
        if request.method == "GET":
            response = await http_client.get(
                url_destino,
                params=query_params,
                headers=headers_filtrados
            )
        elif request.method == "POST":
            response = await http_client.post(
                url_destino,
                json=body if isinstance(body, dict) else None,
                data=body if isinstance(body, bytes) else None,
                params=query_params,
                headers=headers_filtrados
            )
        elif request.method == "PUT":
            response = await http_client.put(
                url_destino,
                json=body if isinstance(body, dict) else None,
                params=query_params,
                headers=headers_filtrados
            )
        elif request.method == "PATCH":
            response = await http_client.patch(
                url_destino,
                json=body if isinstance(body, dict) else None,
                params=query_params,
                headers=headers_filtrados
            )
        elif request.method == "DELETE":
            response = await http_client.delete(
                url_destino,
                params=query_params,
                headers=headers_filtrados
            )
        else:
            raise HTTPException(status_code=405, detail="Método no permitido")
        
        # Retornar la respuesta del microservicio
        upstream_headers = dict(response.headers)
        # Filtrar headers que pueden causar inconsistencias al reenviar
        headers_filtrados_resp = {
            k: v
            for k, v in upstream_headers.items()
            if k.lower() not in [
                "content-length",  # será recalculado
                "transfer-encoding",  # evitar conflictos con streaming
                "content-encoding",  # evitar gzip inconsistente
                "connection"
            ]
        }
        
        # Agregar header de versión en respuesta
        headers_filtrados_resp['X-API-Version'] = version

        content_type = upstream_headers.get("content-type", "")
        try:
            if content_type.startswith("application/json"):
                return JSONResponse(
                    content=response.json(),
                    status_code=response.status_code,
                    headers=headers_filtrados_resp
                )
            else:
                from fastapi import Response
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    media_type=content_type or None,
                    headers=headers_filtrados_resp
                )
        except Exception as e:
            # Como fallback, devolver texto plano
            from fastapi import Response
            return Response(
                content=response.text,
                status_code=response.status_code,
                media_type="text/plain",
                headers=headers_filtrados_resp
            )
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=f"Timeout al conectar con {servicio_nombre}"
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"No se pudo conectar con {servicio_nombre}"
        )
    except Exception as e:
        print(f"❌ Error en gateway: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno en gateway: {str(e)}"
        )

@app.on_event("shutdown")
async def shutdown_event():
    """Cerrar cliente HTTP al apagar"""
    await http_client.aclose()


# ============================================================================
# FIREBASE ENDPOINTS (Integración directa)
# ============================================================================

try:
    from shared.firebase.endpoints import router as firebase_router
    app.include_router(firebase_router, prefix="/api/v1", tags=["Firebase"])
    print("✅ Firebase endpoints integrados en API Gateway")
except Exception as e:
    print(f"⚠️ No se pudieron cargar Firebase endpoints: {e}")
    print("   Firebase funcionará cuando se configuren las credenciales")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
