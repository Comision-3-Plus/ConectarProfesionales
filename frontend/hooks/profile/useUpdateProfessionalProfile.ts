/**
 * Hook de React Query para actualizar el perfil profesional
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { professionalService } from '@/lib/services/professionalService';
import { useAuthStore } from '@/store/authStore';
import type { ProfessionalProfileUpdate } from '@/types';

interface UseUpdateProfessionalProfileOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para actualizar el perfil profesional del usuario actual
 * Invalida las queries relacionadas automáticamente
 * 
 * @example
 * ```tsx
 * const { mutate: updateProfile, isPending } = useUpdateProfessionalProfile();
 * 
 * const handleSubmit = (data) => {
 *   updateProfile({
 *     biografia: data.biografia,
 *     tarifa_por_hora: data.tarifa_por_hora,
 *   });
 * };
 * ```
 */
export function useUpdateProfessionalProfile(options?: UseUpdateProfessionalProfileOptions) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (profileData: ProfessionalProfileUpdate) => {
      return await professionalService.updateProfile(profileData);
    },
    onSuccess: () => {
      // Invalidar y refrescar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['professional', 'profile', user?.id] });
      
      toast.success('Perfil profesional actualizado correctamente');
      
      // Callback opcional
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error al actualizar perfil profesional:', error);
      
      const errorMessage = 
        error?.response?.data?.detail || 
        error?.message || 
        'Error al actualizar el perfil profesional';
      
      toast.error(errorMessage);
      
      // Callback opcional
      options?.onError?.(error);
    },
  });
}
