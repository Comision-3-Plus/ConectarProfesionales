"""
Circuit Breaker pattern para resiliencia en llamadas entre microservicios.
Previene cascadas de fallos y permite recuperación automática.
"""
from enum import Enum
from datetime import datetime, timedelta
from typing import Callable, Any, Optional
import asyncio
import logging
from functools import wraps

logger = logging.getLogger(__name__)

# ============================================================================
# ESTADOS DEL CIRCUIT BREAKER
# ============================================================================

class CircuitState(Enum):
    """Estados posibles del circuit breaker"""
    CLOSED = "closed"          # Funcionando normalmente
    OPEN = "open"              # Circuito abierto, rechazando requests
    HALF_OPEN = "half_open"    # Probando recuperación


class CircuitBreakerError(Exception):
    """Excepción lanzada cuando el circuit breaker está abierto"""
    pass


# ============================================================================
# CIRCUIT BREAKER
# ============================================================================

class CircuitBreaker:
    """
    Circuit Breaker para proteger llamadas a servicios externos.
    
    Funcionamiento:
    - CLOSED: Funciona normal, cuenta fallos
    - OPEN: Rechaza requests inmediatamente cuando se alcanza threshold
    - HALF_OPEN: Después del timeout, prueba 1 request para ver si se recuperó
    
    Args:
        failure_threshold: Número de fallos antes de abrir circuito
        timeout_seconds: Tiempo en segundos antes de intentar recovery
        expected_exception: Tipo de excepción que cuenta como fallo
        success_threshold: Requests exitosos en HALF_OPEN para cerrar circuito
    """
    
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout_seconds: int = 60,
        expected_exception: type = Exception,
        success_threshold: int = 2
    ):
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds
        self.expected_exception = expected_exception
        self.success_threshold = success_threshold
        
        # Estado interno
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.last_success_time: Optional[datetime] = None
        
        logger.info(f"CircuitBreaker inicializado: threshold={failure_threshold}, timeout={timeout_seconds}s")
    
    def _should_attempt_reset(self) -> bool:
        """Verifica si debe intentar resetear el circuito"""
        if self.state == CircuitState.OPEN and self.last_failure_time:
            return datetime.now() - self.last_failure_time > timedelta(seconds=self.timeout_seconds)
        return False
    
    def _record_success(self):
        """Registra un éxito"""
        self.failure_count = 0
        self.success_count += 1
        self.last_success_time = datetime.now()
        
        if self.state == CircuitState.HALF_OPEN:
            if self.success_count >= self.success_threshold:
                logger.info("✅ Circuit breaker CLOSED - Servicio recuperado")
                self.state = CircuitState.CLOSED
                self.success_count = 0
    
    def _record_failure(self):
        """Registra un fallo"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.state == CircuitState.HALF_OPEN:
            logger.warning("⚠️ Circuit breaker OPEN - Fallo en recovery")
            self.state = CircuitState.OPEN
            self.success_count = 0
        
        elif self.failure_count >= self.failure_threshold:
            logger.error(f"❌ Circuit breaker OPEN - {self.failure_count} fallos consecutivos")
            self.state = CircuitState.OPEN
    
    async def call_async(self, func: Callable, *args, **kwargs) -> Any:
        """
        Ejecuta función asíncrona con circuit breaker.
        
        Args:
            func: Función asíncrona a ejecutar
            *args: Argumentos posicionales
            **kwargs: Argumentos con nombre
            
        Returns:
            Resultado de la función
            
        Raises:
            CircuitBreakerError: Si el circuito está abierto
            expected_exception: Si la función falla
        """
        # Verificar si debe intentar reset
        if self._should_attempt_reset():
            logger.info("🔄 Circuit breaker HALF_OPEN - Intentando recovery")
            self.state = CircuitState.HALF_OPEN
            self.success_count = 0
        
        # Si está abierto, rechazar inmediatamente
        if self.state == CircuitState.OPEN:
            raise CircuitBreakerError(
                f"Circuit breaker está OPEN. Última falla: {self.last_failure_time}"
            )
        
        # Ejecutar función
        try:
            result = await func(*args, **kwargs)
            self._record_success()
            return result
            
        except self.expected_exception as e:
            self._record_failure()
            logger.error(f"Error en circuit breaker: {str(e)}")
            raise
    
    def call_sync(self, func: Callable, *args, **kwargs) -> Any:
        """
        Ejecuta función síncrona con circuit breaker.
        
        Args:
            func: Función síncrona a ejecutar
            *args: Argumentos posicionales
            **kwargs: Argumentos con nombre
            
        Returns:
            Resultado de la función
            
        Raises:
            CircuitBreakerError: Si el circuito está abierto
            expected_exception: Si la función falla
        """
        # Verificar reset
        if self._should_attempt_reset():
            logger.info("🔄 Circuit breaker HALF_OPEN - Intentando recovery")
            self.state = CircuitState.HALF_OPEN
            self.success_count = 0
        
        # Si está abierto, rechazar
        if self.state == CircuitState.OPEN:
            raise CircuitBreakerError(
                f"Circuit breaker está OPEN. Última falla: {self.last_failure_time}"
            )
        
        # Ejecutar función
        try:
            result = func(*args, **kwargs)
            self._record_success()
            return result
            
        except self.expected_exception as e:
            self._record_failure()
            logger.error(f"Error en circuit breaker: {str(e)}")
            raise
    
    def get_status(self) -> dict:
        """Obtiene el estado actual del circuit breaker"""
        return {
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": self.last_failure_time.isoformat() if self.last_failure_time else None,
            "last_success_time": self.last_success_time.isoformat() if self.last_success_time else None,
            "threshold": self.failure_threshold,
            "timeout_seconds": self.timeout_seconds
        }


# ============================================================================
# DECORADOR DE CIRCUIT BREAKER
# ============================================================================

def circuit_breaker(
    failure_threshold: int = 5,
    timeout_seconds: int = 60,
    expected_exception: type = Exception
):
    """
    Decorador para aplicar circuit breaker a funciones.
    
    Args:
        failure_threshold: Número de fallos antes de abrir circuito
        timeout_seconds: Tiempo antes de intentar recovery
        expected_exception: Tipo de excepción que cuenta como fallo
        
    Usage:
        @circuit_breaker(failure_threshold=3, timeout_seconds=30)
        async def call_payment_service(payment_id: str):
            # ... lógica ...
            pass
    """
    breaker = CircuitBreaker(
        failure_threshold=failure_threshold,
        timeout_seconds=timeout_seconds,
        expected_exception=expected_exception
    )
    
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            return await breaker.call_async(func, *args, **kwargs)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            return breaker.call_sync(func, *args, **kwargs)
        
        # Detectar si es async o sync
        if asyncio.iscoroutinefunction(func):
            wrapper = async_wrapper
        else:
            wrapper = sync_wrapper
        
        # Agregar método para obtener estado
        wrapper.get_breaker_status = breaker.get_status
        
        return wrapper
    
    return decorator


# ============================================================================
# CIRCUIT BREAKER MANAGER
# ============================================================================

class CircuitBreakerManager:
    """
    Manager para múltiples circuit breakers.
    Útil para manejar circuit breakers por servicio.
    """
    
    def __init__(self):
        self.breakers: dict[str, CircuitBreaker] = {}
    
    def get_breaker(
        self,
        service_name: str,
        failure_threshold: int = 5,
        timeout_seconds: int = 60
    ) -> CircuitBreaker:
        """
        Obtiene o crea un circuit breaker para un servicio.
        
        Args:
            service_name: Nombre del servicio
            failure_threshold: Threshold de fallos
            timeout_seconds: Timeout para recovery
            
        Returns:
            CircuitBreaker instance
        """
        if service_name not in self.breakers:
            self.breakers[service_name] = CircuitBreaker(
                failure_threshold=failure_threshold,
                timeout_seconds=timeout_seconds
            )
            logger.info(f"Circuit breaker creado para servicio: {service_name}")
        
        return self.breakers[service_name]
    
    async def call_service_async(
        self,
        service_name: str,
        func: Callable,
        *args,
        **kwargs
    ) -> Any:
        """
        Llama a un servicio con circuit breaker.
        
        Args:
            service_name: Nombre del servicio
            func: Función a ejecutar
            *args: Argumentos posicionales
            **kwargs: Argumentos con nombre
            
        Returns:
            Resultado de la función
        """
        breaker = self.get_breaker(service_name)
        return await breaker.call_async(func, *args, **kwargs)
    
    def get_all_status(self) -> dict:
        """Obtiene el estado de todos los circuit breakers"""
        return {
            service_name: breaker.get_status()
            for service_name, breaker in self.breakers.items()
        }


# Instancia global del manager
circuit_breaker_manager = CircuitBreakerManager()


# ============================================================================
# HELPERS PARA CASOS COMUNES
# ============================================================================

class ServiceCircuitBreakers:
    """Circuit breakers predefinidos para servicios comunes"""
    
    # Circuit breaker para servicio de pagos (más estricto)
    PAYMENT_SERVICE = CircuitBreaker(
        failure_threshold=3,
        timeout_seconds=30,
        expected_exception=Exception
    )
    
    # Circuit breaker para servicio de notificaciones (más tolerante)
    NOTIFICATION_SERVICE = CircuitBreaker(
        failure_threshold=10,
        timeout_seconds=60,
        expected_exception=Exception
    )
    
    # Circuit breaker para APIs externas (MercadoPago, etc.)
    EXTERNAL_API = CircuitBreaker(
        failure_threshold=5,
        timeout_seconds=120,
        expected_exception=Exception
    )
    
    # Circuit breaker para base de datos
    DATABASE = CircuitBreaker(
        failure_threshold=3,
        timeout_seconds=10,
        expected_exception=Exception
    )


# Función helper para llamadas HTTP con circuit breaker

async def http_call_with_breaker(
    service_name: str,
    url: str,
    method: str = "GET",
    **kwargs
) -> Any:
    """
    Realiza llamada HTTP con circuit breaker.
    
    Args:
        service_name: Nombre del servicio
        url: URL a llamar
        method: Método HTTP
        **kwargs: Argumentos para httpx
        
    Returns:
        Response de httpx
        
    Usage:
        response = await http_call_with_breaker(
            "servicio_pagos",
            "http://servicio_pagos:8005/payments/status",
            method="POST",
            json={"payment_id": "123"}
        )
    """
    import httpx
    
    breaker = circuit_breaker_manager.get_breaker(service_name)
    
    async def make_request():
        async with httpx.AsyncClient() as client:
            return await client.request(method, url, **kwargs)
    
    return await breaker.call_async(make_request)
