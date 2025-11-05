import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trabajosService } from '@/lib/services/trabajosService';
import { toast } from 'sonner';
import { type CancelarTrabajoFormData } from '@/types/forms/jobs';

/**
 * Hook: cancelar un trabajo
 * 
 * Acción: cliente o profesional cancela el trabajo (cualquier estado → CANCELADO)
 */
export function useCancelarTrabajo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trabajoId, motivo }: CancelarTrabajoFormData) => {
      // El servicio actual no acepta motivo, solo cancela
      // Podríamos agregarlo al backend o guardarlo en notas antes de cancelar
      return trabajosService.cancelarTrabajo(trabajoId);
    },
    onSuccess: (_, variables) => {
      toast.success('Trabajo cancelado', {
        description: 'El pago será procesado según las políticas',
      });
      
      // Invalidar queries relacionadas (incluyendo payments por posible reembolso)
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
      queryClient.invalidateQueries({ queryKey: ['trabajo', variables.trabajoId] });
      queryClient.invalidateQueries({ queryKey: ['trabajo-timeline', variables.trabajoId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cancelar el trabajo');
    },
  });
}
