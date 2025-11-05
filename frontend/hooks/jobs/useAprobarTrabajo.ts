import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trabajosService } from '@/lib/services/trabajosService';
import { toast } from 'sonner';
import { type AprobarTrabajoFormData } from '@/types/forms/jobs';

/**
 * Hook: aprobar un trabajo (cliente)
 * 
 * Acción: cliente aprueba el trabajo y libera el pago (COMPLETADO → APROBADO)
 */
export function useAprobarTrabajo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trabajoId, notas_cliente }: AprobarTrabajoFormData) => {
      return trabajosService.aprobarTrabajo(trabajoId, notas_cliente);
    },
    onSuccess: (_, variables) => {
      toast.success('Trabajo aprobado y pago liberado', {
        description: 'El profesional recibirá su pago',
      });
      
      // Invalidar queries relacionadas (incluyendo balance de payments)
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
      queryClient.invalidateQueries({ queryKey: ['trabajo', variables.trabajoId] });
      queryClient.invalidateQueries({ queryKey: ['trabajo-timeline', variables.trabajoId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al aprobar el trabajo');
    },
  });
}
