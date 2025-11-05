import { useQuery } from '@tanstack/react-query';
import { trabajosService, type TimelineEvent } from '@/lib/services/trabajosService';

/**
 * Hook: obtener timeline/historial de un trabajo
 * 
 * @param trabajoId - ID del trabajo
 * @returns Query con array de eventos del timeline
 */
export function useTrabajoTimeline(trabajoId: string | undefined) {
  return useQuery<TimelineEvent[]>({
    queryKey: ['trabajo-timeline', trabajoId],
    queryFn: () => trabajosService.getTrabajoTimeline(trabajoId!),
    enabled: !!trabajoId,
    staleTime: 60 * 1000, // 1 minuto (timeline no cambia tan seguido)
  });
}
