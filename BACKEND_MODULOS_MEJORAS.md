# 🔧 BACKEND - PLAN DE MEJORAS Y TAREAS
## Dividido en 3 Módulos Priorizados

**Desarrollador:** Backend Senior  
**Fecha:** 2 de Noviembre 2025  
**Estado Actual:** Arquitectura de microservicios funcional (70% completo)

---

## 📊 ANÁLISIS DEL ESTADO ACTUAL

### ✅ **Lo que YA funciona bien:**

1. **Arquitectura de microservicios** con API Gateway
2. **Autenticación JWT** completa
3. **Base de datos PostgreSQL + PostGIS** correctamente configurada
4. **Servicios compartidos** (shared/models, shared/services)
5. **Integración con Firebase** (Firestore para chat)
6. **Integración con MercadoPago** (pagos y webhooks)
7. **Sistema de gamificación** básico

### ⚠️ **Áreas que necesitan mejoras:**

1. **Endpoints faltantes** en varios servicios
2. **Validaciones inconsistentes** entre servicios
3. **Manejo de errores** no estandarizado
4. **Sin sistema de eventos** entre microservicios
5. **Sin rate limiting** en producción
6. **Sin logging centralizado**
7. **Sin tests unitarios** en microservicios individuales
8. **Modelos y schemas** con inconsistencias

---

# 🎯 MÓDULO 1: CORE & ESTABILIDAD (CRÍTICO)
**Prioridad:** 🔴 **ALTA**  
**Tiempo estimado:** 5-7 días  
**Objetivo:** Estabilizar el core, completar endpoints críticos y estandarizar

## 1.1 Completar Endpoints Faltantes en Servicios

### **Servicio de Profesionales (8003)**

#### ❌ Falta: Gestión completa de Portfolio
```python
# servicios/servicio_profesionales/app/main.py

# AGREGAR:
@app.put("/professional/portfolio/{item_id}")
async def update_portfolio_item(
    item_id: int,
    item_data: PortfolioUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza un item del portfolio"""
    # Implementar lógica
    pass

@app.post("/professional/portfolio/{item_id}/images")
async def upload_portfolio_images(
    item_id: int,
    files: List[UploadFile],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sube múltiples imágenes a un item de portfolio"""
    # Implementar con upload a S3 o filesystem
    pass

@app.delete("/professional/portfolio/{item_id}/images/{image_id}")
async def delete_portfolio_image(
    item_id: int,
    image_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina una imagen específica del portfolio"""
    pass
```

#### ❌ Falta: Endpoints de Trabajos para Profesionales
```python
@app.get("/professional/trabajos")
async def get_professional_trabajos(
    estado: Optional[TrabajoEstado] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista trabajos del profesional con filtros"""
    pass

@app.get("/professional/ofertas")
async def get_professional_ofertas(
    estado: Optional[OfertaEstado] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista ofertas recibidas del profesional"""
    pass

@app.post("/professional/ofertas")
async def create_oferta_as_professional(
    oferta_data: OfertaCreateByProfessional,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Profesional crea una oferta para un cliente"""
    pass
```

#### ❌ Falta: Estadísticas del Profesional
```python
@app.get("/professional/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene estadísticas del profesional"""
    # - Total trabajos completados
    # - Ingreso total
    # - Rating promedio
    # - Total reseñas
    # - Nivel actual y XP
    # - Próximo nivel
    pass
```

### **Servicio de Chat y Ofertas (8004)**

#### ❌ Falta: CRUD completo de Ofertas
```python
@app.put("/ofertas/{oferta_id}")
async def update_oferta(
    oferta_id: int,
    oferta_data: OfertaUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza una oferta (solo si está pendiente)"""
    pass

@app.post("/ofertas/{oferta_id}/reject")
async def reject_oferta(
    oferta_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Rechaza una oferta (cliente o profesional)"""
    pass
```

#### ❌ Falta: Gestión avanzada de Trabajos
```python
@app.put("/trabajos/{trabajo_id}/marcar-completado")
async def marcar_trabajo_completado(
    trabajo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Profesional marca el trabajo como completado"""
    # Esto debe notificar al cliente para que apruebe
    pass

@app.post("/trabajos/{trabajo_id}/disputar")
async def disputar_trabajo(
    trabajo_id: int,
    dispute_data: DisputeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea una disputa sobre un trabajo"""
    # Sistema de disputas para resolver conflictos
    pass

@app.get("/trabajos/{trabajo_id}/timeline")
async def get_trabajo_timeline(
    trabajo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene el historial de cambios de estado del trabajo"""
    pass
```

