'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Solo verificar autenticación después de hidratar
    if (isHydrated && !isAuthenticated && !token) {
      router.push('/login');
    }
  }, [isAuthenticated, token, router, isHydrated]);

  // Mientras se hidrata o tiene token, mostrar contenido
  if (!isHydrated || token || isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  return null;
}
