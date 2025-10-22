# Configuración de Firebase para Conectar Profesionales

## 🔥 Guía Completa de Configuración

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre: `conectar-profesionales`
4. Habilita Google Analytics (opcional)
5. Crear proyecto

### 2. Configurar Firebase Authentication

1. En el menú lateral, ve a **Authentication**
2. Click en "Comenzar"
3. Habilita los métodos de inicio de sesión:
   - **Email/Password** (recomendado para esta app)
   - Otros métodos opcionales

### 3. Configurar Cloud Firestore

1. En el menú lateral, ve a **Firestore Database**
2. Click en "Crear base de datos"
3. Selecciona:
   - **Modo de prueba** para desarrollo
   - **Modo de producción** para producción
4. Ubicación: Selecciona la más cercana a tus usuarios

### 4. Estructura de Firestore para Chat

Crea las siguientes colecciones:

```
/chats/{chatId}
  - participants: [clienteId, professionalId]
  - created_at: timestamp
  - last_message: string
  - last_message_at: timestamp
  
  /messages/{messageId}
    - sender_id: number
    - type: 'text' | 'oferta' | 'system'
    - content: string
    - oferta_id: number (opcional)
    - timestamp: timestamp
    - read: boolean
```

### 5. Reglas de Seguridad de Firestore

Copia estas reglas en **Firestore → Reglas**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función helper para verificar autenticación
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Chats
    match /chats/{chatId} {
      // Solo participantes pueden leer
      allow read: if isSignedIn() && 
        request.auth.uid in resource.data.participants;
      
      // Solo participantes pueden crear mensajes
      allow write: if isSignedIn() && 
        request.auth.uid in request.resource.data.participants;
      
      // Mensajes dentro del chat
      match /messages/{messageId} {
        allow read: if isSignedIn();
        allow create: if isSignedIn();
        allow update, delete: if isSignedIn() && 
          request.auth.uid == resource.data.sender_id;
      }
    }
  }
}
```

### 6. Obtener Credenciales del Proyecto

1. En Firebase Console, click en ⚙️ (Configuración del proyecto)
2. En la sección "Tus apps", click en el ícono web `</>`
3. Registra tu app con nombre: `conectar-profesionales-web`
4. Copia la configuración que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### 7. Configurar Variables de Entorno

Crea/actualiza `.env.local` en la carpeta `frontend/`:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

### 8. Configuración de Storage (Opcional)

Si necesitas subir imágenes de portfolio:

1. Ve a **Storage** en Firebase Console
2. Click en "Comenzar"
3. Acepta las reglas de seguridad por defecto (o personaliza)

Reglas de seguridad recomendadas para Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolio/{userId}/{imageId} {
      // Solo usuarios autenticados pueden subir
      allow create: if request.auth != null;
      // Solo el dueño puede eliminar
      allow delete: if request.auth.uid == userId;
      // Todos pueden leer (imágenes públicas)
      allow read: if true;
    }
  }
}
```

### 9. Configurar Índices (Importante para Queries)

En **Firestore → Índices**, crea los siguientes índices compuestos:

#### Índice para Mensajes de Chat
- Colección: `chats/{chatId}/messages`
- Campos:
  - `timestamp` (Ascending)
  - `read` (Ascending)
- Scope: Collection Group

### 10. Configurar CORS (Si es necesario)

Para desarrollo local, puede que necesites configurar CORS en Firebase Functions si las usas.

### 11. Testing de Configuración

Reinicia el servidor de desarrollo:

```bash
npm run dev
```

Verifica en la consola del navegador que no hay errores de Firebase.

## 🔒 Seguridad en Producción

### Restricciones de API Key

1. En Firebase Console → Configuración del proyecto
2. Ve a la pestaña "Cloud Messaging"
3. En "Restricciones de API", configura:
   - Restricción de HTTP: Solo dominios autorizados
   - Agrega tu dominio: `https://tudominio.com`

### Variables de Entorno en Producción

Asegúrate de configurar las mismas variables en tu plataforma de hosting:

- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Environment variables

## 📱 Implementación del Chat (Ejemplo)

```typescript
// lib/chat.ts
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

export async function sendMessage(
  chatId: string, 
  senderId: number, 
  content: string, 
  type: 'text' | 'oferta' = 'text'
) {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  
  await addDoc(messagesRef, {
    sender_id: senderId,
    type,
    content,
    timestamp: Date.now(),
    read: false,
  });
}

export function subscribeToMessages(
  chatId: string, 
  callback: (messages: any[]) => void
) {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
}
```

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Firebase Console
- [ ] Authentication habilitado (Email/Password)
- [ ] Firestore Database creado
- [ ] Reglas de seguridad configuradas
- [ ] Variables de entorno en `.env.local`
- [ ] Índices de Firestore creados
- [ ] Restricciones de API configuradas (producción)
- [ ] Testing de conexión exitoso

## 🆘 Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid)"
- Verifica que la API Key en `.env.local` sea correcta
- Revisa las restricciones de API en Firebase Console

### Error: "Missing or insufficient permissions"
- Revisa las reglas de Firestore
- Asegúrate de que el usuario esté autenticado

### Mensajes no aparecen en tiempo real
- Verifica que los índices de Firestore estén creados
- Revisa la consola del navegador para errores
- Asegúrate de que el listener (`onSnapshot`) esté activo

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**Última actualización:** Octubre 2025
