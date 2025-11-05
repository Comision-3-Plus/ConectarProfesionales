import { useQuery } from '@tanstack/react-query';
import { trabajosService } from '@/lib/services/trabajosService';

/**
 * Hook: obtener un trabajo por ID
 * 
 * @param trabajoId - ID del trabajo
 * @param incluirDisplay - Incluir datos de display (cliente, profesional, oferta)
 * @returns Query con datos del trabajo
 */
export function useTrabajoById(trabajoId: string | undefined) {
  return useQuery({
    queryKey: ['trabajo', trabajoId],
    queryFn: () => trabajosService.getTrabajoById(trabajoId!),
    enabled: !!trabajoId,
    staleTime: 30 * 1000, // 30 segundos
  });
}
