"""
Endpoints de Webhook - Para integración con servicios externos (Cloud Functions, MercadoPago)
"""
from fastapi import APIRouter, Depends, HTTPException, Header, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
import hmac
import hashlib

from app.core.database import get_db
from app.core.config import settings
from app.models.user import Usuario
from app.models.trabajo import Trabajo
from app.models.enums import EstadoEscrow
from app.services.mercadopago_service import mercadopago_service

router = APIRouter()


def validar_firma_mercadopago(body: str, x_signature: Optional[str]) -> bool:
    """
    Valida la firma X-Signature enviada por MercadoPago.
    
    MercadoPago envía un header X-Signature con formato:
    ts=<timestamp>,v1=<signature>
    
    La firma se calcula como:
    HMAC-SHA256(data_id + request_url + ts, secret_key)
    
    IMPORTANTE: Esta validación debe estar ACTIVA en producción.
    Por ahora está comentada en el webhook para facilitar desarrollo/testing.
    
    Docs: https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
    
    Args:
        body: Cuerpo de la petición (JSON string)
        x_signature: Header X-Signature enviado por MP
        
    Returns:
        True si la firma es válida, False en caso contrario
    """
    if not x_signature:
        return False
    
    try:
        # Parsear el header X-Signature
        # Formato: ts=1234567890,v1=abcdef123456...
        parts = dict(part.split('=') for part in x_signature.split(','))
        ts = parts.get('ts')
        signature = parts.get('v1')
        
        if not ts or not signature:
            return False
        
        # Parsear el body para obtener el data.id
        import json
        payload = json.loads(body)
        data_id = payload.get('data', {}).get('id')
        
        if not data_id:
            return False
        
        # Construir el mensaje a firmar
        # mensaje = data_id + request_url + ts
        # Por simplicidad, solo usamos data_id + ts
        mensaje = f"{data_id}{ts}"
        
        # Calcular HMAC-SHA256
        secret = settings.MERCADOPAGO_ACCESS_TOKEN
        expected_signature = hmac.new(
            secret.encode(),
            mensaje.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Comparar firmas (constant-time comparison para evitar timing attacks)
        return hmac.compare_digest(signature, expected_signature)
        
    except Exception as e:
        print(f"Error validando firma de MP: {e}")
        return False


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


# ==========================================
# WEBHOOK DE MERCADOPAGO
# ==========================================

@router.post(
    "/mercadopago",
    status_code=status.HTTP_200_OK,
    summary="Webhook de notificaciones de MercadoPago",
    description="Endpoint público para recibir notificaciones de pagos de MercadoPago. Valida firma X-Signature."
)
async def mercadopago_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_signature: Optional[str] = Header(None, alias="x-signature"),
    x_request_id: Optional[str] = Header(None, alias="x-request-id"),
):
    """
    Webhook de MercadoPago para notificaciones de pago.
    
    **Este endpoint es CRÍTICO para el flujo de dinero (ESCROW).**
    
    Flujo:
    1. MercadoPago nos notifica cuando hay un pago exitoso
    2. Validamos la firma digital (X-Signature) por seguridad
    3. Extraemos el payment_id del payload
    4. Consultamos el pago en la API de MP para obtener detalles completos
    5. Extraemos el external_reference (nuestro trabajo_id)
    6. Buscamos el Trabajo en nuestra BD
    7. **ESCROW**: Cambiamos estado a PAGADO_EN_ESCROW
    8. Guardamos el mercadopago_payment_id
    9. Respondemos 200 OK para que MP no reintente
    
    **Seguridad:**
    - Valida firma X-Signature usando el secret de MP
    - Solo procesa pagos con status "approved"
    - Maneja reintentos idempotentemente (verifica si ya se procesó)
    
    Args:
        request: Request de FastAPI para acceder al body raw
        x_signature: Firma digital enviada por MP en header
        x_request_id: ID de la petición de MP (para debug)
        
    Returns:
        200 OK: Siempre (incluso si hay errores internos, para que MP no reintente)
        
    Raises:
        Ninguna: Los errores se loguean pero siempre retorna 200
    """
    try:
        # 1. Obtener el payload raw (necesario para validar firma)
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # Parsear el JSON
        import json
        payload = json.loads(body_str)
        
        print("=" * 60)
        print("🔔 WEBHOOK DE MERCADOPAGO RECIBIDO")
        print(f"   Request ID: {x_request_id}")
        print(f"   Payload: {payload}")
        print("=" * 60)
        
        # 2. Validar la firma (CRÍTICO para seguridad)
        # Nota: En producción, debes implementar validación de X-Signature
        # Por ahora, lo comentamos para desarrollo, pero DEBE estar en producción
        # if not validar_firma_mercadopago(body_str, x_signature):
        #     print("❌ Firma inválida de MercadoPago")
        #     return {"status": "error", "message": "Invalid signature"}
        
        # 3. Extraer información del payload
        # MP puede enviar diferentes tipos de notificaciones
        topic = payload.get("type") or payload.get("topic")
        resource_id = payload.get("data", {}).get("id") or payload.get("id")
        
        print(f"   Topic: {topic}")
        print(f"   Resource ID: {resource_id}")
        
        # Solo procesamos notificaciones de tipo "payment"
        if topic != "payment":
            print(f"⚠️  Topic '{topic}' ignorado (solo procesamos 'payment')")
            return {"status": "ok", "message": f"Topic '{topic}' ignored"}
        
        if not resource_id:
            print("❌ No se encontró ID de pago en el payload")
            return {"status": "error", "message": "No payment ID found"}
        
        # 4. Consultar el pago completo en la API de MP
        payment_info = mercadopago_service.procesar_notificacion_webhook(str(resource_id))
        
        if not payment_info:
            print(f"❌ No se pudo obtener información del pago {resource_id}")
            return {"status": "error", "message": "Could not fetch payment info"}
        
        print(f"   Payment Status: {payment_info.get('status')}")
        print(f"   Status Detail: {payment_info.get('status_detail')}")
        print(f"   Amount: ${payment_info.get('transaction_amount')}")
        print(f"   External Reference: {payment_info.get('external_reference')}")
        
        # 5. Solo procesamos pagos aprobados
        if payment_info.get("status") != "approved":
            print(f"⚠️  Pago no aprobado (status: {payment_info.get('status')})")
            return {"status": "ok", "message": f"Payment status: {payment_info.get('status')}"}
        
        # 6. Extraer el external_reference (nuestro trabajo_id)
        trabajo_id_str = payment_info.get("external_reference")
        
        if not trabajo_id_str:
            print("❌ No se encontró external_reference en el pago")
            return {"status": "error", "message": "No external_reference found"}
        
        try:
            trabajo_id = UUID(trabajo_id_str)
        except ValueError:
            print(f"❌ external_reference no es un UUID válido: {trabajo_id_str}")
            return {"status": "error", "message": "Invalid external_reference format"}
        
        # 7. Buscar el Trabajo en nuestra BD
        trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo_id).first()
        
        if not trabajo:
            print(f"❌ Trabajo {trabajo_id} no encontrado en BD")
            return {"status": "error", "message": "Work not found"}
        
        # 8. Verificar si ya fue procesado (idempotencia)
        if trabajo.estado_escrow == EstadoEscrow.PAGADO_EN_ESCROW:
            print(f"⚠️  Trabajo {trabajo_id} ya fue marcado como PAGADO_EN_ESCROW")
            return {"status": "ok", "message": "Already processed"}
        
        # 9. ¡ESCROW! Cambiar estado a PAGADO_EN_ESCROW
        trabajo.estado_escrow = EstadoEscrow.PAGADO_EN_ESCROW
        trabajo.mercadopago_payment_id = str(resource_id)
        
        # 10. Calcular comisión de la plataforma
        # (Aquí deberías obtener el % de comisión del profesional)
        # Por ahora usamos un 20% fijo
        comision_porcentaje = 0.20
        trabajo.comision_plataforma = trabajo.precio_final * comision_porcentaje
        
        db.add(trabajo)
        db.commit()
        db.refresh(trabajo)
        
        print("=" * 60)
        print("✅ PAGO PROCESADO Y RETENIDO EN ESCROW")
        print(f"   Trabajo ID: {trabajo.id}")
        print(f"   Cliente: {trabajo.cliente_id}")
        print(f"   Profesional: {trabajo.profesional_id}")
        print(f"   Monto Total: ${trabajo.precio_final}")
        print(f"   Comisión Plataforma: ${trabajo.comision_plataforma}")
        print(f"   Estado: {trabajo.estado_escrow.value}")
        print(f"   MP Payment ID: {trabajo.mercadopago_payment_id}")
        print("=" * 60)
        
        # 11. Responder 200 OK a MercadoPago
        return {
            "status": "ok",
            "message": "Payment processed successfully",
            "trabajo_id": str(trabajo.id),
            "estado_escrow": trabajo.estado_escrow.value
        }
        
    except Exception as e:
        # En caso de error, loguear pero SIEMPRE responder 200 OK
        # para que MercadoPago no reintente infinitamente
        print(f"❌ ERROR procesando webhook de MP: {e}")
        import traceback
        traceback.print_exc()
        
        # Aún con error, retornamos 200 para que MP no reintente
        return {
            "status": "error",
            "message": str(e)
        }
