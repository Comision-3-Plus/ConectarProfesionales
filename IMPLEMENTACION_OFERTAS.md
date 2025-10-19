# Sistema de Ofertas Económicas Formales

## ✅ Implementación Completada

### Modelo de Datos (Postgres)

#### Tabla: `ofertas`
```python
class Oferta:
    id: UUID
    profesional_id: FK(usuarios.id)
    cliente_id: FK(usuarios.id)
    chat_id: String  # ID de la sala en Firestore
    descripcion: Text
    precio_final: Numeric(10, 2)
    estado: Enum(OFERTADO, ACEPTADO, RECHAZADO, PAGADO)
    fecha_creacion: DateTime
    fecha_actualizacion: DateTime
```

#### Estados de Oferta
- **OFERTADO**: Oferta enviada, esperando respuesta del cliente
- **ACEPTADO**: Cliente aceptó la oferta
- **RECHAZADO**: Cliente rechazó la oferta
- **PAGADO**: Oferta pagada (estado final)

### Schemas Pydantic

#### `OfertaCreate`
```json
{
  "cliente_id": "uuid",
  "chat_id": "firestore-chat-id",
  "descripcion": "Descripción del servicio...",
  "precio_final": 1500.00
}
```

#### `OfertaRead`
```json
{
  "id": "uuid",
  "profesional_id": "uuid",
  "cliente_id": "uuid",
  "chat_id": "string",
  "descripcion": "string",
  "precio_final": 1500.00,
  "estado": "OFERTADO",
  "fecha_creacion": "2025-10-19T...",
  "fecha_actualizacion": "2025-10-19T..."
}
```

### Servicio de Firebase

**Archivo**: `app/services/firebase_service.py`

#### Funciones Principales:
1. **`send_oferta_to_chat()`**: Envía mensaje especial tipo "oferta" a Firestore
2. **`send_message_to_chat()`**: Envía mensajes de texto normales

#### Estructura del Mensaje en Firestore:
```javascript
// /chats/{chat_id}/messages/{auto_id}
{
  type: "oferta",
  oferta_id: "uuid-de-postgres",
  senderId: "profesional-uuid",
  descripcion: "Instalación de aire acondicionado...",
  precio_final: 1500.00,
  createdAt: serverTimestamp(),
  read: false
}
```

### Endpoints API

#### 1. Crear Oferta
**POST** `/api/v1/professional/ofertas`

**Autenticación**: JWT (Profesional)

**Request Body**:
```json
{
  "cliente_id": "uuid-del-cliente",
  "chat_id": "id-sala-firestore",
  "descripcion": "Instalación de aire acondicionado split 3000 frigorías, incluye materiales y mano de obra",
  "precio_final": 1500.00
}
```

**Response** (201):
```json
{
  "id": "uuid-generado",
  "profesional_id": "uuid-del-profesional",
  "cliente_id": "uuid-del-cliente",
  "chat_id": "id-sala-firestore",
  "descripcion": "Instalación de...",
  "precio_final": 1500.00,
  "estado": "OFERTADO",
  "fecha_creacion": "2025-10-19T14:30:00",
  "fecha_actualizacion": "2025-10-19T14:30:00"
}
```

**Flujo Interno**:
1. ✅ Valida que el cliente existe
2. ✅ Valida que no se oferté a sí mismo
3. ✅ Crea registro en Postgres con estado OFERTADO
4. ✅ Envía mensaje especial a Firestore (type: "oferta")
5. ✅ Retorna la oferta creada

#### 2. Listar Ofertas Enviadas
**GET** `/api/v1/professional/ofertas`

**Autenticación**: JWT (Profesional)

**Response** (200):
```json
[
  {
    "id": "uuid1",
    "profesional_id": "uuid",
    "cliente_id": "uuid",
    "chat_id": "chat-123",
    "descripcion": "Servicio A",
    "precio_final": 1500.00,
    "estado": "OFERTADO",
    "fecha_creacion": "2025-10-19T14:30:00",
    "fecha_actualizacion": "2025-10-19T14:30:00"
  },
  {
    "id": "uuid2",
    "profesional_id": "uuid",
    "cliente_id": "uuid",
    "chat_id": "chat-124",
    "descripcion": "Servicio B",
    "precio_final": 2000.00,
    "estado": "ACEPTADO",
    "fecha_creacion": "2025-10-18T10:00:00",
    "fecha_actualizacion": "2025-10-18T11:30:00"
  }
]
```

