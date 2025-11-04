/**
 * Servicio de Oficios
 * Gestión de oficios/categorías profesionales
 */

import { api } from '../api';

export interface Oficio {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
}

class OficiosService {
  /**
   * Obtener lista de todos los oficios disponibles
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
}

export const oficiosService = new OficiosService();
