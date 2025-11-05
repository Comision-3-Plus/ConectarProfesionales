import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/lib/services';
import type { SearchFiltersFormData } from '@/types/forms/search';
import { searchFiltersToBackend } from '@/types/forms/search';

/**
 * Hook para buscar profesionales con filtros dinámicos
 * 
 * CARACTERÍSTICAS CLAVE:
 * ✅ QueryKey dinámica basada en filtros (React Query cachea por filtros diferentes)
 * ✅ Paginación con page y limit
 * ✅ Enabled condicionalmente (solo si hay ubicación O oficio)
 * ✅ staleTime para evitar re-fetch innecesarios
 * 
 * @param filters - Filtros de búsqueda (del formulario)
 * @param enabled - Habilitar/deshabilitar la query (opcional)
 * 
 * @example
 * const { data: profesionales, isLoading } = useSearchProfessionals({
 *   oficio: 'Plomero',
 *   radio_km: 20,
 *   page: 1,
 * });
 */
export function useSearchProfessionals(
  filters: Partial<SearchFiltersFormData>,
  options?: {
    enabled?: boolean;
  }
) {
  // Convertir filtros del formulario al formato del backend
  const backendParams = searchFiltersToBackend(filters as SearchFiltersFormData);
  
  // Determinar si la query está habilitada
  // Solo buscar si:
  // 1. Hay coordenadas (ubicacion_lat y ubicacion_lon)
  // 2. O hay un oficio seleccionado
  // 3. O el usuario explícitamente habilitó la búsqueda
  const hasLocation = 
    backendParams.ubicacion_lat !== undefined && 
    backendParams.ubicacion_lon !== undefined;
  
  const hasOficio = !!backendParams.oficio;
  
  const shouldFetch = options?.enabled ?? (hasLocation || hasOficio);
  
  return useQuery({
    // QueryKey DINÁMICA: cada combinación de filtros crea un cache diferente
    // React Query cachea inteligentemente por estos valores
    queryKey: [
      'search-professionals',
      backendParams.oficio,
      backendParams.ubicacion_lat,
      backendParams.ubicacion_lon,
      backendParams.radio_km,
      backendParams.tarifa_min,
      backendParams.tarifa_max,
      backendParams.rating_min,
      backendParams.solo_disponibles_ahora,
      backendParams.ordenar_por,
      backendParams.skip, // Paginación: cada página es un cache diferente
      backendParams.limit,
    ],
    
    queryFn: async () => {
      // Llamar al servicio de búsqueda
      // El servicio ya maneja ubicaciones opcionales y devuelve [] si falla
      const results = await searchService.searchProfessionals(backendParams as any);
      return results;
    },
    
    // Solo ejecutar si está habilitada
    enabled: shouldFetch,
    
    // Mantener los datos frescos por 30 segundos
    // (los resultados de búsqueda no cambian tan rápido)
    staleTime: 30_000,
    
    // Mantener datos en cache por 5 minutos
    gcTime: 5 * 60 * 1000,
    
    // No refetch automáticamente al hacer focus en la ventana
    // (el usuario debe hacer búsqueda manual)
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener el total de resultados de la búsqueda actual
 * 
 * Útil para mostrar "Mostrando X de Y resultados"
 * 
 * @param filters - Los mismos filtros usados en useSearchProfessionals
 */
export function useSearchResultsCount(filters: Partial<SearchFiltersFormData>) {
  const { data: results } = useSearchProfessionals(filters);
  return results?.length ?? 0;
}
