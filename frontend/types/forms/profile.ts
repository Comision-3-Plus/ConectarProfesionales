/**
 * Tipos y schemas para formularios de perfil
 */

import { z } from 'zod';

/**
 * Schema de validación para datos básicos del usuario
 */
export const userProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

/**
 * Tipo inferido del schema de perfil de usuario
 */
export type UserProfileFormData = z.infer<typeof userProfileSchema>;

/**
 * Schema de validación para perfil profesional
 */
export const professionalProfileSchema = z.object({
  biografia: z.string().optional(),
  descripcion: z.string().optional(),
  experiencia_anos: z.number().min(0, 'La experiencia debe ser mayor o igual a 0').optional(),
  tarifa_por_hora: z.number().min(0, 'La tarifa debe ser mayor o igual a 0').optional(),
  radio_cobertura_km: z.number().min(1, 'El radio debe ser al menos 1 km').max(500, 'El radio máximo es 500 km').optional(),
  disponible: z.boolean().optional(),
  acepta_instant: z.boolean().optional(),
  // Arrays
  habilidades: z.array(z.string()).optional(),
  certificaciones: z.array(z.string()).optional(),
  imagenes_trabajos: z.array(z.string()).optional(),
  // Ubicación
  ubicacion_lat: z.number().min(-90).max(90).optional(),
  ubicacion_lon: z.number().min(-180).max(180).optional(),
  // Oficios
  oficios_ids: z.array(z.string()).optional(),
});

/**
 * Tipo inferido del schema de perfil profesional
 */
export type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;

/**
 * Schema combinado para editar perfil completo
 */
export const editProfileSchema = z.object({
  // Datos de usuario
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  // Datos de profesional (solo si es profesional)
  biografia: z.string().optional(),
  descripcion: z.string().optional(),
  experiencia_anos: z.number().min(0).optional(),
  tarifa_por_hora: z.number().min(0).optional(),
  radio_cobertura_km: z.number().min(1).max(500).optional(),
  disponible: z.boolean().optional(),
});

/**
 * Tipo inferido del schema de edición completa
 */
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
