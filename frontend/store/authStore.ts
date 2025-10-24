import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRead } from '@/types';

interface AuthState {
  user: UserRead | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserRead, token: string) => void;
  setUser: (user: UserRead) => void;
  logout: () => void;
}

// Helper para leer cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          // Guardar en cookies para que el middleware pueda acceder
          document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
        set({ user, token, isAuthenticated: true });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          // Eliminar cookie también
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      // Sincronizar con cookies al recargar
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const cookieToken = getCookie('access_token');
          const localToken = localStorage.getItem('access_token');
          
          // Si hay token en localStorage pero no en cookie, sincronizar
          if (localToken && !cookieToken) {
            document.cookie = `access_token=${localToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
          
          // Si hay token en cookie pero no en localStorage, sincronizar
          if (cookieToken && !localToken) {
            localStorage.setItem('access_token', cookieToken);
          }
        }
      },
    }
  )
);