### **Servicio de Pagos (8005)**

#### ❌ Falta: Historial de Transacciones
```python
@app.get("/payments/history")
async def get_payment_history(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene historial de pagos"""
    # Cliente ve sus pagos
    # Profesional ve pagos recibidos
    # Admin ve todo
    pass

@app.get("/payments/{payment_id}/status")
async def get_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Consulta el estado de un pago en MercadoPago"""
    pass
```

#### ❌ Falta: Gestión de Comisiones Dinámicas
```python
@app.get("/payments/commission/calculate")
async def calculate_commission(
    monto: float,
    profesional_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calcula la comisión basada en el nivel del profesional"""
    # Integrar con servicio de gamificación
    pass
```

### **Servicio de Notificaciones (8006)**

#### ❌ Falta: Sistema de Preferencias
```python
@app.get("/notifications/preferences")
async def get_notification_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene las preferencias de notificación del usuario"""
    pass

@app.put("/notifications/preferences")
async def update_notification_preferences(
    prefs: NotificationPreferences,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza preferencias de notificación"""
    # Usuario puede desactivar emails, push, etc.
    pass
```

#### ❌ Falta: Historial de Notificaciones
```python
@app.get("/notifications/history")
async def get_notification_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene historial de notificaciones enviadas"""
    pass
```

---

## 1.2 Estandarizar Modelos y Schemas

### **Problema:** Inconsistencias entre modelos en shared/

#### Crear modelos faltantes:
```python
# shared/models/notification.py
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("usuarios.id"))
    tipo = Column(Enum(NotificationType))
    titulo = Column(String)
    mensaje = Column(Text)
    leido = Column(Boolean, default=False)
    data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# shared/models/dispute.py
class Dispute(Base):
    __tablename__ = "disputes"
    
    id = Column(Integer, primary_key=True)
    trabajo_id = Column(Integer, ForeignKey("trabajos.id"))
    iniciado_por = Column(UUID, ForeignKey("usuarios.id"))
    motivo = Column(Text)
    estado = Column(Enum(DisputeStatus))
    resolucion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

# shared/models/transaction.py
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    trabajo_id = Column(Integer, ForeignKey("trabajos.id"))
    tipo = Column(Enum(TransactionType))  # PAGO, ESCROW, LIBERACION, REEMBOLSO
    monto = Column(Numeric(10, 2))
    mercadopago_payment_id = Column(String, nullable=True)
    estado = Column(Enum(TransactionStatus))
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### Crear Schemas correspondientes:
```python
# shared/schemas/notification.py
# shared/schemas/dispute.py
# shared/schemas/transaction.py
```

---

## 1.3 Implementar Manejo de Errores Estandarizado

### Crear middleware de errores global:
```python
# shared/middleware/error_handler.py

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    """Manejador global de excepciones"""
    
    # Log del error
    logger.error(f"Error en {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    
    # Errores de validación de Pydantic
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "error": "Validation Error",
                "detail": exc.errors(),
                "body": exc.body
            }
        )
    
    # Errores HTTP explícitos
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code
            }
        )
    
    # Errores de base de datos
    if isinstance(exc, SQLAlchemyError):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Database Error",
                "detail": "Error al procesar la operación en la base de datos"
            }
        )
    
    # Error genérico
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "Ha ocurrido un error inesperado"
        }
    )

# Agregar a cada servicio:
from shared.middleware.error_handler import global_exception_handler

app.add_exception_handler(Exception, global_exception_handler)
```

---

## 1.4 Implementar Validaciones Robustas

### Crear validadores compartidos:
```python
# shared/validators/business_rules.py

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from shared.models.user import User
from shared.models.professional import Professional
from shared.models.trabajo import Trabajo
from shared.models.enums import TrabajoEstado, UserRole

def validate_user_is_active(user: User):
    """Valida que el usuario esté activo"""
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta ha sido suspendida. Contacta a soporte."
        )

def validate_professional_kyc_approved(professional: Professional):
    """Valida que el KYC del profesional esté aprobado"""
    if professional.kyc_status != KYCStatus.APROBADO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu KYC aún no ha sido aprobado"
        )

