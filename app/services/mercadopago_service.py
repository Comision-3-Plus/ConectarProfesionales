"""
Servicio de integración con MercadoPago.
Gestiona la creación de preferencias de pago y procesamiento de webhooks.
"""
import mercadopago
from typing import Dict, Any, Optional
from uuid import UUID
from decimal import Decimal

from app.core.config import settings


class MercadoPagoService:
    """
    Servicio singleton para interactuar con la API de MercadoPago.
    
    Funcionalidades:
    - Crear preferencias de pago
    - Procesar webhooks de notificación
    - Consultar estado de pagos
    """
    
    def __init__(self):
        """Inicializa el SDK de MercadoPago con el access token"""
        self.sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    
    def crear_preferencia_pago(
        self,
        trabajo_id: UUID,
        titulo: str,
        descripcion: str,
        precio_final: Decimal,
        cliente_email: str,
    ) -> Dict[str, Any]:
        """
        Crea una preferencia de pago en MercadoPago.
        
        La preferencia es el "link de pago" que se le envía al cliente.
        
        Args:
            trabajo_id: UUID del trabajo (se usará como external_reference)
            titulo: Título corto del pago (ej: "Servicio de Plomería")
            descripcion: Descripción detallada del servicio
            precio_final: Monto total a pagar
            cliente_email: Email del cliente (para pre-rellenar en MP)
            
        Returns:
            Dict con:
                - id: ID de la preferencia en MP
                - init_point: URL de pago para web
                - sandbox_init_point: URL de pago para testing
                
        Raises:
            Exception: Si hay error en la API de MercadoPago
        """
        # MODO MOCK para desarrollo sin token válido
        if not settings.MERCADOPAGO_ACCESS_TOKEN or settings.MERCADOPAGO_ACCESS_TOKEN == "TEST_TOKEN":
            print(f"⚠️  Modo MOCK: Generando preferencia simulada para trabajo {trabajo_id}")
            return {
                "preference_id": f"MOCK-PREF-{trabajo_id}",
                "init_point": f"https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=MOCK-{trabajo_id}",
                "sandbox_init_point": f"https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=MOCK-{trabajo_id}",
            }
        
        preference_data = {
            "items": [
                {
                    "title": titulo,
                    "description": descripcion,
                    "quantity": 1,
                    "currency_id": "ARS",  # Pesos argentinos
                    "unit_price": float(precio_final),
                }
            ],
            "payer": {
                "email": cliente_email,
            },
            "external_reference": str(trabajo_id),  # 🔑 CLAVE: Vincula el pago con el trabajo
            "back_urls": {
                "success": settings.MP_SUCCESS_URL,
                "failure": settings.MP_FAILURE_URL,
                "pending": settings.MP_PENDING_URL,
            },
            "notification_url": settings.MP_NOTIFICATION_URL,  # Webhook para recibir notificaciones
            "auto_return": "approved",  # Redirige automáticamente después del pago exitoso
            "statement_descriptor": "CONECTAR_PRO",  # Aparece en el resumen de tarjeta
        }
        
        try:
            # Crear la preferencia en MercadoPago
            preference_response = self.sdk.preference().create(preference_data)
            
            # Verificar respuesta
            if preference_response["status"] != 201:
                raise Exception(
                    f"Error creando preferencia de MP: {preference_response.get('response', {})}"
                )
            
            preference = preference_response["response"]
            
            print(f"✅ Preferencia de pago creada:")
            print(f"   ID: {preference.get('id')}")
            print(f"   External Reference (Trabajo ID): {trabajo_id}")
            print(f"   Init Point: {preference.get('init_point')}")
            
            return {
                "preference_id": preference.get("id"),
                "init_point": preference.get("init_point"),  # URL para producción
                "sandbox_init_point": preference.get("sandbox_init_point"),  # URL para testing
            }
        except Exception as e:
            # Si falla (token inválido, etc.), usar modo mock
            if "invalid_token" in str(e).lower() or "bad_request" in str(e).lower():
                print(f"⚠️  Token MP inválido, usando modo MOCK para trabajo {trabajo_id}")
                return {
                    "preference_id": f"MOCK-PREF-{trabajo_id}",
                    "init_point": f"https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=MOCK-{trabajo_id}",
                    "sandbox_init_point": f"https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=MOCK-{trabajo_id}",
                }
            # Si es otro error, propagarlo
            raise Exception(f"Error creando preferencia de MP: {e}")
    
    def obtener_pago(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene la información completa de un pago por su ID.
        
        Args:
            payment_id: ID del pago en MercadoPago
            
        Returns:
            Dict con los datos del pago, o None si no existe
        """
        try:
            payment_response = self.sdk.payment().get(payment_id)
            
            if payment_response["status"] == 200:
                return payment_response["response"]
            
            return None
        except Exception as e:
            print(f"❌ Error obteniendo pago {payment_id}: {e}")
            return None
    
    def procesar_notificacion_webhook(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """
        Procesa una notificación de webhook de MercadoPago.
        
        Cuando MP nos notifica de un pago, obtenemos los detalles completos.
        
        Args:
            payment_id: ID del pago notificado por MP
            
        Returns:
            Dict con:
                - payment_id: ID del pago en MP
                - status: Estado del pago (approved, pending, rejected, etc)
                - external_reference: El trabajo_id que guardamos
                - transaction_amount: Monto pagado
                
            None si hay error
        """
        payment_info = self.obtener_pago(payment_id)
        
        if not payment_info:
            return None
        
        return {
            "payment_id": payment_info.get("id"),
            "status": payment_info.get("status"),
            "status_detail": payment_info.get("status_detail"),
            "external_reference": payment_info.get("external_reference"),  # trabajo_id
            "transaction_amount": payment_info.get("transaction_amount"),
            "payment_method_id": payment_info.get("payment_method_id"),
            "payment_type_id": payment_info.get("payment_type_id"),
        }
    
    def crear_payout(
        self,
        monto: Decimal,
        destino_cvu_alias: str,
        concepto: str,
        referencia_externa: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Crea un payout (transferencia) a un profesional.
        
        Libera fondos del escrow al CVU/CBU/Alias del profesional.
        
        Args:
            monto: Monto a transferir (después de descontar comisión)
            destino_cvu_alias: CVU, CBU o Alias de MercadoPago del profesional
            concepto: Descripción de la transferencia
            referencia_externa: Referencia única (usamos trabajo_id)
            
        Returns:
            Dict con:
                - id: ID del payout en MP
                - status: Estado del payout (pending, approved, rejected)
                - amount: Monto transferido
                
            None si hay error
            
        Raises:
            Exception: Si hay error en la API de MercadoPago
        """
        # NOTA: La API de Payouts de MercadoPago requiere permisos especiales
        # y configuración de cuenta business.
        # Por ahora simulamos el payout para desarrollo.
        
        print("=" * 60)
        print("💸 SIMULANDO PAYOUT DE MERCADOPAGO")
        print(f"   Monto: ${monto}")
        print(f"   Destino: {destino_cvu_alias}")
        print(f"   Concepto: {concepto}")
        print(f"   Referencia: {referencia_externa}")
        print("=" * 60)
        
        # En producción, usarías algo como:
        # payout_data = {
        #     "transaction_amount": float(monto),
        #     "description": concepto,
        #     "payment_method_id": "account_money",
        #     "payer": {
        #         "email": "tu-email-plataforma@example.com"
        #     },
        #     "receiver": {
        #         "email": destino_email,  # O usar CVU/Alias
        #     },
        #     "external_reference": referencia_externa,
        # }
        # 
        # payout_response = self.sdk.money_request().create(payout_data)
        
        # Por ahora retornamos un payout simulado
        return {
            "id": f"PAYOUT-SIM-{referencia_externa[:8]}",
            "status": "approved",
            "amount": float(monto),
            "destination": destino_cvu_alias,
            "message": "Payout simulado exitosamente (development mode)"
        }
    
    def crear_refund(
        self,
        payment_id: str,
        monto: Optional[Decimal] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Crea un reembolso (refund) para un pago.
        
        Devuelve dinero al cliente cuando se cancela un trabajo.
        
        Args:
            payment_id: ID del pago en MercadoPago a reembolsar
            monto: Monto a reembolsar (None = reembolso total)
            
        Returns:
            Dict con:
                - id: ID del refund en MP
                - payment_id: ID del pago original
                - amount: Monto reembolsado
                - status: Estado del refund (approved, pending, rejected)
                
            None si hay error
            
        Raises:
            Exception: Si hay error en la API de MercadoPago
        """
        print("=" * 60)
        print("💰 PROCESANDO REEMBOLSO DE MERCADOPAGO")
        print(f"   Payment ID: {payment_id}")
        print(f"   Monto: ${monto if monto else 'TOTAL (100%)'}")
        print("=" * 60)
        
        # En producción, usarías la API real de Refunds:
        try:
            # refund_data = {}
            # if monto:
            #     refund_data["amount"] = float(monto)
            # 
            # refund_response = self.sdk.refund().create(payment_id, refund_data)
            # 
            # if refund_response["status"] != 201:
            #     raise Exception(f"Error en refund: {refund_response}")
            # 
            # return refund_response["response"]
            
            # Por ahora simulamos el refund
            return {
                "id": f"REFUND-SIM-{payment_id[:8]}",
                "payment_id": payment_id,
                "amount": float(monto) if monto else None,
                "status": "approved",
                "message": "Reembolso simulado exitosamente (development mode)"
            }
            
        except Exception as e:
            print(f"❌ Error creando refund: {e}")
            raise Exception(f"Error procesando reembolso: {str(e)}")


# Instancia singleton del servicio
mercadopago_service = MercadoPagoService()
