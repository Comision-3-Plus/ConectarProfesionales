'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authService } from '@/lib/services';
import { oficiosService, type Oficio } from '@/lib/services/oficiosService';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Zap, 
  Eye, 
  EyeOff,
  User,
  Phone,
  UserCheck,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  telefono: z.string().optional(),
  oficio_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'cliente' | 'profesional'>('cliente');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [oficioId, setOficioId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Cargar oficios al montar el componente
  useEffect(() => {
    const loadOficios = async () => {
      const data = await oficiosService.getAll();
      setOficios(data);
    };
    loadOficios();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    // Validar oficio si es profesional
    if (userType === 'profesional' && !oficioId) {
      toast.error('Debes seleccionar un oficio');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: userType === 'profesional' ? UserRole.PROFESIONAL : UserRole.CLIENTE,
        oficio_id: userType === 'profesional' ? oficioId : undefined,
      });
      
      toast.success('¡Cuenta creada exitosamente! 🎉', {
        description: 'Ahora puedes iniciar sesión con tus credenciales',
        duration: 3000,
      });
      router.push('/login');
    } catch (error) {
      console.error('Error al registrar:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail 
        || (error as { message?: string })?.message 
        || 'Error al registrarse';
      toast.error(errorMessage);
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
              <span className="text-sm font-medium text-orange-600">Únete a miles de usuarios</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Comienza tu viaje con{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                ConectarProfesionales
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Crea tu cuenta en minutos y accede a un mundo de oportunidades
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
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
            ].map((benefit, index) => (
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

        {/* Right side - Register form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30 mb-4">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Crear Cuenta</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Completa tus datos para comenzar
                </p>
              </div>

              {/* User Type Tabs */}
              <Tabs value={userType} onValueChange={(v) => setUserType(v as 'cliente' | 'profesional')}>
                <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="cliente" className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Cliente
                  </TabsTrigger>
                  <TabsTrigger value="profesional" className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Profesional
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="cliente" className="mt-3">
                  <p className="text-sm text-center text-slate-600 dark:text-slate-400 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                    💼 Busca y contrata profesionales verificados
                  </p>
                </TabsContent>
                <TabsContent value="profesional" className="mt-3">
                  <p className="text-sm text-center text-slate-600 dark:text-slate-400 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                    ⭐ Ofrece tus servicios y consigue clientes
                  </p>
                </TabsContent>
              </Tabs>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name & Lastname */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nombre
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="nombre"
                        placeholder="Juan"
                        {...register('nombre')}
                        className={`pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 ${
                          errors.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.nombre && (
                      <p className="text-xs text-red-500">{errors.nombre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Apellido
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="apellido"
                        placeholder="Pérez"
                        {...register('apellido')}
                        className={`pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 ${
                          errors.apellido ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.apellido && (
                      <p className="text-xs text-red-500">{errors.apellido.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
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
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Teléfono <span className="text-slate-400">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+54 11 1234-5678"
                      {...register('telefono')}
                      className="pl-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Oficio (solo para profesionales) */}
                {userType === 'profesional' && (
                  <div className="space-y-2">
                    <Label htmlFor="oficio" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      ¿Cuál es tu oficio principal? <span className="text-red-500">*</span>
                    </Label>
                    <Select value={oficioId} onValueChange={setOficioId}>
                      <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500">
                        <Briefcase className="h-5 w-5 text-slate-400 mr-2" />
                        <SelectValue placeholder="Selecciona tu oficio..." />
                      </SelectTrigger>
                      <SelectContent>
                        {oficios.map((oficio) => (
                          <SelectItem key={oficio.id} value={oficio.id}>
                            {oficio.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {userType === 'profesional' && !oficioId && (
                      <p className="text-xs text-slate-500">
                        Selecciona el oficio que mejor represente tu trabajo principal
                      </p>
                    )}
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Contraseña
                  </Label>
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
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={`pl-10 pr-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg p-1"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear Cuenta
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
                      ¿Ya tienes cuenta?
                    </span>
                  </div>
                </div>

                {/* Login link */}
                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Inicia sesión aquí
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
