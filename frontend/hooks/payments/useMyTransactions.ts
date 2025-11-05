import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/lib/services';

/**
 * Hook useMyTransactions
 * 
 * Query hook para obtener las transacciones del usuario actual.
 * Más simple que usePaymentHistory, devuelve solo la lista de transacciones.
 * 
 * @param params - Parámetros opcionales (estado, paginación)
 * @param enabled - Si la query está habilitada (default: true)
 * 
 * @returns {
 *   data: { transacciones: Transaction[], total: number },
 *   isLoading,
 *   error,
 *   ...queryResult
 * }
 * 
 * @example
 * ```tsx
 * // Todas las transacciones
 * const { data, isLoading } = useMyTransactions();
 * 
 * // Solo transacciones completadas
 * const { data } = useMyTransactions({ estado: 'completado' });
 * ```
 */
export function useMyTransactions(
  params?: {
    estado?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['my-transactions', params?.estado, params?.page, params?.limit],
    queryFn: async () => {
      return await paymentService.getMyTransactions(params);
    },
    staleTime: 30000, // 30 segundos
    enabled,
  });
}
