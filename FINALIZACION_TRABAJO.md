# Finalización de Trabajo y Liberación de Fondos

## Endpoint
`POST /api/v1/cliente/trabajo/{trabajo_id}/finalizar`

## ¿Qué hace?
Permite al cliente marcar un trabajo como completado y libera los fondos retenidos en escrow al profesional.

## Flujo de Liberación de Escrow

```
Cliente acepta oferta
    ↓
Pago recibido → PAGADO_EN_ESCROW
    ↓
Profesional realiza el trabajo
    ↓
Cliente finaliza trabajo ← ESTAMOS AQUÍ
    ↓
Sistema calcula comisión
    ↓
Estado → LIBERADO
    ↓
💸 Payout ejecutado al profesional
```

## Autenticación
- **Requerida**: Sí (JWT Token del cliente)
- **Validación**: Solo el cliente dueño del trabajo puede finalizarlo

## Request

### Path Parameters
- `trabajo_id` (UUID): ID del trabajo a finalizar

### Headers
```
Authorization: Bearer <jwt_token>
```

## Validaciones Pre-Ejecución

### 1. Validación de Estado
```python
if trabajo.estado_escrow != "PAGADO_EN_ESCROW":
    return 400 Bad Request
```

### 2. Validación de Payout Account
```python
if not profesional.payout_account:
    return 400 Bad Request
    message: "Profesional no ha configurado cuenta de pago"
```

### 3. Validación de Propiedad
```python
if trabajo.cliente_id != current_user.id:
    return 403 Forbidden
```

## Cálculo de Comisión

La comisión se calcula según el **nivel de gamificación** del profesional:

| Nivel | Tasa Comisión |
|-------|---------------|
| BRONCE | 20% |
| PLATA | 15% |
| ORO | 10% |
| DIAMANTE | 5% |

### Ejemplo de Cálculo:
```python
precio_final = 5000.00  # Lo que pagó el cliente
tasa_comision = 0.20    # 20% para nivel BRONCE

comision_plataforma = 5000.00 * 0.20 = 1000.00
monto_a_liberar = 5000.00 - 1000.00 = 4000.00
```

## Operaciones Ejecutadas

### 1. Actualización en Base de Datos
```python
trabajo.estado_escrow = "LIBERADO"
trabajo.comision_plataforma = comision_nuestra
trabajo.monto_liberado = monto_a_liberar
db.commit()
```

### 2. Payout en MercadoPago
```python
mercadopago_service.crear_payout(
    monto=monto_a_liberar,
    destino_cvu_alias=profesional.payout_account,
    concepto=f"Pago por servicio - Trabajo {trabajo_id}",
    referencia_externa=str(trabajo_id)
)
```

### 3. Notificación en Chat (Firestore)
```python
firebase_service.send_message_to_chat(
    chat_id=oferta.chat_id,
    text=f"✅ Trabajo finalizado. Fondos liberados: ${monto_a_liberar}",
    type="info"
)
```

## Response

### Success (200 OK)
```json
{
  "trabajo": {
    "id": "uuid-del-trabajo",
    "cliente_id": "uuid-cliente",
    "profesional_id": "uuid-profesional",
    "precio_final": 5000.00,
    "comision_plataforma": 1000.00,
    "monto_liberado": 4000.00,
    "estado_escrow": "LIBERADO",
    "mercadopago_payment_id": "123456789",
    "fecha_creacion": "2025-10-19T10:00:00Z",
    "fecha_actualizacion": "2025-10-19T14:30:00Z"
  },
  "payout_id": "PAYOUT-SIM-12345678",
  "mensaje": "Trabajo finalizado exitosamente. Se liberaron $4000.00 al profesional."
}
```

### Errores

#### 404 Not Found
```json
{
  "detail": "Trabajo no encontrado"
}
```

#### 403 Forbidden
```json
{
  "detail": "Este trabajo no te pertenece"
}
```

#### 400 Bad Request - Estado Incorrecto
```json
{
  "detail": "No se puede finalizar un trabajo en estado PENDIENTE_PAGO. El trabajo debe estar en estado PAGADO_EN_ESCROW."
}
```

