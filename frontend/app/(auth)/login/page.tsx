/**
 * Página de Login
 * 
 * ✨ ARQUITECTURA LIMPIA ✨
 * - Esta página es solo un contenedor de presentación
 * - Toda la lógica de negocio está en hooks (/hooks/auth/useLogin)
 * - El formulario está en un componente feature (/components/features/auth/LoginForm)
 * - Los estilos se mantienen mediante el componente AuthLayout
 */

import { AuthLayout, LoginForm } from '@/components/features/auth';
import { Shield, Zap, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | ConectarProfesionales',
  description: 'Inicia sesión en ConectarProfesionales para conectar con profesionales verificados.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de vuelta a"
      subtitle="Conecta con miles de profesionales verificados o encuentra tu próximo proyecto"
      badgeText="Plataforma de confianza"
      benefits={[
        {
          icon: Shield,
          title: 'Pagos Seguros',
          description: 'Sistema de escrow que protege tu dinero',
        },
        {
          icon: Zap,
          title: 'Respuestas Rápidas',
          description: 'Conecta con profesionales en minutos',
        },
        {
          icon: Sparkles,
          title: 'Profesionales Verificados',
          description: 'KYC completo para tu tranquilidad',
        },
      ]}
    >
      <LoginForm />
    </AuthLayout>
  );
}
