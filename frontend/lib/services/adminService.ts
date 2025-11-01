/**
 * Servicio de Administración
 * Endpoints: /api/v1/admin/*
 */

import { api } from '../api';
import {
  ProfessionalPendingReview,
  UserSearchResult,
  UserBanResponse,
  UserUnbanResponse,
  FinancialMetricsResponse,
  UserMetricsResponse,
  OficioCreate,
  OficioRead,
  ServicioInstantaneoCreate,
  ServicioInstantaneoRead,
  TrabajoRead,
  TrabajoCancelarResponse,
} from '@/types';

export const adminService = {
  // ==========================================
  // KYC MANAGEMENT
  // ==========================================

  /**
   * GET /api/v1/admin/kyc/pendientes
   * Listar profesionales con KYC en revisión
   */
  listPendingKYC: async (): Promise<ProfessionalPendingReview[]> => {
    const response = await api.get<ProfessionalPendingReview[]>('/admin/kyc/pendientes');
    return response.data;
  },

  /**
   * POST /api/v1/admin/kyc/approve/{profesional_id}
   * Aprobar KYC de un profesional
   */
  approveKYC: async (profesionalId: string): Promise<{ status: string; profesional_id: string }> => {
    const response = await api.post<{ status: string; profesional_id: string }>(
      `/admin/kyc/approve/${profesionalId}`
    );
    return response.data;
  },

  /**
   * POST /api/v1/admin/kyc/reject/{profesional_id}
   * Rechazar KYC de un profesional
   */
  rejectKYC: async (profesionalId: string): Promise<{ status: string; profesional_id: string }> => {
    const response = await api.post<{ status: string; profesional_id: string }>(
      `/admin/kyc/reject/${profesionalId}`
    );
    return response.data;
  },

  // ==========================================
  // OFICIOS
  // ==========================================

  /**
   * POST /api/v1/admin/oficios
   * Crear un nuevo oficio (Admin only)
   */
  createOficio: async (oficioData: OficioCreate): Promise<OficioRead> => {
    const response = await api.post<OficioRead>('/admin/oficios', oficioData);
    return response.data;
  },

  /**
   * GET /api/v1/admin/oficios
   * Listar todos los oficios
   */
  listOficios: async (): Promise<OficioRead[]> => {
    const response = await api.get<OficioRead[]>('/admin/oficios');
    return response.data;
  },

  // ==========================================
  // SERVICIOS INSTANTÁNEOS
  // ==========================================

  /**
   * POST /api/v1/admin/servicios-instant
   * Crear un nuevo servicio instantáneo (Admin only)
   */
  createServicioInstant: async (servicioData: ServicioInstantaneoCreate): Promise<ServicioInstantaneoRead> => {
    const response = await api.post<ServicioInstantaneoRead>('/admin/servicios-instant', servicioData);
    return response.data;
  },

  /**
   * GET /api/v1/admin/oficios/{oficio_id}/servicios-instant
   * Listar servicios instantáneos de un oficio
   */
  listServiciosInstantPorOficio: async (oficioId: string): Promise<ServicioInstantaneoRead[]> => {
    const response = await api.get<ServicioInstantaneoRead[]>(
      `/admin/oficios/${oficioId}/servicios-instant`
    );
    return response.data;
  },

  // ==========================================
  // TRABAJOS
  // ==========================================

  /**
   * POST /api/v1/admin/trabajo/{trabajo_id}/cancelar
   * Cancelar trabajo y reembolsar al cliente
   */
  cancelarTrabajo: async (trabajoId: string): Promise<TrabajoCancelarResponse> => {
    const response = await api.post<TrabajoCancelarResponse>(`/admin/trabajo/${trabajoId}/cancelar`);
    return response.data;
  },

  /**
   * GET /api/v1/admin/trabajos
   * Listar todos los trabajos (admin)
   */
  listAllTrabajos: async (): Promise<TrabajoRead[]> => {
    const response = await api.get<TrabajoRead[]>('/admin/trabajos');
    return response.data;
  },

  /**
   * POST /api/v1/admin/trabajo/{trabajo_id}/simular-pago
   * [TESTING] Simular pago completado
   */
  simularPago: async (trabajoId: string): Promise<TrabajoRead> => {
    const response = await api.post<TrabajoRead>(`/admin/trabajo/${trabajoId}/simular-pago`);
    return response.data;
  },

  // ==========================================
  // MODERACIÓN DE USUARIOS
  // ==========================================

  /**
   * GET /api/v1/admin/users?page=1&limit=10
   * Listar todos los usuarios de forma paginada
   */
  listAllUsers: async (page: number = 1, limit: number = 10): Promise<{
    users: UserSearchResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * GET /api/v1/admin/users/search?email=...
   * Buscar usuarios por email
   */
  searchUsers: async (email: string): Promise<UserSearchResult[]> => {
    const response = await api.get<UserSearchResult[]>('/admin/users/search', {
      params: { email },
    });
    return response.data;
  },

  /**
   * POST /api/v1/admin/users/{user_id}/ban
   * Banear usuario (desactivar cuenta)
   */
  banUser: async (userId: string): Promise<UserBanResponse> => {
    const response = await api.post<UserBanResponse>(`/admin/users/${userId}/ban`);
    return response.data;
  },

  /**
   * POST /api/v1/admin/users/{user_id}/unban
   * Desbanear usuario (reactivar cuenta)
   */
  unbanUser: async (userId: string): Promise<UserUnbanResponse> => {
    const response = await api.post<UserUnbanResponse>(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // ==========================================
  // MÉTRICAS Y DASHBOARD
  // ==========================================

  /**
   * GET /api/v1/admin/metrics/financials
   * Obtener métricas financieras del negocio
   */
  getFinancialMetrics: async (): Promise<FinancialMetricsResponse> => {
    try {
      const response = await api.get<FinancialMetricsResponse>('/admin/metrics/financials');
      return response.data;
    } catch (err: any) {
      // Fallback: si no existe el endpoint nuevo, mapear desde /admin/dashboard/stats (servicio_pagos)
      const status = err?.response?.status;
      if (status === 404) {
        try {
          const alt = await api.get<any>('/admin/dashboard/stats');
          const s = alt?.data || {};
          return {
            total_facturado: s?.finanzas?.total_ingresos ?? 0,
            comision_total: s?.finanzas?.total_comisiones ?? 0,
            trabajos_completados: s?.trabajos?.completados ?? 0,
          } as FinancialMetricsResponse;
        } catch (fallbackErr) {
          // Último recurso: devolver ceros para no romper el dashboard
          return {
            total_facturado: 0,
            comision_total: 0,
            trabajos_completados: 0,
          } as FinancialMetricsResponse;
        }
      }
      throw err;
    }
  },

  /**
   * GET /api/v1/admin/metrics/users
   * Obtener métricas de crecimiento de usuarios
   */
  getUserMetrics: async (): Promise<UserMetricsResponse> => {
    try {
      const response = await api.get<UserMetricsResponse>('/admin/metrics/users');
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        // Fallback provisional: devolver ceros si aún no existe el endpoint
        const empty: UserMetricsResponse = {
          total_clientes: 0,
          total_profesionales: 0,
          total_pro_pendientes_kyc: 0,
          total_pro_aprobados: 0,
        };
        return empty;
      }
      throw err;
    }
  },
};
