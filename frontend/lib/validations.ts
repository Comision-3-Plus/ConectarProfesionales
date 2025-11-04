import { z } from 'zod';

/**
 * Validaciones personalizadas para Argentina
 */

// CUIL/CUIT validator
export const cuilCuitSchema = z
  .string()
  .regex(/^\d{2}-\d{8}-\d{1}$/, 'Formato inválido (XX-XXXXXXXX-X)')
  .refine((value) => {
    const digits = value.replace(/-/g, '');
    if (digits.length !== 11) return false;

    // Algoritmo de verificación CUIL/CUIT
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const sum = digits
      .slice(0, 10)
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * multipliers[index], 0);

    const verifier = 11 - (sum % 11);
    const checkDigit = verifier === 11 ? 0 : verifier === 10 ? 9 : verifier;

    return checkDigit === parseInt(digits[10]);
  }, 'CUIL/CUIT inválido');

// Teléfono argentino
export const phoneArgentinaSchema = z
  .string()
  .regex(
    /^(\+54)?[\s-]?(\d{2,4})[\s-]?(\d{6,8})$/,
    'Formato inválido. Ej: +54 11 1234-5678 o 11 12345678'
  );

// DNI argentino
export const dniSchema = z
  .string()
  .regex(/^\d{7,8}$/, 'DNI debe tener 7 u 8 dígitos')
  .transform((val) => val.padStart(8, '0'));

// Código postal argentino
export const codigoPostalSchema = z
  .string()
  .regex(/^[A-Z]?\d{4}[A-Z]{3}$/, 'Formato inválido. Ej: C1234ABC')
  .or(z.string().regex(/^\d{4}$/, 'Código postal de 4 dígitos'));

// CBU
export const cbuSchema = z
  .string()
  .regex(/^\d{22}$/, 'CBU debe tener 22 dígitos')
  .refine((value) => {
    // Validar dígitos verificadores del CBU
    const bank = value.slice(0, 8);
    const account = value.slice(8, 22);

    const validateBlock = (block: string, weights: number[]) => {
      const sum = block
        .split('')
        .slice(0, -1)
        .reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0);
      const verifier = (10 - (sum % 10)) % 10;
      return verifier === parseInt(block[block.length - 1]);
    };

    return (
      validateBlock(bank, [7, 1, 3, 9, 7, 1, 3]) &&
      validateBlock(account, [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3])
    );
  }, 'CBU inválido');

// Alias CBU
export const aliasCbuSchema = z
  .string()
  .min(6, 'Mínimo 6 caracteres')
  .max(20, 'Máximo 20 caracteres')
  .regex(/^[a-z0-9.]+$/, 'Solo letras minúsculas, números y puntos');

/**
 * Schemas de formularios comunes
 */

// Perfil de profesional
export const professionalProfileSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: phoneArgentinaSchema,
  dni: dniSchema.optional(),
  oficio_id: z.string().min(1, 'Selecciona un oficio'),
  descripcion: z
    .string()
    .min(50, 'Mínimo 50 caracteres')
    .max(1000, 'Máximo 1000 caracteres'),
  años_experiencia: z.number().min(0).max(70),
  radio_trabajo_km: z.number().min(1, 'Mínimo 1 km').max(100, 'Máximo 100 km'),
  precio_hora_min: z.number().min(0).optional(),
  precio_hora_max: z.number().min(0).optional(),
  acepta_emergencias: z.boolean().default(false),
  ubicacion: z.object({
    direccion: z.string().min(5, 'Dirección muy corta'),
    ciudad: z.string().min(2),
    provincia: z.string().min(2),
    codigo_postal: codigoPostalSchema.optional(),
    latitud: z.number().min(-90).max(90),
    longitud: z.number().min(-180).max(180),
  }),
});

// Oferta de trabajo
export const offerSchema = z
  .object({
    descripcion: z
      .string()
      .min(20, 'Describe el trabajo con al menos 20 caracteres')
      .max(2000, 'Máximo 2000 caracteres'),
    presupuesto_estimado: z.number().min(0).optional(),
    fecha_inicio_deseada: z.string().optional(),
    urgencia: z.enum(['baja', 'media', 'alta']).default('media'),
    requiere_materiales: z.boolean().default(false),
    imagenes: z.array(z.string().url()).max(10, 'Máximo 10 imágenes').optional(),
  })
  .refine(
    (data) => {
      if (!data.presupuesto_estimado && data.urgencia === 'alta') {
        return false;
      }
      return true;
    },
    {
      message: 'Para trabajos urgentes debes indicar un presupuesto estimado',
      path: ['presupuesto_estimado'],
    }
  );

// Reseña
export const reviewSchema = z.object({
  calificacion: z.number().min(1, 'Selecciona una calificación').max(5),
  comentario: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  recomendaria: z.boolean().default(true),
});

// Datos de pago
export const paymentDataSchema = z.object({
  metodo: z.enum(['mercadopago', 'transferencia', 'efectivo']),
  acepta_terminos: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
  cbu: z.string().optional(),
  alias: z.string().optional(),
});

// Datos bancarios
export const bankAccountSchema = z
  .object({
    tipo_cuenta: z.enum(['cbu', 'alias']),
    cbu: cbuSchema.optional(),
    alias: aliasCbuSchema.optional(),
    titular: z.string().min(3, 'Nombre del titular requerido'),
    banco: z.string().min(2, 'Nombre del banco requerido'),
  })
  .refine(
    (data) => {
      if (data.tipo_cuenta === 'cbu' && !data.cbu) return false;
      if (data.tipo_cuenta === 'alias' && !data.alias) return false;
      return true;
    },
    {
      message: 'Completa los datos según el tipo de cuenta',
      path: ['tipo_cuenta'],
    }
  );

// Contraseña segura
export const securePasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial');

/**
 * Helpers de validación
 */

export function validateCuilCuit(cuilCuit: string): boolean {
  try {
    cuilCuitSchema.parse(cuilCuit);
    return true;
  } catch {
    return false;
  }
}

export function validateCBU(cbu: string): boolean {
  try {
    cbuSchema.parse(cbu);
    return true;
  } catch {
    return false;
  }
}

export function validatePhoneArgentina(phone: string): boolean {
  try {
    phoneArgentinaSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formateadores
 */

export function formatCuilCuit(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
}

export function formatCBU(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.match(/.{1,4}/g)?.join(' ') || digits;
}

export function formatPhoneArgentina(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
}