def validate_trabajo_can_be_completed(trabajo: Trabajo, user: User):
    """Valida que un trabajo puede ser marcado como completado"""
    
    # Solo el profesional puede marcar como completado
    if trabajo.profesional.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el profesional puede marcar el trabajo como completado"
        )
    
    # El trabajo debe estar en curso
    if trabajo.estado != TrabajoEstado.EN_CURSO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El trabajo debe estar en curso. Estado actual: {trabajo.estado}"
        )
    
    # El pago debe estar en escrow
    if trabajo.escrow_estado != EscrowEstado.PAGADO_EN_ESCROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pago debe estar retenido en escrow"
        )

def validate_can_create_resena(trabajo: Trabajo, user: User, db: Session):
    """Valida que se puede crear una reseña"""
    
    # Solo el cliente puede crear reseñas
    if trabajo.cliente_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el cliente puede dejar una reseña"
        )
    
    # El trabajo debe estar completado
    if trabajo.estado != TrabajoEstado.COMPLETADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden reseñar trabajos completados"
        )
    
    # No debe existir ya una reseña
    from shared.models.resena import Resena
    existing = db.query(Resena).filter(Resena.trabajo_id == trabajo.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una reseña para este trabajo"
        )

def validate_monto_minimo(monto: float):
    """Valida que el monto sea mayor al mínimo permitido"""
    MONTO_MINIMO = 100.0
    if monto < MONTO_MINIMO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El monto mínimo es ${MONTO_MINIMO}"
        )
```

---

## 1.5 Agregar Health Checks Robustos

### Mejorar health checks en todos los servicios:
```python
# shared/health/health_check.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from shared.core.database import get_db
import httpx

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check completo del servicio"""
    
    health_status = {
        "status": "healthy",
        "service": "nombre_servicio",
        "checks": {}
    }
    
    # Check de base de datos
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "ok"
    except Exception as e:
        health_status["checks"]["database"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check de Redis (si aplica)
    try:
        # redis_client.ping()
        health_status["checks"]["redis"] = "ok"
    except:
        health_status["checks"]["redis"] = "not configured"
    
    # Check de Firebase (si aplica)
    try:
        # firestore_client.collection('test').limit(1).get()
        health_status["checks"]["firebase"] = "ok"
    except:
        health_status["checks"]["firebase"] = "not configured"
    
    return health_status

@router.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe para Kubernetes"""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except:
        raise HTTPException(status_code=503, detail="Not ready")

@router.get("/health/live")
async def liveness_check():
    """Liveness probe para Kubernetes"""
    return {"status": "alive"}
```

---

## ✅ CHECKLIST MÓDULO 1

- [ ] **1.1** Completar todos los endpoints faltantes en servicios
  - [ ] Servicio Profesionales: Portfolio completo
  - [ ] Servicio Profesionales: Trabajos y Ofertas
  - [ ] Servicio Profesionales: Estadísticas
  - [ ] Servicio Chat: CRUD ofertas completo
  - [ ] Servicio Chat: Gestión avanzada trabajos
  - [ ] Servicio Pagos: Historial transacciones
  - [ ] Servicio Pagos: Comisiones dinámicas
  - [ ] Servicio Notificaciones: Preferencias
  - [ ] Servicio Notificaciones: Historial

- [ ] **1.2** Estandarizar Modelos y Schemas
  - [ ] Crear modelo Notification
  - [ ] Crear modelo Dispute
  - [ ] Crear modelo Transaction
  - [ ] Crear schemas correspondientes
  - [ ] Revisar y estandarizar enums

- [ ] **1.3** Manejo de Errores
  - [ ] Implementar middleware global
  - [ ] Agregar a todos los servicios
  - [ ] Testear con casos de error

- [ ] **1.4** Validaciones Robustas
  - [ ] Crear validadores compartidos
  - [ ] Implementar en todos los endpoints
  - [ ] Agregar mensajes de error claros

- [ ] **1.5** Health Checks
  - [ ] Mejorar health checks
  - [ ] Agregar readiness/liveness probes
  - [ ] Testear desde API Gateway

---

# 🚀 MÓDULO 2: FEATURES & OPTIMIZACIÓN (IMPORTANTE)
**Prioridad:** 🟠 **MEDIA-ALTA**  
**Tiempo estimado:** 4-6 días  
**Objetivo:** Agregar features avanzadas y optimizar rendimiento

## 2.1 Sistema de Eventos (Event Bus)

### **Implementar RabbitMQ o Redis Pub/Sub**

#### Configuración base:
```python
# shared/events/event_bus.py

