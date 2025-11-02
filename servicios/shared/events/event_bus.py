"""
Sistema de eventos distribuido usando Redis Pub/Sub.
Permite comunicación asíncrona entre microservicios.
"""
import json
import redis
import logging
from typing import Callable, Dict, Any, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class EventType(str, Enum):
    """Tipos de eventos del sistema"""
    # Eventos de Trabajos
    TRABAJO_CREADO = "trabajo.creado"
    TRABAJO_PAGADO = "trabajo.pagado"
    TRABAJO_EN_CURSO = "trabajo.en_curso"
    TRABAJO_COMPLETADO = "trabajo.completado"
    TRABAJO_CANCELADO = "trabajo.cancelado"
    
    # Eventos de Pagos
    PAGO_RECIBIDO = "pago.recibido"
    PAGO_LIBERADO = "pago.liberado"
    PAGO_REEMBOLSADO = "pago.reembolsado"
    
    # Eventos de Ofertas
    OFERTA_CREADA = "oferta.creada"
    OFERTA_ACEPTADA = "oferta.aceptada"
    OFERTA_RECHAZADA = "oferta.rechazada"
    
    # Eventos de Reseñas
    RESENA_CREADA = "resena.creada"
    
    # Eventos de Usuario
    USUARIO_REGISTRADO = "usuario.registrado"
    KYC_APROBADO = "kyc.aprobado"
    KYC_RECHAZADO = "kyc.rechazado"
    
    # Eventos de Gamificación
    NIVEL_SUBIDO = "gamificacion.nivel_subido"
    LOGRO_DESBLOQUEADO = "gamificacion.logro_desbloqueado"
    
    # Eventos de Chat
    MENSAJE_ENVIADO = "chat.mensaje_enviado"
    CHAT_MODERADO = "chat.moderado"


