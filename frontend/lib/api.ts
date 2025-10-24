/**
 * Cliente API configurado para comunicarse con el backend FastAPI
 * Base URL: http://localhost:8004/api/v1 (configurar en .env)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Base URL del backend (desde variable de entorno o default)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
const API_V1_PREFIX = '/api/v1';

/**
 * Cliente Axios configurado con interceptores para:
 * - Agregar token JWT automáticamente en requests
 * - Manejar errores 401 (token expirado) y redirigir a login
 */
export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_V1_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// ============================================================================
// INTERCEPTOR DE REQUEST: Agregar JWT token automáticamente
// ============================================================================
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage (solo en el cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR DE RESPONSE: Manejar errores globalmente
// ============================================================================
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si el token expiró (401), limpiar y redirigir a login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Eliminar cookie también
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

