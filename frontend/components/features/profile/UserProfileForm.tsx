/**
 * Componente Feature: Formulario de datos básicos del usuario
 * Componente "inteligente" - maneja lógica de negocio y estado
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useUserProfile, useUpdateUserProfile } from '@/hooks/profile';
import { userProfileSchema, type UserProfileFormData } from '@/types/forms';

interface UserProfileFormProps {
  onSuccess?: () => void;
}

/**
 * Formulario de edición de datos básicos del usuario
 * Usa react-hook-form + Zod + React Query
 */
export function UserProfileForm({ onSuccess }: UserProfileFormProps) {
  // 🔧 Hooks de negocio
  const { data: userProfile, isLoading: loadingProfile } = useUserProfile();
  const { mutate: updateProfile, isPending: saving } = useUpdateUserProfile({ onSuccess });

  // 📝 Form handling
  const {
    register: field,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  // Cargar datos del perfil cuando estén disponibles
  useEffect(() => {
    if (userProfile) {
      reset({
        nombre: userProfile.nombre || '',
        apellido: userProfile.apellido || '',
        telefono: userProfile.telefono || '',
        direccion: userProfile.direccion || '',
      });
    }
  }, [userProfile, reset]);

  // 🎯 Handler del submit
  const onSubmit = (data: UserProfileFormData) => {
    updateProfile(data);
  };

  if (loadingProfile) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-orange-600" />
          Información Personal
        </CardTitle>
        <CardDescription>
          Actualiza tus datos básicos de usuario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Juan"
                {...field('nombre')}
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                placeholder="Pérez"
                {...field('apellido')}
                className={errors.apellido ? 'border-red-500' : ''}
              />
              {errors.apellido && (
                <p className="text-xs text-red-500">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+54 11 1234-5678"
              {...field('telefono')}
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección
            </Label>
            <Input
              id="direccion"
              placeholder="Av. Corrientes 1234, CABA"
              {...field('direccion')}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
