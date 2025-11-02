"""
Sistema de métricas con Prometheus para monitoreo de microservicios.
Incluye métricas de sistema, negocio y middleware automático.
"""
from prometheus_client import (
    Counter, Histogram, Gauge, Summary,
    CollectorRegistry, generate_latest, CONTENT_TYPE_LATEST
)
from fastapi import Request, Response
from fastapi.responses import PlainTextResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time
import logging

logger = logging.getLogger(__name__)

# Registry de Prometheus
REGISTRY = CollectorRegistry()

# ============================================================================
# MÉTRICAS DE SISTEMA
# ============================================================================

# Requests HTTP
http_requests_total = Counter(
    "http_requests_total",
    "Total de requests HTTP",
    ["method", "endpoint", "status_code"],
    registry=REGISTRY
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "Duración de requests HTTP en segundos",
    ["method", "endpoint"],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0),
    registry=REGISTRY
)

http_request_size_bytes = Summary(
    "http_request_size_bytes",
    "Tamaño de requests HTTP en bytes",
    ["method", "endpoint"],
    registry=REGISTRY
)

http_response_size_bytes = Summary(
    "http_response_size_bytes",
    "Tamaño de responses HTTP en bytes",
    ["method", "endpoint"],
    registry=REGISTRY
)

# Errores
http_errors_total = Counter(
    "http_errors_total",
    "Total de errores HTTP",
    ["method", "endpoint", "error_type"],
    registry=REGISTRY
)

exceptions_total = Counter(
    "exceptions_total",
    "Total de excepciones",
    ["exception_type", "service"],
    registry=REGISTRY
)

# Database
database_queries_total = Counter(
    "database_queries_total",
    "Total de queries a la base de datos",
    ["query_type", "table"],
    registry=REGISTRY
)

database_query_duration_seconds = Histogram(
    "database_query_duration_seconds",
    "Duración de queries a la base de datos",
    ["query_type"],
    buckets=(0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0),
    registry=REGISTRY
)

database_connections_active = Gauge(
    "database_connections_active",
    "Conexiones activas a la base de datos",
    registry=REGISTRY
)

# Cache
cache_hits_total = Counter(
    "cache_hits_total",
    "Total de cache hits",
    ["cache_key_pattern"],
    registry=REGISTRY
)

cache_misses_total = Counter(
    "cache_misses_total",
    "Total de cache misses",
    ["cache_key_pattern"],
    registry=REGISTRY
)

cache_operations_duration_seconds = Histogram(
    "cache_operations_duration_seconds",
    "Duración de operaciones de cache",
    ["operation"],
    buckets=(0.001, 0.005, 0.01, 0.05, 0.1),
    registry=REGISTRY
)

# WebSocket
websocket_connections_active = Gauge(
    "websocket_connections_active",
    "Conexiones WebSocket activas",
    registry=REGISTRY
)

websocket_messages_total = Counter(
    "websocket_messages_total",
    "Total de mensajes WebSocket",
    ["message_type", "direction"],  # direction: inbound/outbound
    registry=REGISTRY
)

# Celery Tasks
celery_tasks_total = Counter(
    "celery_tasks_total",
    "Total de tareas de Celery",
    ["task_name", "status"],  # status: success/failure/retry
    registry=REGISTRY
)

celery_task_duration_seconds = Histogram(
    "celery_task_duration_seconds",
    "Duración de tareas de Celery",
    ["task_name"],
    buckets=(0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0, 300.0),
    registry=REGISTRY
)

# ============================================================================
# MÉTRICAS DE NEGOCIO
# ============================================================================

# Trabajos
trabajos_created_total = Counter(
    "trabajos_created_total",
    "Total de trabajos creados",
    ["oficio"],
    registry=REGISTRY
)

trabajos_completed_total = Counter(
    "trabajos_completed_total",
    "Total de trabajos completados",
    ["oficio"],
    registry=REGISTRY
)

trabajos_cancelled_total = Counter(
    "trabajos_cancelled_total",
    "Total de trabajos cancelados",
    ["oficio", "reason"],
    registry=REGISTRY
)

trabajos_active = Gauge(
    "trabajos_active",
    "Trabajos activos actualmente",
    registry=REGISTRY
)