import json
import redis
from typing import Callable, Dict
from datetime import datetime

class EventBus:
    def __init__(self, redis_url: str = "redis://redis:6379"):
        self.redis_client = redis.from_url(redis_url)
        self.pubsub = self.redis_client.pubsub()
        self.handlers: Dict[str, list[Callable]] = {}
    
    def publish(self, event_type: str, data: dict):
        """Publica un evento"""
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.redis_client.publish(event_type, json.dumps(event))
        print(f"📤 Evento publicado: {event_type}")
    
    def subscribe(self, event_type: str, handler: Callable):
        """Suscribe un handler a un tipo de evento"""
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)
        self.pubsub.subscribe(event_type)
    
    def start_listening(self):
        """Inicia el loop de escucha de eventos"""
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                event_type = message['channel'].decode('utf-8')
                event_data = json.loads(message['data'])
                
                # Ejecutar handlers
                if event_type in self.handlers:
                    for handler in self.handlers[event_type]:
                        try:
                            handler(event_data)
                        except Exception as e:
                            print(f"❌ Error en handler de {event_type}: {e}")

# Instancia global
event_bus = EventBus()
```

#### Eventos del sistema:
```python
# shared/events/events.py

class SystemEvents:
    # Usuario
    USER_REGISTERED = "user.registered"
    USER_BANNED = "user.banned"
    
    # Profesional
    KYC_SUBMITTED = "kyc.submitted"
    KYC_APPROVED = "kyc.approved"
    KYC_REJECTED = "kyc.rejected"
    
    # Ofertas
    OFERTA_CREATED = "oferta.created"
    OFERTA_ACCEPTED = "oferta.accepted"
    OFERTA_REJECTED = "oferta.rejected"
    
    # Trabajos
    TRABAJO_CREATED = "trabajo.created"
    TRABAJO_PAID = "trabajo.paid"
    TRABAJO_COMPLETED = "trabajo.completed"
    TRABAJO_APPROVED = "trabajo.approved"
    TRABAJO_CANCELLED = "trabajo.cancelled"
    
    # Pagos
    PAYMENT_CONFIRMED = "payment.confirmed"
    PAYMENT_FAILED = "payment.failed"
    ESCROW_RELEASED = "escrow.released"
    REFUND_PROCESSED = "refund.processed"
    
    # Reseñas
    REVIEW_CREATED = "review.created"
    
    # Gamificación
    LEVEL_UP = "gamification.level_up"
    POINTS_EARNED = "gamification.points_earned"
```

#### Uso en servicios:
```python
# En servicio_chat_ofertas/app/main.py

from shared.events.event_bus import event_bus
from shared.events.events import SystemEvents

@app.post("/ofertas/{oferta_id}/accept")
async def accept_oferta(...):
    # ... lógica existente ...
    
    # Publicar evento
    event_bus.publish(SystemEvents.OFERTA_ACCEPTED, {
        "oferta_id": oferta.id,
        "cliente_id": oferta.cliente_id,
        "profesional_id": oferta.profesional_id,
        "monto": float(oferta.monto)
    })
    
    return nuevo_trabajo

# En servicio_notificaciones/app/main.py

# Suscribirse a eventos
def handle_oferta_accepted(event_data):
    """Envía notificación cuando se acepta una oferta"""
    # Enviar email al cliente
    # Enviar push al profesional
    pass

event_bus.subscribe(SystemEvents.OFERTA_ACCEPTED, handle_oferta_accepted)
event_bus.subscribe(SystemEvents.TRABAJO_COMPLETED, handle_trabajo_completed)
event_bus.subscribe(SystemEvents.PAYMENT_CONFIRMED, handle_payment_confirmed)
```

---

## 2.2 Rate Limiting y Throttling

### Implementar en API Gateway:
```python
# servicios/puerta_enlace/app/rate_limiter.py

from fastapi import Request, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Crear limiter
limiter = Limiter(key_func=get_remote_address)

# En main.py del gateway
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Aplicar límites por ruta
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
@limiter.limit("100/minute")  # 100 requests por minuto
async def gateway_route(request: Request, path: str):
    # ... lógica existente ...
    pass

# Límites específicos para endpoints sensibles
@app.post("/auth/login")
@limiter.limit("5/minute")  # Máximo 5 intentos de login por minuto
async def login_endpoint(request: Request):
    pass
```

---

## 2.3 Caching con Redis

### Implementar caching estratégico:
```python
# shared/cache/redis_cache.py

