# Endpoints de Cliente - Gestión de Ofertas

## ✅ Implementación Completada

### Endpoints Creados

#### 1. Listar Ofertas Recibidas
**GET** `/api/v1/cliente/ofertas`

**Autenticación**: JWT (cualquier usuario autenticado)

**Response** (200):
```json
[
  {
    "id": "uuid1",
    "profesional_id": "uuid-prof",
    "cliente_id": "uuid-cliente",
    "chat_id": "chat-123",
    "descripcion": "Instalación de aire acondicionado...",
    "precio_final": 1500.00,
    "estado": "OFERTADO",
    "fecha_creacion": "2025-10-19T14:30:00",
    "fecha_actualizacion": "2025-10-19T14:30:00"
  },
  {
    "id": "uuid2",
    "profesional_id": "uuid-prof2",
    "cliente_id": "uuid-cliente",
    "chat_id": "chat-124",
    "descripcion": "Reparación de plomería...",
    "precio_final": 800.00,
    "estado": "ACEPTADO",
    "fecha_creacion": "2025-10-18T10:00:00",
    "fecha_actualizacion": "2025-10-18T11:30:00"
  }
]
```

---

#### 2. ⭐ Aceptar Oferta (DISPARADOR MÓDULO 5)
**POST** `/api/v1/cliente/ofertas/{oferta_id}/accept`

**Autenticación**: JWT (cualquier usuario autenticado)

**Path Parameters**:
- `oferta_id`: UUID de la oferta a aceptar

**Response** (200):
```json
{
  "id": "uuid-oferta",
  "profesional_id": "uuid-profesional",
  "cliente_id": "uuid-cliente",
  "chat_id": "firestore-chat-id",
  "descripcion": "Instalación de aire acondicionado split 3000 frigorías",
  "precio_final": 1500.00,
  "estado": "ACEPTADO",
  "fecha_creacion": "2025-10-19T14:30:00",
  "fecha_actualizacion": "2025-10-19T15:45:00"
}
```

**⚠️ ESTE ES EL DISPARADOR DEL MÓDULO 5 (Pagos)**

La respuesta contiene:
- ✅ `id`: UUID de la oferta (para trackear el pago)
- ✅ `precio_final`: Monto exacto a pagar
- ✅ `descripcion`: Descripción del servicio contratado
- ✅ `profesional_id`: ID del profesional que recibirá el pago
- ✅ `estado`: "ACEPTADO" (confirmación de aceptación)

**Validaciones**:
- ✅ La oferta debe existir
- ✅ La oferta debe pertenecer al cliente actual
- ✅ La oferta debe estar en estado "OFERTADO"
- ❌ Error 404 si no existe
- ❌ Error 403 si no pertenece al cliente
- ❌ Error 400 si ya fue aceptada/rechazada

**Efectos Secundarios**:
1. Cambia `oferta.estado` a `"ACEPTADO"` en Postgres
2. Envía mensaje informativo al chat de Firestore:
   ```json
   {
     "type": "info",
     "text": "✅ Oferta aceptada: $1500.00",
     "senderId": "cliente-uuid",
     "createdAt": serverTimestamp()
   }
   ```

---

#### 3. Rechazar Oferta
**POST** `/api/v1/cliente/ofertas/{oferta_id}/reject`

**Autenticación**: JWT (cualquier usuario autenticado)

**Path Parameters**:
- `oferta_id`: UUID de la oferta a rechazar

**Response** (200):
```json
{
  "id": "uuid-oferta",
  "profesional_id": "uuid-profesional",
  "cliente_id": "uuid-cliente",
  "chat_id": "firestore-chat-id",
  "descripcion": "Instalación de aire acondicionado split 3000 frigorías",
  "precio_final": 1500.00,
  "estado": "RECHAZADO",
  "fecha_creacion": "2025-10-19T14:30:00",
  "fecha_actualizacion": "2025-10-19T15:50:00"
}
```

