'use client';

/**
 * Página de visualización del perfil profesional
 * Muestra el perfil del usuario autenticado o de un profesional específico
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { professionalService } from '@/lib/services/professionalService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  MapPin,
  DollarSign,
  Star,
  Award,
  Briefcase,
  Clock,
  Check,
  X as XIcon
} from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.rol !== 'PROFESIONAL') {
      router.push('/');
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await professionalService.getMe();
      setProfile(data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No se pudo cargar el perfil</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Header con avatar y datos básicos */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.foto_perfil} />
              <AvatarFallback className="text-3xl">
                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Información principal */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    {user?.nombre} {user?.apellido}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    {profile.biografia || 'Profesional verificado'}
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/perfil/editar')}
                  variant="outline"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Button>
              </div>

              {/* Badges de estado */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={profile.disponible ? 'default' : 'secondary'}>
                  {profile.disponible ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Disponible
                    </>
                  ) : (
                    <>
                      <XIcon className="h-3 w-3 mr-1" />
                      No Disponible
                    </>
                  )}
                </Badge>
                {profile.nivel && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Star className="h-3 w-3 mr-1" />
                    Nivel {profile.nivel}
                  </Badge>
                )}
                {profile.kyc_status === 'APROBADO' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Award className="h-3 w-3 mr-1" />
                    Verificado KYC
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.rating_promedio?.toFixed(1) || '0.0'}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.total_resenas || 0}</div>
                  <div className="text-xs text-muted-foreground">Reseñas</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.trabajos_completados || 0}</div>
                  <div className="text-xs text-muted-foreground">Trabajos</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de 2 columnas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Información Profesional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Información Profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.experiencia_anos && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{profile.experiencia_anos}</strong> años de experiencia
                </span>
              </div>
            )}
            
            {profile.tarifa_por_hora && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>ARS ${profile.tarifa_por_hora.toLocaleString()}</strong> por hora
                </span>
              </div>
            )}

            {profile.radio_cobertura_km && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Radio de cobertura: <strong>{profile.radio_cobertura_km} km</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habilidades */}
        {profile.habilidades && profile.habilidades.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Habilidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.habilidades.map((hab: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {hab}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Descripción */}
      {profile.descripcion && (
        <Card>
          <CardHeader>
            <CardTitle>Sobre Mí</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {profile.descripcion}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Certificaciones */}
      {profile.certificaciones && profile.certificaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.certificaciones.map((cert: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{cert}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Imágenes de trabajos */}
      {profile.imagenes_trabajos && profile.imagenes_trabajos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Galería de Trabajos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.imagenes_trabajos.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`Trabajo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border hover:scale-105 transition-transform cursor-pointer"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA para completar perfil */}
      {(!profile.descripcion || !profile.tarifa_por_hora || !profile.habilidades?.length) && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Edit className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  Completa tu perfil para atraer más clientes
                </h3>
                <p className="text-sm text-orange-700 mb-3">
                  Los perfiles completos reciben hasta 3x más solicitudes de trabajo
                </p>
                <Button
                  onClick={() => router.push('/perfil/editar')}
                  variant="default"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Completar Perfil Ahora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
