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

app = FastAPI(
    title="ConectarProfesionales - API Gateway",
    version="2.0.0",
    description="Puerta de enlace para arquitectura de microservicios"
)

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
        "servicios": servicios_estado,
        "estado_general": "healthy" if todos_ok else "degraded"
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

def obtener_servicio_destino(path: str) -> Optional[str]:
    """
    Determina a qué servicio debe ir la petición basándose en la ruta.
    Ordena las rutas por longitud (más largas primero) para que las más específicas tengan prioridad.
    """
    # Ordenar rutas por longitud descendente para que las más específicas se evalúen primero
    rutas_ordenadas = sorted(RUTAS_SERVICIO.items(), key=lambda x: len(x[0]), reverse=True)
    
    for ruta_prefijo, servicio in rutas_ordenadas:
        if path.startswith(ruta_prefijo):
            return servicio
    return None

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def gateway_route(path: str, request: Request):
    """
    Enruta todas las peticiones a los microservicios correspondientes
    """
    # Normalizar prefijos de versión (acepta /api y /api/v1)
    full_path = f"/{path}"
    for version_prefix in ("/api/v1", "/api"):
        if full_path.startswith(version_prefix + "/") or full_path == version_prefix:
            full_path = full_path[len(version_prefix):] or "/"
            break

    # Determinar servicio destino sobre el path normalizado
    servicio_nombre = obtener_servicio_destino(full_path)
    
    if not servicio_nombre:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró un servicio para la ruta: /{path}"
        )
    
    servicio_url = SERVICIOS.get(servicio_nombre)
    
    if not servicio_url:
        raise HTTPException(
            status_code=503,
            detail=f"Servicio {servicio_nombre} no disponible"
        )
    
    # Construir URL completa del servicio destino con path normalizado
    # full_path ya comienza con "/"
    url_destino = f"{servicio_url}{full_path}"
    
    # Obtener query params
    query_params = dict(request.query_params)
    
    # Obtener headers (excluir algunos headers internos)
    headers = dict(request.headers)
    headers_filtrados = {
        k: v for k, v in headers.items() 
        if k.lower() not in ['host', 'content-length']
    }
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