#### 400 Bad Request - Sin Payout Account
```json
{
  "detail": "El profesional no ha configurado su cuenta de pago. No se pueden liberar los fondos."
}
```

#### 500 Internal Server Error - Error de Payout
```json
{
  "detail": "Error liberando fondos: <error>. El trabajo fue marcado como LIBERADO pero el payout falló."
}
```

## Logs del Sistema

```
============================================================
💰 CÁLCULO DE LIBERACIÓN DE FONDOS
   Precio Final: $5000.00
   Tasa Comisión: 20.0% (Nivel: BRONCE)
   Comisión Plataforma: $1000.00
   Monto a Liberar: $4000.00
   Destino: tu.alias.mp
============================================================
✅ Trabajo actualizado en BD:
   Estado: LIBERADO
   Comisión guardada: $1000.00
   Monto liberado: $4000.00
============================================================
💸 SIMULANDO PAYOUT DE MERCADOPAGO
   Monto: $4000.00
   Destino: tu.alias.mp
   Concepto: Pago por servicio - Trabajo uuid-del-trabajo
   Referencia: uuid-del-trabajo
============================================================
💸 Payout ejecutado:
   Payout ID: PAYOUT-SIM-12345678
   Status: approved
============================================================
🎉 TRABAJO FINALIZADO Y FONDOS LIBERADOS
   Trabajo ID: uuid-del-trabajo
   Cliente: uuid-cliente
   Profesional: uuid-profesional
   Payout ID: PAYOUT-SIM-12345678
============================================================
```

## Testing

### Usando curl:
```bash
# 1. Obtener token del cliente
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=cliente@example.com&password=Password123!" \
  | jq -r '.access_token')

# 2. Finalizar trabajo
curl -X POST http://localhost:8000/api/v1/cliente/trabajo/<trabajo_id>/finalizar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

## Orden de Operaciones (CRÍTICO)

**¿Por qué actualizamos la BD ANTES del payout?**

1. **Atomicidad de transacción**: La actualización en BD es transaccional
2. **Idempotencia**: Si el payout falla pero se reintenta, no duplicamos
3. **Auditabilidad**: Tenemos registro del intento incluso si falla el payout
4. **Recovery**: Podemos implementar jobs que reintentan payouts pendientes

## Estados del Trabajo

| Estado | Descripción | Puede Finalizar |
|--------|-------------|-----------------|
| `PENDIENTE_PAGO` | Esperando pago del cliente | ❌ |
| `PAGADO_EN_ESCROW` | Dinero retenido, esperando finalización | ✅ |
| `LIBERADO` | Fondos liberados al profesional | ❌ (ya finalizado) |
| `CANCELADO_REEMBOLSADO` | Trabajo cancelado | ❌ |

## Endpoints Relacionados

- `GET /api/v1/cliente/trabajos` - Listar todos los trabajos del cliente
- `GET /api/v1/cliente/trabajo/{trabajo_id}` - Ver detalles de un trabajo
- `POST /api/v1/cliente/ofertas/{oferta_id}/accept` - Aceptar oferta (crea trabajo)

## Próximos Pasos (Módulo 6)

Después de finalizar el trabajo:
1. ✅ Fondos liberados al profesional
2. ⏳ Sistema de calificaciones se activa
3. ⏳ Cliente puede calificar al profesional
4. ⏳ Profesional puede calificar al cliente

## Nota de Desarrollo

El payout de MercadoPago está **simulado** en desarrollo. Para producción necesitas:

1. Cuenta business de MercadoPago
2. Activar permisos de Money Out API
3. Configurar correctamente las credenciales
4. Implementar la API real de payouts:

```python
# Producción (ejemplo):
payout_data = {
    "transaction_amount": float(monto),
    "description": concepto,
    "payment_method_id": "account_money",
    "receiver": {
        "email": profesional_email
    }
}
payout_response = sdk.money_request().create(payout_data)
```
