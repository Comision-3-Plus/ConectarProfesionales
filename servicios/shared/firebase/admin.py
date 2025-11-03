"""
Firebase Admin SDK - Configuración
Inicialización de Firebase Admin para el backend

IMPORTANTE: Necesitas descargar el archivo de credenciales desde:
Firebase Console -> Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada

Guarda el archivo como: firebase-service-account.json
NO lo subas a Git (está en .gitignore)
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, messaging
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Variables globales para las instancias
_app: Optional[firebase_admin.App] = None
_db: Optional[firestore.Client] = None


def initialize_firebase():
    """
    Inicializa Firebase Admin SDK
    
    Busca las credenciales en el siguiente orden:
    1. Variable de entorno FIREBASE_CREDENTIALS_PATH
    2. Variable de entorno GOOGLE_APPLICATION_CREDENTIALS
    3. Archivo firebase-service-account.json en la raíz del proyecto
    """
    global _app, _db
    
    if _app is not None:
        logger.info("Firebase Admin SDK ya está inicializado")
        return _app
    
    try:
        # Buscar archivo de credenciales
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        
        if not cred_path:
            cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        
        if not cred_path:
            # Buscar en la raíz del proyecto
            cred_path = os.path.join(
                os.path.dirname(__file__), 
                '..', '..', '..', 
                'firebase-service-account.json'
            )
        
        if not os.path.exists(cred_path):
            raise FileNotFoundError(
                f"❌ Archivo de credenciales de Firebase no encontrado en: {cred_path}\n"
                "Descarga el archivo desde Firebase Console -> Configuración -> Cuentas de servicio"
            )
        
        # Inicializar con credenciales
        cred = credentials.Certificate(cred_path)
        _app = firebase_admin.initialize_app(cred)
        _db = firestore.client()
        
        logger.info("✅ Firebase Admin SDK inicializado correctamente")
        return _app
        
    except Exception as e:
        logger.error(f"❌ Error al inicializar Firebase Admin SDK: {e}")
        raise


def get_firestore_client() -> firestore.Client:
    """
    Obtiene el cliente de Firestore
    
    Returns:
        firestore.Client: Cliente de Firestore
    """
    global _db
    
    if _db is None:
        initialize_firebase()
    
    return _db


def get_firebase_app() -> firebase_admin.App:
    """
    Obtiene la instancia de Firebase App
    
    Returns:
        firebase_admin.App: Instancia de Firebase
    """
    global _app
    
    if _app is None:
        initialize_firebase()
    
    return _app


# Inicializar automáticamente cuando se importa el módulo
try:
    initialize_firebase()
except Exception as e:
    logger.warning(f"⚠️ No se pudo inicializar Firebase automáticamente: {e}")
    logger.warning("Firebase se inicializará cuando se llame a las funciones de acceso")
