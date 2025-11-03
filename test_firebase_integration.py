"""
Script de prueba para verificar integración de Firebase
Ejecutar con: python test_firebase_integration.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'servicios'))

from shared.firebase import (
    initialize_firebase,
    firebase_auth_service,
    fcm_service,
    get_firestore_client
)

def test_firebase_initialization():
    """Prueba 1: Verificar inicialización de Firebase"""
    print("\n" + "="*60)
    print("PRUEBA 1: Inicialización de Firebase")
    print("="*60)
    
    try:
        app = initialize_firebase()
        print("✅ Firebase inicializado correctamente")
        print(f"   Proyecto: {app.project_id}")
        return True
    except Exception as e:
        print(f"❌ Error al inicializar Firebase: {e}")
        return False


def test_firestore_connection():
    """Prueba 2: Verificar conexión a Firestore"""
    print("\n" + "="*60)
    print("PRUEBA 2: Conexión a Firestore")
    print("="*60)
    
    try:
        db = get_firestore_client()
        
        # Crear un documento de prueba
        test_ref = db.collection('test').document('connection_test')
        test_ref.set({
            'timestamp': 'test',
            'message': 'Prueba de conexión desde Python'
        })
        
        # Leer el documento
        doc = test_ref.get()
        if doc.exists:
            print("✅ Conexión a Firestore exitosa")
            print(f"   Datos: {doc.to_dict()}")
            
            # Eliminar documento de prueba
            test_ref.delete()
            print("✅ Documento de prueba eliminado")
            return True
        else:
            print("⚠️  Documento no encontrado")
            return False
            
    except Exception as e:
        print(f"❌ Error en Firestore: {e}")
        return False


def test_custom_token_creation():
    """Prueba 3: Crear custom token de autenticación"""
    print("\n" + "="*60)
    print("PRUEBA 3: Creación de Custom Token")
    print("="*60)
    
    try:
        token = firebase_auth_service.create_custom_token(
            user_id="test_user_123",
            additional_claims={
                "email": "test@example.com",
                "role": "profesional",
                "nombre": "Usuario de Prueba"
            }
        )
        
        print("✅ Custom token creado correctamente")
        print(f"   Token (primeros 50 caracteres): {token[:50]}...")
        print(f"   Longitud del token: {len(token)} caracteres")
        return True
        
    except Exception as e:
        print(f"❌ Error al crear custom token: {e}")
        return False


def test_chat_structure():
    """Prueba 4: Verificar estructura de datos de chat"""
    print("\n" + "="*60)
    print("PRUEBA 4: Estructura de datos de chat")
    print("="*60)
    
    try:
        db = get_firestore_client()
        
        # Crear chat de prueba
        chat_ref = db.collection('chats').document('test_chat_123')
        chat_ref.set({
            'participants': ['user1', 'user2'],
            'participantsData': {
                'user1': {
                    'name': 'Usuario 1',
                    'role': 'cliente'
                },
                'user2': {
                    'name': 'Usuario 2',
                    'role': 'profesional'
                }
            },
            'trabajoId': 'trabajo_test',
            'createdAt': 'test_timestamp',
            'updatedAt': 'test_timestamp'
        })
        
        print("✅ Chat de prueba creado")
        
        # Crear mensaje de prueba
        message_ref = db.collection('messages').document('test_chat_123').collection('messages').document('msg1')
        message_ref.set({
            'senderId': 'user1',
            'senderName': 'Usuario 1',
            'text': '¡Hola! Este es un mensaje de prueba',
            'timestamp': 'test_timestamp',
            'read': False,
            'type': 'text'
        })
        
        print("✅ Mensaje de prueba creado")
        
        # Verificar lectura
        chat_doc = chat_ref.get()
        if chat_doc.exists:
            print("✅ Chat verificado en Firestore")
            print(f"   Participantes: {chat_doc.to_dict()['participants']}")
        
        # Limpiar
        message_ref.delete()
        chat_ref.delete()
        print("✅ Datos de prueba eliminados")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en estructura de chat: {e}")
        return False


def main():
    """Ejecutar todas las pruebas"""
    print("\n" + "🔥"*30)
    print("   PRUEBAS DE INTEGRACIÓN DE FIREBASE")
    print("🔥"*30)
    
    results = []
    
    # Ejecutar pruebas
    results.append(("Inicialización", test_firebase_initialization()))
    results.append(("Firestore", test_firestore_connection()))
    results.append(("Custom Token", test_custom_token_creation()))
    results.append(("Chat Structure", test_chat_structure()))
    
    # Resumen
    print("\n" + "="*60)
    print("RESUMEN DE PRUEBAS")
    print("="*60)
    
    passed = 0
    failed = 0
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("\n" + "="*60)
    print(f"Total: {passed} pruebas exitosas, {failed} pruebas fallidas")
    print("="*60)
    
    if failed == 0:
        print("\n🎉 ¡Todas las pruebas pasaron! Firebase está completamente integrado.")
        print("\n📝 Próximos pasos:")
        print("   1. Integrar endpoints en la API Gateway")
        print("   2. Desplegar reglas de Firestore: firebase deploy --only firestore:rules")
        print("   3. Probar el chat desde el frontend")
    else:
        print("\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
