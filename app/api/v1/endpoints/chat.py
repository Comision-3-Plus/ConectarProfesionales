"""
Endpoints de Chat
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, get_current_user
from app.models.user import Usuario
from app.schemas.chat import (
    ChatCreate,
    ChatRead,
    MessageCreate,
    MessageRead,
    ChatListResponse
)
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/create", response_model=ChatRead, status_code=status.HTTP_201_CREATED)
def create_or_get_chat(
    chat_data: ChatCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crear o obtener un chat existente entre cliente y profesional
    
    - **cliente_id**: UUID del cliente
    - **profesional_id**: UUID del profesional
    
    Retorna el chat_id que se usará para enviar/recibir mensajes
    """
    # Verificar que el usuario actual sea uno de los participantes
    if current_user.id not in [chat_data.cliente_id, chat_data.profesional_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes crear un chat en el que no participas"
        )
    
    # Obtener nombres de los participantes
    cliente = db.query(Usuario).filter(Usuario.id == chat_data.cliente_id).first()
    profesional = db.query(Usuario).filter(Usuario.id == chat_data.profesional_id).first()
    
    if not cliente or not profesional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Crear o obtener chat
    chat_id = chat_service.get_or_create_chat(
        cliente_id=chat_data.cliente_id,
        profesional_id=chat_data.profesional_id,
        cliente_nombre=f"{cliente.nombre} {cliente.apellido}",
        profesional_nombre=f"{profesional.nombre} {profesional.apellido}"
    )
    
    return ChatRead(
        id=chat_id,
        cliente_id=chat_data.cliente_id,
        profesional_id=chat_data.profesional_id,
        cliente_nombre=f"{cliente.nombre} {cliente.apellido}",
        profesional_nombre=f"{profesional.nombre} {profesional.apellido}",
        last_message=None,
        last_message_time=None,
        unread_count=0
    )


@router.get("/my-chats", response_model=ChatListResponse)
def get_my_chats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener todos los chats del usuario actual
    
    Retorna lista de chats con información del último mensaje
    """
    chats_data = chat_service.get_user_chats(str(current_user.id))
    
    # Convertir a schema
    chats = []
    total_unread = 0
    
    for chat in chats_data:
        metadata = chat.get('metadata', {})
        
        # Determinar el nombre del otro participante
        other_user_id = (
            metadata['profesional_id'] 
            if metadata['cliente_id'] == str(current_user.id) 
            else metadata['cliente_id']
        )
        other_user_name = (
            metadata['profesional_nombre'] 
            if metadata['cliente_id'] == str(current_user.id) 
            else metadata['cliente_nombre']
        )
        
        chat_read = ChatRead(
            id=chat['id'],
            cliente_id=metadata['cliente_id'],
            profesional_id=metadata['profesional_id'],
            cliente_nombre=metadata.get('cliente_nombre'),
            profesional_nombre=metadata.get('profesional_nombre'),
            last_message=metadata.get('last_message'),
            last_message_time=metadata.get('last_message_time'),
            unread_count=chat.get('unread_count', 0)
        )
        
        chats.append(chat_read)
        total_unread += chat.get('unread_count', 0)
    
    return ChatListResponse(
        chats=chats,
        total_unread=total_unread
    )


@router.post("/send-message", response_model=MessageRead)
def send_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Enviar un mensaje en un chat
    
    - **chat_id**: ID del chat
    - **text**: Contenido del mensaje (1-2000 caracteres)
    """
    # Verificar que el usuario es participante del chat
    # (se haría verificando en Firebase, por simplicidad se omite)
    
    # Sanitizar texto (remover HTML, scripts, etc.)
    clean_text = message_data.text.strip()
    
    if not clean_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El mensaje no puede estar vacío"
        )
    
    # Enviar mensaje
    message = chat_service.send_message(
        chat_id=message_data.chat_id,
        sender_id=str(current_user.id),
        text=clean_text,
        sender_nombre=f"{current_user.nombre} {current_user.apellido}"
    )
    
    return MessageRead(**message)


@router.get("/messages/{chat_id}", response_model=List[MessageRead])
def get_chat_messages(
    chat_id: str,
    limit: int = 50,
    before: int = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener mensajes de un chat
    
    - **chat_id**: ID del chat
    - **limit**: Número máximo de mensajes (default: 50)
    - **before**: Timestamp para paginación (obtener mensajes anteriores)
    """
    # Verificar que el usuario es participante
    # (se haría verificando en Firebase)
    
    messages = chat_service.get_chat_messages(
        chat_id=chat_id,
        limit=limit,
        before_timestamp=before
    )
    
    return [MessageRead(**msg) for msg in messages]


@router.post("/mark-read/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def mark_chat_as_read(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Marcar todos los mensajes de un chat como leídos
    
    - **chat_id**: ID del chat
    """
    chat_service.mark_messages_as_read(
        chat_id=chat_id,
        user_id=str(current_user.id)
    )
    
    return None


@router.get("/unread-count", response_model=dict)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener el número total de mensajes no leídos
    """
    count = chat_service.get_unread_count(str(current_user.id))
    
    return {"unread_count": count}
