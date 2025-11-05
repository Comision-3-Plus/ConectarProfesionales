/**
 * Hook de React Query para obtener la lista de oficios
 * 
 * REUTILIZABLE en todo el proyecto:
 * - Registro (seleccionar oficio al registrarse como profesional)
 * - Búsqueda (filtrar por oficio)
 * - Perfil (editar oficio del profesional)
 */

import { useQuery } from '@tanstack/react-query';
import { oficiosService } from '@/lib/services/oficiosService';

/**
 * Hook para obtener todos los oficios disponibles
 * Los datos se cachean automáticamente por React Query
 * 
 * @example
 * ```tsx
 * const { data: oficios, isLoading } = useOficios();
 * 
 * // Uso en un Select
 * {oficios?.map((oficio) => (
 *   <SelectItem key={oficio.id} value={oficio.id}>
 *     {oficio.nombre}
 *   </SelectItem>
 * ))}
 * ```
 */
export function useOficios() {
  return useQuery({
    queryKey: ['oficios'],
    queryFn: async () => {
      return await oficiosService.getAll();
    },
    // Los oficios no cambian frecuentemente - 1 hora de cache
    staleTime: 1000 * 60 * 60,
    // Mantener en cache por 24 horas
    gcTime: 1000 * 60 * 60 * 24,
  });
}
