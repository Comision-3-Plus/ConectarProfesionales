/**
 * Servicio de Portfolio
 * Gestión completa de portfolio de profesionales
 * Endpoints: /api/v1/professional/portfolio/*
 */

import { api } from "@/lib/api";
import { type PortfolioItem, type PortfolioItemCreate, type PortfolioItemUpdate } from "@/types/portfolio";

export interface PortfolioImageRead {
  id: string;
  portfolio_item_id: string;
  image_url: string;
  orden: number;
  created_at: string;
}

class PortfolioService {
  /**
   * GET /api/v1/professional/portfolio
   * Obtener mi portfolio completo
   */
  async getMyPortfolio(): Promise<PortfolioItem[]> {
    const response = await api.get<PortfolioItem[]>("/professional/portfolio");
    return response.data;
  }

  /**
   * POST /api/v1/professional/portfolio
   * Crear un nuevo item de portfolio
   */
  async createPortfolioItem(data: PortfolioItemCreate): Promise<PortfolioItem> {
    const response = await api.post<PortfolioItem>("/professional/portfolio", data);
    return response.data;
  }

  /**
   * PUT /api/v1/professional/portfolio/{item_id}
   * Actualizar un item existente
   */
  async updatePortfolioItem(id: string, data: PortfolioItemUpdate): Promise<PortfolioItem> {
    const response = await api.put<PortfolioItem>(
      `/professional/portfolio/${id}`,
      data
    );
    return response.data;
  }

  /**
   * DELETE /api/v1/professional/portfolio/{item_id}
   * Eliminar un item del portfolio
   */
  async deletePortfolioItem(id: string): Promise<void> {
    await api.delete(`/professional/portfolio/${id}`);
  }

  /**
   * POST /api/v1/professional/portfolio/{item_id}/image
   * Subir una imagen al portfolio
   */
  async uploadPortfolioImage(id: string, image: File): Promise<PortfolioItem> {
    const formData = new FormData();
    formData.append("file", image);

    const response = await api.post<PortfolioItem>(
      `/professional/portfolio/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * POST /api/v1/professional/portfolio/{item_id}/images
   * Agregar múltiples imágenes a un item
   */
  async addImages(itemId: string, imageUrls: string[]): Promise<PortfolioImageRead[]> {
    const response = await api.post<PortfolioImageRead[]>(
      `/professional/portfolio/${itemId}/images`,
      imageUrls
    );
    return response.data;
  }

  /**
   * DELETE /api/v1/professional/portfolio/{item_id}/images/{image_id}
   * Eliminar una imagen específica
   */
  async deleteImage(itemId: string, imageId: string): Promise<void> {
    await api.delete(`/professional/portfolio/${itemId}/images/${imageId}`);
  }

  /**
   * Helper: Subir múltiples archivos de imágenes
   */
  async uploadMultipleImages(itemId: string, files: File[]): Promise<PortfolioItem[]> {
    const uploadPromises = files.map((file) => this.uploadPortfolioImage(itemId, file));
    return Promise.all(uploadPromises);
  }

  /**
   * Helper: Obtener portfolio de otro profesional (público)
   */
  async getPublicPortfolio(professionalId: string): Promise<PortfolioItem[]> {
    const response = await api.get<PortfolioItem[]>(
      `/public/professional/${professionalId}/portfolio`
    );
    return response.data;
  }
}

export const portfolioService = new PortfolioService();
