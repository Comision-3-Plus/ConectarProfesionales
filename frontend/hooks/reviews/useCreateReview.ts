import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/lib/services/reviewService';
import { toast } from 'sonner';
import { type CreateReviewFormData } from '@/types/forms/reviews';

/**
 * Hook: crear una reseña para un trabajo completado
 * 
 * Acción: cliente crea reseña después de aprobar trabajo
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trabajo_id, profesional_id, valoracion, comentario }: CreateReviewFormData) => {
      // Adaptar valoracion -> rating para el servicio
      return reviewService.createReview(trabajo_id, valoracion, comentario || undefined);
    },
    onSuccess: (_, variables) => {
      toast.success('Reseña publicada exitosamente', {
        description: 'Gracias por compartir tu experiencia',
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.profesional_id] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.profesional_id] });
      queryClient.invalidateQueries({ queryKey: ['trabajo', variables.trabajo_id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al publicar reseña');
    },
  });
}
