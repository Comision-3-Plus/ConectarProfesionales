/**
 * Firebase Cloud Messaging Service
 * Servicio para notificaciones push
 * 
 * Funcionalidades:
 * - Solicitar permisos de notificación
 * - Obtener token FCM
 * - Escuchar notificaciones en foreground
 * - Enviar token al backend
 */

import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { getMessagingInstance } from './config';

// ============================================================================
// TIPOS
// ============================================================================

export interface NotificationPayload {
  title?: string;
  body?: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
}

// ============================================================================
// FCM SERVICE
// ============================================================================

class FCMService {
  private messaging: Messaging | null = null;

  /**
   * Inicializar messaging
   */
  private async initMessaging(): Promise<Messaging | null> {
    if (!this.messaging) {
      this.messaging = await getMessagingInstance();
    }
    return this.messaging;
  }

  /**
   * Solicitar permisos y obtener token FCM
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      // Verificar soporte de notificaciones
      if (!('Notification' in window)) {
        console.warn('⚠️ Este navegador no soporta notificaciones');
        return null;
      }

      // Solicitar permiso
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('⚠️ Permiso de notificaciones denegado');
        return null;
      }

      console.log('✅ Permiso de notificaciones concedido');

      // Obtener messaging instance
      const messaging = await this.initMessaging();
      if (!messaging) {
        console.warn('⚠️ Firebase Messaging no está disponible');
        return null;
      }

      // Obtener token
      // NOTA: Necesitas generar VAPID key en Firebase Console -> Cloud Messaging -> Web Push certificates
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.error('❌ VAPID Key no configurada. Ve a Firebase Console -> Cloud Messaging -> Web Push certificates');
        return null;
      }

      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        console.log('✅ Token FCM obtenido:', token);
        return token;
      } else {
        console.log('⚠️ No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.error('❌ Error al solicitar permiso de notificaciones:', error);
      return null;
    }
  }

  /**
   * Escuchar notificaciones mientras la app está en foreground
   */
  async onForegroundMessage(callback: (payload: NotificationPayload) => void): Promise<void> {
    try {
      const messaging = await this.initMessaging();
      if (!messaging) return;

      onMessage(messaging, (payload) => {
        console.log('📬 Mensaje recibido en foreground:', payload);
        
        const notification: NotificationPayload = {
          title: payload.notification?.title,
          body: payload.notification?.body,
          icon: payload.notification?.icon,
          image: payload.notification?.image,
          data: payload.data as Record<string, string>,
        };

        callback(notification);

        // Mostrar notificación del navegador
        if (notification.title) {
          new Notification(notification.title, {
            body: notification.body,
            icon: notification.icon || '/icon-192x192.png',
            data: notification.data,
          });
        }
      });
    } catch (error) {
      console.error('❌ Error al escuchar mensajes:', error);
    }
  }

  /**
   * Enviar token al backend para guardarlo
   */
  async sendTokenToBackend(token: string, userId: string, apiUrl: string): Promise<void> {
    try {
      const response = await fetch(`${apiUrl}/api/v1/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          userId,
          fcmToken: token,
          platform: 'web',
        }),
      });

      if (response.ok) {
        console.log('✅ Token FCM guardado en el backend');
      } else {
        console.error('❌ Error al guardar token en el backend');
      }
    } catch (error) {
      console.error('❌ Error al enviar token al backend:', error);
    }
  }

  /**
   * Verificar si las notificaciones están habilitadas
   */
  areNotificationsEnabled(): boolean {
    if (!('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  /**
   * Obtener estado del permiso
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Exportar instancia singleton
export const fcmService = new FCMService();
