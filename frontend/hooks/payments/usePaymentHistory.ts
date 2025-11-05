import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/lib/services';
import type { PaymentHistoryFilters } from '@/types/forms/payments';

/**
 * Hook usePaymentHistory
 * 
 * Query hook para obtener el historial completo de movimientos financieros.
 * Incluye filtros por tipo (ingreso/egreso/comisión), rango de fechas y paginación.
 * 
 * @param filters - Filtros opcionales para el historial
 * @param enabled - Si la query está habilitada (default: true)
 * 
 * @returns {
 *   data: {
 *     movimientos: Transaction[],
 *     total: number,
 *     resumen: { total_ingresos, total_egresos, total_comisiones }
 *   },
 *   isLoading,
 *   error,
 *   ...queryResult
 * }
 * 
 * @example
 * ```tsx
 * // Obtener historial completo
 * const { data, isLoading } = usePaymentHistory();
 * 
 * // Con filtros
 * const { data } = usePaymentHistory({
 *   tipo: 'ingreso',
 *   desde: '2024-01-01',
 *   hasta: '2024-12-31',
 *   page: 1,
 *   limit: 20,
 * });
 * ```
 */
export function usePaymentHistory(
  filters?: Partial<PaymentHistoryFilters>,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['payment-history', filters?.tipo, filters?.desde, filters?.hasta, filters?.page, filters?.limit],
    queryFn: async () => {
      const params: any = {};
      
      if (filters?.tipo && filters.tipo !== 'todos') {
        params.tipo = filters.tipo;
      }
      if (filters?.desde) params.desde = filters.desde;
      if (filters?.hasta) params.hasta = filters.hasta;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;
      
      return await paymentService.getPaymentHistory(params);
    },
    staleTime: 30000, // 30 segundos
    enabled,
  });
}