**Validaciones**:
- ✅ La oferta debe existir
- ✅ La oferta debe pertenecer al cliente actual
- ✅ La oferta debe estar en estado "OFERTADO"
- ❌ Error 404 si no existe
- ❌ Error 403 si no pertenece al cliente
- ❌ Error 400 si ya fue aceptada/rechazada

**Efectos Secundarios**:
1. Cambia `oferta.estado` a `"RECHAZADO"` en Postgres
2. Envía mensaje informativo al chat de Firestore:
   ```json
   {
     "type": "info",
     "text": "❌ La oferta fue rechazada",
     "senderId": "cliente-uuid",
     "createdAt": serverTimestamp()
   }
   ```

---

#### 4. Obtener Detalle de Oferta
**GET** `/api/v1/cliente/ofertas/{oferta_id}`

**Autenticación**: JWT (cualquier usuario autenticado)

**Path Parameters**:
- `oferta_id`: UUID de la oferta

**Response** (200):
```json
{
  "id": "uuid-oferta",
  "profesional_id": "uuid-profesional",
  "cliente_id": "uuid-cliente",
  "chat_id": "firestore-chat-id",
  "descripcion": "Instalación de aire acondicionado split 3000 frigorías, incluye materiales y mano de obra",
  "precio_final": 1500.00,
  "estado": "OFERTADO",
  "fecha_creacion": "2025-10-19T14:30:00",
  "fecha_actualizacion": "2025-10-19T14:30:00"
}
```

**Validaciones**:
- ✅ La oferta debe existir
- ✅ La oferta debe pertenecer al cliente actual
- ❌ Error 404 si no existe
- ❌ Error 403 si no pertenece al cliente

**Uso**: Para mostrar el detalle completo antes de aceptar/rechazar

---

## 🔄 Flujo Completo de Aceptación

```
1. Cliente ve tarjeta de oferta en el chat
   ↓
2. Cliente hace clic en "Aceptar"
   ↓
3. Frontend: POST /api/v1/cliente/ofertas/{id}/accept
   ↓
4. Backend:
   - Valida permisos ✅
   - Valida estado ✅
   - Cambia estado a ACEPTADO ✅
   - Guarda en Postgres ✅
   - Notifica en Firestore ✅
   ↓
5. Backend retorna:
   {
     id: "uuid",
     precio_final: 1500.00,
     profesional_id: "uuid",
     descripcion: "...",
     estado: "ACEPTADO"
   }
   ↓
6. Frontend recibe la respuesta
   ↓
7. 🚀 TRIGGER MÓDULO 5 (Pagos)
   Frontend usa los datos para iniciar MercadoPago:
   - Monto: response.precio_final
   - Descripción: response.descripcion
   - Metadata: response.id (para trackear)
```

---

## 🔄 Flujo Completo de Rechazo

```
1. Cliente ve tarjeta de oferta en el chat
   ↓
2. Cliente hace clic en "Rechazar"
   ↓
3. Frontend: POST /api/v1/cliente/ofertas/{id}/reject
   ↓
4. Backend:
   - Valida permisos ✅
   - Valida estado ✅
   - Cambia estado a RECHAZADO ✅
   - Guarda en Postgres ✅
   - Notifica en Firestore: "❌ La oferta fue rechazada" ✅
   ↓
5. Backend retorna oferta actualizada
   ↓
6. Frontend:
   - Muestra mensaje de confirmación
   - Actualiza UI de la tarjeta (estado: rechazada)
   - Listener de Firestore recibe mensaje informativo
   - Profesional ve en su chat: "❌ La oferta fue rechazada"
```

---

## 🎯 Para el Frontend

### Componente: Tarjeta de Oferta

