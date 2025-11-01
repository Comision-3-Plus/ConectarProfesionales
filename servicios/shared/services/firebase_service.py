"""
Servicio de Firebase para integración con Firestore
"""
import os
import json
from typing import Dict, Any, Optional
from datetime import datetime
from uuid import UUID


class FirebaseService:
    """
    Servicio para interactuar con Firebase/Firestore.
    Maneja la comunicación con el chat en tiempo real.
    """
    
    def __init__(self):
        """
        Inicializa el servicio de Firebase.
        En producción, usar el SDK de Admin de Firebase.
        """
        self._initialized = False
        self._db = None
        
        # Intentar inicializar Firebase Admin SDK
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            
            # Buscar el archivo de credenciales
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "/code/firebase-credentials.json")
            
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                if not firebase_admin._apps:
                    firebase_admin.initialize_app(cred)
                self._db = firestore.client()
                self._initialized = True
                print("✅ Firebase Admin SDK inicializado correctamente")
            else:
                print(f"⚠️ Archivo de credenciales no encontrado: {cred_path}")
                print("⚠️ Firebase funcionará en modo simulado (para desarrollo)")
        except ImportError:
            print("⚠️ firebase-admin no instalado. Funcionando en modo simulado.")
        except Exception as e:
            print(f"⚠️ Error al inicializar Firebase: {e}")
    
    def send_oferta_to_chat(
        self,
        chat_id: str,
        oferta_id: UUID,
        profesional_id: UUID,
        descripcion: str,
        precio_final: float
    ) -> bool:
        """
        Envía un mensaje especial de tipo 'oferta' al chat de Firestore.
        
        Args:
            chat_id: ID del chat en Firestore
            oferta_id: ID de la oferta en Postgres
            profesional_id: ID del profesional que envía la oferta
            descripcion: Descripción del servicio
            precio_final: Precio de la oferta
            
        Returns:
            True si se envió correctamente, False en caso contrario
        """
        if not self._initialized or not self._db:
            print(f"⚠️ Firebase no inicializado. Simulando envío de oferta al chat {chat_id}")
            print(f"   Oferta ID: {oferta_id}, Precio: ${precio_final}")
            return True  # En desarrollo, simular éxito
        
        try:
            # Referencia a la colección de mensajes del chat
            messages_ref = self._db.collection('chats').document(chat_id).collection('messages')
            
            # Crear el mensaje especial de tipo 'oferta'
            message_data = {
                'type': 'oferta',
                'oferta_id': str(oferta_id),
                'senderId': str(profesional_id),
                'descripcion': descripcion,
                'precio_final': precio_final,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'read': False
            }
            
            # Agregar el mensaje a Firestore
            messages_ref.add(message_data)
            
            print(f"✅ Mensaje de oferta enviado al chat {chat_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error al enviar oferta a Firestore: {e}")
            return False
    
    def send_message_to_chat(
        self,
        chat_id: str,
        sender_id: UUID,
        text: str,
        message_type: str = "text"
    ) -> bool:
        """
        Envía un mensaje de texto normal al chat.
        
        Args:
            chat_id: ID del chat en Firestore
            sender_id: ID del usuario que envía el mensaje
            text: Contenido del mensaje
            message_type: Tipo de mensaje (default: "text")
            
        Returns:
            True si se envió correctamente, False en caso contrario
        """
        if not self._initialized or not self._db:
            print(f"⚠️ Firebase no inicializado. Simulando envío de mensaje al chat {chat_id}")
            return True
        
        try:
            from firebase_admin import firestore
            
            messages_ref = self._db.collection('chats').document(chat_id).collection('messages')
            
            message_data = {
                'type': message_type,
                'text': text,
                'senderId': str(sender_id),
                'createdAt': firestore.SERVER_TIMESTAMP,
                'read': False
            }
            
            messages_ref.add(message_data)
            print(f"✅ Mensaje enviado al chat {chat_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error al enviar mensaje a Firestore: {e}")
            return False


# Instancia global del servicio
firebase_service = FirebaseService()
