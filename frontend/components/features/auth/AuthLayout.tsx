/**
 * Componente Feature: Layout para páginas de autenticación
 * Componente reutilizable con el diseño visual para login/register
 */

import React from 'react';
import { 
  Sparkles, 
  Shield, 
  Zap, 
  CheckCircle2,
  type LucideIcon
} from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  benefits?: Benefit[];
}

const defaultBenefits: Benefit[] = [
  {
    icon: Shield,
    title: 'Registro Seguro',
    description: 'Tus datos están protegidos con encriptación',
  },
  {
    icon: Zap,
    title: 'Acceso Inmediato',
    description: 'Comienza a usar la plataforma al instante',
  },
  {
    icon: CheckCircle2,
    title: 'Verificación Opcional',
    description: 'Aumenta tu credibilidad con KYC',
  },
];

/**
 * Layout para páginas de autenticación
 * Incluye fondo animado y panel de beneficios
 */
export function AuthLayout({ 
  children, 
  title = 'Comienza tu viaje con',
  subtitle = 'Crea tu cuenta en minutos y accede a un mundo de oportunidades',
  badgeText = 'Únete a miles de usuarios',
  benefits = defaultBenefits 
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Fondo con gradiente vibrante */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
      
      {/* Orbes animados MUY VISIBLES */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-6000"></div>
      </div>
      
      {/* Formas decorativas VISIBLES */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-orange-400/40 rounded-2xl rotate-12 animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 border-4 border-yellow-400/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-br from-orange-300 to-pink-300 rounded-2xl rotate-45 animate-pulse opacity-60" style={{ animationDuration: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-16 h-16 border-4 border-purple-400/40 rounded-2xl -rotate-12"></div>
        <div className="absolute top-32 right-1/3 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full animate-pulse opacity-50" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-10 w-28 h-28 border-4 border-pink-400/30 rounded-2xl rotate-6"></div>
      </div>
      
      {/* Patrón de puntos visible */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgb(251 146 60) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Marketing content */}
        <div className="hidden lg:block space-y-8 text-slate-900 dark:text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-950 rounded-full">
              <Sparkles className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">{badgeText}</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              {title}{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                ConectarProfesionales
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <benefit.icon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form content */}
        {children}
      </div>
    </div>
  );
}
