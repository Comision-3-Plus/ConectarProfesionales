"""
Firebase Services
Servicios de Firebase para backend de Conectar-Profesionales

Incluye:
- Firestore: Base de datos en tiempo real
- Authentication: Custom tokens para autenticación
- Cloud Messaging: Notificaciones push
"""

from .admin import (
    initialize_firebase,
    get_firestore_client,
    get_firebase_app
)

from .auth_service import (
    FirebaseAuthService,
    firebase_auth_service
)

from .messaging_service import (
    FCMService,
    fcm_service
)

__all__ = [
    # Admin
    'initialize_firebase',
    'get_firestore_client',
    'get_firebase_app',
    
    # Auth
    'FirebaseAuthService',
    'firebase_auth_service',
    
    # Messaging
    'FCMService',
    'fcm_service',
]
