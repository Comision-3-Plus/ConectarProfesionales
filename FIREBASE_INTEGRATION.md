# Integración de Firebase - Guía Completa

## ✅ Estado de la Integración

Firebase ha sido completamente integrado en ConectarProfesionales con las siguientes funcionalidades:

### 🔥 Servicios Implementados

1. **Firestore** - Chat en tiempo real
2. **Firebase Cloud Messaging (FCM)** - Notificaciones push
3. **Firebase Storage** - Almacenamiento de imágenes
4. **Firebase Analytics** - Tracking de eventos
5. **Firebase Auth (Custom Tokens)** - Autenticación desde backend

---

## 📁 Estructura de Archivos

### Frontend (`frontend/`)
```
lib/firebase/
├── config.ts                 # Configuración base de Firebase
├── chat.service.ts           # Servicio de chat con Firestore
├── storage.service.ts        # Servicio de almacenamiento
├── messaging.service.ts      # Servicio de notificaciones (FCM)
└── analytics.service.ts      # Servicio de analytics

hooks/
├── useChat.ts               # Hook para chat individual
└── useChatList.ts           # Hook para lista de chats

components/chat/
├── ChatWindow.tsx           # Componente de ventana de chat
└── ChatList.tsx             # Componente de lista de chats

public/
└── firebase-messaging-sw.js # Service worker para notificaciones
```

### Backend (`servicios/shared/firebase/`)
```
firebase/
├── __init__.py              # Exportaciones
├── admin.py                 # Inicialización de Firebase Admin
├── auth_service.py          # Servicio de autenticación
├── messaging_service.py     # Servicio de notificaciones
├── endpoints.py             # Endpoints de API
└── requirements.txt         # Dependencias Python
```

---

## 🚀 Configuración Inicial

### 1. Frontend

#### Instalar dependencias (ya hecho):
```bash
cd frontend
npm install firebase date-fns
```

#### Variables de entorno (`.env.local`):
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBwmhxN2Jw693drSLGv_YYNNM-rngcgw5k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=conectar-profesionales.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=conectar-profesionales
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=conectar-profesionales.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=488751111545
NEXT_PUBLIC_FIREBASE_APP_ID=1:488751111545:web:3fc61477916a8d8c6e63a8
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1FQ5WP0T11

# IMPORTANTE: Generar VAPID Key en Firebase Console
# Cloud Messaging -> Web Push certificates -> Generate key pair
NEXT_PUBLIC_FIREBASE_VAPID_KEY=tu_vapid_key_aqui
```

### 2. Backend

#### Instalar dependencias:
```bash
cd servicios/shared/firebase
pip install -r requirements.txt
```

#### Descargar credenciales de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `conectar-profesionales`
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. Pestaña **Cuentas de servicio**
5. Click en **Generar nueva clave privada**
6. Guarda el archivo JSON como: `firebase-service-account.json`
7. Colócalo en la raíz del proyecto
8. **¡NO lo subas a Git!** (ya está en `.gitignore`)

#### Variable de entorno (`.env`):
```env
FIREBASE_CREDENTIALS_PATH=/ruta/absoluta/a/firebase-service-account.json
```

---

## 📝 Reglas de Seguridad de Firestore

Las reglas ya están configuradas en `firestore.rules`. Para aplicarlas:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto (solo primera vez)
firebase init

# Desplegar reglas
firebase deploy --only firestore:rules
```

---

## 💻 Uso en el Frontend

### 1. Chat en Tiempo Real

#### Componente de ventana de chat:
```tsx
import { ChatWindow } from '@/components/chat/ChatWindow';

function MiPagina() {
  return (
    <ChatWindow
      chatId="chat123"
      otherUserName="Juan Pérez"
      otherUserPhoto="/avatar.jpg"
      trabajoId="trabajo456"
    />
  );
}
```

#### Componente de lista de chats:
```tsx
import { ChatList } from '@/components/chat/ChatList';

function MiPagina() {
  const [selectedChat, setSelectedChat] = useState(null);
  
  return (
    <ChatList
      onChatSelect={(chatId, userName, photo, trabajoId) => {
        setSelectedChat({ chatId, userName, photo, trabajoId });
      }}
      selectedChatId={selectedChat?.chatId}
    />
  );
}
```

