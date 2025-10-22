/**
 * Servicio de Autenticación
 * Endpoints: /api/v1/auth/*
 */

import { api } from '../api';
import {
  Token,
  UserCreate,
  UserRead,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResetResponse
} from '@/types';

export const authService = {
  /**
   * POST /api/v1/auth/register
   * Registrar nuevo usuario (Cliente o Profesional)
   */
  register: async (userData: UserCreate): Promise<UserRead> => {
    const response = await api.post<UserRead>('/auth/register', userData);
    return response.data;
  },

  /**
   * POST /api/v1/auth/login
   * Login con email y contraseña (OAuth2)
   * Retorna JWT token
   */
  login: async (email: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Guardar token en localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }

    return response.data;
  },

  /**
   * POST /api/v1/auth/forgot-password
   * Solicitar recuperación de contraseña
   */
  forgotPassword: async (request: ForgotPasswordRequest): Promise<PasswordResetResponse> => {
    const response = await api.post<PasswordResetResponse>('/auth/forgot-password', request);
    return response.data;
  },

  /**
   * POST /api/v1/auth/reset-password
   * Resetear contraseña con token
   */
  resetPassword: async (request: ResetPasswordRequest): Promise<PasswordResetResponse> => {
    const response = await api.post<PasswordResetResponse>('/auth/reset-password', request);
    return response.data;
  },

  /**
   * Logout (limpia token del localStorage)
   */
  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },

  /**
   * Obtener token del localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
};