# Pagos
pagos_processed_total = Counter(
    "pagos_processed_total",
    "Total de pagos procesados",
    ["payment_method", "status"],
    registry=REGISTRY
)

pagos_amount_total = Counter(
    "pagos_amount_total",
    "Monto total de pagos",
    ["currency"],
    registry=REGISTRY
)

pagos_failed_total = Counter(
    "pagos_failed_total",
    "Total de pagos fallidos",
    ["payment_method", "error_type"],
    registry=REGISTRY
)

# Usuarios
users_registered_total = Counter(
    "users_registered_total",
    "Total de usuarios registrados",
    ["user_type"],  # user_type: cliente/profesional
    registry=REGISTRY
)

users_active = Gauge(
    "users_active",
    "Usuarios activos",
    ["user_type"],
    registry=REGISTRY
)

users_login_total = Counter(
    "users_login_total",
    "Total de logins de usuarios",
    ["user_type"],
    registry=REGISTRY
)

# Profesionales
professionals_verified_total = Counter(
    "professionals_verified_total",
    "Total de profesionales verificados (KYC)",
    registry=REGISTRY
)

professionals_rating_average = Gauge(
    "professionals_rating_average",
    "Rating promedio de profesionales",
    ["oficio"],
    registry=REGISTRY
)

# Ofertas
ofertas_created_total = Counter(
    "ofertas_created_total",
    "Total de ofertas creadas",
    registry=REGISTRY
)

ofertas_accepted_total = Counter(
    "ofertas_accepted_total",
    "Total de ofertas aceptadas",
    registry=REGISTRY
)

# Reseñas
resenas_created_total = Counter(
    "resenas_created_total",
    "Total de reseñas creadas",
    ["rating"],
    registry=REGISTRY
)

# Chat
chat_messages_total = Counter(
    "chat_messages_total",
    "Total de mensajes de chat",
    registry=REGISTRY
)

# ============================================================================
# CLASE PARA MÉTRICAS
# ============================================================================

class MetricsCollector:
    """Clase helper para registrar métricas"""
    
    @staticmethod
    def record_request(method: str, endpoint: str, status_code: int, duration: float):
        """Registra una request HTTP"""
        http_requests_total.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()
        
        http_request_duration_seconds.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
    
    @staticmethod
    def record_error(method: str, endpoint: str, error_type: str):
        """Registra un error HTTP"""
        http_errors_total.labels(
            method=method,
            endpoint=endpoint,
            error_type=error_type
        ).inc()
    
    @staticmethod
    def record_exception(exception_type: str, service: str):
        """Registra una excepción"""
        exceptions_total.labels(
            exception_type=exception_type,
            service=service
        ).inc()
    
    @staticmethod
    def record_database_query(query_type: str, table: str, duration: float):
        """Registra una query a la base de datos"""
        database_queries_total.labels(
            query_type=query_type,
            table=table
        ).inc()
        
        database_query_duration_seconds.labels(
            query_type=query_type
        ).observe(duration)
    
    @staticmethod
    def record_cache_hit(cache_key_pattern: str):
        """Registra un cache hit"""
        cache_hits_total.labels(
            cache_key_pattern=cache_key_pattern
        ).inc()
    
    @staticmethod
    def record_cache_miss(cache_key_pattern: str):
        """Registra un cache miss"""
        cache_misses_total.labels(
            cache_key_pattern=cache_key_pattern
        ).inc()
    
    @staticmethod
    def record_cache_operation(operation: str, duration: float):
        """Registra operación de cache"""
        cache_operations_duration_seconds.labels(
            operation=operation
        ).observe(duration)
    
    @staticmethod
    def record_websocket_connection(delta: int):
        """Incrementa/decrementa conexiones WebSocket activas"""
        websocket_connections_active.inc(delta)
    
    @staticmethod
    def record_websocket_message(message_type: str, direction: str):
        """Registra mensaje WebSocket"""
        websocket_messages_total.labels(
            message_type=message_type,
            direction=direction
        ).inc()
    
    @staticmethod
    def record_celery_task(task_name: str, status: str, duration: float = None):
        """Registra tarea de Celery"""
        celery_tasks_total.labels(
            task_name=task_name,
            status=status
        ).inc()
        
        if duration is not None:
            celery_task_duration_seconds.labels(
                task_name=task_name
            ).observe(duration)
    
    # Métricas de negocio
    
    @staticmethod
    def record_trabajo_created(oficio: str):
        """Registra trabajo creado"""
        trabajos_created_total.labels(oficio=oficio).inc()
        trabajos_active.inc()
    
    @staticmethod
    def record_trabajo_completed(oficio: str):
        """Registra trabajo completado"""
        trabajos_completed_total.labels(oficio=oficio).inc()
        trabajos_active.dec()
    
    @staticmethod
    def record_trabajo_cancelled(oficio: str, reason: str):
        """Registra trabajo cancelado"""
        trabajos_cancelled_total.labels(oficio=oficio, reason=reason).inc()
        trabajos_active.dec()
    
    @staticmethod
    def record_pago_processed(payment_method: str, status: str, amount: float, currency: str = "ARS"):
        """Registra pago procesado"""
        pagos_processed_total.labels(
            payment_method=payment_method,
            status=status
        ).inc()
        
        if status == "success":
            pagos_amount_total.labels(currency=currency).inc(amount)
    
    @staticmethod
    def record_pago_failed(payment_method: str, error_type: str):
        """Registra pago fallido"""
        pagos_failed_total.labels(
            payment_method=payment_method,
            error_type=error_type
        ).inc()
    
    @staticmethod
    def record_user_registered(user_type: str):
        """Registra usuario registrado"""
        users_registered_total.labels(user_type=user_type).inc()
    
    @staticmethod
    def record_user_login(user_type: str):
        """Registra login de usuario"""
        users_login_total.labels(user_type=user_type).inc()
    
    @staticmethod
    def record_professional_verified():
        """Registra profesional verificado"""
        professionals_verified_total.inc()
    
    @staticmethod
    def record_oferta_created():
        """Registra oferta creada"""
        ofertas_created_total.inc()
    
    @staticmethod
    def record_oferta_accepted():
        """Registra oferta aceptada"""
        ofertas_accepted_total.inc()
    
    @staticmethod
    def record_resena_created(rating: int):
        """Registra reseña creada"""
        resenas_created_total.labels(rating=str(rating)).inc()
    
    @staticmethod
    def record_chat_message():
        """Registra mensaje de chat"""
        chat_messages_total.inc()


