'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserProfileForm, ProfessionalProfileForm } from '@/components/features/profile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserRole } from '@/types';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function EditarPerfilPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isProfessional = user?.rol === UserRole.PROFESIONAL;

  useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión para editar tu perfil');
      router.push('/login');
    }
  }, [user, router]);

  const handleSuccess = () => {
    router.push('/perfil');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Editar Perfil
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Actualiza tu información personal{isProfessional && ' y profesional'}
        </p>
      </div>

      <div className="space-y-6">
        <UserProfileForm onSuccess={handleSuccess} />
        {isProfessional && <ProfessionalProfileForm onSuccess={handleSuccess} />}
      </div>
    </div>
  );
}
