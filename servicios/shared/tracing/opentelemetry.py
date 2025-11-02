"""
Sistema de tracing distribuido con OpenTelemetry y Jaeger.
Permite rastrear requests a través de todos los microservicios.
"""
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
import os
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURACIÓN DE JAEGER
# ============================================================================

JAEGER_AGENT_HOST = os.getenv("JAEGER_AGENT_HOST", "localhost")
JAEGER_AGENT_PORT = int(os.getenv("JAEGER_AGENT_PORT", "6831"))
TRACING_ENABLED = os.getenv("TRACING_ENABLED", "true").lower() == "true"


def setup_tracing(app, service_name: str, db_engine=None):
    """
    Configura tracing distribuido con OpenTelemetry y Jaeger.
    
    Args:
        app: Instancia de FastAPI
        service_name: Nombre del servicio (ej: "servicio_profesionales")
        db_engine: Engine de SQLAlchemy (opcional, para instrumentar DB)
        
    Usage:
        from shared.tracing.opentelemetry import setup_tracing
        
        app = FastAPI()
        engine = create_engine(DATABASE_URL)
        
        setup_tracing(app, "servicio_profesionales", engine)
    """
    if not TRACING_ENABLED:
        logger.info("Tracing deshabilitado")
        return
    
    try:
        # Configurar recurso con información del servicio
        resource = Resource(attributes={
            "service.name": service_name,
            "service.version": "1.0.0",
            "deployment.environment": os.getenv("ENVIRONMENT", "development")
        })
        
        # Configurar TracerProvider
        provider = TracerProvider(resource=resource)
        
        # Configurar exportador Jaeger
        jaeger_exporter = JaegerExporter(
            agent_host_name=JAEGER_AGENT_HOST,
            agent_port=JAEGER_AGENT_PORT,
        )
        
        # Agregar procesador de spans
        provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
        
        # En desarrollo, también loguear a consola
        if os.getenv("ENVIRONMENT") == "development":
            console_exporter = ConsoleSpanExporter()
            provider.add_span_processor(BatchSpanProcessor(console_exporter))
        
        # Establecer como provider global
        trace.set_tracer_provider(provider)
        
        # Instrumentar FastAPI automáticamente
        FastAPIInstrumentor.instrument_app(app)
        logger.info(f"✅ FastAPI instrumentado para tracing en {service_name}")
        
        # Instrumentar SQLAlchemy si se proporcionó engine
        if db_engine:
            SQLAlchemyInstrumentor().instrument(
                engine=db_engine,
                service=service_name
            )
            logger.info(f"✅ SQLAlchemy instrumentado para tracing en {service_name}")
        
        # Instrumentar requests HTTP
        RequestsInstrumentor().instrument()
        logger.info(f"✅ HTTP requests instrumentados para tracing en {service_name}")
        
        logger.info(f"🔍 Tracing configurado para {service_name} → Jaeger en {JAEGER_AGENT_HOST}:{JAEGER_AGENT_PORT}")
        
    except Exception as e:
        logger.error(f"❌ Error configurando tracing: {str(e)}")


def get_tracer(service_name: str):
    """
    Obtiene un tracer para crear spans manualmente.
    
    Args:
        service_name: Nombre del servicio
        
    Returns:
        Tracer instance
        
    Usage:
        from shared.tracing.opentelemetry import get_tracer
        
        tracer = get_tracer("servicio_profesionales")
        
        with tracer.start_as_current_span("process_payment") as span:
            span.set_attribute("payment_id", payment_id)
            span.set_attribute("amount", amount)
            # ... lógica de pago ...
    """
    return trace.get_tracer(service_name)


def add_span_attributes(attributes: dict):
    """
    Agrega atributos al span actual.
    
    Args:
        attributes: Dict con atributos a agregar
        
    Usage:
        add_span_attributes({
            "user_id": user.id,
            "professional_id": prof.id,
            "trabajo_id": trabajo.id
        })
    """
    span = trace.get_current_span()
    if span:
        for key, value in attributes.items():
            span.set_attribute(key, value)


