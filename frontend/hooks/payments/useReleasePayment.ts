import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/lib/services';
import { toast } from 'sonner';

/**
 * Hook useReleasePayment
 * 
 * Mutation hook para liberar un pago al profesional.
 * Solo disponible para CLIENTES cuando el trabajo está completo.
 * 
 * El pago pasa de "DEPOSITADO" (escrow) a "LIBERADO" (profesional recibe el dinero).
 * 
 * @returns {
 *   mutate: (transactionId: string) => void,
 *   isPending,
 *   error,
 *   ...mutationResult
 * }
 * 
 * @example
 * ```tsx
 * const { mutate: releasePayment, isPending } = useReleasePayment();
 * 
 * <Button
 *   onClick={() => releasePayment(transaction.id)}
 *   disabled={isPending}
 * >
 *   {isPending ? 'Liberando...' : 'Liberar Pago'}
 * </Button>
 * ```
 */
export function useReleasePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      return await paymentService.releasePayment(transactionId);
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
      
      // Toast de éxito
      toast.success('Pago liberado exitosamente', {
        description: 'El profesional recibirá el dinero en 24-48 horas.',
      });
    },
    onError: (error: any) => {
      toast.error('Error al liberar el pago', {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
}
