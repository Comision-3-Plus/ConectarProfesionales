"""
Firebase Authentication Service
Servicio para autenticación con Firebase usando Custom Tokens
"""

from firebase_admin import auth
from .admin import get_firebase_app
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class FirebaseAuthService:
    """Servicio para autenticación con Firebase"""
    
    @staticmethod
    def create_custom_token(
        user_id: str, 
        additional_claims: Optional[Dict] = None
    ) -> str:
        """
        Crea un custom token de Firebase para autenticar usuarios.
        
        Este token permite que el usuario se autentique en Firebase
        usando las credenciales del backend.
        
        Args:
            user_id: ID del usuario (tu user_id de PostgreSQL)
            additional_claims: Claims adicionales (ej: role, email, nombre)
        
        Returns:
            str: Token de Firebase (debe ser enviado al cliente)
        
        Example:
            ```python
            token = FirebaseAuthService.create_custom_token(
                user_id="123",
                additional_claims={
                    "email": "user@example.com",
                    "role": "profesional",
                    "nombre": "Juan Pérez"
                }
            )
            # El cliente usa este token con signInWithCustomToken()
            ```
        """
        try:
            get_firebase_app()  # Asegurar que Firebase está inicializado
            
            claims = additional_claims or {}
            
            # Convertir user_id a string si no lo es
            uid = str(user_id)
            
            # Crear el custom token
            custom_token = auth.create_custom_token(uid, claims)
            
            # El token es bytes, convertir a string
            if isinstance(custom_token, bytes):
                custom_token = custom_token.decode('utf-8')
            
            logger.info(f"✅ Custom token creado para usuario: {uid}")
            return custom_token
            
        except Exception as e:
            logger.error(f"❌ Error al crear custom token: {e}")
            raise
    
    @staticmethod
    def verify_id_token(id_token: str) -> Dict:
        """
        Verifica un ID token de Firebase enviado por el cliente.
        
        Args:
            id_token: Token de Firebase del cliente
        
        Returns:
            Dict: Datos decodificados del token (incluye uid, email, etc.)
        
        Raises:
            auth.InvalidIdTokenError: Si el token es inválido
            auth.ExpiredIdTokenError: Si el token expiró
        
        Example:
            ```python
            try:
                decoded_token = FirebaseAuthService.verify_id_token(token)
                user_id = decoded_token['uid']
                email = decoded_token.get('email')
            except auth.InvalidIdTokenError:
                # Token inválido
                pass
            ```
        """
        try:
            get_firebase_app()  # Asegurar que Firebase está inicializado
            
            # Verificar el token
            decoded_token = auth.verify_id_token(id_token)
            
            logger.info(f"✅ Token verificado para usuario: {decoded_token['uid']}")
            return decoded_token
            
        except auth.InvalidIdTokenError as e:
            logger.error(f"❌ Token inválido: {e}")
            raise
        except auth.ExpiredIdTokenError as e:
            logger.error(f"❌ Token expirado: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Error al verificar token: {e}")
            raise
    
    @staticmethod
    def revoke_refresh_tokens(user_id: str) -> None:
        """
        Revoca todos los refresh tokens de un usuario.
        
        Útil para cerrar sesión forzadamente o cuando se detecta
        actividad sospechosa.
        
        Args:
            user_id: ID del usuario
        """
        try:
            get_firebase_app()  # Asegurar que Firebase está inicializado
            
            uid = str(user_id)
            auth.revoke_refresh_tokens(uid)
            
            logger.info(f"✅ Refresh tokens revocados para usuario: {uid}")
            
        except Exception as e:
            logger.error(f"❌ Error al revocar tokens: {e}")
            raise
    
    @staticmethod
    def get_user(user_id: str) -> auth.UserRecord:
        """
        Obtiene información de un usuario de Firebase.
        
        Args:
            user_id: ID del usuario
        
        Returns:
            auth.UserRecord: Información del usuario
        """
        try:
            get_firebase_app()  # Asegurar que Firebase está inicializado
            
            uid = str(user_id)
            user = auth.get_user(uid)
            
            return user
            
        except auth.UserNotFoundError:
            logger.warning(f"⚠️ Usuario no encontrado en Firebase: {user_id}")
            raise
        except Exception as e:
            logger.error(f"❌ Error al obtener usuario: {e}")
            raise
    
    @staticmethod
    def delete_user(user_id: str) -> None:
        """
        Elimina un usuario de Firebase Auth.
        
        Args:
            user_id: ID del usuario
        """
        try:
            get_firebase_app()  # Asegurar que Firebase está inicializado
            
            uid = str(user_id)
            auth.delete_user(uid)
            
            logger.info(f"✅ Usuario eliminado de Firebase: {uid}")
            
        except auth.UserNotFoundError:
            logger.warning(f"⚠️ Usuario no encontrado en Firebase: {user_id}")
        except Exception as e:
            logger.error(f"❌ Error al eliminar usuario: {e}")
            raise


# Instancia singleton
firebase_auth_service = FirebaseAuthService()
