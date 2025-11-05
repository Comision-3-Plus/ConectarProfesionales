import { z } from 'zod';
import { Clock, CheckCircle, XCircle, DollarSign, AlertCircle } from 'lucide-react';

/**
 * Types para el módulo de Pagos
 * 
 * NOTA: Los tipos Transaction, BalanceInfo, WithdrawalRequest
 * están definidos en /lib/services/paymentService.ts
 * y se reutilizan desde allí.
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export enum EstadoTransaccion {
  PENDIENTE = 'pendiente',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
  EN_DISPUTA = 'en_disputa',
  REEMBOLSADO = 'reembolsado',
}

export enum EstadoEscrow {
  PENDIENTE = 'PENDIENTE',
  DEPOSITADO = 'DEPOSITADO',
  LIBERADO = 'LIBERADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export enum TipoMovimiento {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
  COMISION = 'comision',
}

// ============================================================================
// CONFIGURACIONES UI (DRY Principle)
// ============================================================================

export const estadoTransaccionConfig = {
  [EstadoTransaccion.PENDIENTE]: {
    label: 'Pendiente de Pago',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: Clock,
    description: 'Esperando confirmación de pago',
  },
  [EstadoTransaccion.COMPLETADO]: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle,
    description: 'Pago procesado exitosamente',
  },
  [EstadoTransaccion.CANCELADO]: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle,
    description: 'Transacción cancelada',
  },
  [EstadoTransaccion.EN_DISPUTA]: {
    label: 'En Disputa',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: AlertCircle,
    description: 'Hay un reclamo en proceso',
  },
  [EstadoTransaccion.REEMBOLSADO]: {
    label: 'Reembolsado',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: DollarSign,
    description: 'Monto devuelto al cliente',
  },
};

export const estadoEscrowConfig = {
  [EstadoEscrow.PENDIENTE]: {
    label: 'Pendiente',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  [EstadoEscrow.DEPOSITADO]: {
    label: 'En Garantía',
    color: 'bg-blue-100 text-blue-800',
    icon: DollarSign,
  },
  [EstadoEscrow.LIBERADO]: {
    label: 'Liberado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  [EstadoEscrow.REEMBOLSADO]: {
    label: 'Reembolsado',
    color: 'bg-purple-100 text-purple-800',
    icon: DollarSign,
  },
};

// ============================================================================
// SCHEMAS ZOD (Validación de Formularios)
// ============================================================================

/**
 * Schema para solicitar un reembolso
 */
export const requestRefundSchema = z.object({
  transactionId: z.string().uuid('ID de transacción inválido'),
  motivo: z
    .string()
    .min(20, 'El motivo debe tener al menos 20 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
});

export type RequestRefundFormData = z.infer<typeof requestRefundSchema>;

/**
 * Schema para filtros de historial de pagos
 */
export const paymentHistoryFiltersSchema = z.object({
  tipo: z.enum(['ingreso', 'egreso', 'comision', 'todos']).optional(),
  desde: z.string().optional(), // ISO date string
  hasta: z.string().optional(), // ISO date string
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaymentHistoryFilters = z.infer<typeof paymentHistoryFiltersSchema>;

/**
 * Schema para configurar cuenta bancaria
 */
export const bankAccountSchema = z
  .object({
    tipo_cuenta: z.enum(['cbu', 'alias'], {
      message: 'Selecciona un tipo de cuenta válido',
    }),
    cbu: z.string().optional(),
    alias: z.string().optional(),
    titular: z.string().min(3, 'El nombre del titular debe tener al menos 3 caracteres'),
    banco: z.string().min(3, 'El nombre del banco debe tener al menos 3 caracteres'),
  })
  .refine(
    (data) => {
      // Si el tipo es CBU, debe proporcionar un CBU válido
      if (data.tipo_cuenta === 'cbu') {
        return data.cbu && data.cbu.length === 22 && /^\d+$/.test(data.cbu);
      }
      // Si el tipo es Alias, debe proporcionar un alias
      if (data.tipo_cuenta === 'alias') {
        return data.alias && data.alias.length >= 6;
      }
      return false;
    },
    {
      message: 'CBU debe tener 22 dígitos o Alias debe tener al menos 6 caracteres',
      path: ['cbu'], // Error path
    }
  );

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

/**
 * Schema para solicitar retiro de fondos
 */
export const withdrawalRequestSchema = z.object({
  monto: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .min(1000, 'El monto mínimo de retiro es $1,000')
    .max(1000000, 'El monto máximo de retiro es $1,000,000'),
});

export type WithdrawalRequestFormData = z.infer<typeof withdrawalRequestSchema>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatear monto en pesos argentinos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
}

/**
 * Calcular comisión de la plataforma
 */
export function calculateCommission(amount: number, rate: number = 0.15): number {
  return amount * rate;
}

/**
 * Calcular monto neto para el profesional
 */
export function calculateNetAmount(amount: number, rate: number = 0.15): number {
  return amount - calculateCommission(amount, rate);
}
