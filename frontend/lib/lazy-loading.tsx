'use client';

import { Suspense, ComponentType, lazy, ReactNode } from 'react';

interface LazyLoadProps {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Wrapper para lazy loading con Suspense
 */
export function LazyLoad({ fallback, children }: LazyLoadProps) {
  return <Suspense fallback={fallback || <div>Cargando...</div>}>{children}</Suspense>;
}

/**
 * HOC para lazy loading de componentes
 */
export function withLazyLoad<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <div>Cargando...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy load de componentes comunes del proyecto
 * NOTA: Los componentes deben exportar 'default' para usar lazy()
 * Si el componente usa 'export function Nombre', cambia a 'export default function Nombre'
 */

// Dashboard - Comentado hasta que exista
// export const LazyDashboard = lazy(() => import('@/app/dashboard/page'));

// Chat - Comentado: necesitan export default
// export const LazyChatList = lazy(() => import('@/components/chat/ChatList'));
// export const LazyChatWindow = lazy(() => import('@/components/chat/ChatWindow'));

// Maps - Comentado: no existe todavía
// export const LazyMapView = lazy(() => import('@/components/maps/MapView'));

// Portfolio - Comentado: no existe todavía
// export const LazyPortfolioGallery = lazy(
//   () => import('@/components/portfolio/PortfolioGallery')
// );

// Reviews - Comentado: no existe todavía
// export const LazyReviewList = lazy(() => import('@/components/reviews/ReviewList'));

// Payment - Comentado: necesita export default
// export const LazyPaymentCheckout = lazy(
//   () => import('@/components/payment/PaymentCheckout')
// );

// Charts - Comentado: necesita export default
// export const LazyChartCard = lazy(() => import('@/components/dashboard/ChartCard'));

// Notifications - Comentado: necesita export default
// export const LazyNotificationCenter = lazy(
//   () => import('@/components/notifications/NotificationCenter')
// );

/**
 * Preload de componentes importantes
 */
export function preloadComponent(
  importFunc: () => Promise<{ default: ComponentType<unknown> }>
) {
  importFunc();
}

/**
 * Hook para preload on hover
 */
export function usePreloadOnHover(
  importFunc: () => Promise<{ default: ComponentType<unknown> }>
) {
  return {
    onMouseEnter: () => preloadComponent(importFunc),
    onFocus: () => preloadComponent(importFunc),
  };
}
