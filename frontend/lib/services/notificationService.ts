/**
 * Servicio de Notificaciones
 */

import api from '../api';

export interface Notification {
  id: string;
  usuario_id: string;
  tipo: 'mensaje' | 'oferta' | 'pago' | 'resena' | 'sistema' | 'trabajo';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  metadata?: {
    chat_id?: string;
    trabajo_id?: string;
    oferta_id?: string;
    transaccion_id?: string;
    resena_id?: string;
    url?: string;
  };
}

export interface NotificationPreferences {
  email_mensajes: boolean;
  email_ofertas: boolean;
  email_pagos: boolean;
  email_resenas: boolean;
  push_mensajes: boolean;
  push_ofertas: boolean;
  push_pagos: boolean;
  push_resenas: boolean;
  frecuencia_resumen: 'nunca' | 'diario' | 'semanal';
}

class NotificationService {
  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    solo_no_leidas?: boolean;
    tipo?: string;
  }): Promise<{ notificaciones: Notification[]; total: number; no_leidas: number }> {
    const response = await api.get('/notificaciones', { params });
    return response.data;
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notificaciones/${notificationId}/leer`);
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead(): Promise<void> {
    await api.put('/notificaciones/leer-todas');
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notificaciones/${notificationId}`);
  }

  /**
   * Eliminar todas las notificaciones leídas
   */
  async deleteAllRead(): Promise<void> {
    await api.delete('/notificaciones/limpiar-leidas');
  }

  /**
   * Obtener contador de no leídas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notificaciones/no-leidas/contador');
    return response.data.count;
  }

  /**
   * Obtener preferencias de notificaciones
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/notificaciones/preferencias');
    return response.data;
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/notificaciones/preferencias', preferences);
    return response.data;
  }

  /**
   * Registrar token de push notifications
   */
  async registerPushToken(token: string, device_type: 'web' | 'android' | 'ios'): Promise<void> {
    await api.post('/notificaciones/push/registrar', { token, device_type });
  }

  /**
   * Desregistrar token de push notifications
   */
  async unregisterPushToken(token: string): Promise<void> {
    await api.post('/notificaciones/push/desregistrar', { token });
  }

  /**
   * Probar envío de notificación (solo desarrollo)
   */
  async testNotification(tipo: string): Promise<void> {
    if (process.env.NODE_ENV !== 'development') return;
    await api.post('/notificaciones/test', { tipo });
  }

  /**
   * Suscribirse a notificaciones en tiempo real (SSE o WebSocket)
   */
  subscribeToNotifications(
    onNotification: (notification: Notification) => void,
    onUnreadCount: (count: number) => void
  ): () => void {
    // TODO: Implementar con WebSocket o Server-Sent Events
    // Por ahora, polling cada 30 segundos
    const intervalId = setInterval(async () => {
      try {
        const count = await this.getUnreadCount();
        onUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }
}

export const notificationService = new NotificationService();

