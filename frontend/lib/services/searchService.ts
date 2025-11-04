/**
 * Servicio de Búsqueda
 * Endpoints: /profesionales/search (POST)
 */

import { api } from '../api';
import { SearchProfessionalsRequest, SearchResult } from '@/types';

interface SearchResponse {
  total: number;
  resultados: SearchResult[];
  pagina: number;
  total_paginas: number;
}

export const searchService = {
  /**
   * POST /search
   * Buscar profesionales por oficio y ubicación (PostGIS)
   * 
   * IMPORTANTE: El backend espera POST, no GET
   * Backend endpoint: API Gateway -> servicio_profesionales:8003/search
   * 
   * Parámetros del backend:
   * - latitude: float (obligatorio)
   * - longitude: float (obligatorio)
   * - radio_km: int (default: 10)
   * - oficio: string (opcional - nombre del oficio)
   * - rating_minimo: float (opcional)
   * - precio_minimo: Decimal (opcional)
   * - precio_maximo: Decimal (opcional)
   * - disponible: bool (opcional - solo profesionales con acepta_instant=true)
   * - ordenar_por: 'rating' | 'precio' | 'distancia' (opcional)
   * - skip: int (paginación - default: 0)
   * - limit: int (paginación - default: 100)
   */
  searchProfessionals: async (params: SearchProfessionalsRequest): Promise<SearchResult[]> => {
    try {
      // Construir parámetros del backend
      const searchParams: any = {
        latitude: params.ubicacion_lat,
        longitude: params.ubicacion_lon,
        radio_km: params.radio_km || 10,
        skip: params.skip || 0,
        limit: params.limit || 100,
        ordenar_por: params.ordenar_por || 'rating', // Por defecto ordenar por rating
      };

      // Agregar filtros opcionales solo si están presentes
      if (params.oficio) {
        searchParams.oficio = params.oficio;
      }
      if (params.rating_min !== undefined && params.rating_min !== null) {
        searchParams.rating_minimo = params.rating_min;
      }
      if (params.tarifa_min !== undefined && params.tarifa_min !== null) {
        searchParams.precio_minimo = params.tarifa_min;
      }
      if (params.tarifa_max !== undefined && params.tarifa_max !== null) {
        searchParams.precio_maximo = params.tarifa_max;
      }
      if (params.solo_disponibles_ahora !== undefined) {
        searchParams.disponible = params.solo_disponibles_ahora;
      }

      console.log('[SearchService] Buscando profesionales con params:', searchParams);

      const response = await api.post<SearchResponse>('/search', searchParams);

      console.log('[SearchService] Resultados:', {
        total: response.data.total,
        count: response.data.resultados?.length || 0,
      });

      return response.data.resultados || [];
    } catch (error: any) {
      console.error('[SearchService] Error al buscar profesionales:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Si falla, devolver array vacío en vez de lanzar error
      return [];
    }
  },

  /**
   * POST /profesionales/search con geolocalización del usuario
   * Intenta obtener la ubicación actual del navegador
   */
  searchProfessionalsNearMe: async (
    params: Omit<SearchProfessionalsRequest, 'ubicacion_lat' | 'ubicacion_lon'>
  ): Promise<SearchResult[]> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocalización no soportada');
        resolve([]);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const results = await searchService.searchProfessionals({
              ...params,
              ubicacion_lat: position.coords.latitude,
              ubicacion_lon: position.coords.longitude,
            });
            resolve(results);
          } catch (error) {
            console.error('Error al buscar profesionales:', error);
            resolve([]);
          }
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          resolve([]);
        }
      );
    });
  },
};
