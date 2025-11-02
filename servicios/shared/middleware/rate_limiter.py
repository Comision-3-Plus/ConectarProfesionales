"""
Sistema de Rate Limiting usando Redis.
Implementa límites de requests por IP y por usuario.
"""
import redis
import time
import logging
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional, Callable
import functools

logger = logging.getLogger(__name__)


class RateLimiter:
    """Gestor de rate limiting con Redis"""
    
    def __init__(self, redis_url: str = "redis://redis:6379"):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
    
    def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> tuple[bool, dict]:
        """
        Verifica si se ha excedido el rate limit.
        
        Args:
            key: Identificador único (IP, user_id, etc.)
            max_requests: Número máximo de requests permitidos
            window_seconds: Ventana de tiempo en segundos
            
        Returns:
            Tupla (permitido, info_dict)
            - permitido: True si está dentro del límite
            - info_dict: Información sobre el rate limit
        """
        try:
            now = time.time()
            window_key = f"ratelimit:{key}:{int(now // window_seconds)}"
            
            # Incrementar contador
            pipe = self.redis_client.pipeline()
            pipe.incr(window_key)
            pipe.expire(window_key, window_seconds)
            results = pipe.execute()
            
            current_requests = results[0]
            
            # Calcular tiempo hasta reset
            time_until_reset = window_seconds - (now % window_seconds)
            
            info = {
                "limit": max_requests,
                "remaining": max(0, max_requests - current_requests),
                "reset": int(now + time_until_reset),
                "reset_in_seconds": int(time_until_reset)
            }
            
            allowed = current_requests <= max_requests
            
            if not allowed:
                logger.warning(f"Rate limit excedido para {key}: {current_requests}/{max_requests}")
            
            return allowed, info
            
        except Exception as e:
            logger.error(f"Error en rate limiter: {str(e)}")
            # En caso de error, permitir el request
            return True, {"limit": max_requests, "remaining": max_requests}
    
    def get_client_key(self, request: Request, user_id: Optional[str] = None) -> str:
        """
        Genera una key única para el cliente.
        
        Args:
            request: Request de FastAPI
            user_id: ID del usuario autenticado (opcional)
            
        Returns:
            Key única para el cliente
        """
        if user_id:
            return f"user:{user_id}"
        
        # Usar IP del cliente
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        return f"ip:{client_ip}"


# Instancia global del rate limiter
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter(redis_url: str = "redis://redis:6379") -> RateLimiter:
    """Obtiene la instancia global del rate limiter"""
    global _rate_limiter
    
    if _rate_limiter is None:
        _rate_limiter = RateLimiter(redis_url)
    
    return _rate_limiter


async def rate_limit_middleware(request: Request, call_next):
    """
    Middleware de rate limiting global.
    
    Se puede agregar a la aplicación FastAPI:
        app.middleware("http")(rate_limit_middleware)
    """
    limiter = get_rate_limiter()
    
    # Obtener key del cliente
    client_key = limiter.get_client_key(request)
    
    # Configuración por defecto: 100 requests por minuto
    max_requests = 100
    window_seconds = 60
    
    # Verificar rate limit
    allowed, info = limiter.check_rate_limit(client_key, max_requests, window_seconds)
    
    if not allowed:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit excedido",
                "message": f"Has excedido el límite de {max_requests} requests por minuto",
                "retry_after": info["reset_in_seconds"]
            },
            headers={
                "X-RateLimit-Limit": str(info["limit"]),
                "X-RateLimit-Remaining": str(info["remaining"]),
                "X-RateLimit-Reset": str(info["reset"]),
                "Retry-After": str(info["reset_in_seconds"])
            }
        )
    
    # Ejecutar request
    response = await call_next(request)
    
    # Agregar headers de rate limit
    response.headers["X-RateLimit-Limit"] = str(info["limit"])
    response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
    response.headers["X-RateLimit-Reset"] = str(info["reset"])
    
    return response


def rate_limit(max_requests: int = 60, window_seconds: int = 60, per: str = "ip"):
    """
    Decorador para aplicar rate limiting a endpoints específicos.
    
    Args:
        max_requests: Número máximo de requests permitidos
        window_seconds: Ventana de tiempo en segundos
        per: Tipo de límite ("ip" o "user")
        
    Ejemplo:
        @app.get("/api/expensive-operation")
        @rate_limit(max_requests=10, window_seconds=60, per="user")
        async def expensive_operation(request: Request, current_user = Depends(get_current_user)):
            # Solo 10 requests por minuto por usuario
            pass
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            limiter = get_rate_limiter()
            
            # Buscar el Request en los argumentos
            request = None
            user_id = None
            
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                elif hasattr(arg, 'id'):  # Probablemente un User
                    user_id = str(arg.id)
            
            if not request:
                for key, value in kwargs.items():
                    if isinstance(value, Request):
                        request = value
                    elif hasattr(value, 'id'):
                        user_id = str(value.id)
            
            if not request:
                # Si no hay request, no aplicar rate limit
                return await func(*args, **kwargs)
            
            # Generar key
            if per == "user" and user_id:
                client_key = f"user:{user_id}"
            else:
                client_key = limiter.get_client_key(request)
            
            # Verificar rate limit
            allowed, info = limiter.check_rate_limit(
                client_key,
                max_requests,
                window_seconds
            )
            
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit excedido",
                        "message": f"Límite: {max_requests} requests por {window_seconds} segundos",
                        "retry_after": info["reset_in_seconds"]
                    }
                )
            
            # Ejecutar función
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


class RateLimitConfig:
    """Configuraciones predefinidas de rate limiting"""
    
    # Rate limits generales
    GENERAL = (100, 60)  # 100 requests/minuto
    STRICT = (20, 60)    # 20 requests/minuto
    RELAXED = (200, 60)  # 200 requests/minuto
    
    # Rate limits específicos
    AUTH = (5, 300)           # 5 intentos de login cada 5 minutos
    SEARCH = (30, 60)         # 30 búsquedas por minuto
    CREATE_OFERTA = (10, 60)  # 10 ofertas por minuto
    UPLOAD = (5, 60)          # 5 uploads por minuto
    EMAIL = (3, 3600)         # 3 emails por hora
    WEBHOOK = (1000, 60)      # 1000 webhooks por minuto
    
    @staticmethod
    def get(config_name: str) -> tuple[int, int]:
        """Obtiene una configuración por nombre"""
        return getattr(RateLimitConfig, config_name.upper(), RateLimitConfig.GENERAL)


# Decoradores con configuraciones predefinidas

def rate_limit_auth(func: Callable) -> Callable:
    """Rate limit para endpoints de autenticación (5 intentos cada 5 minutos)"""
    return rate_limit(*RateLimitConfig.AUTH, per="ip")(func)


def rate_limit_search(func: Callable) -> Callable:
    """Rate limit para búsquedas (30 por minuto)"""
    return rate_limit(*RateLimitConfig.SEARCH, per="ip")(func)


def rate_limit_create(func: Callable) -> Callable:
    """Rate limit para creación de recursos (10 por minuto)"""
    return rate_limit(*RateLimitConfig.CREATE_OFERTA, per="user")(func)


def rate_limit_upload(func: Callable) -> Callable:
    """Rate limit para uploads (5 por minuto)"""
    return rate_limit(*RateLimitConfig.UPLOAD, per="user")(func)