# ============================================================================
# MIDDLEWARE DE PROMETHEUS
# ============================================================================

class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware para registrar métricas de HTTP automáticamente"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # No registrar métricas para el endpoint de métricas
        if request.url.path == "/metrics":
            return await call_next(request)
        
        # Medir tiempo de request
        start_time = time.time()
        
        # Obtener tamaño de request
        request_size = int(request.headers.get("content-length", 0))
        
        try:
            response = await call_next(request)
            
            # Calcular duración
            duration = time.time() - start_time
            
            # Obtener tamaño de response
            response_size = int(response.headers.get("content-length", 0))
            
            # Registrar métricas
            MetricsCollector.record_request(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code,
                duration=duration
            )
            
            http_request_size_bytes.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(request_size)
            
            http_response_size_bytes.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(response_size)
            
            return response
            
        except Exception as e:
            # Registrar error
            MetricsCollector.record_error(
                method=request.method,
                endpoint=request.url.path,
                error_type=type(e).__name__
            )
            raise


# ============================================================================
# ENDPOINT DE MÉTRICAS
# ============================================================================

async def metrics_endpoint(request: Request):
    """
    Endpoint para exponer métricas en formato Prometheus.
    
    Usage:
        app.add_route("/metrics", metrics_endpoint)
    """
    return Response(
        content=generate_latest(REGISTRY),
        media_type=CONTENT_TYPE_LATEST
    )


# Helper para agregar middleware y endpoint a FastAPI

def setup_metrics(app):
    """
    Configura métricas de Prometheus en una app de FastAPI.
    
    Args:
        app: Instancia de FastAPI
        
    Usage:
        from shared.monitoring.metrics import setup_metrics
        
        app = FastAPI()
        setup_metrics(app)
    """
    # Agregar middleware
    app.add_middleware(PrometheusMiddleware)
    
    # Agregar endpoint de métricas
    app.add_route("/metrics", metrics_endpoint)
    
    logger.info("Métricas de Prometheus configuradas")
