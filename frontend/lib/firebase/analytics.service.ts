/**
 * Firebase Analytics Service
 * Servicio para tracking de eventos y análisis
 */

import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getAnalyticsInstance } from './config';

// ============================================================================
// EVENTOS PERSONALIZADOS
// ============================================================================

export enum AnalyticsEvent {
  // Autenticación
  SIGN_UP = 'sign_up',
  LOGIN = 'login',
  LOGOUT = 'logout',
  
  // Perfil
  PROFILE_VIEW = 'profile_view',
  PROFILE_EDIT = 'profile_edit',
  
  // Búsqueda
  SEARCH_PROFESSIONALS = 'search_professionals',
  FILTER_APPLY = 'filter_apply',
  
  // Ofertas
  OFFER_CREATE = 'offer_create',
  OFFER_ACCEPT = 'offer_accept',
  OFFER_REJECT = 'offer_reject',
  
  // Trabajos
  JOB_CREATE = 'job_create',
  JOB_COMPLETE = 'job_complete',
  JOB_CANCEL = 'job_cancel',
  
  // Chat
  CHAT_START = 'chat_start',
  MESSAGE_SEND = 'message_send',
  
  // Pagos
  PAYMENT_INITIATE = 'payment_initiate',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAIL = 'payment_fail',
  
  // Reseñas
  REVIEW_SUBMIT = 'review_submit',
  
  // Portfolio
  PORTFOLIO_VIEW = 'portfolio_view',
  PORTFOLIO_IMAGE_UPLOAD = 'portfolio_image_upload',
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

class AnalyticsService {
  /**
   * Registrar evento
   */
  logEvent(eventName: AnalyticsEvent | string, params?: Record<string, any>): void {
    try {
      const analytics = getAnalyticsInstance();
      if (analytics) {
        logEvent(analytics, eventName, params);
        console.log('📊 Evento registrado:', eventName, params);
      }
    } catch (error) {
      console.error('❌ Error al registrar evento:', error);
    }
  }

  /**
   * Establecer ID de usuario
   */
  setUserId(userId: string): void {
    try {
      const analytics = getAnalyticsInstance();
      if (analytics) {
        setUserId(analytics, userId);
        console.log('📊 User ID establecido:', userId);
      }
    } catch (error) {
      console.error('❌ Error al establecer user ID:', error);
    }
  }

  /**
   * Establecer propiedades del usuario
   */
  setUserProperties(properties: Record<string, any>): void {
    try {
      const analytics = getAnalyticsInstance();
      if (analytics) {
        setUserProperties(analytics, properties);
        console.log('📊 Propiedades de usuario establecidas:', properties);
      }
    } catch (error) {
      console.error('❌ Error al establecer propiedades de usuario:', error);
    }
  }

  // ========================================================================
  // MÉTODOS ESPECÍFICOS DE EVENTOS
  // ========================================================================

  /**
   * Registrar búsqueda de profesionales
   */
  trackSearch(oficio: string, location: string, filters?: Record<string, any>): void {
    this.logEvent(AnalyticsEvent.SEARCH_PROFESSIONALS, {
      oficio,
      location,
      ...filters,
    });
  }

  /**
   * Registrar creación de oferta
   */
  trackOfferCreate(ofertaId: string, profesionalId: string, monto: number): void {
    this.logEvent(AnalyticsEvent.OFFER_CREATE, {
      oferta_id: ofertaId,
      profesional_id: profesionalId,
      monto,
      currency: 'USD',
    });
  }

  /**
   * Registrar inicio de chat
   */
  trackChatStart(chatId: string, withUserId: string): void {
    this.logEvent(AnalyticsEvent.CHAT_START, {
      chat_id: chatId,
      with_user_id: withUserId,
    });
  }

  /**
   * Registrar envío de mensaje
   */
  trackMessageSend(chatId: string, messageType: 'text' | 'image' | 'file'): void {
    this.logEvent(AnalyticsEvent.MESSAGE_SEND, {
      chat_id: chatId,
      message_type: messageType,
    });
  }

  /**
   * Registrar pago iniciado
   */
  trackPaymentInitiate(trabajoId: string, monto: number): void {
    this.logEvent(AnalyticsEvent.PAYMENT_INITIATE, {
      trabajo_id: trabajoId,
      value: monto,
      currency: 'USD',
    });
  }

  /**
   * Registrar pago exitoso
   */
  trackPaymentSuccess(trabajoId: string, monto: number, paymentMethod: string): void {
    this.logEvent(AnalyticsEvent.PAYMENT_SUCCESS, {
      trabajo_id: trabajoId,
      value: monto,
      currency: 'USD',
      payment_method: paymentMethod,
    });
  }

  /**
   * Registrar reseña enviada
   */
  trackReviewSubmit(trabajoId: string, rating: number): void {
    this.logEvent(AnalyticsEvent.REVIEW_SUBMIT, {
      trabajo_id: trabajoId,
      rating,
    });
  }

  /**
   * Registrar visualización de perfil
   */
  trackProfileView(profesionalId: string): void {
    this.logEvent(AnalyticsEvent.PROFILE_VIEW, {
      profesional_id: profesionalId,
    });
  }

  /**
   * Registrar visualización de portfolio
   */
  trackPortfolioView(profesionalId: string, itemCount: number): void {
    this.logEvent(AnalyticsEvent.PORTFOLIO_VIEW, {
      profesional_id: profesionalId,
      item_count: itemCount,
    });
  }
}

// Exportar instancia singleton
export const analyticsService = new AnalyticsService();
