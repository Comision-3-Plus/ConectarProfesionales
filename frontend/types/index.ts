/**
 * Tipos TypeScript que coinciden exactamente con los schemas Pydantic del backend
 * Backend: FastAPI + Pydantic v2
 * Este archivo se mantiene sincronizado con app/schemas/*.py
 */

// ============================================================================
// ENUMS (coinciden con app/models/enums.py)
// ============================================================================

export enum UserRole {
  CLIENTE = 'CLIENTE',
  PROFESIONAL = 'PROFESIONAL',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO'
}

export enum ProfessionalLevel {
  BRONCE = 'BRONCE',
  PLATA = 'PLATA',
  ORO = 'ORO',
  DIAMANTE = 'DIAMANTE'
}

export enum EstadoEscrow {
  PENDIENTE_PAGO = 'PENDIENTE_PAGO',
  PAGADO_EN_ESCROW = 'PAGADO_EN_ESCROW',
  LIBERADO = 'LIBERADO',
  CANCELADO_REEMBOLSADO = 'CANCELADO_REEMBOLSADO'
}

export enum EstadoOferta {
  OFERTADO = 'OFERTADO',
  ACEPTADO = 'ACEPTADO',
  RECHAZADO = 'RECHAZADO'
}

// ============================================================================
// USER SCHEMAS (app/schemas/user.py)
// ============================================================================

export interface UserCreate {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol?: UserRole;
}

export interface UserUpdate {
  nombre?: string;
  apellido?: string;
}

export interface UserRead {
  id: string; // UUID
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  is_active: boolean;
  fecha_creacion: string; // ISO datetime
  avatar_url?: string;
  infracciones_chat: number;
  is_chat_banned: boolean;
  telefono?: string;
  direccion?: string;
  kyc_verificado?: boolean;
  // Helper properties
  es_cliente?: boolean;
  es_profesional?: boolean;
  es_admin?: boolean;
}

// ============================================================================
// AUTH SCHEMAS (app/schemas/auth.py & token.py)
// ============================================================================

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

// ============================================================================
// PROFESSIONAL SCHEMAS (app/schemas/professional.py)
// ============================================================================

export interface ProfessionalProfileUpdate {
  radio_cobertura_km?: number; // 1-500
  acepta_instant?: boolean;
  tarifa_por_hora?: number;
}

export interface ProfessionalProfileRead {
  id: string; // UUID
  usuario_id: string; // UUID
  estado_verificacion: VerificationStatus;
  nivel: ProfessionalLevel;
  radio_cobertura_km: number;
  acepta_instant: boolean;
  tarifa_por_hora?: number;
  tasa_comision_actual: number;
  nombre: string;
  apellido: string;
  email: string;
  rating_promedio?: number;
  total_resenas?: number;
}

export interface ProfessionalLocationUpdate {
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
}

export interface PayoutInfoUpdate {
  payout_account: string; // CVU, CBU o Alias
}

export interface PublicProfileResponse {
  id: string; // UUID
  nombre: string;
  apellido: string;
  avatar_url?: string;
  nivel: ProfessionalLevel;
  radio_cobertura_km: number;
  acepta_instant: boolean;
  tarifa_por_hora?: number;
  rating_promedio: number;
  total_resenas: number;
  oficios: OficioRead[];
  portfolio: PortfolioItemRead[];
  portfolio_items?: PortfolioItemRead[]; // Alias
  resenas: ResenaPublicRead[];
  // Legacy fields
  user?: { nombre: string; apellido: string; avatar_url?: string };
  nivel_experiencia?: string;
  biografia?: string;
}

// ============================================================================
// OFICIO SCHEMAS (app/schemas/oficio.py)
// ============================================================================

export interface OficioCreate {
  nombre: string;
  descripcion: string;
}

export interface OficioRead {
  id: string; // UUID
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
}

export interface ProfessionalOficiosUpdate {
  oficio_ids: string[]; // UUIDs
}

// ============================================================================
// SERVICIO INSTANTANEO SCHEMAS (app/schemas/servicio_instantaneo.py)
// También conocidos como "Proyectos Publicados" en el frontend
// ============================================================================

export interface ServicioInstantaneoCreate {
  nombre: string;
  descripcion?: string;
  precio_fijo: number;
  oficio_id: string; // UUID
}

export interface ServicioInstantaneoUpdate {
  nombre?: string;
  descripcion?: string;
  precio_fijo?: number;
}

export interface ServicioInstantaneoRead {
  id: string; // UUID
  nombre: string;
  descripcion?: string;
  precio_fijo: number;
  oficio_id: string; // UUID
  profesional_id: string; // UUID
  fecha_creacion: string;
  profesional?: {
    id: string;
    user_id: string;
    nombre?: string;
    email?: string;
    nivel?: string;
    rating_promedio?: number;
  };
  oficio?: {
    id: string;
    nombre: string;
    categoria?: string;
  };
}

export interface ProfessionalServiciosInstantUpdate {
  servicio_ids: string[]; // UUIDs
}

// Alias para el frontend (proyecto publicado = servicio instantáneo)
export type ProyectoPublicadoCreate = ServicioInstantaneoCreate;
export type ProyectoPublicadoRead = ServicioInstantaneoRead;
export type ProyectoPublicadoUpdate = ServicioInstantaneoUpdate;

// ============================================================================
// PORTFOLIO SCHEMAS (app/schemas/portfolio.py)
// ============================================================================

export interface PortfolioItemCreate {
  titulo: string;
  descripcion: string;
}

export interface PortfolioImageRead {
  id: string; // UUID
  imagen_url: string;
  orden: number;
}

