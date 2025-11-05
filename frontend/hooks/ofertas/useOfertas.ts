import { useQuery } from '@tanstack/react-query';
import { ofertasService } from '@/lib/services/ofertasService';

/**
 * Hook para obtener todas las ofertas del usuario actual
 * 
 * CARACTERÍSTICAS:
 * ✅ Obtiene ofertas como profesional o como cliente (el backend decide)
 * ✅ staleTime de 30 segundos (ofertas no cambian muy rápido)
 * ✅ Enabled por defecto (se puede deshabilitar si es necesario)
 * 
 * @example
 * const { data: ofertas, isLoading } = useOfertas();
 * 
 * // Con enabled condicional
 * const { data: ofertas } = useOfertas({ enabled: isAuthenticated });
 */
export function useOfertas(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['ofertas'],
    queryFn: async () => {
      return await ofertasService.getMyOfertas();
    },
    staleTime: 30_000, // 30 segundos
    enabled: options?.enabled ?? true,
  });
}
