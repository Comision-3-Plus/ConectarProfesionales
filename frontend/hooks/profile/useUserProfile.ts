/**
 * Hook de React Query para obtener el perfil del usuario actual
 */

import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook para obtener el perfil del usuario actual
 * Los datos se cachean automáticamente por React Query
 * 
 * @example
 * ```tsx
 * const { data: userProfile, isLoading } = useUserProfile();
 * ```
 */
export function useUserProfile() {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'profile', user?.id],
    queryFn: async () => {
      return await userService.getMe();
    },
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
