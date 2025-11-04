# 🔥 Firebase Setup - Guía Completa

## Estado Actual
- ✅ Proyecto Firebase creado: `conectar-profesionales`
- ✅ Firestore habilitado
- ✅ Reglas de Firestore desplegadas
- ⚠️ **PENDIENTE**: Habilitar Anonymous Authentication

---

## 🔐 Paso Crítico: Habilitar Anonymous Authentication

### ¿Por qué es necesario?
Firebase Firestore requiere que los usuarios estén autenticados para aplicar las reglas de seguridad. Usamos **Anonymous Authentication** porque:
- ✅ No requiere email/password del usuario
- ✅ Automático y transparente
- ✅ Cada sesión obtiene un UID único
- ✅ Compatible con nuestro sistema de autenticación JWT

### Pasos para habilitar:

1. **Accede a Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Selecciona el proyecto**
   - Proyecto: `Conectar-Profesionales`
   - Project ID: `conectar-profesionales`

3. **Ve a Authentication**
   - Menú lateral → **Build** → **Authentication**
   - Si es la primera vez, clic en **"Get Started"**

4. **Habilita Anonymous Sign-in**
   - Pestaña **"Sign-in method"**
   - Busca **"Anonymous"** en la lista de proveedores
   - Clic en **"Anonymous"**
   - **Activa el toggle** "Enable"
   - Clic en **"Save"**

5. **Verifica que esté habilitado**
   - Deberías ver "Anonymous" con estado **"Enabled"** ✅

---

## 📊 Estructura de Firestore

### Colecciones Principales:

```
📁 chats/
  └── {chatId}/
      ├── participants: string[]
      ├── participantsData: object
      ├── trabajoId?: string
      ├── ofertaId?: string
      ├── createdAt: timestamp
      └── updatedAt: timestamp

📁 messages/
  └── {chatId}/
      └── messages/
          └── {messageId}/
              ├── senderId: string
              ├── senderName: string
              ├── text: string
              ├── imageUrl?: string
              ├── read: boolean
              ├── createdAt: timestamp
              └── updatedAt: timestamp

📁 user_chats/
  └── {userId}/
      └── chats/
          └── {chatId}/
              ├── lastMessage: string
              ├── lastMessageTime: timestamp
              ├── unreadCount: number
              ├── otherUserId: string
              ├── otherUserName: string
              ├── otherUserPhoto: string
              └── trabajoId?: string
```

### Reglas de Seguridad Actuales:

```javascript
// Reglas simplificadas para desarrollo
// TEMPORAL: Cualquier usuario autenticado puede leer/escribir
match /chats/{chatId} {
  allow read, create, update: if request.auth != null;
}

match /messages/{chatId}/messages/{messageId} {
  allow read, create, update: if request.auth != null;
}

match /user_chats/{userId}/chats/{chatId} {
  allow read, write: if request.auth != null;
}
```

**NOTA:** En producción, estas reglas deberían ser más estrictas validando:
- Que el usuario sea participante del chat
- Que el senderId coincida con request.auth.uid
- Permisos específicos por operación (read/write)

---

## 🧪 Verificar que funciona

Después de habilitar Anonymous Authentication:

1. **Reinicia el frontend**
   ```bash
   docker-compose restart frontend
   ```

2. **Abre la página de chat**
   ```
   http://localhost:3000/chat
   ```

3. **Abre la consola del navegador** (F12)

4. **Deberías ver:**
   ```
   🔐 Autenticando en Firebase...
   ✅ Usuario autenticado en Firebase: [algún UID]
   ```

5. **Busca un usuario y crea un chat**
   - Clic en "Nuevo Chat"
   - Busca por email
   - Clic en "Chatear"
   - Deberías ver: `✅ Chat creado/obtenido: [chatId]`

6. **Verifica en Firebase Console**
   - Ve a Firestore Database
   - Deberías ver las colecciones `chats`, `messages`, `user_chats` creadas

---

## 🐛 Solución de Problemas

### Error: `auth/configuration-not-found`
**Causa:** Anonymous Authentication no está habilitado  
**Solución:** Sigue los pasos de "Habilitar Anonymous Sign-in" arriba

### Error: `Missing or insufficient permissions`
**Causa:** Reglas de Firestore no están actualizadas o el usuario no está autenticado  
**Solución:**
1. Verifica que Anonymous Auth esté habilitado
2. Redeploy las reglas: `firebase deploy --only firestore:rules`
3. Verifica en consola que se vea "✅ Usuario autenticado en Firebase"

### Error: `Firebase: Error (auth/invalid-api-key)`
**Causa:** Variables de entorno incorrectas  
**Solución:** Verifica `frontend/.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=conectar-profesionales.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=conectar-profesionales
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=conectar-profesionales.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

### Los chats no aparecen en la lista
**Causa:** El hook useChatList tiene un timeout de 10 segundos  
**Solución:**
1. Verifica la conexión a Internet
2. Verifica que las credenciales de Firebase sean correctas
3. Revisa la consola del navegador para errores
4. Verifica en Firebase Console que los datos existan

---

## 📝 Próximos Pasos (Opcional)

### Seguridad en Producción:
1. **Restringir reglas de Firestore** para validar participantes
2. **Agregar rate limiting** para prevenir spam
3. **Implementar moderación** de contenido
4. **Agregar encriptación** de mensajes sensibles

### Features Adicionales:
1. **Notificaciones push** usando Firebase Cloud Messaging
2. **Imágenes en mensajes** con Firebase Storage
3. **Indicadores de "escribiendo..."**
4. **Estado online/offline** de usuarios
5. **Mensajes de audio/video**
6. **Eliminación de mensajes**
7. **Edición de mensajes** (con timestamp de edición)

---

## 🔗 Enlaces Útiles

- **Firebase Console:** https://console.firebase.google.com/
- **Documentación Firebase Auth:** https://firebase.google.com/docs/auth/web/anonymous-auth
- **Documentación Firestore:** https://firebase.google.com/docs/firestore
- **Reglas de Seguridad:** https://firebase.google.com/docs/firestore/security/get-started

---

**Última actualización:** 3 de noviembre, 2025  
**Estado:** ⚠️ Pendiente habilitar Anonymous Authentication
