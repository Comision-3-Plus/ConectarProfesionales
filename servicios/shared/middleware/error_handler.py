"""
Middleware global de manejo de errores.
Centraliza el manejo de excepciones en todos los servicios.
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging
import traceback
from typing import Union

logger = logging.getLogger(__name__)


class APIException(Exception):
    """Excepción base personalizada para la API"""
    def __init__(self, status_code: int, detail: str, error_code: str = None):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or "API_ERROR"


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler para HTTPException de FastAPI"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail,
            "error_code": "HTTP_ERROR",
            "path": str(request.url)
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler para errores de validación de Pydantic"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "status_code": 422,
            "message": "Error de validación",
            "error_code": "VALIDATION_ERROR",
            "errors": errors,
            "path": str(request.url)
        }
    )


async def database_exception_handler(request: Request, exc: Union[IntegrityError, SQLAlchemyError]):
    """Handler para errores de base de datos"""
    logger.error(f"Database error: {str(exc)}")
    logger.error(traceback.format_exc())
    
    # IntegrityError (violación de constraints)
    if isinstance(exc, IntegrityError):
        error_msg = str(exc.orig) if hasattr(exc, 'orig') else str(exc)
        
        if "duplicate key" in error_msg.lower():
            message = "El registro ya existe en la base de datos"
            error_code = "DUPLICATE_ENTRY"
        elif "foreign key" in error_msg.lower():
            message = "Referencia inválida a otro registro"
            error_code = "FOREIGN_KEY_VIOLATION"
        elif "not null" in error_msg.lower():
            message = "Falta un campo requerido"
            error_code = "NULL_CONSTRAINT_VIOLATION"
        else:
            message = "Error de integridad en la base de datos"
            error_code = "INTEGRITY_ERROR"
        
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": True,
                "status_code": 409,
                "message": message,
                "error_code": error_code,
                "path": str(request.url)
            }
        )
    
    # Otros errores de SQLAlchemy
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": 500,
            "message": "Error en la base de datos",
            "error_code": "DATABASE_ERROR",
            "path": str(request.url)
        }
    )


async def custom_exception_handler(request: Request, exc: APIException):
    """Handler para excepciones personalizadas"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail,
            "error_code": exc.error_code,
            "path": str(request.url)
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handler genérico para excepciones no capturadas"""
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": 500,
            "message": "Error interno del servidor",
            "error_code": "INTERNAL_SERVER_ERROR",
            "path": str(request.url),
            "detail": str(exc) if logger.level == logging.DEBUG else None
        }
    )


def add_exception_handlers(app):
    """
    Agrega todos los exception handlers a una aplicación FastAPI.
    
    Uso:
        from shared.middleware.error_handler import add_exception_handlers
        
        app = FastAPI()
        add_exception_handlers(app)
    """
    from fastapi.exceptions import RequestValidationError
    from sqlalchemy.exc import IntegrityError, SQLAlchemyError
    
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, database_exception_handler)
    app.add_exception_handler(SQLAlchemyError, database_exception_handler)
    app.add_exception_handler(APIException, custom_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
    
    logger.info("Exception handlers registrados correctamente")