#### Hook de chat:
```tsx
import { useChat } from '@/hooks/useChat';

function MiComponente() {
  const { messages, isLoading, sendMessage, sendImageMessage, markAsRead } = useChat({
    chatId: 'chat123'
  });
  
  const handleSend = async () => {
    await sendMessage('Hola!');
  };
  
  return <div>{/* UI */}</div>;
}
```

### 2. Subir Imágenes

```tsx
import { storageService } from '@/lib/firebase/storage.service';

const handleImageUpload = async (file: File) => {
  // Validar imagen
  const validation = storageService.validateImageFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }
  
  // Comprimir
  const compressed = await storageService.compressImage(file);
  
  // Subir
  const url = await storageService.uploadChatImage(
    'chatId',
    compressed,
    (progress) => {
      console.log(`${progress.progress}%`);
    }
  );
  
  console.log('URL:', url);
};
```

### 3. Notificaciones Push

```tsx
import { fcmService } from '@/lib/firebase/messaging.service';

const setupNotifications = async () => {
  // Solicitar permiso
  const token = await fcmService.requestPermissionAndGetToken();
  
  if (token) {
    // Enviar token al backend
    await fcmService.sendTokenToBackend(
      token,
      userId,
      'http://localhost:8000'
    );
    
    // Escuchar notificaciones en foreground
    await fcmService.onForegroundMessage((payload) => {
      console.log('Nueva notificación:', payload);
      // Mostrar en UI
    });
  }
};
```

### 4. Analytics

```tsx
import { analyticsService, AnalyticsEvent } from '@/lib/firebase/analytics.service';

// Registrar búsqueda
analyticsService.trackSearch('plomero', 'Buenos Aires', {
  radio: 10,
  rating: 4.5
});

// Registrar inicio de chat
analyticsService.trackChatStart('chat123', 'user456');

// Registrar envío de mensaje
analyticsService.trackMessageSend('chat123', 'text');

// Establecer usuario
analyticsService.setUserId('user123');

// Establecer propiedades
analyticsService.setUserProperties({
  role: 'profesional',
  oficio: 'plomero'
});
```

---

## 🔧 Uso en el Backend

### 1. Obtener Firebase Token (Autenticación)

El usuario debe llamar a este endpoint después de autenticarse:

```bash
GET /api/v1/firebase/token
Authorization: Bearer {jwt_token}
```

Respuesta:
```json
{
  "firebaseToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user123"
}
```

El frontend usa este token:
```typescript
import { signInWithCustomToken } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const credential = await signInWithCustomToken(auth, firebaseToken);
```

### 2. Guardar FCM Token

```bash
POST /api/v1/firebase/fcm-token
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "fcmToken": "fcm_token_here",
  "platform": "web"
}
```

### 3. Enviar Notificaciones desde Backend

```python
from shared.firebase import fcm_service

# Notificar nuevo mensaje
await fcm_service.notify_new_message(
    recipient_user_id="user123",
    sender_name="Juan Pérez",
    message_text="Hola, ¿cómo estás?",
    chat_id="chat456"
)

# Notificar nueva oferta
await fcm_service.notify_new_offer(
    professional_user_id="prof123",
    client_name="María González",
    offer_amount=150.00,
    offer_id="offer789"
)

# Enviar notificación personalizada
await fcm_service.send_notification_to_user(
    user_id="user123",
    title="Título",
    body="Contenido del mensaje",
    data={
        "type": "custom",
        "extraData": "value"
    }
)
```

### 4. Integrar Endpoints en API Gateway

En `servicios/puerta_enlace/main.py`:

```python
from shared.firebase.endpoints import router as firebase_router

app.include_router(firebase_router, prefix="/api/v1")
```

---

## 🔐 Estructura de Datos en Firestore

### Colección: `chats/{chatId}`
```json
{
  "participants": ["user1", "user2"],
  "participantsData": {
    "user1": {
      "name": "Juan Pérez",
      "photo": "url",
      "role": "cliente"
    },
    "user2": {
      "name": "María González",
      "photo": "url",
      "role": "profesional"
    }
  },
  "trabajoId": "trabajo123",
  "ofertaId": "oferta456",
  "createdAt": "2025-11-03T...",
  "updatedAt": "2025-11-03T...",
  "lastMessage": {
    "text": "Último mensaje",
    "senderId": "user1",
    "timestamp": "2025-11-03T..."
  }
}
```

