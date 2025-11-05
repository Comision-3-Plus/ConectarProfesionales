/**
 * Componente Feature: Formulario de perfil profesional
 * Componente "inteligente" - maneja lógica de negocio y estado
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Star, 
  Clock,
  Plus,
  X,
  Award,
  Image as ImageIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

import { useProfessionalProfile, useUpdateProfessionalProfile } from '@/hooks/profile';
import { useOficios } from '@/hooks/auth';
import { professionalProfileSchema, type ProfessionalProfileFormData } from '@/types/forms';

interface ProfessionalProfileFormProps {
  onSuccess?: () => void;
}

/**
 * Formulario de edición de perfil profesional
 * Solo se muestra si el usuario es PROFESIONAL
 */
export function ProfessionalProfileForm({ onSuccess }: ProfessionalProfileFormProps) {
  // 🔧 Hooks de negocio
  const { data: professionalProfile, isLoading: loadingProfile } = useProfessionalProfile();
  const { mutate: updateProfile, isPending: saving } = useUpdateProfessionalProfile({ onSuccess });
  const { data: oficios = [] } = useOficios();

  // 📝 Form handling
  const {
    register: field,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
  });

  // Estados locales para arrays (habilidades, certificaciones, imágenes)
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [certificaciones, setCertificaciones] = useState<string[]>([]);
  const [nuevaCertificacion, setNuevaCertificacion] = useState('');
  const [imagenesTrabajos, setImagenesTrabajos] = useState<string[]>([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');

  // Cargar datos del perfil cuando estén disponibles
  useEffect(() => {
    if (professionalProfile) {
      reset({
        biografia: (professionalProfile as any).biografia || '',
        descripcion: (professionalProfile as any).descripcion || '',
        experiencia_anos: (professionalProfile as any).experiencia_anos || 0,
        tarifa_por_hora: professionalProfile.tarifa_por_hora || 0,
        radio_cobertura_km: professionalProfile.radio_cobertura_km || 10,
        disponible: (professionalProfile as any).disponible ?? true,
        acepta_instant: professionalProfile.acepta_instant || false,
      });

      // Cargar arrays
      setHabilidades((professionalProfile as any).habilidades || []);
      setCertificaciones((professionalProfile as any).certificaciones || []);
      setImagenesTrabajos((professionalProfile as any).imagenes_trabajos || []);
    }
  }, [professionalProfile, reset]);

  // 🎯 Handler del submit
  const onSubmit = (data: ProfessionalProfileFormData) => {
    updateProfile({
      ...data,
      habilidades,
      certificaciones,
      imagenes_trabajos: imagenesTrabajos,
    } as any);
  };

  // Handlers para agregar/quitar items
  const agregarHabilidad = () => {
    if (nuevaHabilidad.trim()) {
      setHabilidades([...habilidades, nuevaHabilidad.trim()]);
      setNuevaHabilidad('');
    }
  };

  const quitarHabilidad = (index: number) => {
    setHabilidades(habilidades.filter((_, i) => i !== index));
  };

  const agregarCertificacion = () => {
    if (nuevaCertificacion.trim()) {
      setCertificaciones([...certificaciones, nuevaCertificacion.trim()]);
      setNuevaCertificacion('');
    }
  };

  const quitarCertificacion = (index: number) => {
    setCertificaciones(certificaciones.filter((_, i) => i !== index));
  };

  const agregarImagen = () => {
    if (nuevaImagenUrl.trim()) {
      setImagenesTrabajos([...imagenesTrabajos, nuevaImagenUrl.trim()]);
      setNuevaImagenUrl('');
    }
  };

  const quitarImagen = (index: number) => {
    setImagenesTrabajos(imagenesTrabajos.filter((_, i) => i !== index));
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
          <Briefcase className="h-5 w-5 text-orange-600" />
          Perfil Profesional
        </CardTitle>
        <CardDescription>
          Actualiza tu información profesional y destaca tus habilidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Biografía */}
          <div className="space-y-2">
            <Label htmlFor="biografia">Biografía</Label>
            <Textarea
              id="biografia"
              placeholder="Cuéntanos sobre ti y tu experiencia..."
              rows={3}
              {...field('biografia')}
            />
            <p className="text-xs text-slate-500">Presenta tu trayectoria profesional</p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de Servicios</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe los servicios que ofreces..."
              rows={3}
              {...field('descripcion')}
            />
          </div>

          <Separator />

          {/* Experiencia y Tarifa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experiencia_anos" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Años de Experiencia
              </Label>
              <Input
                id="experiencia_anos"
                type="number"
                min="0"
                placeholder="0"
                {...field('experiencia_anos', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifa_por_hora" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tarifa por Hora (ARS)
              </Label>
              <Input
                id="tarifa_por_hora"
                type="number"
                min="0"
                step="100"
                placeholder="0"
                {...field('tarifa_por_hora', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Radio de Cobertura */}
          <div className="space-y-2">
            <Label htmlFor="radio_cobertura_km" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Radio de Cobertura (km)
            </Label>
            <Input
              id="radio_cobertura_km"
              type="number"
              min="1"
              max="500"
              placeholder="10"
              {...field('radio_cobertura_km', { valueAsNumber: true })}
            />
            <p className="text-xs text-slate-500">
              Distancia máxima que estás dispuesto a desplazarte
            </p>
          </div>

          <Separator />

          {/* Disponibilidad */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="disponible" className="text-base">
                Disponible para trabajar
              </Label>
              <p className="text-sm text-slate-500">
                Indica si estás aceptando nuevos proyectos
              </p>
            </div>
            <Switch
              id="disponible"
              checked={watch('disponible')}
              onCheckedChange={(checked) => setValue('disponible', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="acepta_instant" className="text-base">
                Aceptar trabajos instantáneos
              </Label>
              <p className="text-sm text-slate-500">
                Permite que los clientes te contraten directamente
              </p>
            </div>
            <Switch
              id="acepta_instant"
              checked={watch('acepta_instant')}
              onCheckedChange={(checked) => setValue('acepta_instant', checked)}
            />
          </div>

          <Separator />

          {/* Habilidades */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Habilidades
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: Soldadura, Electricidad..."
                value={nuevaHabilidad}
                onChange={(e) => setNuevaHabilidad(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarHabilidad())}
              />
              <Button type="button" onClick={agregarHabilidad} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {habilidades.map((habilidad, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {habilidad}
                  <button
                    type="button"
                    onClick={() => quitarHabilidad(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Certificaciones */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificaciones
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: Certificado de Electricista Matriculado..."
                value={nuevaCertificacion}
                onChange={(e) => setNuevaCertificacion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCertificacion())}
              />
              <Button type="button" onClick={agregarCertificacion} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certificaciones.map((cert, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => quitarCertificacion(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Imágenes de Trabajos */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Imágenes de Trabajos Anteriores
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="URL de la imagen..."
                value={nuevaImagenUrl}
                onChange={(e) => setNuevaImagenUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarImagen())}
              />
              <Button type="button" onClick={agregarImagen} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {imagenesTrabajos.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Trabajo ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => quitarImagen(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
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
              'Guardar Perfil Profesional'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
