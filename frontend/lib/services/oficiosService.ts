/**
 * Servicio de Oficios
 * Gestión completa de oficios/categorías profesionales
 * Endpoints: /api/v1/professional/oficios/* y /api/v1/public/oficios
 */

import { api } from '../api';

export interface Oficio {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  icono?: string;
  activo?: boolean;
}

export interface OficioCreate {
  nombre: string;
  descripcion?: string;
  categoria?: string;
}

class OficiosService {
  /**
   * GET /api/v1/public/oficios
   * Obtener lista de todos los oficios disponibles (público)
   */
  async getAll(): Promise<Oficio[]> {
    try {
      const response = await api.get<Oficio[]>('/public/oficios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener oficios:', error);
      // Retornar algunos oficios por defecto en caso de error
      return [
        { id: '1', nombre: 'Plomería', descripcion: 'Instalación y reparación de sistemas de agua' },
        { id: '2', nombre: 'Electricidad', descripcion: 'Instalaciones y reparaciones eléctricas' },
        { id: '3', nombre: 'Carpintería', descripcion: 'Trabajos en madera y muebles' },
        { id: '4', nombre: 'Pintura', descripcion: 'Pintura de interiores y exteriores' },
        { id: '5', nombre: 'Jardinería', descripcion: 'Mantenimiento de jardines y espacios verdes' },
        { id: '6', nombre: 'Limpieza', descripcion: 'Servicios de limpieza profesional' },
        { id: '7', nombre: 'Herrería', descripcion: 'Trabajos en metal y soldadura' },
        { id: '8', nombre: 'Albañilería', descripcion: 'Construcción y reformas' },
        { id: '9', nombre: 'Gasista', descripcion: 'Instalación y reparación de gas' },
        { id: '10', nombre: 'Cerrajería', descripcion: 'Instalación y reparación de cerraduras' },
      ];
    }
  }

  /**
   * GET /api/v1/professional/oficios
   * Obtener mis oficios (profesional autenticado)
   */
  async getMyOficios(): Promise<Oficio[]> {
    const response = await api.get<Oficio[]>('/professional/oficios');
    return response.data;
  }

  /**
   * POST /api/v1/professional/oficios
   * Agregar un nuevo oficio a mi perfil
   */
  async addOficio(oficioData: OficioCreate): Promise<Oficio> {
    const response = await api.post<Oficio>('/professional/oficios', oficioData);
    return response.data;
  }

  /**
   * DELETE /api/v1/professional/oficios/{oficio_id}
   * Eliminar un oficio de mi perfil
   */
  async removeOficio(oficioId: string): Promise<void> {
    await api.delete(`/professional/oficios/${oficioId}`);
  }

  /**
   * Helper: Buscar oficios por nombre
   */
  async searchOficios(searchTerm: string): Promise<Oficio[]> {
    const allOficios = await this.getAll();
    return allOficios.filter((oficio) =>
      oficio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Helper: Verificar si tengo un oficio específico
   */
  async hasOficio(oficioId: string): Promise<boolean> {
    try {
      const myOficios = await this.getMyOficios();
      return myOficios.some((oficio) => oficio.id === oficioId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Agregar múltiples oficios a la vez
   */
  async addMultipleOficios(oficiosData: OficioCreate[]): Promise<Oficio[]> {
    const addPromises = oficiosData.map((oficio) => this.addOficio(oficio));
    return Promise.all(addPromises);
  }

  /**
   * ADMIN: Crear nuevo oficio en el sistema
   * POST /api/v1/admin/oficios
   */
  async adminCreateOficio(oficioData: OficioCreate): Promise<Oficio> {
    const response = await api.post<Oficio>('/admin/oficios', oficioData);
    return response.data;
  }

  /**
   * ADMIN: Listar todos los oficios (incluye inactivos)
   * GET /api/v1/admin/oficios
   */
  async adminListOficios(): Promise<Oficio[]> {
    const response = await api.get<Oficio[]>('/admin/oficios');
    return response.data;
  }

  /**
   * ADMIN: Actualizar un oficio
   * PUT /api/v1/admin/oficios/{oficio_id}
   */
  async adminUpdateOficio(oficioId: string, data: Partial<OficioCreate>): Promise<Oficio> {
    const response = await api.put<Oficio>(`/admin/oficios/${oficioId}`, data);
    return response.data;
  }

  /**
   * ADMIN: Desactivar/activar un oficio
   * PATCH /api/v1/admin/oficios/{oficio_id}/toggle
   */
  async adminToggleOficio(oficioId: string): Promise<Oficio> {
    const response = await api.patch<Oficio>(`/admin/oficios/${oficioId}/toggle`);
    return response.data;
  }
}

export const oficiosService = new OficiosService();