### Integración con Firestore

#### Firebase Admin SDK
- ✅ Instalado: `firebase-admin==6.4.0`
- ✅ Modo simulado para desarrollo (cuando no hay credenciales)
- ✅ Variable de entorno: `FIREBASE_CREDENTIALS_PATH`

#### Para Producción:
```bash
# 1. Descargar credenciales de Firebase Console
# 2. Colocar en: /code/firebase-credentials.json
# 3. O configurar variable: FIREBASE_CREDENTIALS_PATH=/path/to/creds.json
```

### Migración Aplicada
- ✅ Archivo: `dfd278c9506f_agregar_modelo_ofertas.py`
- ✅ Tabla `ofertas` creada
- ✅ Enum `estado_oferta_enum` creado
- ✅ Relaciones FK configuradas

## 🔄 Flujo Completo

```
1. Profesional y Cliente chatean en Firestore
   ↓
2. Cliente: "¿Cuánto me cobras?"
   ↓
3. Profesional NO escribe precio en chat (sería censurado)
   ↓
4. Profesional usa: POST /api/v1/professional/ofertas
   {
     cliente_id: "...",
     chat_id: "...",
     descripcion: "Instalación completa...",
     precio_final: 1500.00
   }
   ↓
5. Backend:
   - Guarda en Postgres ✅
   - Envía a Firestore: {type: "oferta", oferta_id: "..."} ✅
   ↓
6. Frontend (listener en tiempo real):
   - Detecta mensaje type="oferta"
   - Renderiza Tarjeta de Oferta (no globo de chat)
   - Muestra: descripción, precio, botones Aceptar/Rechazar
   ↓
7. Cliente acepta/rechaza desde la tarjeta
   ↓
8. Frontend llama a endpoint de actualización (a implementar)
   PUT /api/v1/ofertas/{oferta_id}/estado
   {estado: "ACEPTADO"}
```

## 🎯 Para el Frontend

### Listener de Mensajes (Firestore)
```javascript
// Escuchar nuevos mensajes
onSnapshot(messagesRef, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      const msg = change.doc.data();
      
      if (msg.type === 'oferta') {
        // Renderizar TARJETA DE OFERTA
        renderOfertaCard({
          ofertaId: msg.oferta_id,
          descripcion: msg.descripcion,
          precioFinal: msg.precio_final,
          senderId: msg.senderId
        });
      } else {
        // Renderizar mensaje normal
        renderChatBubble(msg);
      }
    }
  });
});
```

### Componente: Tarjeta de Oferta
```jsx
<OfertaCard>
  <Title>Nueva Oferta</Title>
  <Description>{descripcion}</Description>
  <Price>${precio_final}</Price>
  <Actions>
    <Button onClick={aceptarOferta}>Aceptar</Button>
    <Button onClick={rechazarOferta}>Rechazar</Button>
  </Actions>
</OfertaCard>
```

## 🔒 Validaciones

### Backend
- ✅ Cliente debe existir
- ✅ No puede ofertarse a sí mismo
- ✅ Solo profesionales verificados pueden ofertar
- ✅ Precio debe ser > 0
- ✅ Descripción mínimo 10 caracteres

### Filtro Anti-Chantas
- ✅ Si profesional escribe precio en chat → **CENSURADO**
- ✅ Debe usar endpoint formal de ofertas

## 📊 Ventajas del Sistema

1. **Trazabilidad**: Todas las ofertas en BD
2. **Seguridad**: No se pueden manipular mensajes de oferta
3. **UX**: Tarjetas visuales profesionales
4. **Anti-fraude**: Filtro evita negociaciones informales
5. **Analytics**: Fácil tracking de conversión
6. **Legal**: Registro formal de propuestas comerciales

## 🚀 Estado Actual

- ✅ Modelo creado y migrado
- ✅ Endpoints funcionando
- ✅ Integración con Firestore lista
- ✅ Firebase Admin SDK instalado
- ✅ Modo simulado para desarrollo
- ⏳ Pendiente: Endpoint para aceptar/rechazar ofertas (siguiente tarea)
