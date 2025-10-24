/**
 * Servicio de Profesionales
 * Endpoints: /api/v1/professional/*
 */

import { api } from '../api';
import {
  ProfessionalProfileRead,
  ProfessionalProfileUpdate,
  ProfessionalLocationUpdate,
  PayoutInfoUpdate,
  ProfessionalOficiosUpdate,
  OficioRead,
  ProfessionalServiciosInstantUpdate,
  ServicioInstantaneoRead,
  PortfolioItemCreate,
  PortfolioItemRead,
  OfertaCreate,
  OfertaRead,
  TrabajoRead,
} from '@/types';

export const professionalService = {
  /**
   * GET /api/v1/professional/me
   * Obtener perfil del profesional actual
   */
  getMe: async (): Promise<ProfessionalProfileRead> => {
    const response = await api.get<ProfessionalProfileRead>('/professional/me');
    return response.data;
  },

  /**
   * PUT /api/v1/professional/profile
   * Actualizar configuración del perfil profesional
   */
  updateProfile: async (profileData: ProfessionalProfileUpdate): Promise<ProfessionalProfileRead> => {
    const response = await api.put<ProfessionalProfileRead>('/professional/profile', profileData);
    return response.data;
  },

  /**
   * POST /api/v1/professional/kyc/upload
   * Subir documentos KYC
   */
  uploadKYC: async (files: File[]): Promise<{ status: string; message: string }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<{ status: string; message: string }>(
      '/professional/kyc/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * PUT /api/v1/professional/profile/oficios
   * Asignar oficios al profesional
   */
  updateOficios: async (oficiosData: ProfessionalOficiosUpdate): Promise<OficioRead[]> => {
    const response = await api.put<OficioRead[]>('/professional/profile/oficios', oficiosData);
    return response.data;
  },

  /**
   * PUT /api/v1/professional/profile/servicios-instant
   * Asignar servicios instantáneos al profesional
   */
  updateServiciosInstant: async (
    serviciosData: ProfessionalServiciosInstantUpdate
  ): Promise<ServicioInstantaneoRead[]> => {
    const response = await api.put<ServicioInstantaneoRead[]>(
      '/professional/profile/servicios-instant',
      serviciosData
    );
    return response.data;
  },

  /**
   * PUT /api/v1/professional/profile/location
   * Actualizar ubicación geográfica del profesional
   */
  updateLocation: async (locationData: ProfessionalLocationUpdate): Promise<ProfessionalProfileRead> => {
    const response = await api.put<ProfessionalProfileRead>(
      '/professional/profile/location',
      locationData
    );
    return response.data;
  },

  /**
   * PUT /api/v1/professional/payout-info
   * Actualizar información de pago del profesional
   */
  updatePayoutInfo: async (payoutData: PayoutInfoUpdate): Promise<{ status: string; message: string }> => {
    const response = await api.put<{ status: string; message: string }>(
      '/professional/payout-info',
      payoutData
    );
    return response.data;
  },

  // ==========================================
  // PORTFOLIO
  // ==========================================

  /**
   * POST /api/v1/professional/portfolio
   * Crear un item de portfolio
   */
  createPortfolioItem: async (itemData: PortfolioItemCreate): Promise<PortfolioItemRead> => {
    const response = await api.post<PortfolioItemRead>('/professional/portfolio', itemData);
    return response.data;
  },

  /**
   * POST /api/v1/professional/portfolio/{item_id}/image
   * Subir imagen a un item de portfolio
   */
  uploadPortfolioImage: async (itemId: string, file: File): Promise<PortfolioItemRead> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<PortfolioItemRead>(
      `/professional/portfolio/${itemId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/professional/portfolio/{item_id}
   * Eliminar un item de portfolio
   */
  deletePortfolioItem: async (itemId: string): Promise<void> => {
    await api.delete(`/professional/portfolio/${itemId}`);
  },

  // ==========================================
  // OFERTAS
  // ==========================================

  /**
   * POST /api/v1/professional/ofertas
   * Crear una oferta económica formal
   */
  createOferta: async (ofertaData: OfertaCreate): Promise<OfertaRead> => {
    const response = await api.post<OfertaRead>('/professional/ofertas', ofertaData);
    return response.data;
  },

  /**
   * GET /api/v1/professional/ofertas
   * Listar ofertas enviadas por el profesional
   */
  listOfertas: async (): Promise<OfertaRead[]> => {
    const response = await api.get<OfertaRead[]>('/professional/ofertas');
    return response.data;
  },

  // ==========================================
  // TRABAJOS
  // ==========================================

  /**
   * GET /api/v1/professional/trabajos
   * Listar trabajos del profesional
   */
  listTrabajos: async (): Promise<TrabajoRead[]> => {
    const response = await api.get<TrabajoRead[]>('/professional/trabajos');
    return response.data;
  },

  /**
   * GET /api/v1/professional/portfolio
   * Listar portfolio del profesional
   */
  listPortfolio: async (): Promise<PortfolioItemRead[]> => {
    const response = await api.get<PortfolioItemRead[]>('/professional/portfolio');
    return response.data;
  },
};
