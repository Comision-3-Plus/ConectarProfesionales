/**
 * Servicio de Reseñas y Calificaciones
 * Endpoints: /api/v1/resenas/*
 */

import api from '../api';

export interface Review {
  id: string;
  trabajo_id: string;
  profesional_id: string;
  cliente_id: string;
  rating: number; // 1-5
  texto_resena?: string;
  fecha_creacion: string;
  cliente_nombre: string;
  cliente_avatar?: string;
  trabajo_titulo?: string;
  respuesta_profesional?: {
    texto: string;
    fecha: string;
  };
}

export interface ResenaCreate {
  trabajo_id: string;
  rating: number;
  texto_resena?: string;
}

export interface ResenaPublicRead {
  id: string;
  trabajo_id: string;
  profesional_id: string;
  rating: number;
  texto_resena?: string;
  fecha_creacion: string;
  cliente_nombre: string;
  cliente_avatar?: string;
}

export interface ResenaCreateResponse {
  id: string;
  trabajo_id: string;
  profesional_id: string;
  cliente_id: string;
  rating: number;
  texto_resena?: string;
  created_at: string;
  updated_at: string;
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
   * POST /api/v1/resenas
   * Crear una reseña para un trabajo completado
   * Solo clientes que completaron el trabajo pueden reseñar
   */
  async createReview(trabajoId: string, rating: number, comment?: string): Promise<ResenaCreateResponse> {
    const reviewData: ResenaCreate & { trabajo_id: string } = {
      trabajo_id: trabajoId,
      rating,
      texto_resena: comment,
    };

    const response = await api.post<ResenaCreateResponse>('/resenas', reviewData);
    return response.data;
  }

  /**
   * GET /api/v1/resenas/professional/{prof_id}
   * Obtener todas las reseñas de un profesional (público)
   */
  async getProfessionalReviews(profesionalId: string): Promise<ResenaPublicRead[]> {
    const response = await api.get<ResenaPublicRead[]>(
      `/resenas/professional/${profesionalId}`
    );
    return response.data;
  }

  /**
   * GET /api/v1/resenas/profesional/{profesionalId}/estadisticas
   * Obtener estadísticas de reseñas de un profesional
   */
  async getProfessionalStats(profesionalId: string): Promise<ReviewStats> {
    const response = await api.get<ReviewStats>(`/resenas/profesional/${profesionalId}/estadisticas`);
    return response.data;
  }

  /**
   * GET /api/v1/resenas/{reviewId}
   * Obtener una reseña específica
   */
  async getReview(reviewId: string): Promise<Review> {
    const response = await api.get<Review>(`/resenas/${reviewId}`);
    return response.data;
  }

  /**
   * PUT /api/v1/resenas/{reviewId}
   * Actualizar una reseña (solo dentro de 24 horas)
   */
  async updateReview(
    reviewId: string,
    data: {
      rating?: number;
      texto_resena?: string;
    }
  ): Promise<Review> {
    const response = await api.put<Review>(`/resenas/${reviewId}`, data);
    return response.data;
  }

  /**
   * DELETE /api/v1/resenas/{reviewId}
   * Eliminar una reseña (solo dentro de 24 horas)
   */
  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/resenas/${reviewId}`);
  }

  /**
   * POST /api/v1/resenas/{reviewId}/responder
   * Responder a una reseña (solo profesional)
   */
  async respondToReview(reviewId: string, respuesta: string): Promise<Review> {
    const response = await api.post<Review>(`/resenas/${reviewId}/responder`, { respuesta });
    return response.data;
  }

  /**
   * GET /api/v1/resenas/mis-resenas
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
   * GET /api/v1/resenas/puede-resenar/{trabajoId}
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
   * POST /api/v1/resenas/{reviewId}/reportar
   * Reportar una reseña inapropiada
   */
  async reportReview(reviewId: string, motivo: string): Promise<void> {
    await api.post(`/resenas/${reviewId}/reportar`, { motivo });
  }

  /**
   * Helper: Calcular rating promedio de un profesional
   */
  calculateAverageRating(reviews: ResenaPublicRead[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  /**
   * Helper: Obtener distribución de ratings (para gráficos)
   */
  getRatingDistribution(reviews: ResenaPublicRead[]): { [rating: number]: number } {
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });

    return distribution;
  }
}

export const reviewService = new ReviewService();

