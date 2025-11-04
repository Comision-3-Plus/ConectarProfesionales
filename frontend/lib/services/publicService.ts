/**
 * Servicio Público (sin autenticación requerida)
 * Endpoints: /api/v1/public/*
 */

import { api } from '../api';
import { PublicProfileResponse, PortfolioItemRead, OficioRead, ServicioInstantaneoRead, ResenaPublicRead } from '@/types';

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

  /**
   * GET /api/v1/public/professional/{prof_id}/resenas
   * Obtener reseñas públicas de un profesional
   */
  getReviews: async (profId: string): Promise<ResenaPublicRead[]> => {
    try {
      const response = await api.get<ResenaPublicRead[]>(`/public/professional/${profId}/resenas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      return [];
    }
  },

  /**
   * GET /api/v1/servicios
   * Obtener todos los proyectos/servicios publicados (Marketplace)
   */
  getProyectosPublicados: async (params?: { oficio_id?: string }): Promise<ServicioInstantaneoRead[]> => {
    const response = await api.get<ServicioInstantaneoRead[]>('/servicios', { params });
    return response.data;
  },
};
