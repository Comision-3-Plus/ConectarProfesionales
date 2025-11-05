/**
 * Hook de React Query para obtener la lista de oficios
 */

import { useQuery } from '@tanstack/react-query';
import { oficiosService } from '@/lib/services/oficiosService';

/**
 * Hook para obtener todos los oficios disponibles
 * Los datos se cachean automáticamente por React Query
 * 
 * @example
 * ```tsx
 * const { data: oficios, isLoading } = useOficios();
 * ```
 */
export function useOficios() {
  return useQuery({
    queryKey: ['oficios'],
    queryFn: async () => {
      return await oficiosService.getAll();
    },
    staleTime: 1000 * 60 * 60, // Los oficios no cambian frecuentemente - 1 hora
  });
}