import redis
import json
import pickle
from typing import Optional, Any
from functools import wraps

class RedisCache:
    def __init__(self, redis_url: str = "redis://redis:6379"):
        self.redis = redis.from_url(redis_url, decode_responses=True)
    
    def get(self, key: str) -> Optional[Any]:
        """Obtiene un valor del cache"""
        value = self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300):
        """Guarda un valor en cache con TTL en segundos"""
        self.redis.setex(key, ttl, json.dumps(value))
    
    def delete(self, key: str):
        """Elimina un valor del cache"""
        self.redis.delete(key)
    
    def invalidate_pattern(self, pattern: str):
        """Invalida todas las keys que coincidan con el patrón"""
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)

# Instancia global
cache = RedisCache()

# Decorator para cachear
def cached(key_prefix: str, ttl: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generar key única
            cache_key = f"{key_prefix}:{args}:{kwargs}"
            
            # Intentar obtener del cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Ejecutar función
            result = await func(*args, **kwargs)
            
            # Guardar en cache
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator
```

#### Uso en endpoints:
```python
# En servicio_profesionales/app/main.py

from shared.cache.redis_cache import cached, cache

@app.get("/public/professional/{prof_id}")
@cached(key_prefix="professional_profile", ttl=600)  # 10 minutos
async def get_public_professional_profile(prof_id: int, db: Session = Depends(get_db)):
    # ... lógica existente ...
    pass

@app.get("/public/profesional/{prof_id}/portfolio")
@cached(key_prefix="professional_portfolio", ttl=300)  # 5 minutos
async def get_public_portfolio(prof_id: int, db: Session = Depends(get_db)):
    # ... lógica existente ...
    pass

# Invalidar cache cuando se actualiza
@app.put("/professional/me")
async def update_my_professional_profile(...):
    # ... lógica existente ...
    
    # Invalidar cache del profesional
    cache.invalidate_pattern(f"professional_profile:{professional.id}:*")
    cache.invalidate_pattern(f"professional_portfolio:{professional.id}:*")
    
    return professional
```

#### Cachear búsquedas geoespaciales:
```python
@app.post("/search")
@cached(key_prefix="search_professionals", ttl=180)  # 3 minutos
async def search_professionals(search_params: SearchRequest, db: Session = Depends(get_db)):
    # ... lógica existente ...
    pass
```

---

## 2.4 Logging Centralizado

### Implementar logging estructurado:
```python
# shared/logging/logger.py

import logging
import sys
import json
from datetime import datetime
from pythonjsonlogger import jsonlogger

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['service'] = 'nombre_servicio'  # Configurar por servicio

def setup_logging(service_name: str):
    """Configura logging para un servicio"""
    
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Handler para stdout (Docker/K8s)
    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(name)s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Configurar servicio
    CustomJsonFormatter.service_name = service_name
    
    return logger

# Uso en cada servicio
# servicios/servicio_profesionales/app/main.py

from shared.logging.logger import setup_logging

logger = setup_logging("servicio_profesionales")

@app.post("/professional/portfolio")
async def add_portfolio_item(...):
    logger.info("Agregando item al portfolio", extra={
        "user_id": current_user.id,
        "professional_id": professional.id,
        "action": "portfolio_item_created"
    })
    # ... lógica ...
```

---

## 2.5 Optimización de Queries con PostgreSQL

### Agregar índices faltantes:
```sql
-- Crear archivo: shared/migrations/add_performance_indexes.sql

-- Índices para búsquedas geoespaciales
CREATE INDEX IF NOT EXISTS idx_profesionales_ubicacion 
ON profesionales USING GIST (ubicacion);

CREATE INDEX IF NOT EXISTS idx_profesionales_estado_verificacion 
ON profesionales (estado_verificacion);

-- Índices para trabajos
CREATE INDEX IF NOT EXISTS idx_trabajos_cliente_id 
ON trabajos (cliente_id);

CREATE INDEX IF NOT EXISTS idx_trabajos_profesional_id 
ON trabajos (profesional_id);

CREATE INDEX IF NOT EXISTS idx_trabajos_estado 
ON trabajos (estado);

CREATE INDEX IF NOT EXISTS idx_trabajos_escrow_estado 
ON trabajos (escrow_estado);

-- Índices para ofertas
CREATE INDEX IF NOT EXISTS idx_ofertas_cliente_id 
ON ofertas (cliente_id);

CREATE INDEX IF NOT EXISTS idx_ofertas_profesional_id 
ON ofertas (profesional_id);

CREATE INDEX IF NOT EXISTS idx_ofertas_estado 
ON ofertas (estado);

-- Índices para reseñas
CREATE INDEX IF NOT EXISTS idx_resenas_profesional_id 
ON resenas (profesional_id);

CREATE INDEX IF NOT EXISTS idx_resenas_cliente_id 
ON resenas (cliente_id);

CREATE INDEX IF NOT EXISTS idx_resenas_trabajo_id 
ON resenas (trabajo_id);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email 
ON usuarios (email);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol 
ON usuarios (rol);

CREATE INDEX IF NOT EXISTS idx_usuarios_is_active 
ON usuarios (is_active);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_profesionales_kyc_activo 
ON profesionales (estado_verificacion, is_active);
```

### Optimizar queries con eager loading:
```python
# En servicios que hacen joins frecuentes

from sqlalchemy.orm import joinedload

# Antes (N+1 queries)
trabajos = db.query(Trabajo).filter(Trabajo.cliente_id == user_id).all()
for trabajo in trabajos:
    print(trabajo.profesional.nombre)  # Query adicional por cada trabajo

# Después (1 query)
trabajos = db.query(Trabajo).options(
    joinedload(Trabajo.profesional),
    joinedload(Trabajo.oferta)
).filter(Trabajo.cliente_id == user_id).all()
```

---

## ✅ CHECKLIST MÓDULO 2

- [ ] **2.1** Sistema de Eventos
  - [ ] Implementar EventBus con Redis Pub/Sub
  - [ ] Definir todos los eventos del sistema
  - [ ] Integrar en servicios clave
  - [ ] Agregar handlers en servicio_notificaciones
  - [ ] Testear flujo completo de eventos

- [ ] **2.2** Rate Limiting
  - [ ] Implementar slowapi en API Gateway
  - [ ] Configurar límites por endpoint
  - [ ] Agregar límites especiales para auth
  - [ ] Testear bajo carga

- [ ] **2.3** Caching
  - [ ] Implementar RedisCache wrapper
  - [ ] Cachear perfiles públicos
  - [ ] Cachear búsquedas geoespaciales
  - [ ] Cachear portfolio
  - [ ] Implementar invalidación inteligente

- [ ] **2.4** Logging Centralizado
  - [ ] Implementar logger JSON estructurado
  - [ ] Configurar en todos los servicios
  - [ ] Agregar correlation IDs
  - [ ] Integrar con ELK (opcional)

- [ ] **2.5** Optimización BD
  - [ ] Crear índices de performance
  - [ ] Optimizar queries con joinedload
  - [ ] Agregar EXPLAIN ANALYZE a queries lentas
  - [ ] Configurar connection pooling

---

# 📈 MÓDULO 3: MONITORING & PRODUCTION (AVANZADO)
**Prioridad:** 🟡 **MEDIA**  
**Tiempo estimado:** 3-5 días  
**Objetivo:** Preparar para producción, monitoring y escalabilidad

## 3.1 Métricas con Prometheus

### Implementar exportador de métricas:
```python
# shared/metrics/prometheus.py

from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Response
import time

# Métricas definidas
http_requests_total = Counter(
    'http_requests_total',
    'Total de requests HTTP',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'Duración de requests HTTP',
    ['method', 'endpoint']
)

active_users = Gauge(
    'active_users',
    'Usuarios activos en el sistema'
)

trabajos_en_curso = Gauge(
    'trabajos_en_curso',
    'Trabajos actualmente en curso'
)

# Middleware para capturar métricas
async def prometheus_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    
    # Registrar métricas
    http_requests_total.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    http_request_duration_seconds.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response

# Endpoint de métricas
@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")
```

---

## 3.2 Tracing Distribuido con Jaeger

### Implementar OpenTelemetry:
```python
# shared/tracing/opentelemetry.py

from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

def setup_tracing(app, service_name: str):
    """Configura tracing distribuido"""
    
    # Configurar recurso
    resource = Resource(attributes={
        "service.name": service_name
    })
    
    # Configurar provider
    provider = TracerProvider(resource=resource)
    
    # Configurar exportador Jaeger
    jaeger_exporter = JaegerExporter(
        agent_host_name="jaeger",
        agent_port=6831,
    )
    
    provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
    trace.set_tracer_provider(provider)
    
    # Instrumentar FastAPI
    FastAPIInstrumentor.instrument_app(app)
    
    # Instrumentar SQLAlchemy
    SQLAlchemyInstrumentor().instrument()
    
    # Instrumentar HTTPX (para calls entre servicios)
    HTTPXClientInstrumentor().instrument()

# Uso en cada servicio
from shared.tracing.opentelemetry import setup_tracing

setup_tracing(app, "servicio_profesionales")
```

---

## 3.3 Circuit Breaker Pattern

### Implementar circuit breaker para llamadas entre servicios:
```python
# shared/resilience/circuit_breaker.py

from enum import Enum
from datetime import datetime, timedelta
import asyncio

class CircuitState(Enum):
    CLOSED = "closed"      # Funcionando normal
    OPEN = "open"          # Circuito abierto, rechazando requests
    HALF_OPEN = "half_open"  # Probando si se recuperó

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout: int = 60,
        expected_exception: Exception = Exception
    ):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    async def call(self, func, *args, **kwargs):
        """Ejecuta función con circuit breaker"""
        
        if self.state == CircuitState.OPEN:
            # Verificar si pasó el timeout
            if datetime.now() - self.last_failure_time > timedelta(seconds=self.timeout):
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = await func(*args, **kwargs)
            
            # Success
            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
            
            return result
        
        except self.expected_exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.now()
            
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
            
            raise e

