import { useAuthStore } from '@/store/authStore';
import { userService } from '@/lib/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch user data if authenticated but user is null
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getMe,
    enabled: isAuthenticated && !user && !!token,
    retry: false,
  });

  // Update user in store if fetched
  if (userData && !user) {
    setAuth(userData, token!);
  }

  const refreshUser = useCallback(async () => {
    try {
      const userData = await userService.getMe();
      setAuth(userData, token!);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [setAuth, token, queryClient]);

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
    refreshUser,
  };
}
