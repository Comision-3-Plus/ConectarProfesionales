/**
 * Servicio para gestión de trabajos
 * Integra con el backend de servicio_chat_ofertas
 */

import { api } from '../api';
import { toast } from 'sonner';

export type EstadoTrabajo = 
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'APROBADO'
  | 'CANCELADO';

export interface Trabajo {
  id: string;
  oferta_id: string;
  profesional_id: string;
  cliente_id: string;
  estado: EstadoTrabajo;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_aprobacion?: string;
  notas_profesional?: string;
  notas_cliente?: string;
  imagenes?: string[];
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  trabajo_id: string;
  tipo: 'ESTADO_CAMBIO' | 'COMENTARIO' | 'IMAGEN' | 'PAGO';
  descripcion: string;
  estado_anterior?: EstadoTrabajo;
  estado_nuevo?: EstadoTrabajo;
  usuario_id: string;
  usuario_nombre: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UpdateTrabajoData {
  estado?: EstadoTrabajo;
  notas_profesional?: string;
  notas_cliente?: string;
  imagenes?: string[];
}

class TrabajosService {
  /**
   * Obtener mis trabajos (como profesional o cliente)
   */
  async getMyTrabajos(): Promise<Trabajo[]> {
    try {
      const response = await api.get('/chat_ofertas/trabajos');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al obtener trabajos';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Obtener un trabajo específico por ID
   */
  async getTrabajoById(trabajoId: string): Promise<Trabajo> {
    try {
      const response = await api.get(`/chat_ofertas/trabajos/${trabajoId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al obtener trabajo';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Actualizar el estado de un trabajo
   */
  async updateTrabajo(trabajoId: string, data: UpdateTrabajoData): Promise<Trabajo> {
    try {
      const response = await api.put(`/chat_ofertas/trabajos/${trabajoId}`, data);
      
      if (data.estado) {
        const estadoMessages: Record<EstadoTrabajo, string> = {
          PENDIENTE_PAGO: 'Esperando pago del cliente',
          PAGADO: 'Pago confirmado, listo para comenzar',
          EN_PROCESO: 'Trabajo iniciado',
          COMPLETADO: 'Trabajo completado, pendiente de aprobación',
          APROBADO: 'Trabajo aprobado, pago liberado',
          CANCELADO: 'Trabajo cancelado'
        };
        toast.success(estadoMessages[data.estado]);
      } else {
        toast.success('Trabajo actualizado');
      }

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al actualizar trabajo';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Iniciar trabajo (cambiar estado a EN_PROCESO)
   * Solo para profesionales
   */
  async iniciarTrabajo(trabajoId: string, notas?: string): Promise<Trabajo> {
    return this.updateTrabajo(trabajoId, {
      estado: 'EN_PROCESO',
      notas_profesional: notas
    });
  }

  /**
   * Completar trabajo (cambiar estado a COMPLETADO)
   * Solo para profesionales
   */
  async completarTrabajo(trabajoId: string, notas?: string, imagenes?: string[]): Promise<Trabajo> {
    return this.updateTrabajo(trabajoId, {
      estado: 'COMPLETADO',
      notas_profesional: notas,
      imagenes
    });
  }

  /**
   * Aprobar trabajo (cambiar estado a APROBADO)
   * Solo para clientes - libera el pago
   */
  async aprobarTrabajo(trabajoId: string, notas?: string): Promise<Trabajo> {
    return this.updateTrabajo(trabajoId, {
      estado: 'APROBADO',
      notas_cliente: notas
    });
  }

  /**
   * Cancelar trabajo
   * Disponible para ambos (cliente y profesional)
   */
  async cancelarTrabajo(trabajoId: string): Promise<Trabajo> {
    try {
      const response = await api.post(`/chat_ofertas/trabajos/${trabajoId}/cancelar`);
      toast.warning('Trabajo cancelado');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al cancelar trabajo';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Obtener timeline/historial del trabajo
   */
  async getTrabajoTimeline(trabajoId: string): Promise<TimelineEvent[]> {
    try {
      const response = await api.get(`/chat_ofertas/trabajos/${trabajoId}/timeline`);
      return response.data;
    } catch (error: any) {
      // No mostrar error si no existe timeline
      if (error.response?.status === 404) {
        return [];
      }
      const message = error.response?.data?.detail || 'Error al obtener historial';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Agregar imágenes al trabajo
   */
  async addImagenes(trabajoId: string, imagenes: string[]): Promise<Trabajo> {
    try {
      // Primero obtener el trabajo actual
      const trabajo = await this.getTrabajoById(trabajoId);
      
      // Combinar imágenes existentes con las nuevas
      const imagenesActualizadas = [...(trabajo.imagenes || []), ...imagenes];
      
      return this.updateTrabajo(trabajoId, { imagenes: imagenesActualizadas });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al agregar imágenes';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Obtener trabajos por oferta
   */
  async getTrabajosByOferta(ofertaId: string): Promise<Trabajo[]> {
    try {
      const allTrabajos = await this.getMyTrabajos();
      return allTrabajos.filter(t => t.oferta_id === ofertaId);
    } catch (error: any) {
      return [];
    }
  }
}

export const trabajosService = new TrabajosService();
