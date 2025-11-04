/**
 * Servicio de Ofertas
 * Maneja la creación, aceptación y rechazo de ofertas entre profesionales y clientes
 */

import { api } from '../api';

export interface Oferta {
  id: string;
  profesional_id: string;
  cliente_id: string;
  chat_id: string;
  descripcion: string;
  precio_final: number;
  estado: 'OFERTADO' | 'ACEPTADO' | 'RECHAZADO' | 'PAGADO';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateOfertaData {
  cliente_id: string;
  chat_id: string;
  descripcion: string;
  precio_final: number;
}

export interface AcceptOfertaResponse {
  oferta: Oferta;
  trabajo_id: string;
  payment_preference_id: string;
  payment_url: string;
  mensaje: string;
}

class OfertasService {
  /**
   * Crear una oferta (solo profesionales)
   */
  async createOferta(data: CreateOfertaData): Promise<Oferta> {
    try {
      const response = await api.post('/chat_ofertas/ofertas', data);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear oferta:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al crear la oferta'
      );
    }
  }

  /**
   * Obtener mis ofertas (como cliente o profesional)
   */
  async getMyOfertas(): Promise<Oferta[]> {
    try {
      const response = await api.get('/chat_ofertas/ofertas');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener ofertas:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al obtener ofertas'
      );
    }
  }

  /**
   * Obtener ofertas por chat
   */
  async getOfertasByChat(chatId: string): Promise<Oferta[]> {
    try {
      const response = await api.get(`/chat_ofertas/ofertas/chat/${chatId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener ofertas del chat:', error);
      // Si el endpoint no existe, devolver array vacío
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(
        error.response?.data?.detail || 'Error al obtener ofertas del chat'
      );
    }
  }

  /**
   * Aceptar una oferta (solo clientes)
   * Genera trabajo y link de pago de MercadoPago
   */
  async acceptOferta(ofertaId: string): Promise<AcceptOfertaResponse> {
    try {
      const response = await api.put(`/chat_ofertas/ofertas/${ofertaId}/accept`);
      return response.data;
    } catch (error: any) {
      console.error('Error al aceptar oferta:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al aceptar la oferta'
      );
    }
  }

  /**
   * Rechazar una oferta (solo clientes)
   */
  async rejectOferta(ofertaId: string): Promise<Oferta> {
    try {
      const response = await api.post(`/chat_ofertas/ofertas/${ofertaId}/reject`);
      return response.data;
    } catch (error: any) {
      console.error('Error al rechazar oferta:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al rechazar la oferta'
      );
    }
  }

  /**
   * Actualizar una oferta (solo profesionales)
   */
  async updateOferta(
    ofertaId: string,
    data: { descripcion?: string; precio_final?: number }
  ): Promise<Oferta> {
    try {
      const response = await api.put(`/chat_ofertas/ofertas/${ofertaId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar oferta:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al actualizar la oferta'
      );
    }
  }

  /**
   * Eliminar una oferta (solo clientes, solo si está pendiente)
   */
  async deleteOferta(ofertaId: string): Promise<void> {
    try {
      await api.delete(`/chat_ofertas/ofertas/${ofertaId}`);
    } catch (error: any) {
      console.error('Error al eliminar oferta:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al eliminar la oferta'
      );
    }
  }

  /**
   * Obtener timeline de una oferta
   */
  async getOfertaTimeline(ofertaId: string): Promise<{
    oferta_id: string;
    estado_actual: string;
    timeline: Array<{
      evento: string;
      fecha: string;
      estado: string;
    }>;
  }> {
    try {
      const response = await api.get(`/chat_ofertas/ofertas/${ofertaId}/timeline`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener timeline:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al obtener el historial'
      );
    }
  }
}

export const ofertasService = new OfertasService();
