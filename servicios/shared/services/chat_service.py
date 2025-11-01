"""
Servicio de Chat utilizando Firebase Realtime Database
"""
import firebase_admin
from firebase_admin import credentials, db
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from shared.core.config import settings


class ChatService:
    """Servicio para gestionar chats en Firebase"""
    
    def __init__(self):
        # Inicializar Firebase si no está inicializado
        try:
            firebase_admin.get_app()
        except ValueError:
            # Firebase no está inicializado, inicializar ahora
            # En producción, usar certificado de Firebase
            # Por ahora, usar base de datos en modo testing
            pass
    
    def get_or_create_chat(
        self, 
        cliente_id: str, 
        profesional_id: str,
        cliente_nombre: str = "",
        profesional_nombre: str = ""
    ) -> str:
        """
        Obtiene un chat existente o crea uno nuevo entre cliente y profesional
        
        Returns:
            str: ID del chat
        """
        # Generar ID consistente basado en los participantes
        # Ordenar IDs para que siempre genere el mismo chat_id
        ids = sorted([cliente_id, profesional_id])
        chat_id = f"{ids[0]}_{ids[1]}"
        
        # Verificar si el chat ya existe en Firebase
        # ref = db.reference(f'/chats/{chat_id}')
        # chat_data = ref.get()
        
        # Si no existe, crearlo
        # if not chat_data:
        #     ref.set({
        #         'participants': {
        #             cliente_id: True,
        #             profesional_id: True
        #         },
        #         'metadata': {
        #             'cliente_id': cliente_id,
        #             'profesional_id': profesional_id,
        #             'cliente_nombre': cliente_nombre,
        #             'profesional_nombre': profesional_nombre,
        #             'created_at': datetime.utcnow().timestamp(),
        #             'last_message': '',
        #             'last_message_time': 0
        #         }
        #     })
        
        return chat_id
    
    def get_user_chats(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Obtiene todos los chats de un usuario
        
        Args:
            user_id: UUID del usuario
            
        Returns:
            Lista de chats con metadata
        """
        chats = []
        
        # Buscar en Firebase todos los chats donde el usuario es participante
        # ref = db.reference('/chats')
        # all_chats = ref.order_by_child(f'participants/{user_id}').equal_to(True).get()
        
        # Por ahora retornar lista vacía (Firebase debe estar configurado)
        return chats
    
    def send_message(
        self,
        chat_id: str,
        sender_id: str,
        text: str,
        sender_nombre: str = ""
    ) -> Dict[str, Any]:
        """
        Envía un mensaje al chat
        
        Args:
            chat_id: ID del chat
            sender_id: UUID del remitente
            text: Contenido del mensaje
            sender_nombre: Nombre del remitente
            
        Returns:
            Datos del mensaje creado
        """
        timestamp = int(datetime.utcnow().timestamp() * 1000)
        message_id = str(uuid.uuid4())
        
        message_data = {
            'id': message_id,
            'sender_id': sender_id,
            'sender_nombre': sender_nombre,
            'text': text,
            'timestamp': timestamp,
            'read': False
        }
        
        # Guardar mensaje en Firebase
        # messages_ref = db.reference(f'/chats/{chat_id}/messages')
        # messages_ref.child(message_id).set(message_data)
        
        # Actualizar metadata del chat
        # metadata_ref = db.reference(f'/chats/{chat_id}/metadata')
        # metadata_ref.update({
        #     'last_message': text[:100],
        #     'last_message_time': timestamp
        # })
        
        return message_data
    
    def get_chat_messages(
        self,
        chat_id: str,
        limit: int = 50,
        before_timestamp: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Obtiene mensajes de un chat
        
        Args:
            chat_id: ID del chat
            limit: Número máximo de mensajes
            before_timestamp: Obtener mensajes antes de este timestamp (para paginación)
            
        Returns:
            Lista de mensajes
        """
        messages = []
        
        # Obtener mensajes de Firebase
        # messages_ref = db.reference(f'/chats/{chat_id}/messages')
        # query = messages_ref.order_by_child('timestamp').limit_to_last(limit)
        
        # if before_timestamp:
        #     query = query.end_at(before_timestamp)
        
        # messages_data = query.get()
        
        # if messages_data:
        #     messages = list(messages_data.values())
        #     messages.sort(key=lambda x: x['timestamp'])
        
        return messages
    
    def mark_messages_as_read(self, chat_id: str, user_id: str) -> None:
        """
        Marca todos los mensajes del chat como leídos para un usuario
        
        Args:
            chat_id: ID del chat
            user_id: UUID del usuario que lee los mensajes
        """
        # messages_ref = db.reference(f'/chats/{chat_id}/messages')
        # messages = messages_ref.order_by_child('read').equal_to(False).get()
        
        # if messages:
        #     for message_id, message in messages.items():
        #         if message['sender_id'] != user_id:
        #             messages_ref.child(message_id).update({'read': True})
        pass
    
    def get_unread_count(self, user_id: str) -> int:
        """
        Obtiene el número total de mensajes no leídos para un usuario
        
        Args:
            user_id: UUID del usuario
            
        Returns:
            Número de mensajes no leídos
        """
        # Implementar lógica de conteo
        return 0


# Instancia global del servicio
chat_service = ChatService()
