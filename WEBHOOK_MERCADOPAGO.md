# Webhook de MercadoPago - Documentación

## Endpoint
`POST /api/v1/webhook/mercadopago`

## ¿Qué hace?
Este endpoint es llamado automáticamente por MercadoPago cuando ocurre un evento de pago (aprobado, rechazado, pendiente, etc).

## Flujo de Escrow

```
Cliente acepta oferta
    ↓
Se crea Trabajo (PENDIENTE_PAGO)
    ↓
Se genera link de pago MP
    ↓
Cliente paga en MP
    ↓
MP llama a nuestro webhook ← ESTAMOS AQUÍ
    ↓
Cambiamos Trabajo a PAGADO_EN_ESCROW
    ↓
💰 Dinero retenido hasta completar servicio
```

## Estructura del Webhook

### 1. MercadoPago envía notificación
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"  // Payment ID en MP
  }
}
```

### 2. Consultamos el pago completo en MP API
```python
payment_info = mercadopago_service.obtener_pago("123456789")
```

### 3. Extraemos datos clave
```json
{
  "status": "approved",
  "external_reference": "uuid-del-trabajo",
  "transaction_amount": 5000.00,
  "payment_method_id": "visa"
}
```

### 4. Actualizamos el Trabajo
```python
trabajo.estado_escrow = "PAGADO_EN_ESCROW"
trabajo.mercadopago_payment_id = "123456789"
trabajo.comision_plataforma = precio_final * 0.20
```

## Seguridad

### Validación de Firma (X-Signature)
MercadoPago envía un header `X-Signature` para validar autenticidad:

```
X-Signature: ts=1234567890,v1=abcdef123456...
```

**IMPORTANTE:** La validación está comentada en desarrollo pero **DEBE** estar activa en producción.

```python
# Activar en producción:
if not validar_firma_mercadopago(body_str, x_signature):
    return {"status": "error", "message": "Invalid signature"}
```

## Idempotencia
El webhook maneja reintentos de MP:
- Si el trabajo ya está en `PAGADO_EN_ESCROW`, retorna OK sin hacer nada
- MP puede llamar múltiples veces al webhook (reintentos)

## Respuesta
**SIEMPRE retorna 200 OK** (incluso con errores internos) para que MP no reintente infinitamente.

```json
{
  "status": "ok",
  "message": "Payment processed successfully",
  "trabajo_id": "uuid-del-trabajo",
  "estado_escrow": "PAGADO_EN_ESCROW"
}
```

## Testing Local

### 1. Usando el script de prueba:
```bash
python test_mp_webhook.py <trabajo_id>
```

### 2. Usando curl:
```bash
curl -X POST http://localhost:8000/api/v1/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-request-id: test-123" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

**NOTA:** Para testing completo necesitas:
1. Un trabajo creado en BD con estado `PENDIENTE_PAGO`
2. Configurar `MERCADOPAGO_ACCESS_TOKEN` en `.env`
3. Mock del servicio de MP para que devuelva datos del pago

## Variables de Entorno Necesarias
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789-...
MP_NOTIFICATION_URL=https://tu-dominio.com/api/v1/webhook/mercadopago
```

## Estados del Escrow

| Estado | Descripción |
|--------|-------------|
| `PENDIENTE_PAGO` | Cliente aceptó oferta, esperando pago |
| `PAGADO_EN_ESCROW` | ✅ Pago recibido y retenido |
| `LIBERADO` | Dinero liberado al profesional |
| `CANCELADO_REEMBOLSADO` | Trabajo cancelado, dinero devuelto |

## Logs
El webhook imprime logs detallados:
```
============================================================
🔔 WEBHOOK DE MERCADOPAGO RECIBIDO
   Request ID: xyz-123
   Payload: {...}
============================================================
   Topic: payment
   Resource ID: 123456789
   Payment Status: approved
   Status Detail: accredited
   Amount: $5000.00
   External Reference: uuid-del-trabajo
============================================================
✅ PAGO PROCESADO Y RETENIDO EN ESCROW
   Trabajo ID: uuid-del-trabajo
   Cliente: uuid-cliente
   Profesional: uuid-profesional
   Monto Total: $5000.00
   Comisión Plataforma: $1000.00
   Estado: PAGADO_EN_ESCROW
   MP Payment ID: 123456789
============================================================
```

## Próximos Pasos (Ticket 5.6)
Después de que el trabajo esté en `PAGADO_EN_ESCROW`, el profesional debe poder:
1. Marcar el trabajo como completado
2. Sistema libera el dinero automáticamente
3. Estado cambia a `LIBERADO`
4. `monto_liberado` = `precio_final` - `comision_plataforma`
