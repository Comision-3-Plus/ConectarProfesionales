/**
 * Servicio de Reseñas y Calificaciones
 */

import api from '../api';

export interface Review {
  id: string;
  trabajo_id: string;
  profesional_id: string;
  cliente_id: string;
  calificacion: number;
  comentario: string;
  recomendaria: boolean;
  fecha_creacion: string;
  cliente_nombre: string;
  cliente_avatar?: string;
  trabajo_titulo?: string;
  respuesta_profesional?: {
    texto: string;
    fecha: string;
  };
}

export interface ReviewStats {
  promedio: number;
  total: number;
  distribucion: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  porcentaje_recomendado: number;
  porcentaje_excelente: number;
}

class ReviewService {
  /**
   * Crear una reseña
   */
  async createReview(data: {
    trabajo_id: string;
    profesional_id: string;
    calificacion: number;
    comentario: string;
    recomendaria: boolean;
  }): Promise<Review> {
    const response = await api.post('/resenas', data);
    return response.data;
  }

  /**
   * Obtener reseñas de un profesional
   */
  async getProfessionalReviews(
    profesionalId: string,
    params?: {
      page?: number;
      limit?: number;
      min_calificacion?: number;
    }
  ): Promise<{ resenas: Review[]; total: number }> {
    const response = await api.get(`/resenas/profesional/${profesionalId}`, { params });
    return response.data;
  }

  /**
   * Obtener estadísticas de reseñas de un profesional
   */
  async getProfessionalStats(profesionalId: string): Promise<ReviewStats> {
    const response = await api.get(`/resenas/profesional/${profesionalId}/estadisticas`);
    return response.data;
  }

  /**
   * Obtener una reseña específica
   */
  async getReview(reviewId: string): Promise<Review> {
    const response = await api.get(`/resenas/${reviewId}`);
    return response.data;
  }

  /**
   * Actualizar una reseña (solo dentro de 24 horas)
   */
  async updateReview(
    reviewId: string,
    data: {
      calificacion?: number;
      comentario?: string;
      recomendaria?: boolean;
    }
  ): Promise<Review> {
    const response = await api.put(`/resenas/${reviewId}`, data);
    return response.data;
  }

  /**
   * Eliminar una reseña (solo dentro de 24 horas)
   */
  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/resenas/${reviewId}`);
  }

  /**
   * Responder a una reseña (solo profesional)
   */
  async respondToReview(reviewId: string, respuesta: string): Promise<Review> {
    const response = await api.post(`/resenas/${reviewId}/responder`, { respuesta });
    return response.data;
  }

  /**
   * Obtener reseñas que dejé (como cliente)
   */
  async getMyReviews(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ resenas: Review[]; total: number }> {
    const response = await api.get('/resenas/mis-resenas', { params });
    return response.data;
  }

  /**
   * Verificar si puedo dejar reseña para un trabajo
   */
  async canReviewTrabajo(trabajoId: string): Promise<{
    puede_resenar: boolean;
    motivo?: string;
    ya_reseno?: boolean;
  }> {
    const response = await api.get(`/resenas/puede-resenar/${trabajoId}`);
    return response.data;
  }

  /**
   * Reportar una reseña inapropiada
   */
  async reportReview(reviewId: string, motivo: string): Promise<void> {
    await api.post(`/resenas/${reviewId}/reportar`, { motivo });
  }
}

export const reviewService = new ReviewService();

