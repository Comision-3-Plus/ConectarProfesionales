import { z } from 'zod';

/**
 * Schema de validación para filtros de búsqueda de profesionales
 * 
 * Usado en el formulario de búsqueda con react-hook-form
 * Se convierte a SearchProfessionalsRequest para el backend
 */
export const searchFiltersSchema = z.object({
  // Búsqueda por texto libre
  q: z.string().optional(),
  
  // Filtro por oficio (nombre)
  oficio: z.string().optional(),
  
  // Filtro por oficio ID (para el selector)
  oficio_id: z.string().optional(),
  
  // Ubicación (ambos opcionales - si no se proveen, no se filtra por ubicación)
  ubicacion_lat: z.number().optional(),
  ubicacion_lon: z.number().optional(),
  
  // Radio de búsqueda en kilómetros
  radio_km: z.number().min(1).max(500).optional().default(10),
  
  // Rango de tarifas (por hora)
  tarifa_min: z.number().min(0).optional(),
  tarifa_max: z.number().min(0).optional(),
  
  // Rating mínimo (1-5 estrellas)
  rating_min: z.number().min(1).max(5).optional(),
  
  // Solo profesionales disponibles ahora (acepta_instant = true)
  solo_disponibles_ahora: z.boolean().optional().default(false),
  
  // Incluir profesionales fuera del radio (si el backend lo soporta)
  incluir_fuera_de_radio: z.boolean().optional().default(false),
  
  // Ordenamiento
  ordenar_por: z.enum(['rating', 'precio', 'distancia']).optional().default('rating'),
  
  // Paginación
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(30),
}).refine(
  (data) => {
    // Si se provee tarifa_max, debe ser mayor que tarifa_min
    if (data.tarifa_min && data.tarifa_max) {
      return data.tarifa_max >= data.tarifa_min;
    }
    return true;
  },
  {
    message: 'La tarifa máxima debe ser mayor o igual a la mínima',
    path: ['tarifa_max'],
  }
).refine(
  (data) => {
    // Si se provee una coordenada, se debe proveer la otra
    const hasLat = data.ubicacion_lat !== undefined && data.ubicacion_lat !== null;
    const hasLon = data.ubicacion_lon !== undefined && data.ubicacion_lon !== null;
    
    if (hasLat || hasLon) {
      return hasLat && hasLon;
    }
    return true;
  },
  {
    message: 'Debes proveer latitud y longitud juntas, o ninguna',
    path: ['ubicacion_lon'],
  }
);

/**
 * TypeScript type inferido del schema
 */
export type SearchFiltersFormData = z.infer<typeof searchFiltersSchema>;

/**
 * Valores por defecto para el formulario de búsqueda
 */
export const defaultSearchFilters: Partial<SearchFiltersFormData> = {
  q: '',
  oficio_id: '',
  ubicacion_lat: undefined,
  ubicacion_lon: undefined,
  radio_km: 10,
  tarifa_min: undefined,
  tarifa_max: undefined,
  rating_min: undefined,
  solo_disponibles_ahora: false,
  incluir_fuera_de_radio: false,
  ordenar_por: 'rating',
  page: 1,
  limit: 30,
};

/**
 * Helper para convertir los filtros del formulario al formato del backend
 * 
 * El backend espera SearchProfessionalsRequest con ubicacion_lat/lon como numbers
 */
export function searchFiltersToBackend(filters: SearchFiltersFormData) {
  const skip = (filters.page - 1) * filters.limit;
  
  return {
    oficio: filters.oficio,
    ubicacion_lat: filters.ubicacion_lat,
    ubicacion_lon: filters.ubicacion_lon,
    radio_km: filters.radio_km,
    tarifa_min: filters.tarifa_min,
    tarifa_max: filters.tarifa_max,
    rating_min: filters.rating_min,
    solo_disponibles_ahora: filters.solo_disponibles_ahora,
    incluir_fuera_de_radio: filters.incluir_fuera_de_radio,
    ordenar_por: filters.ordenar_por,
    skip,
    limit: filters.limit,
  };
}
