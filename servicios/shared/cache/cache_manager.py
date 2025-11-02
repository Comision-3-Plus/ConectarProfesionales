"""
Sistema de caché distribuido usando Redis.
Incluye decoradores, invalidación automática y TTL configurable.
"""
import json
import redis
import functools
import hashlib
import logging
from typing import Any, Optional, Callable
from datetime import timedelta

logger = logging.getLogger(__name__)


class CacheManager:
    """Gestor de caché distribuido con Redis"""
    
    def __init__(self, redis_url: str = "redis://redis:6379", prefix: str = "cache"):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.prefix = prefix
    
    def _make_key(self, key: str) -> str:
        """Crea una key con prefijo"""
        return f"{self.prefix}:{key}"
    
    def get(self, key: str) -> Optional[Any]:
        """
        Obtiene un valor del caché.
        
        Args:
            key: Clave del valor
            
        Returns:
            El valor cacheado o None si no existe
        """
        try:
            cache_key = self._make_key(key)
            value = self.redis_client.get(cache_key)
            
            if value is not None:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)
            
            logger.debug(f"Cache MISS: {key}")
            return None
            
        except Exception as e:
            logger.error(f"Error obteniendo del cache: {str(e)}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """
        Guarda un valor en el caché.
        
        Args:
            key: Clave del valor
            value: Valor a cachear
            ttl: Tiempo de vida en segundos (None = sin expiración)
        """
        try:
            cache_key = self._make_key(key)
            serialized_value = json.dumps(value, default=str)
            
            if ttl:
                self.redis_client.setex(cache_key, ttl, serialized_value)
            else:
                self.redis_client.set(cache_key, serialized_value)
            
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            
        except Exception as e:
            logger.error(f"Error guardando en cache: {str(e)}")
    
    def delete(self, key: str):
        """Elimina un valor del caché"""
        try:
            cache_key = self._make_key(key)
            self.redis_client.delete(cache_key)
            logger.debug(f"Cache DELETE: {key}")
        except Exception as e:
            logger.error(f"Error eliminando del cache: {str(e)}")
    
    def delete_pattern(self, pattern: str):
        """
        Elimina todas las keys que coincidan con un patrón.
        
        Args:
            pattern: Patrón (ej: "user:*", "professional:123:*")
        """
        try:
            cache_pattern = self._make_key(pattern)
            keys = self.redis_client.keys(cache_pattern)
            
            if keys:
                self.redis_client.delete(*keys)
                logger.debug(f"Cache DELETE pattern: {pattern} ({len(keys)} keys)")
                
        except Exception as e:
            logger.error(f"Error eliminando patrón del cache: {str(e)}")
    
    def clear_all(self):
        """Limpia todo el caché con el prefijo actual"""
        try:
            pattern = self._make_key("*")
            keys = self.redis_client.keys(pattern)
            
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Cache limpiado: {len(keys)} keys eliminadas")
                
        except Exception as e:
            logger.error(f"Error limpiando cache: {str(e)}")
    
    def exists(self, key: str) -> bool:
        """Verifica si una key existe en el caché"""
        try:
            cache_key = self._make_key(key)
            return bool(self.redis_client.exists(cache_key))
        except Exception as e:
            logger.error(f"Error verificando existencia en cache: {str(e)}")
            return False
    
    def get_ttl(self, key: str) -> Optional[int]:
        """Obtiene el tiempo de vida restante de una key en segundos"""
        try:
            cache_key = self._make_key(key)
            ttl = self.redis_client.ttl(cache_key)
            return ttl if ttl > 0 else None
        except Exception as e:
            logger.error(f"Error obteniendo TTL: {str(e)}")
            return None


# Instancia global del cache manager
_cache_manager: Optional[CacheManager] = None


def get_cache_manager(redis_url: str = "redis://redis:6379") -> CacheManager:
    """
    Obtiene la instancia global del cache manager.
    
    Args:
        redis_url: URL de conexión a Redis
        
    Returns:
        Instancia del CacheManager
    """
    global _cache_manager
    
    if _cache_manager is None:
        _cache_manager = CacheManager(redis_url)
    
    return _cache_manager


def _generate_cache_key(func_name: str, args: tuple, kwargs: dict) -> str:
    """Genera una key única basada en la función y sus argumentos"""
    # Crear un string con función, args y kwargs
    key_parts = [func_name]
    
    # Agregar args (excluyendo self/cls si es un método)
    for arg in args:
        if not hasattr(arg, '__dict__'):  # Skip self/cls
            key_parts.append(str(arg))
    
    # Agregar kwargs ordenados
    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}={v}")
    
    # Crear hash MD5 del string completo
    key_string = ":".join(key_parts)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    
    return f"func:{func_name}:{key_hash}"


def cached(ttl: int = 300, key_prefix: Optional[str] = None):
    """
    Decorador para cachear el resultado de una función.
    
    Args:
        ttl: Tiempo de vida en segundos (default: 5 minutos)
        key_prefix: Prefijo personalizado para la key de caché
        
    Ejemplo:
        @cached(ttl=600)
        def get_professional_profile(professional_id: int):
            # Esta función se cacheará por 10 minutos
            return db.query(Professional).filter(...).first()
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache_manager()
            
            # Generar key de caché
            func_name = key_prefix or func.__name__
            cache_key = _generate_cache_key(func_name, args, kwargs)
            
            # Intentar obtener del caché
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Si no está en caché, ejecutar la función
            result = func(*args, **kwargs)
            
            # Guardar en caché
            cache.set(cache_key, result, ttl=ttl)
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache(pattern: str):
    """
    Helper para invalidar caché por patrón.
    
    Args:
        pattern: Patrón de keys a invalidar (ej: "professional:123:*")
        
    Ejemplo:
        # Invalidar todo el caché de un profesional
        invalidate_cache("professional:123:*")
    """
    cache = get_cache_manager()
    cache.delete_pattern(pattern)


# Helpers específicos para invalidación

def invalidate_professional_cache(professional_id: str):
    """Invalida todo el caché relacionado a un profesional"""
    invalidate_cache(f"professional:{professional_id}:*")
    invalidate_cache(f"func:get_professional_*:{professional_id}*")


def invalidate_user_cache(user_id: str):
    """Invalida todo el caché relacionado a un usuario"""
    invalidate_cache(f"user:{user_id}:*")
    invalidate_cache(f"func:get_user_*:{user_id}*")


def invalidate_search_cache():
    """Invalida el caché de búsquedas"""
    invalidate_cache("func:search_professionals:*")
    invalidate_cache("search:*")


def invalidate_stats_cache(user_id: str):
    """Invalida el caché de estadísticas de un usuario"""
    invalidate_cache(f"stats:{user_id}:*")
    invalidate_cache(f"func:get_*_stats:{user_id}*")


# Cache para entidades específicas

class ProfessionalCache:
    """Caché especializado para profesionales"""
    
    @staticmethod
    def get_profile(professional_id: str) -> Optional[dict]:
        """Obtiene el perfil de un profesional del caché"""
        cache = get_cache_manager()
        return cache.get(f"professional:{professional_id}:profile")
    
    @staticmethod
    def set_profile(professional_id: str, profile: dict, ttl: int = 600):
        """Guarda el perfil de un profesional en caché"""
        cache = get_cache_manager()
        cache.set(f"professional:{professional_id}:profile", profile, ttl=ttl)
    
    @staticmethod
    def get_stats(professional_id: str) -> Optional[dict]:
        """Obtiene las estadísticas de un profesional del caché"""
        cache = get_cache_manager()
        return cache.get(f"professional:{professional_id}:stats")
    
    @staticmethod
    def set_stats(professional_id: str, stats: dict, ttl: int = 300):
        """Guarda las estadísticas de un profesional en caché"""
        cache = get_cache_manager()
        cache.set(f"professional:{professional_id}:stats", stats, ttl=ttl)
    
    @staticmethod
    def invalidate(professional_id: str):
        """Invalida todo el caché de un profesional"""
        invalidate_professional_cache(professional_id)


class SearchCache:
    """Caché especializado para búsquedas"""
    
    @staticmethod
    def get_search_results(search_params: dict) -> Optional[list]:
        """Obtiene resultados de búsqueda del caché"""
        cache = get_cache_manager()
        # Crear key basada en los parámetros de búsqueda
        params_str = json.dumps(search_params, sort_keys=True)
        key_hash = hashlib.md5(params_str.encode()).hexdigest()
        return cache.get(f"search:results:{key_hash}")
    
    @staticmethod
    def set_search_results(search_params: dict, results: list, ttl: int = 180):
        """Guarda resultados de búsqueda en caché"""
        cache = get_cache_manager()
        params_str = json.dumps(search_params, sort_keys=True)
        key_hash = hashlib.md5(params_str.encode()).hexdigest()
        cache.set(f"search:results:{key_hash}", results, ttl=ttl)
    
    @staticmethod
    def invalidate_all():
        """Invalida todo el caché de búsquedas"""
        invalidate_search_cache()
