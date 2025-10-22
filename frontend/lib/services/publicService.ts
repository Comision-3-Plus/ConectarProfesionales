/**
 * Servicio Público (sin autenticación requerida)
 * Endpoints: /api/v1/public/*
 */

import { api } from '../api';
import { PublicProfileResponse, PortfolioItemRead, OficioRead } from '@/types';

export const publicService = {
  /**
   * GET /api/v1/public/oficios
   * Listar todos los oficios disponibles (público)
   */
  getOficios: async (): Promise<OficioRead[]> => {
    const response = await api.get<OficioRead[]>('/public/oficios');
    return response.data;
  },

  /**
   * GET /api/v1/public/professional/{profesional_id}
   * Ver perfil público completo de un profesional
   */
  getProfessionalProfile: async (profesionalId: string): Promise<PublicProfileResponse> => {
    const response = await api.get<PublicProfileResponse>(`/public/professional/${profesionalId}`);
    return response.data;
  },

  /**
   * GET /api/v1/public/professional/{prof_id}/portfolio
   * Ver portfolio de un profesional (público)
   */
  getProfessionalPortfolio: async (profId: string): Promise<PortfolioItemRead[]> => {
    const response = await api.get<PortfolioItemRead[]>(`/public/professional/${profId}/portfolio`);
    return response.data;
  },
};
