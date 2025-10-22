/**
 * Servicio de Búsqueda
 * Endpoints: /api/v1/search/*
 */

import { api } from '../api';
import { SearchProfessionalsRequest, SearchResult } from '@/types';

export const searchService = {
  /**
   * GET /api/v1/search/professionals
   * Buscar profesionales por oficio y ubicación
   */
  searchProfessionals: async (params: SearchProfessionalsRequest): Promise<SearchResult[]> => {
    const response = await api.get<SearchResult[]>('/search/professionals', {
      params,
    });
    return response.data;
  },
};
