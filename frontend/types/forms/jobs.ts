import { z } from 'zod';
import { Clock, CheckCircle, XCircle, PlayCircle, Hourglass, Award } from 'lucide-react';

/**
 * Types para el módulo de Trabajos
 * 
 * Reutiliza tipos de /lib/services/trabajosService.ts
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export enum EstadoTrabajo {
  PENDIENTE_PAGO = 'PENDIENTE_PAGO',
  PAGADO = 'PAGADO',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  APROBADO = 'APROBADO',
  CANCELADO = 'CANCELADO',
}

// ============================================================================
// CONFIGURACIONES UI
// ============================================================================

export const estadoTrabajoConfig = {
  [EstadoTrabajo.PENDIENTE_PAGO]: {
    label: 'Pendiente de Pago',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: Clock,
    description: 'Esperando que el cliente realice el pago',
    badge: 'secondary' as const,
  },
  [EstadoTrabajo.PAGADO]: {
    label: 'Pago Confirmado',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: CheckCircle,
    description: 'Pago confirmado, listo para iniciar',
    badge: 'default' as const,
  },
  [EstadoTrabajo.EN_PROCESO]: {
    label: 'En Proceso',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: PlayCircle,
    description: 'Trabajo en progreso',
    badge: 'default' as const,
  },
  [EstadoTrabajo.COMPLETADO]: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: Hourglass,
    description: 'Completado, pendiente de aprobación del cliente',
    badge: 'default' as const,
  },
  [EstadoTrabajo.APROBADO]: {
    label: 'Aprobado',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: Award,
    description: 'Aprobado, pago liberado al profesional',
    badge: 'default' as const,
  },
  [EstadoTrabajo.CANCELADO]: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle,
    description: 'Trabajo cancelado',
    badge: 'destructive' as const,
  },
};

// ============================================================================
// SCHEMAS ZOD
// ============================================================================

/**
 * Schema para iniciar un trabajo
 */
export const iniciarTrabajoSchema = z.object({
  trabajoId: z.string().uuid('ID de trabajo inválido'),
  notas_profesional: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

export type IniciarTrabajoFormData = z.infer<typeof iniciarTrabajoSchema>;

/**
 * Schema para completar un trabajo
 */
export const completarTrabajoSchema = z.object({
  trabajoId: z.string().uuid('ID de trabajo inválido'),
  notas_profesional: z
    .string()
    .min(10, 'Describe brevemente lo realizado (mínimo 10 caracteres)')
    .max(500, 'Las notas no pueden exceder 500 caracteres'),
  imagenes: z.array(z.string().url('URL de imagen inválida')).optional(),
});

export type CompletarTrabajoFormData = z.infer<typeof completarTrabajoSchema>;

/**
 * Schema para aprobar un trabajo (cliente)
 */
export const aprobarTrabajoSchema = z.object({
  trabajoId: z.string().uuid('ID de trabajo inválido'),
  notas_cliente: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

export type AprobarTrabajoFormData = z.infer<typeof aprobarTrabajoSchema>;

/**
 * Schema para cancelar un trabajo
 */
export const cancelarTrabajoSchema = z.object({
  trabajoId: z.string().uuid('ID de trabajo inválido'),
  motivo: z
    .string()
    .min(20, 'Explica brevemente el motivo (mínimo 20 caracteres)')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
});

export type CancelarTrabajoFormData = z.infer<typeof cancelarTrabajoSchema>;

/**
 * Schema para agregar imágenes
 */
export const addImagenesSchema = z.object({
  trabajoId: z.string().uuid('ID de trabajo inválido'),
  imagenes: z
    .array(z.string().url('URL de imagen inválida'))
    .min(1, 'Debes agregar al menos una imagen')
    .max(10, 'Máximo 10 imágenes por vez'),
});

export type AddImagenesFormData = z.infer<typeof addImagenesSchema>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verificar si un trabajo puede ser iniciado (profesional)
 */
export function canIniciarTrabajo(estado: EstadoTrabajo): boolean {
  return estado === EstadoTrabajo.PAGADO;
}

/**
 * Verificar si un trabajo puede ser completado (profesional)
 */
export function canCompletarTrabajo(estado: EstadoTrabajo): boolean {
  return estado === EstadoTrabajo.EN_PROCESO;
}

/**
 * Verificar si un trabajo puede ser aprobado (cliente)
 */
export function canAprobarTrabajo(estado: EstadoTrabajo): boolean {
  return estado === EstadoTrabajo.COMPLETADO;
}

/**
 * Verificar si un trabajo puede ser cancelado
 */
export function canCancelarTrabajo(estado: EstadoTrabajo): boolean {
  return [
    EstadoTrabajo.PENDIENTE_PAGO,
    EstadoTrabajo.PAGADO,
    EstadoTrabajo.EN_PROCESO,
  ].includes(estado);
}

/**
 * Obtener acciones disponibles según rol y estado
 */
export function getAvailableActions(
  estado: EstadoTrabajo,
  userRole: 'cliente' | 'profesional'
): {
  canIniciar: boolean;
  canCompletar: boolean;
  canAprobar: boolean;
  canCancelar: boolean;
} {
  if (userRole === 'profesional') {
    return {
      canIniciar: canIniciarTrabajo(estado),
      canCompletar: canCompletarTrabajo(estado),
      canAprobar: false,
      canCancelar: canCancelarTrabajo(estado),
    };
  } else {
    // cliente
    return {
      canIniciar: false,
      canCompletar: false,
      canAprobar: canAprobarTrabajo(estado),
      canCancelar: canCancelarTrabajo(estado),
    };
  }
}
