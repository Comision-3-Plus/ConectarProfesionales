/**
 * Servicio de Disputas
 */

import api from '../api';

export interface Dispute {
  id: string;
  trabajo_id: string;
  transaccion_id: string;
  iniciador_id: string;
  tipo: 'reembolso' | 'calidad' | 'cancelacion' | 'otro';
  estado: 'abierta' | 'en_revision' | 'resuelta' | 'rechazada';
  descripcion: string;
  evidencias: string[];
  resolucion?: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  trabajo_titulo: string;
  cliente_nombre: string;
  profesional_nombre: string;
}

export interface DisputeMessage {
  id: string;
  disputa_id: string;
  usuario_id: string;
  usuario_nombre: string;
  mensaje: string;
  es_admin: boolean;
  fecha_creacion: string;
}

class DisputeService {
  /**
   * Crear una disputa
   */
  async createDispute(data: {
    trabajo_id: string;
    tipo: 'reembolso' | 'calidad' | 'cancelacion' | 'otro';
    descripcion: string;
    evidencias?: string[];
  }): Promise<Dispute> {
    const response = await api.post('/disputas', data);
    return response.data;
  }

  /**
   * Obtener mis disputas
   */
  async getMyDisputes(params?: {
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<{ disputas: Dispute[]; total: number }> {
    const response = await api.get('/disputas/mis-disputas', { params });
    return response.data;
  }

  /**
   * Obtener detalles de una disputa
   */
  async getDispute(disputeId: string): Promise<Dispute> {
    const response = await api.get(`/disputas/${disputeId}`);
    return response.data;
  }

  /**
   * Agregar evidencia a una disputa
   */
  async addEvidence(disputeId: string, evidencia: string): Promise<Dispute> {
    const response = await api.post(`/disputas/${disputeId}/evidencias`, { evidencia });
    return response.data;
  }

  /**
   * Obtener mensajes de una disputa
   */
  async getDisputeMessages(disputeId: string): Promise<DisputeMessage[]> {
    const response = await api.get(`/disputas/${disputeId}/mensajes`);
    return response.data;
  }

  /**
   * Enviar mensaje en una disputa
   */
  async sendMessage(disputeId: string, mensaje: string): Promise<DisputeMessage> {
    const response = await api.post(`/disputas/${disputeId}/mensajes`, { mensaje });
    return response.data;
  }

  /**
   * Cancelar una disputa (solo iniciador)
   */
  async cancelDispute(disputeId: string): Promise<Dispute> {
    const response = await api.post(`/disputas/${disputeId}/cancelar`);
    return response.data;
  }

  // Admin endpoints
  async getAllDisputes(params?: {
    estado?: string;
    tipo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ disputas: Dispute[]; total: number }> {
    const response = await api.get('/admin/disputas', { params });
    return response.data;
  }

  async resolveDispute(
    disputeId: string,
    resolucion: string,
    favorece_a: 'cliente' | 'profesional' | 'ninguno'
  ): Promise<Dispute> {
    const response = await api.post(`/admin/disputas/${disputeId}/resolver`, {
      resolucion,
      favorece_a,
    });
    return response.data;
  }
}

export const disputeService = new DisputeService();
