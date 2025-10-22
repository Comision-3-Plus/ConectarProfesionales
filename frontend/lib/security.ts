/**
 * Utilidades de seguridad para el frontend
 */

/**
 * Sanitiza HTML para prevenir XSS
 */
export function sanitizeHtml(dirty: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return dirty.replace(reg, (match) => map[match]);
}

/**
 * Valida email con regex seguro
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valida contraseña segura
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Genera un token CSRF para forms
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida que un input no contenga scripts maliciosos
 */
export function validateInput(input: string, maxLength: number = 500): boolean {
  // Rechazar si excede longitud máxima
  if (input.length > maxLength) return false;

  // Rechazar si contiene tags HTML/scripts
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+=/i, // onclick, onload, etc.
    /<object/i,
    /<embed/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitiza URL para prevenir ataques
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Rate limiting simple en cliente (localStorage)
 */
export class ClientRateLimiter {
  private key: string;
  private maxAttempts: number;
  private windowMs: number;

  constructor(key: string, maxAttempts: number = 5, windowMs: number = 60000) {
    this.key = `rate_limit_${key}`;
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    if (typeof window === 'undefined') return true;

    const now = Date.now();
    const item = localStorage.getItem(this.key);
    
    if (!item) {
      this.recordAttempt();
      return true;
    }

    const data = JSON.parse(item);
    const { attempts, timestamp } = data;

    // Reset si pasó la ventana de tiempo
    if (now - timestamp > this.windowMs) {
      this.recordAttempt();
      return true;
    }

    // Verificar límite
    if (attempts >= this.maxAttempts) {
      return false;
    }

    // Incrementar intentos
    localStorage.setItem(
      this.key,
      JSON.stringify({ attempts: attempts + 1, timestamp })
    );
    return true;
  }

  private recordAttempt(): void {
    localStorage.setItem(
      this.key,
      JSON.stringify({ attempts: 1, timestamp: Date.now() })
    );
  }

  reset(): void {
    localStorage.removeItem(this.key);
  }

  getRemainingTime(): number {
    if (typeof window === 'undefined') return 0;

    const item = localStorage.getItem(this.key);
    if (!item) return 0;

    const { timestamp } = JSON.parse(item);
    const elapsed = Date.now() - timestamp;
    return Math.max(0, this.windowMs - elapsed);
  }
}

/**
 * Encripta datos sensibles para localStorage (simple XOR)
 * NO usar para datos críticos, solo ofuscación básica
 */
export function encryptStorage(data: string, key: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

export function decryptStorage(encrypted: string, key: string): string {
  const data = atob(encrypted);
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * Detecta si el navegador tiene herramientas de desarrollo abiertas
 */
export function detectDevTools(): boolean {
  if (typeof window === 'undefined') return false;

  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  return widthThreshold || heightThreshold;
}

/**
 * Prevenir copy-paste en campos sensibles
 */
export function preventCopyPaste(event: ClipboardEvent): void {
  event.preventDefault();
  console.warn('Copy/Paste deshabilitado en este campo por seguridad');
}

/**
 * Genera fingerprint del navegador (simple)
 */
export async function getBrowserFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return '';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];

  const fingerprint = components.join('|');
  
  // Hash simple (en producción usar Web Crypto API)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}
