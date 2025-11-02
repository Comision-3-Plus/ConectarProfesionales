'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // ADMIN puede acceder a cualquier dashboard
      // Por defecto, llevarlo al dashboard admin
      if (user.rol === 'ADMIN') {
        router.replace('/dashboard/admin');
      } else if (user.rol === 'PROFESIONAL') {
        router.replace('/dashboard/profesional');
      } else if (user.rol === 'CLIENTE') {
        router.replace('/dashboard/cliente');
      }
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    </div>
  );
}
