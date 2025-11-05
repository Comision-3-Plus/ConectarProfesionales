import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trabajosService } from '@/lib/services/trabajosService';
import { toast } from 'sonner';
import { type AddImagenesFormData } from '@/types/forms/jobs';

/**
 * Hook: agregar imágenes a un trabajo
 * 
 * Acción: agregar imágenes adicionales durante el trabajo
 */
export function useAddImagenes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trabajoId, imagenes }: AddImagenesFormData) => {
      return trabajosService.addImagenes(trabajoId, imagenes);
    },
    onSuccess: (_, variables) => {
      toast.success('Imágenes agregadas correctamente');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['trabajo', variables.trabajoId] });
      queryClient.invalidateQueries({ queryKey: ['trabajo-timeline', variables.trabajoId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al agregar imágenes');
    },
  });
}
