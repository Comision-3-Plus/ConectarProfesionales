# Configuración de Firebase para Conectar Profesionales

Este documento describe cómo configurar Firebase para el sistema de chat en tiempo real.

## Prerrequisitos

1. Cuenta de Google/Firebase
2. Proyecto de Firebase creado

## Pasos de Configuración

### 1. Crear Proyecto en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre: "Conectar Profesionales" (o el que prefieras)
4. Habilitar Google Analytics (opcional)
5. Crear proyecto

### 2. Agregar App Web

1. En la página principal del proyecto, click en el ícono Web (`</>`)
2. Registrar app con nombre: "Conectar Profesionales Web"
3. Copiar las credenciales que aparecen

### 3. Configurar Variables de Entorno

Pegar las credenciales en `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Configurar Firestore Database

1. En el menú lateral, ir a "Firestore Database"
2. Click en "Crear base de datos"
3. Modo: Empezar en **modo de prueba** (cambiar a producción después)
4. Ubicación: `us-central1` (o la más cercana)
5. Habilitar

### 5. Reglas de Seguridad (Temporal - Solo para desarrollo)

En la pestaña "Reglas", usar estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo a usuarios autenticados
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
    }
    
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE:** Estas reglas son temporales. Para producción, implementar reglas más restrictivas.

### 6. Estructura de Datos en Firestore

#### Colección: `chats`

```typescript
{
  id: string,                    // ID del chat
  participants: number[],        // IDs de usuarios participantes
  professional_id: number,       // ID del profesional
  cliente_id: number,            // ID del cliente
  created_at: Timestamp,
  updated_at: Timestamp,
  last_message: string | null,
  unread_count: {
    [userId: number]: number     // Contador de no leídos por usuario
  }
}
```

#### Colección: `messages` (subcollection de chats)

```typescript
{
  id: string,
  chat_id: string,
  sender_id: number,
  type: 'text' | 'oferta' | 'system',
  content: string,
  oferta_id?: number,            // Si es una oferta
  timestamp: Timestamp,
  read: boolean
}
```

### 7. Índices Compuestos (Opcional)

Para mejorar el rendimiento de las queries:

1. Ir a "Firestore Database" > "Índices"
2. Agregar índices para:
   - `chats` ordenado por `updated_at` descendente
   - `messages` ordenado por `timestamp` ascendente

## Uso en el Frontend

El archivo `lib/firebase.ts` ya está configurado para usar estas variables de entorno:

```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

// Ejemplo: Escuchar mensajes en tiempo real
const messagesRef = collection(db, 'chats', chatId, 'messages');
const q = query(messagesRef, orderBy('timestamp', 'asc'));

onSnapshot(q, (snapshot) => {
  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  // Actualizar UI con los mensajes
});
```

## Seguridad en Producción

Para producción, actualizar las reglas de Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isParticipant(chatId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/chats/$(chatId)).data.participants.hasAny([request.auth.uid]);
    }
    
    match /chats/{chatId} {
      allow read: if isParticipant(chatId);
      allow create: if isAuthenticated();
      allow update: if isParticipant(chatId);
    }
    
    match /chats/{chatId}/messages/{messageId} {
      allow read: if isParticipant(chatId);
      allow create: if isParticipant(chatId) && 
                       request.resource.data.sender_id == request.auth.uid;
    }
  }
}
```

## Troubleshooting

### Error: "Firebase not initialized"
- Verificar que las variables de entorno estén correctamente configuradas
- Reiniciar el servidor de desarrollo

### Error: "Permission denied"
- Verificar que las reglas de Firestore permitan el acceso
- Verificar que el usuario esté autenticado

### Mensajes no se actualizan en tiempo real
- Verificar la conexión a Internet
- Verificar que `onSnapshot` esté correctamente implementado
- Revisar la consola del navegador para errores

## Recursos

- [Documentación oficial de Firestore](https://firebase.google.com/docs/firestore)
- [Reglas de seguridad](https://firebase.google.com/docs/firestore/security/get-started)
- [Queries en tiempo real](https://firebase.google.com/docs/firestore/query-data/listen)
