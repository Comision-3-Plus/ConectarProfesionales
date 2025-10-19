# Sistema de Moderación de Chat con 3 Strikes

## ✅ Implementación Completada

### Backend FastAPI

#### 1. Modelo de Base de Datos (`app/models/user.py`)
- ✅ Agregadas 2 columnas al modelo Usuario:
  - `infracciones_chat` (Integer, default=0): Contador de infracciones
  - `is_chat_banned` (Boolean, default=False): Flag de baneo del chat

#### 2. Migración de Base de Datos
- ✅ Generada y aplicada migración Alembic: `0a294fb5a050_agregar_sistema_infracciones_chat.py`
- ✅ Migración incluye server_default para evitar errores con datos existentes

#### 3. Configuración (`app/core/config.py`)
- ✅ Agregada variable `WEBHOOK_API_KEY` para seguridad del webhook
- ✅ Configurada en `.env` y `docker-compose.yml`

#### 4. Endpoint Webhook (`app/api/v1/endpoints/webhook.py`)
- ✅ Endpoint: `POST /api/v1/webhook/chat/infraction`
- ✅ Seguridad: Protegido por API Key (header `X-API-Key`)
- ✅ Lógica de 3 strikes:
  - Incrementa `infracciones_chat`
  - Si llega a 3, activa `is_chat_banned = True`
- ✅ Registrado en router principal (`app/api/v1/__init__.py`)

#### 5. Schema de Usuario (`app/schemas/user.py`)
- ✅ Agregados campos al schema `UserRead`:
  - `infracciones_chat: int = 0`
  - `is_chat_banned: bool = False`
- ✅ El frontend puede leer estos valores desde `GET /api/v1/users/me`

### Cloud Function (Firebase)

#### 1. Función Principal (`firebase-functions/src/index.ts`)
- ✅ Listener `onWrite` en `/chats/{chatId}/messages/{messageId}`
- ✅ 3 Regex para detectar:
  - Teléfonos argentinos: `+54, 11, 15, 011, 9 11, etc.`
  - Emails
  - Redes sociales: `ig, facebook, twitter, whatsapp, telegram, etc.`
- ✅ Censura el mensaje en Firestore
- ✅ Llama al webhook de FastAPI con el `user_id` infractor

#### 2. Configuración
- ✅ Variables de entorno configurables:
  - `backend.url`: URL del backend FastAPI
  - `backend.webhook_key`: API Key secreta
- ✅ Documentación en `firebase-functions/CONFIG.md`

### Firestore

#### 1. Reglas de Seguridad (`firestore.rules`)
- ✅ Solo participantes pueden leer/escribir mensajes
- ✅ Solo Cloud Functions pueden actualizar mensajes (para censura)
- ✅ Usuarios no pueden eliminar mensajes

#### 2. Estructura de Datos
```
/chats/{chatId}/messages/{messageId}
{
  text: string,
  senderId: string,
  createdAt: timestamp,
  censored?: boolean,
  censoredAt?: timestamp,
  censorReasons?: { phone, email, social }
}
```

## 🚀 Flujo Completo

1. **Usuario envía mensaje** → Firestore `/chats/{chatId}/messages/{messageId}`
2. **Cloud Function detecta** → Si contiene datos de contacto:
   - Censura el mensaje en Firestore
   - Llama a `POST /api/v1/webhook/chat/infraction` con `user_id`
3. **Backend FastAPI procesa**:
   - Incrementa `infracciones_chat`
   - Si llega a 3 → `is_chat_banned = True`
4. **Frontend verifica** → `GET /api/v1/users/me` devuelve `is_chat_banned`
5. **Frontend deshabilita** → UI del chat si está baneado

## 🔒 Seguridad

- Webhook protegido por `X-API-Key` (no JWT, es server-to-server)
- API Key diferente de SECRET_KEY
- No se guarda el texto original (solo hash para auditoría)
- Firestore rules previenen que usuarios modifiquen mensajes censurados

## 📝 Endpoints Disponibles

### Webhook (Interno)
- `POST /api/v1/webhook/chat/infraction`
  - Headers: `X-API-Key: {WEBHOOK_API_KEY}`
  - Body: `{ "user_id": "uuid", "reason": "optional" }`
  - Response: `{ "user_id", "infracciones_chat", "is_chat_banned", "message" }`

### Usuario (Frontend)
- `GET /api/v1/users/me`
  - Returns: `{ ..., "infracciones_chat": 0, "is_chat_banned": false }`

## 🎯 Para el Frontend

El frontend debe:
1. Leer `is_chat_banned` del usuario actual (`GET /api/v1/users/me`)
2. Si `is_chat_banned === true`, deshabilitar la UI del chat
3. Mostrar mensaje: "Has sido baneado del chat por intentar compartir datos de contacto"

## 🔧 Deploy

### Backend
```bash
# Ya está funcionando en Docker
docker-compose up -d
```

### Cloud Function
```bash
cd firebase-functions
npm install
npm run build
firebase login
firebase functions:config:set backend.url="http://tu-backend.com"
firebase functions:config:set backend.webhook_key="tu-api-key-secreta"
firebase deploy --only functions
```
