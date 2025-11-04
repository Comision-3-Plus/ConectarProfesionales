"""
Firebase Custom Token Authentication
Genera tokens personalizados para autenticar usuarios en Firebase
"""
import os
import firebase_admin
from firebase_admin import auth, credentials
import logging

logger = logging.getLogger(__name__)

# Inicializar Firebase Admin (una sola vez)
_firebase_initialized = False

def initialize_firebase_admin():
    """Inicializa Firebase Admin SDK si aún no está inicializado"""
    global _firebase_initialized
    
    if _firebase_initialized:
        return
    
    try:
        # Verificar si ya hay una app inicializada
        firebase_admin.get_app()
        _firebase_initialized = True
        logger.info("✅ Firebase Admin ya estaba inicializado")
        return
    except ValueError:
        pass
    
    try:
        # Intentar cargar credenciales desde archivo
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin inicializado con archivo de credenciales")
        else:
            # Usar credenciales por defecto (requiere GOOGLE_APPLICATION_CREDENTIALS)
            firebase_admin.initialize_app()
            logger.info("✅ Firebase Admin inicializado con credenciales por defecto")
        
        _firebase_initialized = True
    except Exception as e:
        logger.error(f"❌ Error al inicializar Firebase Admin: {e}")
        raise


def create_custom_token(user_id: str, additional_claims: dict = None) -> str:
    """
    Crea un token personalizado de Firebase para un usuario
    
    Args:
        user_id: ID único del usuario
        additional_claims: Claims adicionales a incluir en el token
        
    Returns:
        Token JWT personalizado
    """
    try:
        initialize_firebase_admin()
        
        # Preparar claims
        claims = additional_claims or {}
        
        # Crear token
        token = auth.create_custom_token(user_id, claims)
        
        # El token es bytes, necesitamos decodificarlo a string
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        
        logger.info(f"✅ Token personalizado creado para usuario: {user_id}")
        return token
        
    except Exception as e:
        logger.error(f"❌ Error al crear token personalizado: {e}")
        raise


def verify_custom_token(token: str) -> dict:
    """
    Verifica un token personalizado de Firebase
    
    Args:
        token: Token JWT a verificar
        
    Returns:
        Información decodificada del token
    """
    try:
        initialize_firebase_admin()
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"❌ Error al verificar token: {e}")
        raise
