/**
 * Barrel export para hooks de Trabajos
 * 
 * Queries:
 * - useTrabajos: lista de trabajos con filtros
 * - useTrabajoById: detalle de un trabajo
 * - useTrabajoTimeline: historial/timeline de un trabajo
 * 
 * Mutations:
 * - useIniciarTrabajo: profesional inicia trabajo (PAGADO → EN_PROCESO)
 * - useCompletarTrabajo: profesional completa trabajo (EN_PROCESO → COMPLETADO)
 * - useAprobarTrabajo: cliente aprueba trabajo (COMPLETADO → APROBADO)
 * - useCancelarTrabajo: cancelar trabajo (cualquier estado → CANCELADO)
 * - useAddImagenes: agregar imágenes al trabajo
 */

// Queries
export { useTrabajos } from './useTrabajos';
export { useTrabajoById } from './useTrabajoById';
export { useTrabajoTimeline } from './useTrabajoTimeline';

// Mutations
export { useIniciarTrabajo } from './useIniciarTrabajo';
export { useCompletarTrabajo } from './useCompletarTrabajo';
export { useAprobarTrabajo } from './useAprobarTrabajo';
export { useCancelarTrabajo } from './useCancelarTrabajo';
export { useAddImagenes } from './useAddImagenes';
