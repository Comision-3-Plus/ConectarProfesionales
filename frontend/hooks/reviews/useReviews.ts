import { useQuery } from '@tanstack/react-query';
import { reviewService, type ResenaPublicRead } from '@/lib/services/reviewService';

/**
 * Hook: obtener reseñas de un profesional
 * 
 * @param profesionalId - ID del profesional
 * @returns Query con lista de reseñas públicas
 */
export function useReviews(profesionalId: string | undefined) {
  return useQuery<ResenaPublicRead[]>({
    queryKey: ['reviews', profesionalId],
    queryFn: () => reviewService.getProfessionalReviews(profesionalId!),
    enabled: !!profesionalId,
    staleTime: 60 * 1000, // 1 minuto
  });
}