# Uso en API Gateway
from shared.resilience.circuit_breaker import CircuitBreaker

payment_service_breaker = CircuitBreaker(failure_threshold=3, timeout=30)

async def call_payment_service(url, data):
    return await payment_service_breaker.call(
        http_client.post,
        url,
        json=data
    )
```

---

## 3.4 Background Tasks con Celery

### Implementar Celery para tareas asíncronas:
```python
# shared/tasks/celery_app.py

from celery import Celery

celery_app = Celery(
    'conectar_profesionales',
    broker='redis://redis:6379/0',
    backend='redis://redis:6379/0'
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Argentina/Buenos_Aires',
    enable_utc=True,
)

# Tareas definidas
@celery_app.task(name="send_email_async")
def send_email_async(to_email: str, subject: str, body: str):
    """Envía email de forma asíncrona"""
    from shared.services.email_service import EmailService
    email_service = EmailService()
    email_service.send_email(to_email, subject, body)

@celery_app.task(name="process_payment_webhook")
def process_payment_webhook(payment_data: dict):
    """Procesa webhook de MercadoPago de forma asíncrona"""
    # Lógica de procesamiento
    pass

@celery_app.task(name="calculate_professional_stats")
def calculate_professional_stats(professional_id: int):
    """Recalcula estadísticas de un profesional"""
    # Lógica de cálculo
    pass

