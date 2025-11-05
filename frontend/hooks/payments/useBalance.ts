import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/lib/services';

/**
 * Hook useBalance
 * 
 * Query hook para obtener el balance financiero del profesional.
 * Incluye: saldo disponible, pendiente, total ganado, comisiones y trabajos completados.
 * 
 * Solo disponible para usuarios con rol PROFESIONAL.
 * 
 * @param enabled - Si la query está habilitada (default: true)
 * 
 * @returns {
 *   data: {
 *     disponible: number,
 *     pendiente: number,
 *     total_ganado: number,
 *     total_comisiones: number,
 *     trabajos_completados: number
 *   },
 *   isLoading,
 *   error,
 *   ...queryResult
 * }
 * 
 * @example
 * ```tsx
 * const { data: balance, isLoading } = useBalance();
 * 
 * if (!isLoading && balance) {
 *   console.log(`Disponible: $${balance.disponible}`);
 *   console.log(`Pendiente: $${balance.pendiente}`);
 * }
 * ```
 */
export function useBalance(enabled: boolean = true) {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      return await paymentService.getBalance();
    },
    staleTime: 60000, // 1 minuto (los balances no cambian tan seguido)
    enabled,
  });
}
