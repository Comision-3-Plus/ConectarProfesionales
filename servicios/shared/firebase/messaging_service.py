"""
Firebase Cloud Messaging Service
Servicio para enviar notificaciones push
"""

from firebase_admin import messaging, firestore
from .admin import get_firebase_app, get_firestore_client
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class FCMService:
    """Servicio para enviar notificaciones push con Firebase Cloud Messaging"""
    
    @staticmethod
    async def save_fcm_token(user_id: str, token: str, platform: str = 'web') -> None:
        """
        Guarda el FCM token de un usuario en Firestore.
        
        Args:
            user_id: ID del usuario
            token: Token FCM del dispositivo
            platform: Plataforma (web, android, ios)
        """
        try:
            db = get_firestore_client()
            
            # Guardar en Firestore
            doc_ref = db.collection('fcm_tokens').document(str(user_id))
            doc_ref.set({
                'token': token,
                'platform': platform,
                'updated_at': firestore.SERVER_TIMESTAMP
            }, merge=True)
            
            logger.info(f"✅ FCM token guardado para usuario: {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Error al guardar FCM token: {e}")
            raise
    
    @staticmethod
    async def get_user_token(user_id: str) -> Optional[str]:
        """
        Obtiene el FCM token de un usuario.
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Optional[str]: Token FCM o None si no existe
        """
        try:
            db = get_firestore_client()
            
            doc_ref = db.collection('fcm_tokens').document(str(user_id))
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict().get('token')
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error al obtener FCM token: {e}")
            return None
    
    @staticmethod
    def send_notification(
        token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        image_url: Optional[str] = None
    ) -> str:
        """
        Envía una notificación push a un dispositivo específico.
        
        Args:
            token: FCM token del dispositivo
            title: Título de la notificación
            body: Cuerpo de la notificación
            data: Datos adicionales (opcional)
            image_url: URL de imagen (opcional)
        
        Returns:
            str: Message ID de Firebase
        
        Example:
            ```python
            message_id = FCMService.send_notification(
                token="fcm_token_here",
                title="Nuevo mensaje",
                body="Tienes un mensaje nuevo de Juan",
                data={
                    "chatId": "chat123",
                    "type": "new_message"
                }
            )
            ```
        """
        try:
            get_firebase_app()  # Asegurar que Firebase está inicializado
            
            # Construir el mensaje
            notification = messaging.Notification(
                title=title,
                body=body,
                image=image_url
            )
            
            message = messaging.Message(
                notification=notification,
                data=data or {},
                token=token,
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icon-192x192.png',
                        badge='/badge-72x72.png',
                    ),
                    fcm_options=messaging.WebpushFCMOptions(
                        link='/'
                    )
                )
            )
            
            # Enviar mensaje
            response = messaging.send(message)
            
            logger.info(f"✅ Notificación enviada: {response}")
            return response
            
        except messaging.UnregisteredError:
            logger.warning(f"⚠️ Token FCM no registrado o expirado")
            raise
        except Exception as e:
            logger.error(f"❌ Error al enviar notificación: {e}")
            raise
    
    @staticmethod
    async def send_notification_to_user(
        user_id: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        image_url: Optional[str] = None
    ) -> Optional[str]:
        """
        Envía una notificación a un usuario específico.
        
        Args:
            user_id: ID del usuario
            title: Título de la notificación
            body: Cuerpo de la notificación
            data: Datos adicionales (opcional)
            image_url: URL de imagen (opcional)
        
        Returns:
            Optional[str]: Message ID o None si no se pudo enviar
        """
        try:
            # Obtener token del usuario
            token = await FCMService.get_user_token(user_id)
            
            if not token:
                logger.warning(f"⚠️ No se encontró token FCM para usuario: {user_id}")
                return None
            
            # Enviar notificación
            message_id = FCMService.send_notification(
                token=token,
                title=title,
                body=body,
                data=data,
                image_url=image_url
            )
            
            return message_id
            
        except messaging.UnregisteredError:
            logger.warning(f"⚠️ Token FCM expirado para usuario: {user_id}")
            # Eliminar token expirado
            try:
                db = get_firestore_client()
                db.collection('fcm_tokens').document(str(user_id)).delete()
            except:
                pass
            return None
            
        except Exception as e:
            logger.error(f"❌ Error al enviar notificación a usuario {user_id}: {e}")
            return None
    
    @staticmethod
    def send_multicast(
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> messaging.BatchResponse:
        """
        Envía una notificación a múltiples dispositivos.
        
        Args:
            tokens: Lista de FCM tokens
            title: Título de la notificación
            body: Cuerpo de la notificación
            data: Datos adicionales (opcional)
        
        Returns:
            messaging.BatchResponse: Respuesta con detalles de envío
        """
        try:
            get_firebase_app()  # Asegurar que Firebase está inicializado
            
            # Construir el mensaje
            notification = messaging.Notification(
                title=title,
                body=body
            )
            
            message = messaging.MulticastMessage(
                notification=notification,
                data=data or {},
                tokens=tokens
            )
            
            # Enviar mensajes
            response = messaging.send_multicast(message)
            
            logger.info(
                f"✅ Notificaciones enviadas: {response.success_count} exitosas, "
                f"{response.failure_count} fallidas"
            )
            
            # Loggear tokens fallidos
            if response.failure_count > 0:
                for idx, result in enumerate(response.responses):
                    if not result.success:
                        logger.warning(
                            f"⚠️ Error al enviar a token {idx}: {result.exception}"
                        )
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Error al enviar notificaciones multicast: {e}")
            raise
    
    @staticmethod
    async def notify_new_message(
        recipient_user_id: str,
        sender_name: str,
        message_text: str,
        chat_id: str
    ) -> Optional[str]:
        """
        Envía notificación de nuevo mensaje de chat.
        
        Args:
            recipient_user_id: ID del usuario que recibe
            sender_name: Nombre del remitente
            message_text: Texto del mensaje
            chat_id: ID del chat
        
        Returns:
            Optional[str]: Message ID o None
        """
        return await FCMService.send_notification_to_user(
            user_id=recipient_user_id,
            title=f"Nuevo mensaje de {sender_name}",
            body=message_text[:100],  # Limitar a 100 caracteres
            data={
                "type": "new_message",
                "chatId": chat_id,
                "senderId": sender_name
            }
        )
    
    @staticmethod
    async def notify_new_offer(
        professional_user_id: str,
        client_name: str,
        offer_amount: float,
        offer_id: str
    ) -> Optional[str]:
        """
        Envía notificación de nueva oferta.
        
        Args:
            professional_user_id: ID del profesional
            client_name: Nombre del cliente
            offer_amount: Monto de la oferta
            offer_id: ID de la oferta
        
        Returns:
            Optional[str]: Message ID o None
        """
        return await FCMService.send_notification_to_user(
            user_id=professional_user_id,
            title="Nueva oferta recibida",
            body=f"{client_name} te envió una oferta de ${offer_amount:.2f}",
            data={
                "type": "new_offer",
                "offerId": offer_id,
                "clientName": client_name
            }
        )


# Instancia singleton
fcm_service = FCMService()
