"""
Firebase Endpoints
Endpoints para integración con Firebase desde el frontend
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from shared.firebase import firebase_auth_service, fcm_service
from shared.auth.dependencies import get_current_user
from shared.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/firebase", tags=["Firebase"])


# ============================================================================
# SCHEMAS
# ============================================================================

class FirebaseTokenResponse(BaseModel):
    """Respuesta con Firebase custom token"""
    firebaseToken: str
    userId: str


class FCMTokenRequest(BaseModel):
    """Request para guardar FCM token"""
    fcmToken: str
    platform: str = 'web'


class FCMTokenResponse(BaseModel):
    """Respuesta al guardar FCM token"""
    message: str
    success: bool


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/token", response_model=FirebaseTokenResponse)
async def get_firebase_token(
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene un custom token de Firebase para el usuario autenticado.
    
    Este token permite al cliente autenticarse en Firebase usando
    las credenciales del backend.
    
    **Flujo:**
    1. Cliente se autentica en el backend (JWT)
    2. Cliente llama a este endpoint con su JWT
    3. Backend genera un Firebase custom token
    4. Cliente usa el token con `signInWithCustomToken()` en Firebase
    
    **Returns:**
    - firebaseToken: Token para autenticarse en Firebase
    - userId: ID del usuario
    """
    try:
        # Crear claims adicionales
        claims = {
            'email': current_user.email,
            'role': current_user.role.value if hasattr(current_user, 'role') else 'cliente',
            'nombre': getattr(current_user, 'nombre', ''),
            'apellido': getattr(current_user, 'apellido', ''),
        }
        
        # Generar custom token
        firebase_token = firebase_auth_service.create_custom_token(
            user_id=str(current_user.id),
            additional_claims=claims
        )
        
        logger.info(f"✅ Firebase token generado para usuario: {current_user.id}")
        
        return FirebaseTokenResponse(
            firebaseToken=firebase_token,
            userId=str(current_user.id)
        )
        
    except Exception as e:
        logger.error(f"❌ Error al generar Firebase token: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error al generar token de Firebase"
        )


@router.post("/fcm-token", response_model=FCMTokenResponse)
async def save_fcm_token(
    request: FCMTokenRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Guarda el FCM token del usuario para notificaciones push.
    
    **Parámetros:**
    - fcmToken: Token FCM del dispositivo
    - platform: Plataforma (web, android, ios)
    
    **Returns:**
    - message: Mensaje de confirmación
    - success: Estado de la operación
    """
    try:
        await fcm_service.save_fcm_token(
            user_id=str(current_user.id),
            token=request.fcmToken,
            platform=request.platform
        )
        
        logger.info(f"✅ FCM token guardado para usuario: {current_user.id}")
        
        return FCMTokenResponse(
            message="Token FCM guardado correctamente",
            success=True
        )
        
    except Exception as e:
        logger.error(f"❌ Error al guardar FCM token: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error al guardar token FCM"
        )


@router.delete("/fcm-token")
async def delete_fcm_token(
    current_user: User = Depends(get_current_user)
):
    """
    Elimina el FCM token del usuario.
    
    Útil cuando el usuario cierra sesión o deshabilita las notificaciones.
    """
    try:
        from shared.firebase import get_firestore_client
        
        db = get_firestore_client()
        db.collection('fcm_tokens').document(str(current_user.id)).delete()
        
        logger.info(f"✅ FCM token eliminado para usuario: {current_user.id}")
        
        return {"message": "Token FCM eliminado", "success": True}
        
    except Exception as e:
        logger.error(f"❌ Error al eliminar FCM token: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar token FCM"
        )
