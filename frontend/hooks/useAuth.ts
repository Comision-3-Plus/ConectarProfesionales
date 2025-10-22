import { useAuthStore } from '@/store/authStore';
import { userService } from '@/lib/services';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

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

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
  };
}
