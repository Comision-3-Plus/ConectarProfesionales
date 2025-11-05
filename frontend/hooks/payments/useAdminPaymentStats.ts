import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/lib/services';

/**
 * Hook useAdminPaymentStats
 * 
 * Query hook para obtener las estadísticas financieras del admin.
 * Solo disponible para usuarios con rol ADMIN.
 * 
 * Incluye: total de transacciones, monto procesado, comisiones,
 * pagos pendientes, retiros pendientes, ingresos último mes.
 * 
 * @param enabled - Si la query está habilitada (default: true)
 * 
 * @returns {
 *   data: {
 *     total_transacciones: number,
 *     total_monto_procesado: number,
 *     total_comisiones: number,
 *     pagos_pendientes: number,
 *     retiros_pendientes: number,
 *     ingresos_ultimo_mes: number
 *   },
 *   isLoading,
 *   error,
 *   ...queryResult
 * }
 * 
 * @example
 * ```tsx
 * const { data: stats, isLoading } = useAdminPaymentStats();
 * 
 * if (!isLoading && stats) {
 *   console.log(`Total procesado: $${stats.total_monto_procesado}`);
 *   console.log(`Comisiones: $${stats.total_comisiones}`);
 * }
 * ```
 */
export function useAdminPaymentStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin-payment-stats'],
    queryFn: async () => {
      return await paymentService.adminGetDashboard();
    },
    staleTime: 60000, // 1 minuto
    enabled,
  });
}
