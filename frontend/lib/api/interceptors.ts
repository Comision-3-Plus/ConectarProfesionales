/**
 * Interceptor de Axios para manejo centralizado de errores
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Tipos de error personalizados
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

// Mapeo de códigos de error a mensajes amigables
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Por favor verifica e intenta nuevamente.',
  401: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'Ya existe un registro con estos datos.',
  422: 'Los datos enviados contienen errores de validación.',
  429: 'Has excedido el límite de solicitudes. Por favor espera un momento.',
  500: 'Error del servidor. Nuestro equipo ha sido notificado.',
  502: 'El servicio está temporalmente no disponible.',
  503: 'El servicio está en mantenimiento. Intenta nuevamente en unos minutos.',
  504: 'La solicitud tardó demasiado en responder. Por favor intenta nuevamente.',
};

// Generar ID único para cada request
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Setup del interceptor de requests
export function setupRequestInterceptor() {
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Agregar Request-ID único
      const requestId = generateRequestId();
      config.headers['X-Request-ID'] = requestId;

      // Agregar timestamp
      config.headers['X-Request-Time'] = new Date().toISOString();

      // Log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          requestId,
          headers: config.headers,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

// Setup del interceptor de responses
export function setupResponseInterceptor() {
  axios.interceptors.response.use(
    (response) => {
      // Capturar headers de rate limiting
      const rateLimitLimit = response.headers['x-ratelimit-limit'];
      const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
      const rateLimitReset = response.headers['x-ratelimit-reset'];

      if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
        toast.warning(`⚠️ Te quedan ${rateLimitRemaining} solicitudes disponibles`, {
          description: 'Por favor modera tu uso para evitar bloqueos temporales.',
        });
      }

      // Log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        const requestId = response.config.headers['X-Request-ID'];
        console.log(`[API Response] ${response.status} ${response.config.url}`, {
          requestId,
          data: response.data,
          rateLimit: { limit: rateLimitLimit, remaining: rateLimitRemaining, reset: rateLimitReset },
        });
      }

      return response;
    },
    (error: AxiosError<APIError>) => {
      const requestId = error.config?.headers?.['X-Request-ID'] as string;
      
      // Manejar errores de red
      if (!error.response) {
        toast.error('Error de Conexión', {
          description: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        });
        return Promise.reject(error);
      }

      const status = error.response.status;
      const errorData = error.response.data;

      // Mensaje de error personalizado
      let errorMessage = ERROR_MESSAGES[status] || 'Ocurrió un error inesperado.';
      
      // Si el backend envía un mensaje específico, usarlo
      if (errorData?.message) {
        errorMessage = errorData.message;
      }

      // Manejar 401 - Logout automático
      if (status === 401) {
        toast.error('Sesión Expirada', {
          description: 'Serás redirigido al login.',
        });
        
        // Limpiar token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
      // Manejar 429 - Rate Limit
      else if (status === 429) {
        const resetTime = error.response.headers['x-ratelimit-reset'];
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
        const minutesLeft = resetDate 
          ? Math.ceil((resetDate.getTime() - Date.now()) / 60000)
          : 'unos';

        toast.error('Límite de Solicitudes Excedido', {
          description: `Por favor espera ${minutesLeft} minutos antes de intentar nuevamente.`,
          duration: 10000,
        });
      }
      // Manejar errores 5xx - Retry sugerido
      else if (status >= 500) {
        toast.error('Error del Servidor', {
          description: errorMessage,
          action: {
            label: 'Reintentar',
            onClick: () => {
              if (error.config) {
                axios.request(error.config);
              }
            },
          },
        });
      }
      // Otros errores
      else {
        toast.error('Error', {
          description: errorMessage,
        });
      }

      // Log del error con Request-ID
      console.error(`[API Error] ${status} ${error.config?.url}`, {
        requestId,
        error: errorData,
        message: errorMessage,
      });

      // Agregar requestId al error para debugging
      const enhancedError = error;
      (enhancedError as AxiosError & { details?: Record<string, unknown> }).details = errorData.details;
      (enhancedError as AxiosError & { requestId?: string }).requestId = requestId;

      return Promise.reject(enhancedError);
    }
  );
}

// Retry logic con exponential backoff
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // No reintentar para ciertos errores
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      if (status && (status < 500 || status === 429)) {
        throw error;
      }

      // Calcular delay con exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      
      if (attempt < maxRetries - 1) {
        console.log(`Reintentando en ${delay}ms... (intento ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Circuit Breaker simple
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private readonly threshold: number = 5;
  private readonly timeout: number = 60000; // 1 minuto
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(requestFn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
    }

    try {
      const result = await requestFn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      toast.error('Servicio Degradado', {
        description: 'El servicio está experimentando problemas. Reintentando automáticamente...',
        duration: 10000,
      });
    }
  }

  getState() {
    return this.state;
  }
}

export const circuitBreaker = new CircuitBreaker();

// Inicializar interceptores
export function initializeAxiosInterceptors() {
  setupRequestInterceptor();
  setupResponseInterceptor();
}
