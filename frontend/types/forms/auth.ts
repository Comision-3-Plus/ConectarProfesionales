/**
 * Tipos y schemas para formularios de autenticación
 */

import { z } from 'zod';
import { UserRole } from '../index';

/**
 * Schema de validación para el formulario de registro
 */
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  telefono: z.string().optional(),
  oficio_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Tipo inferido del schema de registro
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema de validación para el formulario de login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

/**
 * Tipo inferido del schema de login
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Tipo para el selector de tipo de usuario
 */
export type UserTypeSelection = 'cliente' | 'profesional';
