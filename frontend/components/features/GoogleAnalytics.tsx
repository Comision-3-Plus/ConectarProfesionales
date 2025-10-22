'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId: string;
}

// Declaración global para gtag
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

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

// Hook para trackear eventos personalizados
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Eventos predefinidos comunes
export const analytics = {
  // Conversión: Usuario se registra
  trackSignup: (method: string) => {
    trackEvent('sign_up', 'engagement', method);
  },

  // Conversión: Usuario inicia sesión
  trackLogin: (method: string) => {
    trackEvent('login', 'engagement', method);
  },

  // Interacción: Usuario busca profesionales
  trackSearch: (searchTerm: string) => {
    trackEvent('search', 'engagement', searchTerm);
  },

  // Conversión: Usuario contacta a un profesional
  trackContactProfessional: (professionalId: string) => {
    trackEvent('contact_professional', 'conversion', professionalId);
  },

  // Conversión: Usuario acepta una oferta
  trackAcceptOffer: (offerId: string, amount: number) => {
    trackEvent('accept_offer', 'conversion', offerId, amount);
  },

  // Interacción: Usuario ve un perfil
  trackViewProfile: (professionalId: string) => {
    trackEvent('view_profile', 'engagement', professionalId);
  },

  // Conversión: Usuario completa un proyecto
  trackCompleteProject: (projectId: string, amount: number) => {
    trackEvent('complete_project', 'conversion', projectId, amount);
  },

  // Interacción: Usuario deja una reseña
  trackLeaveReview: (rating: number) => {
    trackEvent('leave_review', 'engagement', 'rating', rating);
  },
};
