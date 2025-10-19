# Configuración de Cloud Function - Moderación de Chat

## Variables de entorno necesarias

Para configurar el backend URL y la API Key en Firebase Functions, usar:

```bash
# Configurar el URL del backend (ajustar según el entorno)
firebase functions:config:set backend.url="http://tu-backend.com"

# Configurar la API Key del webhook (debe coincidir con WEBHOOK_API_KEY en el backend)
firebase functions:config:set backend.webhook_key="super-secret-webhook-key-change-in-production"

# Ver la configuración actual
firebase functions:config:get

# Para desarrollo local (emuladores), crear archivo .runtimeconfig.json:
# {
#   "backend": {
#     "url": "http://host.docker.internal:8004",
#     "webhook_key": "super-secret-webhook-key-change-in-production"
#   }
# }
```

## Flujo de moderación

1. Usuario envía mensaje en Firestore `/chats/{chatId}/messages/{messageId}`
2. Cloud Function `moderateChat` se dispara automáticamente
3. Si detecta datos de contacto (teléfono, email, redes sociales):
   - Censura el mensaje en Firestore
   - Llama al webhook del backend FastAPI: `POST /api/v1/webhook/chat/infraction`
4. Backend registra la infracción:
   - Incrementa contador `infracciones_chat`
   - Si llega a 3, activa `is_chat_banned = true`
5. Frontend verifica `is_chat_banned` en el usuario (`GET /api/v1/users/me`)
6. Si está baneado, deshabilita la UI del chat

## Seguridad

- El webhook está protegido por `X-API-Key` header
- No usa JWT porque es server-to-server
- La API Key debe ser secreta y diferente en cada entorno
