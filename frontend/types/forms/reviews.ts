import { z } from 'zod';
import { Star } from 'lucide-react';

/**
 * Types para el módulo de Reviews (Reseñas)
 * 
 * Sistema de calificación 1-5 estrellas con comentario opcional
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export const VALORACION_MIN = 1;
export const VALORACION_MAX = 5;

export type Valoracion = 1 | 2 | 3 | 4 | 5;

// ============================================================================
// CONFIGURACIONES UI
// ============================================================================

export const valoracionConfig = {
  1: {
    label: 'Muy Malo',
    color: 'text-red-500',
    description: 'Experiencia muy negativa',
  },
  2: {
    label: 'Malo',
    color: 'text-orange-500',
    description: 'Por debajo de las expectativas',
  },
  3: {
    label: 'Regular',
    color: 'text-yellow-500',
    description: 'Cumplió lo básico',
  },
  4: {
    label: 'Bueno',
    color: 'text-lime-500',
    description: 'Superó las expectativas',
  },
  5: {
    label: 'Excelente',
    color: 'text-green-500',
    description: 'Experiencia excepcional',
  },
};

// ============================================================================
// SCHEMAS ZOD
// ============================================================================

/**
 * Schema para crear una reseña
 */
export const createReviewSchema = z.object({
  trabajo_id: z.string().uuid('ID de trabajo inválido'),
  profesional_id: z.string().uuid('ID de profesional inválido'),
  valoracion: z
    .number()
    .int('La valoración debe ser un número entero')
    .min(VALORACION_MIN, `La valoración mínima es ${VALORACION_MIN}`)
    .max(VALORACION_MAX, `La valoración máxima es ${VALORACION_MAX}`),
  comentario: z
    .string()
    .max(500, 'El comentario no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtener promedio de valoraciones
 */
export function getAverageRating(reviews: { valoracion: number }[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.valoracion, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // 1 decimal
}

/**
 * Obtener distribución de estrellas (para gráfico)
 */
export function getRatingDistribution(reviews: { valoracion: number }[]): Record<
  Valoracion,
  number
> {
  const distribution: Record<Valoracion, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach((r) => {
    const val = r.valoracion as Valoracion;
    if (val >= 1 && val <= 5) {
      distribution[val]++;
    }
  });

  return distribution;
}
