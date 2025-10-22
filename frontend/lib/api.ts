import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Professional,
  Oferta,
  Trabajo,
  Resena,
  Oficio,
  SearchFilters,
  PaginatedResponse,
  AuthTokens,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const { data } = await apiClient.post<AuthTokens>('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  register: async (userData: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    es_profesional?: boolean;
  }): Promise<User> => {
    const { data } = await apiClient.post<User>('/api/v1/auth/register', userData);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/v1/users/me');
    return data;
  },
};

// Public API
export const publicApi = {
  getProfessional: async (id: number): Promise<Professional> => {
    const { data } = await apiClient.get<Professional>(`/api/v1/public/professional/${id}`);
    return data;
  },

  getOficios: async (): Promise<Oficio[]> => {
    const { data } = await apiClient.get<Oficio[]>('/api/v1/public/oficios');
    return data;
  },
};

// Search API
export const searchApi = {
  searchProfessionals: async (
    filters?: SearchFilters,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<Professional>> => {
    const params = new URLSearchParams();
    if (filters?.oficio_id) params.append('oficio_id', filters.oficio_id.toString());
    if (filters?.nivel) params.append('nivel', filters.nivel);
    if (filters?.tarifa_max) params.append('tarifa_max', filters.tarifa_max.toString());
    if (filters?.tarifa_min) params.append('tarifa_min', filters.tarifa_min.toString());
    if (filters?.rating_min) params.append('rating_min', filters.rating_min.toString());
    params.append('skip', ((page - 1) * size).toString());
    params.append('limit', size.toString());

    const { data } = await apiClient.get<PaginatedResponse<Professional>>(
      `/api/v1/search/professionals?${params.toString()}`
    );
    return data;
  },
};

// Cliente API
export const clienteApi = {
  getMyProjects: async (): Promise<Trabajo[]> => {
    const { data } = await apiClient.get<Trabajo[]>('/api/v1/cliente/trabajos');
    return data;
  },

  acceptOffer: async (offerId: number): Promise<{ payment_url: string }> => {
    const { data } = await apiClient.post<{ payment_url: string }>(
      `/api/v1/cliente/ofertas/${offerId}/accept`
    );
    return data;
  },

  rejectOffer: async (offerId: number): Promise<void> => {
    await apiClient.post(`/api/v1/cliente/ofertas/${offerId}/reject`);
  },

  finalizeWork: async (workId: number): Promise<Trabajo> => {
    const { data } = await apiClient.post<Trabajo>(`/api/v1/cliente/trabajo/${workId}/finalizar`);
    return data;
  },

  createReview: async (
    workId: number,
    review: { calificacion: number; comentario?: string }
  ): Promise<Resena> => {
    const { data } = await apiClient.post<Resena>(
      `/api/v1/cliente/trabajo/${workId}/resena`,
      review
    );
    return data;
  },
};

// Professional API
export const professionalApi = {
  getProfile: async (): Promise<Professional> => {
    const { data } = await apiClient.get<Professional>('/api/v1/professional/me');
    return data;
  },

  updateProfile: async (profileData: Partial<Professional>): Promise<Professional> => {
    const { data } = await apiClient.put<Professional>('/api/v1/professional/me', profileData);
    return data;
  },

  createOffer: async (offerData: {
    chat_id: string;
    cliente_id: number;
    descripcion: string;
    precio: number;
  }): Promise<Oferta> => {
    const { data } = await apiClient.post<Oferta>('/api/v1/professional/ofertas', offerData);
    return data;
  },

  getMyOffers: async (): Promise<Oferta[]> => {
    const { data } = await apiClient.get<Oferta[]>('/api/v1/professional/ofertas');
    return data;
  },

  getMyWorks: async (): Promise<Trabajo[]> => {
    const { data } = await apiClient.get<Trabajo[]>('/api/v1/professional/trabajos');
    return data;
  },
};

export { apiClient };
export default apiClient;