def add_span_event(name: str, attributes: dict = None):
    """
    Agrega un evento al span actual.
    
    Args:
        name: Nombre del evento
        attributes: Atributos del evento (opcional)
        
    Usage:
        add_span_event("payment_processed", {
            "payment_id": payment.id,
            "status": "success"
        })
    """
    span = trace.get_current_span()
    if span:
        span.add_event(name, attributes=attributes or {})


def record_exception(exception: Exception):
    """
    Registra una excepción en el span actual.
    
    Args:
        exception: Excepción a registrar
        
    Usage:
        try:
            process_payment()
        except Exception as e:
            record_exception(e)
            raise
    """
    span = trace.get_current_span()
    if span:
        span.record_exception(exception)
        span.set_status(trace.Status(trace.StatusCode.ERROR))


# ============================================================================
# DECORADOR PARA TRACING MANUAL
# ============================================================================

def traced(span_name: str = None):
    """
    Decorador para agregar tracing a funciones.
    
    Args:
        span_name: Nombre del span (opcional, usa nombre de función por defecto)
        
    Usage:
        @traced("calculate_commission")
        async def calculate_commission(trabajo_id: int):
            # ... lógica ...
            pass
    """
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            tracer = trace.get_tracer(__name__)
            name = span_name or func.__name__
            
            with tracer.start_as_current_span(name) as span:
                # Agregar argumentos como atributos
                span.set_attribute("function", func.__name__)
                
                try:
                    result = await func(*args, **kwargs)
                    span.set_status(trace.Status(trace.StatusCode.OK))
                    return result
                except Exception as e:
                    record_exception(e)
                    raise
        
        def sync_wrapper(*args, **kwargs):
            tracer = trace.get_tracer(__name__)
            name = span_name or func.__name__
            
            with tracer.start_as_current_span(name) as span:
                span.set_attribute("function", func.__name__)
                
                try:
                    result = func(*args, **kwargs)
                    span.set_status(trace.Status(trace.StatusCode.OK))
                    return result
                except Exception as e:
                    record_exception(e)
                    raise
        
        # Detectar si es async o sync
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# ============================================================================
# CONTEXT PROPAGATION PARA LLAMADAS ENTRE SERVICIOS
# ============================================================================

def get_trace_context_headers():
    """
    Obtiene los headers necesarios para propagar el contexto de tracing.
    Usar al hacer requests HTTP a otros servicios.
    
    Returns:
        Dict con headers de propagación
        
    Usage:
        import httpx
        from shared.tracing.opentelemetry import get_trace_context_headers
        
        async with httpx.AsyncClient() as client:
            headers = get_trace_context_headers()
            response = await client.get(
                "http://servicio_pagos:8005/payments/status",
                headers=headers
            )
    """
    from opentelemetry.propagate import inject
    
    headers = {}
    inject(headers)
    return headers


# ============================================================================
# HELPERS PARA CASOS COMUNES
# ============================================================================

class TracingHelper:
    """Helper class con métodos comunes de tracing"""
    
    @staticmethod
    def trace_database_query(query_type: str, table: str):
        """Agrega información de query al span actual"""
        add_span_attributes({
            "db.operation": query_type,
            "db.table": table,
            "db.system": "postgresql"
        })
    
    @staticmethod
    def trace_external_api_call(service: str, endpoint: str, method: str):
        """Agrega información de llamada a API externa"""
        add_span_attributes({
            "http.method": method,
            "http.url": endpoint,
            "peer.service": service
        })
    
    @staticmethod
    def trace_business_event(event_type: str, entity_id: str = None):
        """Agrega evento de negocio"""
        attributes = {"event.type": event_type}
        if entity_id:
            attributes["event.entity_id"] = entity_id
        
        add_span_event("business_event", attributes)
    
    @staticmethod
    def trace_user_action(user_id: str, action: str):
        """Agrega acción de usuario"""
        add_span_attributes({
            "user.id": user_id,
            "user.action": action
        })


# Instancia global del helper
tracing_helper = TracingHelper()
