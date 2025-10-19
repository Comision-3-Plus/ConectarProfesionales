"""
Endpoints de Webhook - Para integración con servicios externos (Cloud Functions)
"""
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
from app.core.database import get_db
from app.core.config import settings
from app.models.user import Usuario
from typing import Optional

router = APIRouter()


class ChatInfractionRequest(BaseModel):
    """Request para registrar una infracción de chat"""
    user_id: UUID
    reason: Optional[str] = None


class ChatInfractionResponse(BaseModel):
    """Response de infracción de chat"""
    user_id: UUID
    infracciones_chat: int
    is_chat_banned: bool
    message: str


def verify_webhook_api_key(x_api_key: str = Header(...)):
    """
    Verifica que el API Key del webhook sea correcto.
    Este endpoint NO usa JWT, usa una API Key compartida con la Cloud Function.
    """
    if x_api_key != settings.WEBHOOK_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    return True


@router.post(
    "/chat/infraction",
    response_model=ChatInfractionResponse,
    status_code=status.HTTP_200_OK,
    summary="Registrar infracción de chat",
    description="Endpoint interno para que la Cloud Function registre infracciones de chat. Protegido por API Key."
)
def register_chat_infraction(
    infraction: ChatInfractionRequest,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_webhook_api_key)
):
    """
    Registra una infracción de chat para un usuario.
    
    Sistema de 3 strikes:
    - Si un usuario intenta pasar datos de contacto 3 veces, se le banea del chat.
    - La Cloud Function llama a este endpoint cada vez que detecta una infracción.
    """
    # Buscar el usuario
    usuario = db.query(Usuario).filter(Usuario.id == infraction.user_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario {infraction.user_id} no encontrado"
        )
    
    # Incrementar contador de infracciones
    usuario.infracciones_chat += 1
    
    # Si llega a 3 infracciones, banear del chat
    message = f"Infracción registrada. Total: {usuario.infracciones_chat}"
    if usuario.infracciones_chat >= 3 and not usuario.is_chat_banned:
        usuario.is_chat_banned = True
        message = f"Usuario baneado del chat después de {usuario.infracciones_chat} infracciones"
    
    db.commit()
    db.refresh(usuario)
    
    return ChatInfractionResponse(
        user_id=usuario.id,
        infracciones_chat=usuario.infracciones_chat,
        is_chat_banned=usuario.is_chat_banned,
        message=message
    )
