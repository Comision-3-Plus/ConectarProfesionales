"""
Sistema de logging estructurado con formato JSON.
Configuración centralizada para todos los servicios.
"""
import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from pythonjsonlogger import jsonlogger


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Formatter personalizado para logs en formato JSON"""
    
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]):
        """Agrega campos personalizados al log record"""
        super().add_fields(log_record, record, message_dict)
        
        # Timestamp en formato ISO
        log_record['timestamp'] = datetime.utcnow().isoformat() + 'Z'
        
        # Nivel del log
        log_record['level'] = record.levelname
        
        # Información del servicio
        log_record['service'] = getattr(record, 'service_name', 'unknown')
        
        # Información del request (si está disponible)
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
        
        if hasattr(record, 'user_id'):
            log_record['user_id'] = record.user_id
        
        if hasattr(record, 'correlation_id'):
            log_record['correlation_id'] = record.correlation_id
        
        # Información de excepción
        if record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)


def setup_logging(
    service_name: str = "service",
    level: str = "INFO",
    log_to_file: bool = False,
    log_file_path: str = "logs/app.log"
):
    """
    Configura el sistema de logging para un servicio.
    
    Args:
        service_name: Nombre del servicio
        level: Nivel de logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Si True, también guarda logs en archivo
        log_file_path: Ruta del archivo de logs
    """
    # Crear logger raíz
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))
    
    # Limpiar handlers existentes
    root_logger.handlers.clear()
    
    # Handler para consola con formato JSON
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    
    # Formato JSON
    json_formatter = CustomJsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s'
    )
    console_handler.setFormatter(json_formatter)
    
    # Agregar service_name a todos los logs
    old_factory = logging.getLogRecordFactory()
    
    def record_factory(*args, **kwargs):
        record = old_factory(*args, **kwargs)
        record.service_name = service_name
        return record
    
    logging.setLogRecordFactory(record_factory)
    
    # Agregar handler
    root_logger.addHandler(console_handler)
    
    # Handler para archivo (opcional)
    if log_to_file:
        import os
        os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
        
        file_handler = logging.FileHandler(log_file_path)
        file_handler.setLevel(getattr(logging, level.upper()))
        file_handler.setFormatter(json_formatter)
        root_logger.addHandler(file_handler)
    
    # Silenciar logs muy verbosos de librerías
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    logging.info(f"Logging configurado para servicio: {service_name}", extra={"service_name": service_name})


class StructuredLogger:
    """Logger con helpers para logging estructurado"""
    
    def __init__(self, name: str = __name__):
        self.logger = logging.getLogger(name)
    
    def _log(self, level: str, message: str, **kwargs):
        """Método interno para logging con campos extra"""
        getattr(self.logger, level)(message, extra=kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log de debug con campos extra"""
        self._log("debug", message, **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log de info con campos extra"""
        self._log("info", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log de warning con campos extra"""
        self._log("warning", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log de error con campos extra"""
        self._log("error", message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log de critical con campos extra"""
        self._log("critical", message, **kwargs)
    
    # Helpers específicos para eventos comunes
    
    def log_request(self, method: str, path: str, status_code: int, duration_ms: float, **kwargs):
        """Log de request HTTP"""
        self.info(
            f"{method} {path} {status_code}",
            method=method,
            path=path,
            status_code=status_code,
            duration_ms=duration_ms,
            **kwargs
        )
    
    def log_database_query(self, query: str, duration_ms: float, **kwargs):
        """Log de query a base de datos"""
        self.debug(
            "Database query executed",
            query=query,
            duration_ms=duration_ms,
            **kwargs
        )
    
    def log_external_api_call(self, service: str, endpoint: str, status_code: int, duration_ms: float, **kwargs):
        """Log de llamada a API externa"""
        self.info(
            f"External API call: {service}",
            external_service=service,
            endpoint=endpoint,
            status_code=status_code,
            duration_ms=duration_ms,
            **kwargs
        )
    
    def log_event(self, event_type: str, event_data: Dict[str, Any], **kwargs):
        """Log de evento del sistema"""
        self.info(
            f"Event: {event_type}",
            event_type=event_type,
            event_data=event_data,
            **kwargs
        )
    
    def log_error_with_context(self, error: Exception, context: Dict[str, Any], **kwargs):
        """Log de error con contexto adicional"""
        self.error(
            f"Error: {str(error)}",
            error_type=type(error).__name__,
            error_message=str(error),
            context=context,
            **kwargs,
            exc_info=True
        )
    
    def log_user_action(self, user_id: str, action: str, resource: str, **kwargs):
        """Log de acción de usuario"""
        self.info(
            f"User action: {action}",
            user_id=user_id,
            action=action,
            resource=resource,
            **kwargs
        )
    
    def log_security_event(self, event_type: str, severity: str, details: Dict[str, Any], **kwargs):
        """Log de evento de seguridad"""
        self.warning(
            f"Security event: {event_type}",
            security_event_type=event_type,
            severity=severity,
            details=details,
            **kwargs
        )


# Middleware de logging para FastAPI

import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from uuid import uuid4


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logging de requests HTTP"""
    
    def __init__(self, app, service_name: str = "service"):
        super().__init__(app)
        self.service_name = service_name
        self.logger = StructuredLogger(__name__)
    
    async def dispatch(self, request: Request, call_next):
        # Generar request ID único
        request_id = str(uuid4())
        request.state.request_id = request_id
        
        # Capturar tiempo de inicio
        start_time = time.time()
        
        # Procesar request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log de error
            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_error_with_context(
                e,
                {
                    "method": request.method,
                    "path": request.url.path,
                    "request_id": request_id
                }
            )
            raise
        
        # Calcular duración
        duration_ms = (time.time() - start_time) * 1000
        
        # Log del request
        user_id = getattr(request.state, 'user_id', None)
        
        self.logger.log_request(
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            request_id=request_id,
            user_id=user_id
        )
        
        # Agregar headers de tracing
        response.headers["X-Request-ID"] = request_id
        
        return response


# Helper para obtener logger
def get_logger(name: str = __name__) -> StructuredLogger:
    """
    Obtiene un logger estructurado.
    
    Args:
        name: Nombre del logger (generalmente __name__)
        
    Returns:
        Instancia de StructuredLogger
    """
    return StructuredLogger(name)
