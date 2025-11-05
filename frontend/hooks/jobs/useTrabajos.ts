import { useQuery } from '@tanstack/react-query';
import { trabajosService, type Trabajo } from '@/lib/services/trabajosService';
import { EstadoTrabajo } from '@/types/forms/jobs';

/**
 * Hook: obtener mis trabajos (con filtros opcionales)
 * 
 * @param filters - Filtros opcionales por estado
 * @returns Query con lista de trabajos
 */
export function useTrabajos(filters?: {
  estado?: EstadoTrabajo;
}) {
  return useQuery({
    queryKey: ['trabajos', filters],
    queryFn: async () => {
      const trabajos = await trabajosService.getMyTrabajos();

      // Filtrar por estado si se especifica
      if (filters?.estado) {
        return trabajos.filter((t) => t.estado === filters.estado);
      }

      return trabajos;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}
