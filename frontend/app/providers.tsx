'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { initializeAxiosInterceptors } from '@/lib/api/interceptors';
import { AuthProvider } from '@/components/providers/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos más tiempo
            gcTime: 10 * 60 * 1000, // 10 minutos en caché (garbage collection time)
            refetchOnWindowFocus: false, // No recargar al cambiar de ventana
            refetchOnMount: false, // No recargar si ya hay datos en caché
            refetchOnReconnect: true, // Sí recargar al reconectar internet
            retry: 1, // Solo 1 reintento en caso de error
            retryDelay: 1000, // 1 segundo entre reintentos
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  // Inicializar interceptores de Axios
  useEffect(() => {
    initializeAxiosInterceptors();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