### Colección: `messages/{chatId}/messages/{messageId}`
```json
{
  "senderId": "user1",
  "senderName": "Juan Pérez",
  "senderPhoto": "url",
  "text": "Hola!",
  "timestamp": "2025-11-03T...",
  "read": false,
  "type": "text",
  "imageUrl": null
}
```

### Colección: `user_chats/{userId}/{chatId}`
```json
{
  "lastMessage": "Último mensaje",
  "lastMessageTime": "2025-11-03T...",
  "unreadCount": 3,
  "otherUserId": "user2",
  "otherUserName": "María González",
  "otherUserPhoto": "url",
  "trabajoId": "trabajo123"
}
```

---

## 🧪 Testing

### Test de Chat (Frontend)
```bash
cd frontend
npm run dev
# Abrir http://localhost:3000/chat
```

### Test de Notificaciones
1. Abrir consola del navegador
2. Ejecutar: `Notification.requestPermission()`
3. Aceptar permisos
4. Enviar notificación desde backend

### Test de Backend
```python
# Test de Firebase Auth
from shared.firebase import firebase_auth_service

token = firebase_auth_service.create_custom_token("user123", {
    "email": "test@example.com"
})
print(token)

# Test de FCM
from shared.firebase import fcm_service

await fcm_service.send_notification_to_user(
    user_id="user123",
    title="Test",
    body="Mensaje de prueba"
)
```

---

## ⚠️ Pasos Pendientes

### 1. Generar VAPID Key para FCM
1. Ve a Firebase Console
2. Cloud Messaging → Web Push certificates
3. Click en "Generate key pair"
4. Copia la clave y agrégala a `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=tu_vapid_key_aqui
   ```

### 2. Desplegar Reglas de Firestore
```bash
firebase deploy --only firestore:rules
```

### 3. Configurar Índices de Firestore (opcional pero recomendado)
Firebase te pedirá crear índices cuando hagas queries complejas. 
Los links aparecerán en la consola del navegador.

---

## 📊 Monitoreo

### Firebase Console
- **Firestore**: Ver datos en tiempo real
- **Analytics**: Ver eventos y usuarios
- **Cloud Messaging**: Ver estadísticas de notificaciones
- **Storage**: Ver archivos subidos

### Logs del Backend
```bash
# Ver logs de Firebase
tail -f logs/firebase.log
```

---

## 🆘 Troubleshooting

### Error: "Firebase not initialized"
**Solución**: Asegúrate de que `firebase-service-account.json` existe y la variable `FIREBASE_CREDENTIALS_PATH` está configurada.

### Error: "Permission denied" en Firestore
**Solución**: Verifica las reglas de seguridad y que el usuario esté autenticado con Firebase.

### Error: "Token FCM inválido"
**Solución**: El token expiró. Solicita permiso de notificaciones nuevamente.

### Error: "VAPID key not configured"
**Solución**: Genera la VAPID key en Firebase Console y agrégala a `.env.local`.

---

## 📚 Recursos Adicionales

- [Documentación Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [FCM para Web](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)

---

## ✅ Checklist de Integración

- [x] Instalar dependencias Firebase en frontend
- [x] Configurar Firebase en frontend
- [x] Crear servicios de chat, storage, messaging y analytics
- [x] Crear hooks personalizados (useChat, useChatList)
- [x] Crear componentes UI (ChatWindow, ChatList)
- [x] Instalar Firebase Admin SDK en backend
- [x] Crear servicios de autenticación y notificaciones
- [x] Crear endpoints de API
- [x] Configurar reglas de seguridad de Firestore
- [ ] **Descargar credenciales de Firebase Admin** 
- [ ] **Generar VAPID key para FCM**
- [ ] **Desplegar reglas de Firestore**
- [ ] **Integrar endpoints en API Gateway**
- [ ] **Probar flujo completo de chat**
- [ ] **Probar notificaciones push**

---

¡Firebase está completamente integrado! Solo faltan los pasos marcados en el checklist.