export interface PortfolioItemRead {
  id: string; // UUID
  profesional_id: string; // UUID
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  imagenes: PortfolioImageRead[];
  fecha_proyecto?: string; // Legacy field
}

// ============================================================================
// OFERTA SCHEMAS (app/schemas/oferta.py)
// ============================================================================

export interface OfertaCreate {
  cliente_id: string; // UUID
  chat_id: string;
  descripcion: string;
  precio_final: number;
}

export interface OfertaRead {
  id: string; // UUID
  profesional_id: string; // UUID
  cliente_id: string; // UUID
  chat_id: string;
  descripcion: string;
  precio_final: number;
  estado: string; // EstadoOferta enum as string
  fecha_creacion: string;
  fecha_actualizacion: string;
  precio?: number; // Legacy field
  expires_at?: string; // Legacy field
  // Campos adicionales para visualización
  profesional_nombre?: string;
  cliente_nombre?: string;
  oficio_nombre?: string;
  precio_ofertado?: number; // alias de precio_final
}

export interface OfertaAcceptResponse {
  oferta: OfertaRead;
  trabajo_id: string; // UUID
  payment_preference_id: string;
  payment_url: string;
  mensaje?: string;
}

// ============================================================================
// TRABAJO SCHEMAS (app/schemas/trabajo.py)
// ============================================================================

export interface TrabajoRead {
  id: string; // UUID
  cliente_id: string; // UUID
  profesional_id: string; // UUID
  oferta_id?: string; // UUID
  servicio_instant_id?: string; // UUID
  precio_final: number;
  estado_escrow: EstadoEscrow;
  mercadopago_payment_id?: string;
  mercadopago_preference_id?: string;
  comision_plataforma?: number;
  monto_liberado?: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Legacy field
  estado?: string;
  // Campos adicionales para visualización
  cliente_nombre?: string;
  profesional_nombre?: string;
  descripcion?: string;
  monto?: number; // alias de precio_final
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  oficio_nombre?: string;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
}

export interface TrabajoFinalizarResponse {
  trabajo: TrabajoRead;
  payout_id: string;
  mensaje: string;
}

export interface TrabajoCancelarResponse {
  trabajo: TrabajoRead;
  refund_id: string;
  mensaje: string;
}

// ============================================================================
// RESENA SCHEMAS (app/schemas/resena.py)
// ============================================================================

export interface ResenaCreate {
  rating: number; // 1-5
  texto_resena?: string;
}

export interface ResenaRead {
  id: string; // UUID
  trabajo_id: string; // UUID
  cliente_id: string; // UUID
  profesional_id: string; // UUID
  rating: number;
  texto_resena?: string;
  fecha_creacion: string;
}

export interface ResenaPublicRead {
  id: string; // UUID
  rating: number;
  texto_resena?: string;
  fecha_creacion: string;
  cliente_nombre: string;
}

export interface ResenaCreateResponse {
  resena: ResenaRead;
  profesional_rating_promedio: number;
  profesional_total_resenas: number;
  mensaje: string;
}

// ============================================================================
// SEARCH SCHEMAS (app/schemas/search.py)
// ============================================================================

export interface SearchProfessionalsRequest {
  oficio?: string; // Nombre del oficio
  ubicacion_lat: number;
  ubicacion_lon: number;
  radio_km?: number; // Default: 10
  incluir_fuera_de_radio?: boolean; // Default: false
  solo_disponibles_ahora?: boolean; // Default: false
}

export interface SearchResult {
  id: string; // UUID
  nombre: string;
  apellido: string;
  oficio: string;
  tarifa_por_hora?: number;
  calificacion_promedio: number;
  cantidad_resenas: number;
  distancia_km: number;
  nivel_profesional: ProfessionalLevel;
  puntos_experiencia: number;
  avatar_url?: string;
}

// ============================================================================
// ADMIN SCHEMAS (app/schemas/admin.py)
// ============================================================================

export interface ProfessionalPendingReview {
  id: string; // UUID
  email: string;
  nombre: string;
  apellido: string;
  fecha_creacion: string;
  estado_verificacion: VerificationStatus;
}

export interface UserSearchResult {
  id: string; // UUID
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  is_active: boolean;
  fecha_creacion: string;
  avatar_url?: string | null;
}

export interface UserBanResponse {
  user_id: string; // UUID
  email: string;
  is_active: boolean;
  mensaje: string;
}

export interface UserUnbanResponse {
  user_id: string; // UUID
  email: string;
  is_active: boolean;
  mensaje: string;
}

export interface FinancialMetricsResponse {
  total_facturado: number;
  comision_total: number;
  trabajos_completados: number;
}

export interface UserMetricsResponse {
  total_clientes: number;
  total_profesionales: number;
  total_pro_pendientes_kyc: number;
  total_pro_aprobados: number;
}

// ============================================================================
// FIREBASE / CHAT (integrado con Firestore)
// ============================================================================

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string; // UUID
  type: 'text' | 'oferta' | 'system' | 'info';
  content: string;
  oferta_id?: string; // UUID
  timestamp: number;
  read: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Type aliases for commonly used types
export type User = UserRead;
export type Professional = SearchResult;
export type Oferta = OfertaRead;
export type PortfolioItem = PortfolioItemRead;

// Search filters interface
export interface SearchFilters {
  oficio?: string;
  oficio_id?: number;
  ubicacion_lat?: number;
  ubicacion_lon?: number;
  radio_km?: number;
  incluir_fuera_de_radio?: boolean;
  solo_disponibles_ahora?: boolean;
  nivel?: string;
  tarifa_min?: number;
  tarifa_max?: number;
  rating_min?: number;
}