class Event:
    """Representa un evento del sistema"""
    
    def __init__(
        self,
        event_type: EventType,
        data: Dict[str, Any],
        source_service: str,
        user_id: Optional[str] = None,
        correlation_id: Optional[str] = None
    ):
        self.event_type = event_type
        self.data = data
        self.source_service = source_service
        self.user_id = user_id
        self.correlation_id = correlation_id
        self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el evento a diccionario"""
        return {
            "event_type": self.event_type.value,
            "data": self.data,
            "source_service": self.source_service,
            "user_id": self.user_id,
            "correlation_id": self.correlation_id,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Event':
        """Crea un evento desde un diccionario"""
        event = cls(
            event_type=EventType(data["event_type"]),
            data=data["data"],
            source_service=data["source_service"],
            user_id=data.get("user_id"),
            correlation_id=data.get("correlation_id")
        )
        event.timestamp = data.get("timestamp", datetime.utcnow().isoformat())
        return event


class EventBus:
    """Sistema de eventos distribuido usando Redis Pub/Sub"""
    
    def __init__(self, redis_url: str = "redis://redis:6379"):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.pubsub = None
        self.handlers: Dict[EventType, list[Callable]] = {}
        self.running = False
    
    def publish(self, event: Event) -> bool:
        """
        Publica un evento en el bus.
        
        Args:
            event: El evento a publicar
            
        Returns:
            True si se publicó correctamente
        """
        try:
            channel = f"events:{event.event_type.value}"
            message = json.dumps(event.to_dict())
            
            self.redis_client.publish(channel, message)
            logger.info(f"Evento publicado: {event.event_type.value} desde {event.source_service}")
            return True
            
        except Exception as e:
            logger.error(f"Error publicando evento: {str(e)}")
            return False
    
    def subscribe(self, event_type: EventType, handler: Callable[[Event], None]):
        """
        Suscribe un handler a un tipo de evento.
        
        Args:
            event_type: Tipo de evento a escuchar
            handler: Función que procesará el evento
        """
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        
        self.handlers[event_type].append(handler)
        logger.info(f"Handler registrado para evento: {event_type.value}")
    
    def start_listening(self):
        """Inicia el listener de eventos en background"""
        if self.running:
            logger.warning("EventBus ya está corriendo")
            return
        
        self.pubsub = self.redis_client.pubsub()
        
        # Suscribirse a todos los canales de eventos registrados
        for event_type in self.handlers.keys():
            channel = f"events:{event_type.value}"
            self.pubsub.subscribe(channel)
            logger.info(f"Suscrito al canal: {channel}")
        
        self.running = True
        
        # Escuchar mensajes
        for message in self.pubsub.listen():
            if not self.running:
                break
            
            if message['type'] == 'message':
                self._handle_message(message)
    
    def _handle_message(self, message: Dict[str, Any]):
        """Procesa un mensaje recibido"""
        try:
            # Parsear el evento
            event_data = json.loads(message['data'])
            event = Event.from_dict(event_data)
            
            # Ejecutar handlers registrados
            if event.event_type in self.handlers:
                for handler in self.handlers[event.event_type]:
                    try:
                        handler(event)
                    except Exception as e:
                        logger.error(f"Error en handler de {event.event_type.value}: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error procesando mensaje: {str(e)}")
    
    def stop_listening(self):
        """Detiene el listener de eventos"""
        self.running = False
        if self.pubsub:
            self.pubsub.close()
        logger.info("EventBus detenido")


# Instancia global del event bus
_event_bus: Optional[EventBus] = None


def get_event_bus(redis_url: str = "redis://redis:6379") -> EventBus:
    """
    Obtiene la instancia global del event bus.
    
    Args:
        redis_url: URL de conexión a Redis
        
    Returns:
        Instancia del EventBus
    """
    global _event_bus
    
    if _event_bus is None:
        _event_bus = EventBus(redis_url)
    
    return _event_bus


# Helpers para publicar eventos comunes

def publish_trabajo_creado(trabajo_id: str, cliente_id: str, profesional_id: str, monto: float, source_service: str):
    """Publica evento de trabajo creado"""
    event = Event(
        event_type=EventType.TRABAJO_CREADO,
        data={
            "trabajo_id": trabajo_id,
            "cliente_id": cliente_id,
            "profesional_id": profesional_id,
            "monto": monto
        },
        source_service=source_service,
        user_id=cliente_id
    )
    get_event_bus().publish(event)


def publish_pago_recibido(trabajo_id: str, monto: float, payment_id: str, source_service: str):
    """Publica evento de pago recibido"""
    event = Event(
        event_type=EventType.PAGO_RECIBIDO,
        data={
            "trabajo_id": trabajo_id,
            "monto": monto,
            "payment_id": payment_id
        },
        source_service=source_service
    )
    get_event_bus().publish(event)


def publish_trabajo_completado(trabajo_id: str, profesional_id: str, cliente_id: str, source_service: str):
    """Publica evento de trabajo completado"""
    event = Event(
        event_type=EventType.TRABAJO_COMPLETADO,
        data={
            "trabajo_id": trabajo_id,
            "profesional_id": profesional_id,
            "cliente_id": cliente_id
        },
        source_service=source_service,
        user_id=profesional_id
    )
    get_event_bus().publish(event)


def publish_resena_creada(resena_id: str, trabajo_id: str, profesional_id: str, rating: float, source_service: str):
    """Publica evento de reseña creada"""
    event = Event(
        event_type=EventType.RESENA_CREADA,
        data={
            "resena_id": resena_id,
            "trabajo_id": trabajo_id,
            "profesional_id": profesional_id,
            "rating": rating
        },
        source_service=source_service,
        user_id=profesional_id
    )
    get_event_bus().publish(event)


def publish_kyc_aprobado(profesional_id: str, user_id: str, source_service: str):
    """Publica evento de KYC aprobado"""
    event = Event(
        event_type=EventType.KYC_APROBADO,
        data={
            "profesional_id": profesional_id,
            "user_id": user_id
        },
        source_service=source_service,
        user_id=user_id
    )
    get_event_bus().publish(event)