```jsx
function OfertaCard({ oferta }) {
  const [loading, setLoading] = useState(false);
  
  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/cliente/ofertas/${oferta.oferta_id}/accept`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        // ✅ OFERTA ACEPTADA
        console.log('Oferta aceptada:', data);
        
        // 🚀 INICIAR MÓDULO 5 (Pagos)
        iniciarPagoMercadoPago({
          amount: data.precio_final,
          description: data.descripcion,
          ofertaId: data.id,
          profesionalId: data.profesional_id
        });
      } else {
        alert(data.detail || 'Error al aceptar la oferta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/cliente/ofertas/${oferta.oferta_id}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      if (response.ok) {
        // ✅ OFERTA RECHAZADA
        alert('Oferta rechazada');
        // La UI se actualizará automáticamente con el listener de Firestore
      } else {
        const data = await response.json();
        alert(data.detail || 'Error al rechazar la oferta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="oferta-card">
      <h3>Nueva Oferta</h3>
      <p>{oferta.descripcion}</p>
      <h2>${oferta.precio_final}</h2>
      
      {oferta.estado === 'OFERTADO' && (
        <div className="actions">
          <button 
            onClick={handleAccept}
            disabled={loading}
            className="btn-accept"
          >
            ✅ Aceptar
          </button>
          <button 
            onClick={handleReject}
            disabled={loading}
            className="btn-reject"
          >
            ❌ Rechazar
          </button>
        </div>
      )}
      
      {oferta.estado === 'ACEPTADO' && (
        <div className="badge-accepted">✅ Aceptada</div>
      )}
      
      {oferta.estado === 'RECHAZADO' && (
        <div className="badge-rejected">❌ Rechazada</div>
      )}
    </div>
  );
}
```

---

## 🔒 Seguridad

### Validaciones Implementadas:
1. ✅ **JWT requerido**: Solo usuarios autenticados
2. ✅ **Ownership**: Solo el cliente dueño puede aceptar/rechazar
3. ✅ **Estado válido**: Solo ofertas en estado OFERTADO
4. ✅ **Existencia**: Validación de que la oferta existe
5. ✅ **Idempotencia**: No se puede aceptar/rechazar dos veces

### Códigos de Error:
- `401`: No autenticado
- `403`: No autorizado (oferta no pertenece al cliente)
- `404`: Oferta no encontrada
- `400`: Estado inválido (ya aceptada/rechazada)

---

## 📊 Estados de Oferta

```
OFERTADO → (cliente acepta) → ACEPTADO → (pago exitoso) → PAGADO
         ↓
         (cliente rechaza) → RECHAZADO (estado final)
```

---

## 🚀 Integración con Módulo 5 (Pagos)

### Datos Disponibles para MercadoPago:

Del endpoint `/accept`:
```json
{
  "id": "uuid-de-la-oferta",           // Para metadata/tracking
  "precio_final": 1500.00,              // Monto exacto
  "descripcion": "Servicio contratado", // Descripción
  "profesional_id": "uuid",             // Destinatario del pago
  "estado": "ACEPTADO"                  // Confirmación
}
```

### Ejemplo de Integración:
```javascript
async function iniciarPagoMercadoPago(ofertaData) {
  const preference = {
    items: [
      {
        title: ofertaData.descripcion,
        unit_price: ofertaData.precio_final,
        quantity: 1,
      }
    ],
    metadata: {
      oferta_id: ofertaData.ofertaId,
      profesional_id: ofertaData.profesionalId
    },
    back_urls: {
      success: `/pago/success?oferta_id=${ofertaData.ofertaId}`,
      failure: `/pago/failure`,
      pending: `/pago/pending`
    }
  };
  
  // Crear preferencia en MercadoPago
  const mp = new MercadoPago('PUBLIC_KEY');
  const checkout = mp.checkout({
    preference: preference
  });
  
  checkout.open();
}
```

---

## ✅ Estado Actual

- ✅ 4 endpoints creados
- ✅ Validaciones completas
- ✅ Notificaciones a Firestore
- ✅ Logs informativos
- ✅ Respuesta optimizada para Módulo 5
- ✅ API funcionando en `http://localhost:8004`

**¡Sistema listo para integración con el Frontend y Módulo 5 (Pagos)!** 🎯
