import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trabajosService } from '@/lib/services/trabajosService';
import { toast } from 'sonner';
import { type IniciarTrabajoFormData } from '@/types/forms/jobs';

/**
 * Hook: iniciar un trabajo (profesional)
 * 
 * Acción: profesional inicia el trabajo (PAGADO → EN_PROCESO)
 */
export function useIniciarTrabajo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trabajoId, notas_profesional }: IniciarTrabajoFormData) => {
      return trabajosService.iniciarTrabajo(trabajoId, notas_profesional);
    },
    onSuccess: (_, variables) => {
      toast.success('Trabajo iniciado correctamente');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
      queryClient.invalidateQueries({ queryKey: ['trabajo', variables.trabajoId] });
      queryClient.invalidateQueries({ queryKey: ['trabajo-timeline', variables.trabajoId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al iniciar el trabajo');
    },
  });
}
