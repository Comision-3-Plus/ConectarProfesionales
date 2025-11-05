import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trabajosService } from '@/lib/services/trabajosService';
import { toast } from 'sonner';
import { type CompletarTrabajoFormData } from '@/types/forms/jobs';

/**
 * Hook: completar un trabajo (profesional)
 * 
 * Acción: profesional marca trabajo como completado (EN_PROCESO → COMPLETADO)
 */
export function useCompletarTrabajo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trabajoId, notas_profesional, imagenes }: CompletarTrabajoFormData) => {
      return trabajosService.completarTrabajo(trabajoId, notas_profesional, imagenes);
    },
    onSuccess: (_, variables) => {
      toast.success('Trabajo marcado como completado', {
        description: 'El cliente recibirá una notificación para aprobarlo',
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
      queryClient.invalidateQueries({ queryKey: ['trabajo', variables.trabajoId] });
      queryClient.invalidateQueries({ queryKey: ['trabajo-timeline', variables.trabajoId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al completar el trabajo');
    },
  });
}
