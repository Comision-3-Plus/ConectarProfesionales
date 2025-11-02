"""
Sistema de WebSocket para chat en tiempo real.
Sincronización con Firestore para mensajería.
"""
from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import Dict, Set, Optional
import json
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Gestor de conexiones WebSocket"""
    
    def __init__(self):
        # Mapeo de user_id -> Set de WebSockets activas
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        
        # Mapeo de chat_id -> Set de user_ids
        self.chat_participants: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, chat_id: str):
        """
        Conecta un WebSocket de usuario a un chat.
        
        Args:
            websocket: Conexión WebSocket
            user_id: ID del usuario
            chat_id: ID del chat
        """
        await websocket.accept()
        
        # Agregar conexión del usuario
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        
        # Agregar usuario al chat
        if chat_id not in self.chat_participants:
            self.chat_participants[chat_id] = set()
        self.chat_participants[chat_id].add(user_id)
        
        logger.info(f"Usuario {user_id} conectado al chat {chat_id}")
        
        # Notificar a otros participantes
        await self.broadcast_to_chat(
            chat_id,
            {
                "type": "user_connected",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            exclude_user=user_id
        )
    
    def disconnect(self, websocket: WebSocket, user_id: str, chat_id: str):
        """
        Desconecta un WebSocket.
        
        Args:
            websocket: Conexión WebSocket
            user_id: ID del usuario
            chat_id: ID del chat
        """
        # Remover conexión
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        # Remover de participantes del chat
        if chat_id in self.chat_participants:
            self.chat_participants[chat_id].discard(user_id)
            if not self.chat_participants[chat_id]:
                del self.chat_participants[chat_id]
        
        logger.info(f"Usuario {user_id} desconectado del chat {chat_id}")
    
    async def send_personal_message(self, user_id: str, message: dict):
        """
        Envía un mensaje a un usuario específico (todas sus conexiones).
        
        Args:
            user_id: ID del usuario destinatario
            message: Mensaje a enviar (dict)
        """
        if user_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error enviando mensaje a {user_id}: {str(e)}")
                    disconnected.add(connection)
            
            # Limpiar conexiones muertas
            for conn in disconnected:
                self.active_connections[user_id].discard(conn)
    
    async def broadcast_to_chat(self, chat_id: str, message: dict, exclude_user: Optional[str] = None):
        """
        Envía un mensaje a todos los participantes de un chat.
        
        Args:
            chat_id: ID del chat
            message: Mensaje a enviar (dict)
            exclude_user: User ID a excluir (opcional)
        """
        if chat_id in self.chat_participants:
            for user_id in self.chat_participants[chat_id]:
                if user_id != exclude_user:
                    await self.send_personal_message(user_id, message)
    
    async def broadcast_typing_indicator(self, chat_id: str, user_id: str, is_typing: bool):
        """
        Envía indicador de "escribiendo..." a otros participantes del chat.
        
        Args:
            chat_id: ID del chat
            user_id: ID del usuario que está escribiendo
            is_typing: True si está escribiendo, False si dejó de escribir
        """
        await self.broadcast_to_chat(
            chat_id,
            {
                "type": "typing_indicator",
                "user_id": user_id,
                "is_typing": is_typing,
                "timestamp": datetime.utcnow().isoformat()
            },
            exclude_user=user_id
        )
    
    def get_chat_participants(self, chat_id: str) -> Set[str]:
        """Obtiene los participantes activos de un chat"""
        return self.chat_participants.get(chat_id, set())
    
    def is_user_online(self, user_id: str) -> bool:
        """Verifica si un usuario está conectado"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0


# Instancia global del connection manager
connection_manager = ConnectionManager()