@celery_app.task(name="cleanup_expired_ofertas")
def cleanup_expired_ofertas():
    """Limpia ofertas expiradas (tarea periódica)"""
    # Lógica de limpieza
    pass

# Configurar tareas periódicas
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'cleanup-expired-ofertas-daily': {
        'task': 'cleanup_expired_ofertas',
        'schedule': crontab(hour=2, minute=0),  # 2 AM diario
    },
}
```

---

## 3.5 API Versioning

### Implementar versionado de API:
```python
# servicios/puerta_enlace/app/main.py

# Soporte para múltiples versiones
RUTAS_SERVICIO_V1 = {
    "/auth": "autenticacion",
    "/users": "usuarios",
    # ... rutas v1 ...
}

RUTAS_SERVICIO_V2 = {
    "/auth": "autenticacion_v2",  # Nueva versión con cambios
    "/users": "usuarios",
    # ... rutas v2 ...
}

def obtener_servicio_destino(path: str, version: str = "v1"):
    """Determina servicio según versión"""
    rutas = RUTAS_SERVICIO_V1 if version == "v1" else RUTAS_SERVICIO_V2
    
    for ruta_prefijo, servicio in sorted(rutas.items(), key=lambda x: len(x[0]), reverse=True):
        if path.startswith(ruta_prefijo):
            return servicio
    return None

