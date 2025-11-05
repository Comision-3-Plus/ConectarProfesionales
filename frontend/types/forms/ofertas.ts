import { z } from 'zod';

/**
 * Schema de validación para crear una oferta
 * 
 * Una oferta es una propuesta de trabajo que un profesional envía a un cliente
 * a través del sistema de chat.
 */
export const createOfertaSchema = z.object({
  // ID del cliente que recibirá la oferta
  cliente_id: z.string().uuid('ID de cliente inválido'),
  
  // ID del chat donde se envía la oferta
  chat_id: z.string().uuid('ID de chat inválido'),
  
  // Descripción del servicio ofrecido
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede superar 500 caracteres'),
  
  // Precio final ofertado
  precio_final: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .max(1000000, 'El precio no puede superar $1,000,000'),
});

/**
 * Schema de validación para actualizar una oferta existente
 * 
 * Solo el profesional que creó la oferta puede actualizarla,
 * y solo si aún está en estado OFERTADO (pendiente).
 */
export const updateOfertaSchema = z.object({
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede superar 500 caracteres')
    .optional(),
  
  precio_final: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .max(1000000, 'El precio no puede superar $1,000,000')
    .optional(),
}).refine(
  (data) => {
    // Al menos un campo debe estar presente
    return data.descripcion !== undefined || data.precio_final !== undefined;
  },
  {
    message: 'Debes actualizar al menos un campo',
  }
);

/**
 * TypeScript types inferidos de los schemas
 */
export type CreateOfertaFormData = z.infer<typeof createOfertaSchema>;
export type UpdateOfertaFormData = z.infer<typeof updateOfertaSchema>;

/**
 * Valores por defecto para el formulario de crear oferta
 */
export const defaultCreateOferta: Partial<CreateOfertaFormData> = {
  descripcion: '',
  precio_final: undefined,
};

/**
 * Enum de estados de oferta (para TypeScript)
 */
export enum EstadoOferta {
  OFERTADO = 'OFERTADO',
  ACEPTADO = 'ACEPTADO',
  RECHAZADO = 'RECHAZADO',
  EXPIRADO = 'EXPIRADO',
}

/**
 * Configuración de UI para cada estado
 */
export const estadoOfertaConfig = {
  [EstadoOferta.OFERTADO]: {
    label: 'Pendiente',
    color: 'bg-blue-500',
    variant: 'default' as const,
  },
  [EstadoOferta.ACEPTADO]: {
    label: 'Aceptada',
    color: 'bg-green-500',
    variant: 'success' as const,
  },
  [EstadoOferta.RECHAZADO]: {
    label: 'Rechazada',
    color: 'bg-red-500',
    variant: 'destructive' as const,
  },
  [EstadoOferta.EXPIRADO]: {
    label: 'Expirada',
    color: 'bg-gray-500',
    variant: 'secondary' as const,
  },
} as const;
