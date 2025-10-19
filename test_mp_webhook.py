"""
Script para probar el webhook de MercadoPago localmente.

Simula una notificación de pago aprobado de MercadoPago.

Uso:
    python test_mp_webhook.py <trabajo_id>
"""
import requests
import sys
from uuid import UUID

def test_mp_webhook(trabajo_id: str, payment_id: str = "123456789"):
    """
    Simula una notificación de webhook de MercadoPago.
    
    Args:
        trabajo_id: UUID del trabajo que fue "pagado"
        payment_id: ID de pago ficticio de MP
    """
    # Validar que trabajo_id sea un UUID válido
    try:
        UUID(trabajo_id)
    except ValueError:
        print(f"❌ Error: '{trabajo_id}' no es un UUID válido")
        return
    
    # URL del webhook (ajustar si usas otro puerto/host)
    webhook_url = "http://localhost:8000/api/v1/webhook/mercadopago"
    
    # Payload simulado de MercadoPago
    # Este es el formato que MP envía cuando hay un pago aprobado
    payload = {
        "type": "payment",
        "data": {
            "id": payment_id
        }
    }
    
    # Simular headers de MercadoPago
    headers = {
        "Content-Type": "application/json",
        "x-request-id": "test-request-12345",
        # La firma X-Signature está deshabilitada en desarrollo
        # "x-signature": "ts=1234567890,v1=abcdef123456..."
    }
    
    print("=" * 60)
    print("🧪 TESTEANDO WEBHOOK DE MERCADOPAGO")
    print(f"   URL: {webhook_url}")
    print(f"   Payment ID: {payment_id}")
    print(f"   Trabajo ID (external_reference): {trabajo_id}")
    print("=" * 60)
    
    # Nota: Para que este test funcione, debes:
    # 1. Tener un trabajo creado con el trabajo_id especificado
    # 2. El servicio de MP debe poder consultar el pago (mock necesario)
    
    print("\n⚠️  NOTA: Este es un test simulado.")
    print("   En producción, MercadoPago enviará el payload real.")
    print("   Debes tener configurado MERCADOPAGO_ACCESS_TOKEN en .env")
    print("\nPayload a enviar:")
    print(payload)
    print("\nPresiona ENTER para enviar la petición...")
    input()
    
    try:
        response = requests.post(webhook_url, json=payload, headers=headers)
        
        print("\n" + "=" * 60)
        print("📥 RESPUESTA DEL WEBHOOK")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        print("=" * 60)
        
        if response.status_code == 200:
            print("✅ Webhook procesado correctamente")
        else:
            print("❌ Error procesando webhook")
            
    except Exception as e:
        print(f"\n❌ Error al llamar al webhook: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python test_mp_webhook.py <trabajo_id> [payment_id]")
        print("\nEjemplo:")
        print("  python test_mp_webhook.py 550e8400-e29b-41d4-a716-446655440000")
        sys.exit(1)
    
    trabajo_id = sys.argv[1]
    payment_id = sys.argv[2] if len(sys.argv) > 2 else "123456789"
    
    test_mp_webhook(trabajo_id, payment_id)
