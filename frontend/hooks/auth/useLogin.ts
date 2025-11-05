/**
 * Hook de React Query para el login de usuarios
 * Maneja la lógica de negocio del login y actualiza el estado global
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService, userService } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';
import type { LoginFormData } from '@/types/forms';

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para iniciar sesión
 * 
 * @example
 * ```tsx
 * const { mutate: login, isPending } = useLogin();
 * 
 * const handleSubmit = (data) => {
 *   login({
 *     email: data.email,
 *     password: data.password,
 *   });
 * };
 * ```
 */
export function useLogin(options?: UseLoginOptions) {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      // 1. Realizar login y obtener token
      const tokens = await authService.login(credentials.email, credentials.password);
      
      // 2. Obtener datos del usuario
      const user = await userService.getMe();
      
      return { user, token: tokens.access_token };
    },
    onSuccess: ({ user, token }) => {
      // 3. Guardar en el store de Zustand
      setAuth(user, token);
      
      toast.success('¡Bienvenido de vuelta! 🎉', {
        description: 'Has iniciado sesión correctamente',
        duration: 2000,
      });
      
      // Callback opcional
      options?.onSuccess?.();
      
      // 4. Redirigir después de un pequeño delay
      setTimeout(() => {
        router.push('/');
      }, 500);
    },
    onError: (error: any) => {
      console.error('Error al iniciar sesión:', error);
      
      const errorMessage = 
        error?.response?.data?.detail || 
        error?.message || 
        'Error al iniciar sesión';
      
      toast.error(errorMessage);
      
      // Callback opcional
      options?.onError?.(error);
    },
  });
}
