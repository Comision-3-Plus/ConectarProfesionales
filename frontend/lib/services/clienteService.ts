/**
 * Servicio de Cliente
 * Endpoints: /api/v1/cliente/*
 */

import { api } from '../api';
import {
  OfertaRead,
  OfertaAcceptResponse,
  TrabajoRead,
  TrabajoFinalizarResponse,
  TrabajoCancelarResponse,
  ResenaCreate,
  ResenaCreateResponse,
} from '@/types';

export const clienteService = {
  // ==========================================
  // SERVICIOS INSTANTÁNEOS
  // ==========================================

  /**
   * POST /api/v1/cliente/servicios/{servicio_id}/contratar
   * Contratar un servicio instantáneo publicado
   * Crea automáticamente: chat, oferta, trabajo y link de pago
   */
  contratarProyecto: async (servicioId: string): Promise<OfertaAcceptResponse> => {
    const response = await api.post<OfertaAcceptResponse>(
      `/cliente/servicios/${servicioId}/contratar`
    );
    return response.data;
  },
  // ==========================================
  // OFERTAS
  // ==========================================

  /**
   * GET /api/v1/cliente/ofertas
   * Listar ofertas recibidas por el cliente
   */
  listOfertas: async (): Promise<OfertaRead[]> => {
    const response = await api.get<OfertaRead[]>('/cliente/ofertas');
    return response.data;
  },

  /**
   * POST /api/v1/cliente/ofertas/{oferta_id}/accept
   * Aceptar una oferta recibida y generar link de pago
   */
  acceptOferta: async (ofertaId: string): Promise<OfertaAcceptResponse> => {
    const response = await api.post<OfertaAcceptResponse>(`/cliente/ofertas/${ofertaId}/accept`);
    return response.data;
  },

  /**
   * POST /api/v1/cliente/ofertas/{oferta_id}/reject
   * Rechazar una oferta recibida
   */
  rejectOferta: async (ofertaId: string): Promise<OfertaRead> => {
    const response = await api.post<OfertaRead>(`/cliente/ofertas/${ofertaId}/reject`);
    return response.data;
  },

  /**
   * GET /api/v1/cliente/ofertas/{oferta_id}
   * Obtener detalles de una oferta específica
   */
  getOferta: async (ofertaId: string): Promise<OfertaRead> => {
    const response = await api.get<OfertaRead>(`/cliente/ofertas/${ofertaId}`);
    return response.data;
  },

  // ==========================================
  // TRABAJOS
  // ==========================================

  /**
   * GET /api/v1/cliente/trabajos
   * Listar trabajos del cliente
   */
  listTrabajos: async (): Promise<TrabajoRead[]> => {
    const response = await api.get<TrabajoRead[]>('/cliente/trabajos');
    return response.data;
  },

  /**
   * GET /api/v1/cliente/trabajo/{trabajo_id}
   * Obtener detalles de un trabajo
   */
  getTrabajo: async (trabajoId: string): Promise<TrabajoRead> => {
    const response = await api.get<TrabajoRead>(`/cliente/trabajo/${trabajoId}`);
    return response.data;
  },

  /**
   * POST /api/v1/cliente/trabajo/{trabajo_id}/finalizar
   * Finalizar trabajo y liberar fondos al profesional
   */
  finalizarTrabajo: async (trabajoId: string): Promise<TrabajoFinalizarResponse> => {
    const response = await api.post<TrabajoFinalizarResponse>(`/cliente/trabajo/${trabajoId}/finalizar`);
    return response.data;
  },

  /**
   * POST /api/v1/cliente/trabajo/{trabajo_id}/cancelar
   * Cancelar trabajo y solicitar reembolso
   */
  cancelarTrabajo: async (trabajoId: string): Promise<TrabajoCancelarResponse> => {
    const response = await api.post<TrabajoCancelarResponse>(`/cliente/trabajo/${trabajoId}/cancelar`);
    return response.data;
  },

  // ==========================================
  // RESEÑAS
  // ==========================================

  /**
   * POST /api/v1/cliente/trabajo/{trabajo_id}/resena
   * Crear reseña de un trabajo finalizado
   */
  crearResena: async (trabajoId: string, resenaData: ResenaCreate): Promise<ResenaCreateResponse> => {
    const response = await api.post<ResenaCreateResponse>(
      `/cliente/trabajo/${trabajoId}/resena`,
      resenaData
    );
    return response.data;
  },
};
