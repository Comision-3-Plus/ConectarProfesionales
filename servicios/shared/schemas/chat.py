"""
Schemas para Chat (Firebase Realtime Database)
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatCreate(BaseModel):
    """Schema para crear un nuevo chat"""
    cliente_id: str = Field(..., description="UUID del cliente")
    profesional_id: str = Field(..., description="UUID del profesional")


class ChatRead(BaseModel):
    """Schema de respuesta de chat"""
    id: str = Field(..., description="ID del chat en Firebase")
    cliente_id: str
    profesional_id: str
    cliente_nombre: Optional[str] = None
    profesional_nombre: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[int] = None
    unread_count: int = 0


class MessageCreate(BaseModel):
    """Schema para crear un mensaje"""
    chat_id: str = Field(..., description="ID del chat")
    text: str = Field(..., min_length=1, max_length=2000, description="Texto del mensaje")


class MessageRead(BaseModel):
    """Schema de respuesta de mensaje"""
    id: str
    chat_id: str
    sender_id: str
    sender_nombre: Optional[str] = None
    text: str
    timestamp: int
    read: bool = False


class ChatListResponse(BaseModel):
    """Lista de chats del usuario"""
    chats: List[ChatRead]
    total_unread: int = 0


# Alias para compatibilidad
ConversationResponse = ChatRead
ConversationCreate = ChatCreate
MessageResponse = MessageRead
ModerateMessageRequest = dict  # Request de moderación
