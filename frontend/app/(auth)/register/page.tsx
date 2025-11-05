/**
 * Página de Registro
 * 
 * ✨ ARQUITECTURA LIMPIA ✨
 * - Esta página es solo un contenedor de presentación
 * - Toda la lógica de negocio está en hooks (/hooks/auth/useRegister)
 * - El formulario está en un componente feature (/components/features/auth/RegisterForm)
 * - Los estilos se mantienen mediante el componente AuthLayout
 */

import { AuthLayout, RegisterForm } from '@/components/features/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro | ConectarProfesionales',
  description: 'Crea tu cuenta en ConectarProfesionales y accede a miles de profesionales verificados.',
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
