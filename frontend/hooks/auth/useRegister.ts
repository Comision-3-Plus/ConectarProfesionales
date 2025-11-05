/**
 * Hook de React Query para el registro de usuarios
 * Maneja la lógica de negocio del registro y actualiza el estado global
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/lib/services';
import type { UserCreate } from '@/types';

interface UseRegisterOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para registrar un nuevo usuario
 * 
 * @example
 * ```tsx
 * const { mutate: register, isPending } = useRegister();
 * 
 * const handleSubmit = (data) => {
 *   register({
 *     email: data.email,
 *     password: data.password,
 *     nombre: data.nombre,
 *     apellido: data.apellido,
 *     rol: UserRole.CLIENTE,
 *   });
 * };
 * ```
 */
export function useRegister(options?: UseRegisterOptions) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: UserCreate) => {
      return await authService.register(userData);
    },
    onSuccess: (data) => {
      toast.success('¡Cuenta creada exitosamente! 🎉', {
        description: 'Ahora puedes iniciar sesión con tus credenciales',
        duration: 3000,
      });
      
      // Callback opcional
      options?.onSuccess?.();
      
      // Redirigir al login
      router.push('/login');
    },
    onError: (error: any) => {
      console.error('Error al registrar:', error);
      
      const errorMessage = 
        error?.response?.data?.detail || 
        error?.message || 
        'Error al registrarse';
      
      toast.error(errorMessage);
      
      // Callback opcional
      options?.onError?.(error);
    },
  });
}
