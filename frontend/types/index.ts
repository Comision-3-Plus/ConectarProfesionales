// Types for API responses

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  avatar_url?: string;
  es_profesional: boolean;
  es_cliente: boolean;
  created_at: string;
}

export interface Oficio {
  id: number;
  nombre: string;
  descripcion?: string;
  icono_url?: string;
}

export interface Professional {
  id: number;
  user_id: number;
  biografia?: string;
  nivel_experiencia: 'junior' | 'intermedio' | 'senior';
  tarifa_por_hora?: number;
  rating_promedio: number;
  total_resenas: number;
  acepta_instant: boolean;
  payout_account?: string;
  oficios: Oficio[];
  user: User;
  portfolio_items?: PortfolioItem[];
}

export interface PortfolioItem {
  id: number;
  professional_id: number;
  titulo: string;
  descripcion?: string;
  fecha_proyecto?: string;
  imagenes: PortfolioImage[];
}

export interface PortfolioImage {
  id: number;
  portfolio_item_id: number;
  imagen_url: string;
  orden: number;
}

export interface Resena {
  id: number;
  trabajo_id: number;
  cliente_id: number;
  calificacion: number;
  comentario?: string;
  created_at: string;
  cliente: User;
}

export interface Trabajo {
  id: number;
  oferta_id: number;
  estado: 'pendiente' | 'en_progreso' | 'finalizado' | 'cancelado';
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  payment_id?: string;
  payment_status?: string;
}

export interface Oferta {
  id: number;
  chat_id: string;
  professional_id: number;
  cliente_id: number;
  descripcion: string;
  precio: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  expires_at: string;
  created_at: string;
  professional?: Professional;
  cliente?: User;
  trabajo?: Trabajo;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: number;
  type: 'text' | 'oferta' | 'system';
  content: string;
  oferta_id?: number;
  timestamp: number;
  read: boolean;
}

export interface SearchFilters {
  oficio_id?: number;
  nivel?: 'junior' | 'intermedio' | 'senior';
  tarifa_max?: number;
  tarifa_min?: number;
  rating_min?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}
