'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/lib/services';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, logout, setAuth, _hasHydrated } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Solo validar después de que Zustand haya hidratado
    if (!_hasHydrated) return;

    const validateSession = async () => {
      // Si no hay token o no está autenticado, no hay nada que validar
      if (!token || !isAuthenticated) {
        setIsValidating(false);
        return;
      }

      try {
        // Intentar obtener el usuario actual para validar el token
        const userData = await userService.getMe();
        
        // Si el token es válido, actualizar el usuario
        setAuth(userData, token);
        console.log('✅ Sesión válida restaurada');
      } catch (error) {
        // Token inválido o expirado, cerrar sesión
        console.log('❌ Token inválido, cerrando sesión');
        logout();
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [_hasHydrated, token, isAuthenticated, logout, setAuth]);

  // Mostrar loading solo si está validando y hay token
  if (isValidating && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