@app.api_route("/api/{version}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def versioned_gateway_route(version: str, path: str, request: Request):
    """Gateway con soporte de versiones"""
    
    if version not in ["v1", "v2"]:
        raise HTTPException(status_code=404, detail="Versión de API no soportada")
    
    servicio_nombre = obtener_servicio_destino(f"/{path}", version)
    # ... resto de lógica ...
```

---

## 3.6 Tests de Integración

### Crear suite de tests para microservicios:
```python
# tests/integration/test_profesionales_service.py

import pytest
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.mark.asyncio
async def test_create_portfolio_item():
    """Test crear item de portfolio"""
    async with AsyncClient(base_url="http://servicio_profesionales:8003") as client:
        # Login
        login_response = await client.post("/auth/login", data={
            "username": "test_professional@example.com",
            "password": "Test1234!"
        })
        token = login_response.json()["access_token"]
        
        # Crear portfolio item
        response = await client.post(
            "/professional/portfolio",
            json={
                "titulo": "Instalación eléctrica",
                "descripcion": "Instalación completa en casa de 3 ambientes"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["titulo"] == "Instalación eléctrica"

@pytest.mark.asyncio
async def test_search_professionals_by_location():
    """Test búsqueda geoespacial"""
    async with AsyncClient(base_url="http://servicio_profesionales:8003") as client:
        response = await client.post("/search", json={
            "latitude": -34.6037,
            "longitude": -58.3816,
            "radio_km": 10,
            "oficio": "Plomero"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "resultados" in data
        assert data["total"] >= 0

# tests/integration/test_payment_flow.py

@pytest.mark.asyncio
async def test_complete_payment_flow():
    """Test flujo completo de pago"""
    
    # 1. Crear oferta
    # 2. Aceptar oferta (crea trabajo)
    # 3. Generar preference de MercadoPago
    # 4. Simular webhook de pago aprobado
    # 5. Verificar escrow actualizado
    # 6. Marcar trabajo completado
    # 7. Liberar escrow
    # 8. Verificar payout al profesional
    
    pass
```

---

## ✅ CHECKLIST MÓDULO 3

- [ ] **3.1** Métricas con Prometheus
  - [ ] Implementar exportador de métricas
  - [ ] Agregar middleware en todos los servicios
  - [ ] Definir métricas de negocio
  - [ ] Configurar Grafana dashboards

- [ ] **3.2** Tracing Distribuido
  - [ ] Implementar OpenTelemetry
  - [ ] Configurar Jaeger
  - [ ] Instrumentar todos los servicios
  - [ ] Testear traces end-to-end

- [ ] **3.3** Circuit Breaker
  - [ ] Implementar patrón circuit breaker
  - [ ] Aplicar en API Gateway
  - [ ] Testear bajo fallas

- [ ] **3.4** Background Tasks
  - [ ] Implementar Celery
  - [ ] Migrar tareas pesadas a Celery
  - [ ] Configurar tareas periódicas
  - [ ] Monitorear workers

- [ ] **3.5** API Versioning
  - [ ] Implementar soporte de versiones
  - [ ] Documentar cambios entre versiones
  - [ ] Deprecation warnings

- [ ] **3.6** Tests de Integración
  - [ ] Crear suite de tests E2E
  - [ ] Tests de flujos críticos
  - [ ] CI/CD integration
  - [ ] Coverage mínimo 70%

---

# 📋 RESUMEN DE PRIORIDADES

## SEMANA 1-2: MÓDULO 1 (Crítico)
- Completar todos los endpoints faltantes
- Estandarizar modelos y schemas
- Implementar manejo de errores robusto
- Agregar validaciones de negocio
- Health checks mejorados

## SEMANA 3-4: MÓDULO 2 (Importante)
- Sistema de eventos (Event Bus)
- Rate limiting y caching
- Logging centralizado
- Optimización de queries

## SEMANA 5-6: MÓDULO 3 (Avanzado)
- Monitoring con Prometheus
- Tracing distribuido
- Circuit breakers
- Background tasks
- Tests de integración

---

# 🎯 MÉTRICAS DE ÉXITO

Al completar los 3 módulos, el backend tendrá:

✅ **100% de endpoints** implementados y documentados  
✅ **Manejo de errores** estandarizado en todos los servicios  
✅ **Validaciones robustas** en todas las operaciones  
✅ **Sistema de eventos** para desacoplamiento  
✅ **Rate limiting** para protección  
✅ **Caching** para performance  
✅ **Logging estructurado** para debugging  
✅ **Queries optimizadas** con índices  
✅ **Métricas y monitoring** en tiempo real  
✅ **Tracing distribuido** para troubleshooting  
✅ **Circuit breakers** para resiliencia  
✅ **Background tasks** para operaciones pesadas  
✅ **Tests E2E** para garantizar calidad

---

**🚀 El backend estará production-ready y escalable al 100%**