async def handle_websocket_message(
    websocket: WebSocket,
    user_id: str,
    chat_id: str,
    message_data: dict
):
    """
    Procesa un mensaje recibido por WebSocket.
    
    Args:
        websocket: Conexión WebSocket
        user_id: ID del usuario
        chat_id: ID del chat
        message_data: Datos del mensaje
    """
    message_type = message_data.get("type")
    
    if message_type == "message":
        # Nuevo mensaje de chat
        await connection_manager.broadcast_to_chat(
            chat_id,
            {
                "type": "new_message",
                "chat_id": chat_id,
                "user_id": user_id,
                "content": message_data.get("content"),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    elif message_type == "typing":
        # Indicador de escritura
        is_typing = message_data.get("is_typing", False)
        await connection_manager.broadcast_typing_indicator(chat_id, user_id, is_typing)
    
    elif message_type == "read":
        # Mensaje leído
        message_id = message_data.get("message_id")
        await connection_manager.broadcast_to_chat(
            chat_id,
            {
                "type": "message_read",
                "chat_id": chat_id,
                "user_id": user_id,
                "message_id": message_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            exclude_user=user_id
        )
    
    elif message_type == "ping":
        # Keep-alive ping
        await websocket.send_json({"type": "pong"})


# Router de WebSocket para FastAPI

from fastapi import APIRouter, Query
from shared.core.security import decode_access_token

websocket_router = APIRouter()


@websocket_router.websocket("/ws/chat/{chat_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    chat_id: str,
    token: str = Query(..., description="JWT token de autenticación")
):
    """
    Endpoint WebSocket para chat en tiempo real.
    
    Parámetros:
        - chat_id: ID del chat
        - token: JWT token en query string
    
    Ejemplo de conexión desde cliente:
        ws://localhost:8000/ws/chat/123?token=eyJ0eXAiOiJKV1QiLCJhbGc...
    """
    try:
        # Verificar token
        from shared.core.security import decode_access_token as decode_token
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
    except Exception as e:
        logger.error(f"Error autenticando WebSocket: {str(e)}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Conectar usuario al chat
    await connection_manager.connect(websocket, user_id, chat_id)
    
    try:
        while True:
            # Recibir mensaje
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Procesar mensaje
            await handle_websocket_message(websocket, user_id, chat_id, message_data)
            
    except WebSocketDisconnect:
        # Cliente desconectado
        connection_manager.disconnect(websocket, user_id, chat_id)
        
        # Notificar a otros participantes
        await connection_manager.broadcast_to_chat(
            chat_id,
            {
                "type": "user_disconnected",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Error en WebSocket: {str(e)}")
        connection_manager.disconnect(websocket, user_id, chat_id)


# Helpers para integración con Firestore

async def sync_message_to_firestore(chat_id: str, message_data: dict):
    """
    Sincroniza un mensaje de WebSocket a Firestore.
    
    Args:
        chat_id: ID del chat
        message_data: Datos del mensaje
    """
    try:
        from shared.services.chat_service import ChatService
        chat_service = ChatService()
        
        # Guardar mensaje en Firestore
        await chat_service.send_message(
            conversation_id=chat_id,
            sender_id=message_data["user_id"],
            content=message_data["content"]
        )
        
    except Exception as e:
        logger.error(f"Error sincronizando mensaje a Firestore: {str(e)}")


async def notify_new_message_via_websocket(chat_id: str, message_data: dict):
    """
    Notifica un nuevo mensaje a través de WebSocket.
    Esta función se puede llamar cuando Firestore detecta un nuevo mensaje.
    
    Args:
        chat_id: ID del chat
        message_data: Datos del mensaje
    """
    await connection_manager.broadcast_to_chat(
        chat_id,
        {
            "type": "new_message",
            "chat_id": chat_id,
            "user_id": message_data.get("sender_id"),
            "content": message_data.get("content"),
            "timestamp": message_data.get("timestamp"),
            "message_id": message_data.get("id")
        }
    )


def get_connection_manager() -> ConnectionManager:
    """Obtiene la instancia global del connection manager"""
    return connection_manager
