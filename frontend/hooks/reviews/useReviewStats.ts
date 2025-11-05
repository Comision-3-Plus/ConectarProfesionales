import { useQuery } from '@tanstack/react-query';
import { reviewService, type ReviewStats } from '@/lib/services/reviewService';

/**
 * Hook: obtener estadísticas de reseñas de un profesional
 * 
 * @param profesionalId - ID del profesional
 * @returns Query con stats (promedio, total, distribución)
 */
export function useReviewStats(profesionalId: string | undefined) {
  return useQuery<ReviewStats>({
    queryKey: ['review-stats', profesionalId],
    queryFn: () => reviewService.getProfessionalStats(profesionalId!),
    enabled: !!profesionalId,
    staleTime: 60 * 1000, // 1 minuto
  });
}
