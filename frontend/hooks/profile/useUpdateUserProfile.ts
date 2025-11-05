/**
 * Hook de React Query para actualizar el perfil del usuario
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';
import type { UserUpdate } from '@/types';

interface UseUpdateUserProfileOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para actualizar el perfil del usuario actual
 * Invalida las queries relacionadas automáticamente
 * 
 * @example
 * ```tsx
 * const { mutate: updateProfile, isPending } = useUpdateUserProfile();
 * 
 * const handleSubmit = (data) => {
 *   updateProfile({
 *     nombre: data.nombre,
 *     apellido: data.apellido,
 *   });
 * };
 * ```
 */
export function useUpdateUserProfile(options?: UseUpdateUserProfileOptions) {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: UserUpdate) => {
      return await userService.updateMe(userData);
    },
    onSuccess: (updatedUser) => {
      // Actualizar el usuario en el store de Zustand
      setUser(updatedUser);
      
      // Invalidar y refrescar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', user?.id] });
      
      toast.success('Perfil actualizado correctamente');
      
      // Callback opcional
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error al actualizar perfil de usuario:', error);
      
      const errorMessage = 
        error?.response?.data?.detail || 
        error?.message || 
        'Error al actualizar el perfil';
      
      toast.error(errorMessage);
      
      // Callback opcional
      options?.onError?.(error);
    },
  });
}
