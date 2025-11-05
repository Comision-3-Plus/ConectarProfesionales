import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/lib/services';
import { toast } from 'sonner';

/**
 * Hook useRequestRefund
 * 
 * Mutation hook para solicitar un reembolso.
 * Solo disponible para CLIENTES cuando no están satisfechos con el trabajo.
 * 
 * Inicia un proceso de disputa que debe ser revisado por el admin.
 * 
 * @returns {
 *   mutate: ({ transactionId, motivo }) => void,
 *   isPending,
 *   error,
 *   ...mutationResult
 * }
 * 
 * @example
 * ```tsx
 * const { mutate: requestRefund, isPending } = useRequestRefund();
 * 
 * const handleRefund = (formData) => {
 *   requestRefund({
 *     transactionId: transaction.id,
 *     motivo: formData.motivo,
 *   });
 * };
 * ```
 */
export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, motivo }: { transactionId: string; motivo: string }) => {
      return await paymentService.requestRefund(transactionId, motivo);
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      
      // Toast informativo
      toast.info('Solicitud de reembolso enviada', {
        description: 'Un administrador revisará tu caso. Recibirás una notificación pronto.',
      });
    },
    onError: (error: any) => {
      toast.error('Error al solicitar reembolso', {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
}
