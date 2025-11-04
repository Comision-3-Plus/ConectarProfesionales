'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { authService, userService } from '@/lib/services';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, Sparkles, Shield, Zap, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const tokens = await authService.login(data.email, data.password);
      const user = await userService.getMe();
      
      setAuth(user, tokens.access_token);
      toast.success('¡Bienvenido de vuelta! 🎉', {
        description: 'Has iniciado sesión correctamente',
        duration: 2000,
      });
      
      // Pequeño delay para que el toast se muestre y el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect a la página principal
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

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
              <span className="text-sm font-medium text-orange-600">Plataforma de confianza</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Bienvenido de vuelta a{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                ConectarProfesionales
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Conecta con miles de profesionales verificados o encuentra tu próximo proyecto
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
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
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30 mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      {...register('email')}
                      className={`pl-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Contraseña
                    </Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={`pl-10 pr-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg p-1"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">
                      ¿No tienes cuenta?
                    </span>
                  </div>
                </div>

                {/* Register link */}
                <div className="text-center">
                  <Link 
                    href="/register" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Crear una cuenta nueva
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
