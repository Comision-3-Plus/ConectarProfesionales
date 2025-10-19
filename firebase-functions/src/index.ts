import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// Configuración del Backend (FastAPI)
const BACKEND_URL = functions.config().backend?.url || "http://host.docker.internal:8004";
const WEBHOOK_API_KEY = functions.config().backend?.webhook_key || "super-secret-webhook-key-change-in-production";

// Expresiones regulares para detectar datos de contacto
const PHONE_REGEX = /\b(\+?54|0?11|15|9)\b[\s\-]*(\d[\s\-]*){8,10}\b/gi;
const EMAIL_REGEX = /\b[\w\.-]+@[\w\.-]+\.\w{2,}\b/gi;
const SOCIAL_REGEX = /\b(ig|facebook|twitter|instagram|\.com|\.ar|whatsapp|wa\.me|t\.me|telegram|tiktok|linkedin)\b/gi;

const CENSORED_MESSAGE = "*** Mensaje bloqueado por incluir datos de contacto ***";

/**
 * Cloud Function que se activa cuando se escribe un mensaje en Firestore
 * Censura automáticamente mensajes que contengan datos de contacto
 */
export const moderateChat = functions.firestore
  .document("/chats/{chatId}/messages/{messageId}")
  .onWrite(async (change, context) => {
    // Si el documento fue eliminado, no hacemos nada
    if (!change.after.exists) {
      return null;
    }

    const messageData = change.after.data();
    const messageRef = change.after.ref;

    // Si el mensaje no tiene texto, no hacemos nada
    if (!messageData || !messageData.text) {
      return null;
    }

    const originalText = messageData.text;

    // Si el mensaje ya fue censurado, evitamos loop infinito
    if (originalText === CENSORED_MESSAGE) {
      return null;
    }

    // Verificar si el mensaje contiene datos de contacto
    const hasPhone = PHONE_REGEX.test(originalText);
    const hasEmail = EMAIL_REGEX.test(originalText);
    const hasSocial = SOCIAL_REGEX.test(originalText);

    // Si no hay datos de contacto, dejamos el mensaje como está
    if (!hasPhone && !hasEmail && !hasSocial) {
      return null;
    }

    // Censurar el mensaje
    console.log(`Censurando mensaje en chat ${context.params.chatId}: "${originalText}"`);

    try {
      // 1. Actualizar el mensaje en Firestore (censura)
      await messageRef.update({
        text: CENSORED_MESSAGE,
        censored: true,
        censoredAt: admin.firestore.FieldValue.serverTimestamp(),
        originalTextHash: hashText(originalText), // Hash para auditoría sin guardar el contenido
        censorReasons: {
          phone: hasPhone,
          email: hasEmail,
          social: hasSocial,
        },
      });

      console.log(`Mensaje censurado exitosamente: ${context.params.messageId}`);

      // 2. Notificar al Backend (FastAPI) sobre la infracción
      const senderId = messageData.senderId;
      if (senderId) {
        await notifyBackendInfraction(senderId, {
          phone: hasPhone,
          email: hasEmail,
          social: hasSocial,
        });
      }

      return null;
    } catch (error) {
      console.error("Error al censurar mensaje:", error);
      throw error;
    }
  });

/**
 * Notifica al Backend (FastAPI) sobre una infracción de chat
 */
async function notifyBackendInfraction(
  userId: string,
  reasons: { phone: boolean; email: boolean; social: boolean }
): Promise<void> {
  try {
    const webhookUrl = `${BACKEND_URL}/api/v1/webhook/chat/infraction`;
    
    console.log(`Notificando infracción al backend: userId=${userId}`);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": WEBHOOK_API_KEY,
      },
      body: JSON.stringify({
        user_id: userId,
        reason: `phone:${reasons.phone}, email:${reasons.email}, social:${reasons.social}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error al notificar backend: ${response.status} - ${errorText}`
      );
      return;
    }

    const data = await response.json();
    console.log(`Backend notificado exitosamente:`, data);

    // Si el usuario fue baneado, podemos agregar un flag en Firestore
    if (data.is_chat_banned) {
      console.warn(`⚠️ Usuario ${userId} fue BANEADO del chat después de ${data.infracciones_chat} infracciones`);
    }
  } catch (error) {
    console.error("Error al llamar al webhook del backend:", error);
    // No lanzamos el error para que la censura se complete aunque falle la notificación
  }
}

/**
 * Función auxiliar para crear un hash simple del texto (para auditoría)
 */
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}
