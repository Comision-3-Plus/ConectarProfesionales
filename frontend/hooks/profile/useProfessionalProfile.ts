/**
 * Hook de React Query para obtener el perfil profesional del usuario actual
 */

import { useQuery } from '@tanstack/react-query';
import { professionalService } from '@/lib/services/professionalService';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

/**
 * Hook para obtener el perfil profesional del usuario actual
 * Solo funciona si el usuario es PROFESIONAL
 * 
 * @example
 * ```tsx
 * const { data: professionalProfile, isLoading } = useProfessionalProfile();
 * ```
 */
export function useProfessionalProfile() {
  const { user, isAuthenticated } = useAuthStore();
  const isProfessional = user?.rol === UserRole.PROFESIONAL;

  return useQuery({
    queryKey: ['professional', 'profile', user?.id],
    queryFn: async () => {
      return await professionalService.getMe();
    },
    enabled: isAuthenticated && isProfessional,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
