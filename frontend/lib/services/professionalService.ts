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
  ServicioInstantaneoCreate,
  ServicioInstantaneoUpdate,
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
   * PUT /api/v1/professional/me
   * Actualizar configuración del perfil profesional
   */
  updateProfile: async (profileData: ProfessionalProfileUpdate): Promise<ProfessionalProfileRead> => {
    const response = await api.put<ProfessionalProfileRead>('/professional/me', profileData);
    return response.data;
  },

  /**
   * POST /api/v1/professional/kyc/submit
   * Enviar documentación KYC
   */
  uploadKYC: async (files: File[]): Promise<{ status: string; message: string }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<{ status: string; message: string }>(
      '/professional/kyc/submit',
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
   * GET /api/v1/professional/kyc/status
   * Obtener estado de verificación KYC
   */
  getKYCStatus: async (): Promise<{ kyc_status: string; verificado: boolean }> => {
    const response = await api.get<{ kyc_status: string; verificado: boolean }>(
      '/professional/kyc/status'
    );
    return response.data;
  },

  /**
   * PUT /api/v1/professional/oficios (usa /professional/me)
   * Actualizar oficios del profesional
   */
  updateOficios: async (oficios_ids: string[]): Promise<ProfessionalProfileRead> => {
    const response = await api.put<ProfessionalProfileRead>('/professional/me', {
      oficios_ids,
    });
    return response.data;
  },

  /**
   * PUT /api/v1/professional/me (actualizar ubicación)
   * Actualizar ubicación geográfica del profesional
   */
  updateLocation: async (locationData: {
    direccion?: string;
    latitud?: number;
    longitud?: number;
    radio_cobertura_km?: number;
  }): Promise<ProfessionalProfileRead> => {
    const response = await api.put<ProfessionalProfileRead>('/professional/me', locationData);
    return response.data;
  },

  /**
   * PUT /api/v1/professional/me (actualizar info de pago)
   * Actualizar información de pago del profesional
   */
  updatePayoutInfo: async (payoutData: {
    tarifa_hora?: number;
    moneda?: string;
    metodos_pago?: string[];
  }): Promise<ProfessionalProfileRead> => {
    const response = await api.put<ProfessionalProfileRead>('/professional/me', payoutData);
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

  // ==========================================
  // ENDPOINTS PÚBLICOS
  // ==========================================

  /**
   * GET /api/v1/public/professional/{prof_id}
   * Ver perfil público de un profesional
   */
  getPublicProfile: async (professionalId: string): Promise<ProfessionalProfileRead> => {
    const response = await api.get<ProfessionalProfileRead>(
      `/public/professional/${professionalId}`
    );
    return response.data;
  },

  /**
   * GET /api/v1/public/professional/{prof_id}/portfolio
   * Ver portfolio público de un profesional
   */
  getPublicPortfolio: async (professionalId: string): Promise<PortfolioItemRead[]> => {
    const response = await api.get<PortfolioItemRead[]>(
      `/public/professional/${professionalId}/portfolio`
    );
    return response.data;
  },

  // ==========================================
  // SERVICIOS/PROYECTOS PUBLICADOS
  // ==========================================

  /**
   * POST /api/v1/profesional/servicios
   * Publicar un nuevo servicio/proyecto
   */
  publicarProyecto: async (proyectoData: ServicioInstantaneoCreate): Promise<ServicioInstantaneoRead> => {
    const response = await api.post<ServicioInstantaneoRead>('/profesional/servicios', proyectoData);
    return response.data;
  },

  /**
   * GET /api/v1/profesional/servicios/me
   * Obtener mis proyectos publicados
   */
  getMisProyectosPublicados: async (): Promise<ServicioInstantaneoRead[]> => {
    const response = await api.get<ServicioInstantaneoRead[]>('/profesional/servicios/me');
    return response.data;
  },

  /**
   * PUT /api/v1/profesional/servicios/{servicio_id}
   * Actualizar un proyecto publicado
   */
  actualizarProyecto: async (
    servicioId: string,
    proyectoData: ServicioInstantaneoUpdate
  ): Promise<ServicioInstantaneoRead> => {
    const response = await api.put<ServicioInstantaneoRead>(
      `/profesional/servicios/${servicioId}`,
      proyectoData
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/profesional/servicios/{servicio_id}
   * Eliminar un proyecto publicado
   */
  eliminarProyecto: async (servicioId: string): Promise<void> => {
    await api.delete(`/profesional/servicios/${servicioId}`);
  },
};
