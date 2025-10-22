/**
 * Servicio de Usuario
 * Endpoints: /api/v1/users/*
 */

import { api } from '../api';
import { UserRead, UserUpdate } from '@/types';

export const userService = {
  /**
   * GET /api/v1/users/me
   * Obtener perfil del usuario actual
   */
  getMe: async (): Promise<UserRead> => {
    const response = await api.get<UserRead>('/users/me');
    return response.data;
  },

  /**
   * PUT /api/v1/users/me
   * Actualizar datos básicos del usuario actual
   */
  updateMe: async (userData: UserUpdate): Promise<UserRead> => {
    const response = await api.put<UserRead>('/users/me', userData);
    return response.data;
  },

  /**
   * POST /api/v1/users/me/avatar
   * Subir avatar del usuario actual
   */
  uploadAvatar: async (file: File): Promise<UserRead> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UserRead>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
