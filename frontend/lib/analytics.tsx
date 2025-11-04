'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Hook para inicializar Google Analytics 4
 */
export function useGoogleAnalytics(measurementId: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    // Cargar script de GA4 si no está cargado
    if (!window.gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId);
    }
  }, [measurementId]);

  // Track page views
  useEffect(() => {
    if (!window.gtag) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', measurementId, {
      page_path: url,
    });
  }, [pathname, searchParams, measurementId]);
}

/**
 * Funciones para eventos personalizados de GA4
 */
export const analytics = {
  // Búsqueda de profesionales
  trackSearch: (searchTerm: string, filters?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm,
        ...filters,
      });
    }
  },

  // Ver perfil de profesional
  trackProfileView: (profesionalId: string, profesionalName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        item_id: profesionalId,
        item_name: profesionalName,
        item_category: 'professional',
      });
    }
  },

  // Crear oferta
  trackCreateOffer: (trabajoId: string, amount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'ARS',
        value: amount,
        items: [
          {
            item_id: trabajoId,
            item_category: 'offer',
            price: amount,
          },
        ],
      });
    }
  },

  // Iniciar pago
  trackBeginCheckout: (trabajoId: string, amount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'ARS',
        value: amount,
        items: [
          {
            item_id: trabajoId,
            price: amount,
          },
        ],
      });
    }
  },

  // Pago completado
  trackPurchase: (transactionId: string, amount: number, trabajoId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'ARS',
        value: amount,
        items: [
          {
            item_id: trabajoId,
            price: amount,
          },
        ],
      });
    }
  },

  // Registro de usuario
  trackSignUp: (method: string, userRole: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method,
        user_role: userRole,
      });
    }
  },

  // Login
  trackLogin: (method: string, userRole: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method,
        user_role: userRole,
      });
    }
  },

  // Publicar reseña
  trackReview: (profesionalId: string, rating: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'review', {
        professional_id: profesionalId,
        rating,
      });
    }
  },

  // Enviar mensaje
  trackMessage: (conversationId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'message_sent', {
        conversation_id: conversationId,
      });
    }
  },

  // Completar trabajo
  trackWorkComplete: (trabajoId: string, amount: number, duration: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'work_complete', {
        trabajo_id: trabajoId,
        value: amount,
        duration_days: duration,
      });
    }
  },

  // Compartir perfil
  trackShare: (method: string, contentType: string, itemId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method,
        content_type: contentType,
        item_id: itemId,
      });
    }
  },

  // Evento personalizado genérico
  trackCustomEvent: (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  },
};

/**
 * Componente de Analytics Provider
 */
interface AnalyticsProviderProps {
  children: React.ReactNode;
  measurementId?: string;
}

export function AnalyticsProvider({ children, measurementId }: AnalyticsProviderProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useGoogleAnalytics(gaId || '');

  return <>{children}</>;
}
