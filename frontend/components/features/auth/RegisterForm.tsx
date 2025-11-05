/**
 * Componente Feature: Formulario de Registro
 * Componente "inteligente" - maneja lógica de negocio y estado
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { 
  Mail, 
  ArrowRight, 
  User,
  Phone,
  UserCheck,
  Briefcase,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useRegister, useOficios } from '@/hooks/auth';
import { registerSchema, type RegisterFormData, type UserTypeSelection } from '@/types/forms';
import { UserRole } from '@/types';
import { toast } from 'sonner';

/**
 * Formulario completo de registro con validación y manejo de estado
 * Este es un componente "feature" que orquesta la lógica del registro
 */
export function RegisterForm() {
  // Estado local del UI
  const [userType, setUserType] = useState<UserTypeSelection>('cliente');
  const [oficioId, setOficioId] = useState<string>('');

  // Hooks de negocio
  const { mutate: register, isPending } = useRegister();
  const { data: oficios = [], isLoading: loadingOficios } = useOficios();

  // Form handling
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Handler del submit
  const onSubmit = (data: RegisterFormData) => {
    // Validar oficio si es profesional
    if (userType === 'profesional' && !oficioId) {
      toast.error('Debes seleccionar un oficio');
      return;
    }

    // Llamar a la mutation
    register({
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: userType === 'profesional' ? UserRole.PROFESIONAL : UserRole.CLIENTE,
      oficio_id: userType === 'profesional' ? oficioId : undefined,
    });
  };

  return (
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
          <Tabs value={userType} onValueChange={(v) => setUserType(v as UserTypeSelection)}>
            <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger 
                value="cliente" 
                className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Cliente
              </TabsTrigger>
              <TabsTrigger 
                value="profesional" 
                className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
              >
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
                <InputWithIcon
                  id="nombre"
                  icon={User}
                  placeholder="Juan"
                  error={!!errors.nombre}
                  {...registerField('nombre')}
                />
                {errors.nombre && (
                  <p className="text-xs text-red-500">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Apellido
                </Label>
                <InputWithIcon
                  id="apellido"
                  icon={User}
                  placeholder="Pérez"
                  error={!!errors.apellido}
                  {...registerField('apellido')}
                />
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
              <InputWithIcon
                id="email"
                type="email"
                icon={Mail}
                placeholder="tu@email.com"
                error={!!errors.email}
                {...registerField('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Teléfono <span className="text-slate-400">(opcional)</span>
              </Label>
              <InputWithIcon
                id="telefono"
                type="tel"
                icon={Phone}
                placeholder="+54 11 1234-5678"
                {...registerField('telefono')}
              />
            </div>

            {/* Oficio (solo para profesionales) */}
            {userType === 'profesional' && (
              <div className="space-y-2">
                <Label htmlFor="oficio" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  ¿Cuál es tu oficio principal? <span className="text-red-500">*</span>
                </Label>
                <Select value={oficioId} onValueChange={setOficioId} disabled={loadingOficios}>
                  <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500">
                    <Briefcase className="h-5 w-5 text-slate-400 mr-2" />
                    <SelectValue placeholder={loadingOficios ? 'Cargando oficios...' : 'Selecciona tu oficio...'} />
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
              <PasswordInput
                id="password"
                placeholder="••••••••"
                error={!!errors.password}
                {...registerField('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirmar Contraseña
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                {...registerField('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 group"
              disabled={isPending}
            >
              {isPending ? (
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
  );
}
