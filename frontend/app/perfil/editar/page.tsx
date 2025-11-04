'use client';

/**
 * Página de edición de perfil profesional
 * Permite actualizar: biografía, descripción, tarifa, ubicación, habilidades, etc.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { professionalService } from '@/lib/services/professionalService';
import { userService } from '@/lib/services/userService';
import { oficiosService, type Oficio } from '@/lib/services/oficiosService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  DollarSign,
  MapPin,
  Star,
  Clock,
  Image as ImageIcon,
  Plus,
  X,
  Award
} from 'lucide-react';

export default function EditarPerfilPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Datos del usuario (nombre y apellido)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  // Datos del perfil
  const [biografia, setBiografia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [experienciaAnos, setExperienciaAnos] = useState<number>(0);
  const [tarifaPorHora, setTarifaPorHora] = useState<number>(0);
  const [radioCobertura, setRadioCobertura] = useState<number>(10);
  const [disponible, setDisponible] = useState(true);
  
  // Habilidades
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');

  // Certificaciones
  const [certificaciones, setCertificaciones] = useState<string[]>([]);
  const [nuevaCertificacion, setNuevaCertificacion] = useState('');

  // Oficios
  const [oficiosDisponibles, setOficiosDisponibles] = useState<Oficio[]>([]);
  const [oficiosSeleccionados, setOficiosSeleccionados] = useState<string[]>([]);

  // Imágenes
  const [imagenesTrabajos, setImagenesTrabajos] = useState<string[]>([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');

  // Ubicación
  const [ubicacionLat, setUbicacionLat] = useState<number | undefined>();
  const [ubicacionLon, setUbicacionLon] = useState<number | undefined>();

  useEffect(() => {
    if (user?.rol !== 'PROFESIONAL') {
      toast.error('Solo los profesionales pueden editar este perfil');
      router.push('/');
      return;
    }

    loadProfile();
    loadOficios();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del usuario (nombre y apellido)
      const userData = await userService.getMe();
      setNombre(userData.nombre || '');
      setApellido(userData.apellido || '');
      
      // Cargar datos del perfil profesional
      const profile = await professionalService.getMe();
      
      // Cargar datos existentes
      setBiografia(profile.biografia || '');
      setDescripcion(profile.descripcion || '');
      setExperienciaAnos(profile.experiencia_anos || 0);
      setTarifaPorHora(profile.tarifa_por_hora || 0);
      setRadioCobertura(profile.radio_cobertura_km || 10);
      setDisponible(profile.disponible ?? true);
      setHabilidades(profile.habilidades || []);
      setCertificaciones(profile.certificaciones || []);
      setImagenesTrabajos(profile.imagenes_trabajos || []);
      setUbicacionLat(profile.ubicacion_lat);
      setUbicacionLon(profile.ubicacion_lon);
      
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadOficios = async () => {
    const data = await oficiosService.getAll();
    setOficiosDisponibles(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ejecutar ambas actualizaciones en paralelo
      await Promise.all([
        // Actualizar datos del usuario (nombre y apellido)
        userService.updateMe({ nombre, apellido }),
        
        // Actualizar datos del perfil profesional
        professionalService.updateProfile({
          biografia,
          descripcion,
          experiencia_anos: experienciaAnos,
          tarifa_por_hora: tarifaPorHora,
          radio_cobertura_km: radioCobertura,
          disponible,
          habilidades,
          certificaciones,
          imagenes_trabajos: imagenesTrabajos,
          ubicacion_lat: ubicacionLat,
          ubicacion_lon: ubicacionLon,
        })
      ]);

      toast.success('Perfil actualizado correctamente');
      router.push('/perfil');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const agregarHabilidad = () => {
    if (nuevaHabilidad.trim() && !habilidades.includes(nuevaHabilidad.trim())) {
      setHabilidades([...habilidades, nuevaHabilidad.trim()]);
      setNuevaHabilidad('');
    }
  };

  const eliminarHabilidad = (index: number) => {
    setHabilidades(habilidades.filter((_, i) => i !== index));
  };

  const agregarCertificacion = () => {
    if (nuevaCertificacion.trim() && !certificaciones.includes(nuevaCertificacion.trim())) {
      setCertificaciones([...certificaciones, nuevaCertificacion.trim()]);
      setNuevaCertificacion('');
    }
  };

  const eliminarCertificacion = (index: number) => {
    setCertificaciones(certificaciones.filter((_, i) => i !== index));
  };

  const agregarImagen = () => {
    if (nuevaImagenUrl.trim() && !imagenesTrabajos.includes(nuevaImagenUrl.trim())) {
      setImagenesTrabajos([...imagenesTrabajos, nuevaImagenUrl.trim()]);
      setNuevaImagenUrl('');
    }
  };

  const eliminarImagen = (index: number) => {
    setImagenesTrabajos(imagenesTrabajos.filter((_, i) => i !== index));
  };

  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no soportada en este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacionLat(position.coords.latitude);
        setUbicacionLon(position.coords.longitude);
        toast.success('Ubicación actualizada');
      },
      (error) => {
        console.error('Error al obtener ubicación:', error);
        toast.error('No se pudo obtener la ubicación');
      }
    );
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/perfil')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Perfil Profesional</h1>
            <p className="text-muted-foreground">
              Actualiza tu información para atraer más clientes
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Básica
          </CardTitle>
          <CardDescription>
            Presenta tu perfil profesional de forma atractiva
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              placeholder="Tu apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Biografía */}
          <div className="space-y-2">
            <Label htmlFor="biografia">Biografía (Título corto)</Label>
            <Input
              id="biografia"
              placeholder="Ej: Electricista con 10 años de experiencia"
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {biografia.length}/100 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción Detallada</Label>
            <Textarea
              id="descripcion"
              placeholder="Cuéntale a tus clientes sobre tu experiencia, especialidades y por qué deberían contratarte..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {descripcion.length}/1000 caracteres
            </p>
          </div>

          {/* Experiencia en años */}
          <div className="space-y-2">
            <Label htmlFor="experiencia">Años de Experiencia</Label>
            <Input
              id="experiencia"
              type="number"
              min="0"
              max="50"
              value={experienciaAnos}
              onChange={(e) => setExperienciaAnos(parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tarifas y Disponibilidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Tarifas y Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tarifa por hora */}
          <div className="space-y-2">
            <Label htmlFor="tarifa">Tarifa por Hora (ARS)</Label>
            <Input
              id="tarifa"
              type="number"
              min="0"
              step="100"
              value={tarifaPorHora}
              onChange={(e) => setTarifaPorHora(parseInt(e.target.value) || 0)}
              placeholder="5000"
            />
            <p className="text-xs text-muted-foreground">
              Esta es tu tarifa referencial. Puedes negociar precios en cada oferta.
            </p>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Disponible para nuevos trabajos</Label>
              <p className="text-xs text-muted-foreground">
                Aparecerás en las búsquedas cuando esté activo
              </p>
            </div>
            <Switch
              checked={disponible}
              onCheckedChange={setDisponible}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ubicación y Cobertura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación y Área de Cobertura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ubicación actual */}
          <div className="space-y-2">
            <Label>Ubicación Base</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Latitud"
                value={ubicacionLat || ''}
                onChange={(e) => setUbicacionLat(parseFloat(e.target.value) || undefined)}
                className="flex-1"
              />
              <Input
                placeholder="Longitud"
                value={ubicacionLon || ''}
                onChange={(e) => setUbicacionLon(parseFloat(e.target.value) || undefined)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={obtenerUbicacionActual}
              >
                Usar mi ubicación
              </Button>
            </div>
            {ubicacionLat && ubicacionLon && (
              <p className="text-xs text-green-600">
                ✓ Ubicación configurada: {ubicacionLat.toFixed(4)}, {ubicacionLon.toFixed(4)}
              </p>
            )}
          </div>

          {/* Radio de cobertura */}
          <div className="space-y-2">
            <Label htmlFor="radio">Radio de Cobertura (km)</Label>
            <Input
              id="radio"
              type="number"
              min="1"
              max="100"
              value={radioCobertura}
              onChange={(e) => setRadioCobertura(parseInt(e.target.value) || 10)}
            />
            <p className="text-xs text-muted-foreground">
              Distancia máxima que estás dispuesto a viajar desde tu ubicación base
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Habilidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Habilidades
          </CardTitle>
          <CardDescription>
            Agrega palabras clave que describan tus especialidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de habilidades */}
          <div className="flex flex-wrap gap-2">
            {habilidades.map((habilidad, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {habilidad}
                <button
                  onClick={() => eliminarHabilidad(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Agregar habilidad */}
          <div className="flex gap-2">
            <Input
              placeholder="Ej: Instalaciones eléctricas, Cableado, Domótica..."
              value={nuevaHabilidad}
              onChange={(e) => setNuevaHabilidad(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarHabilidad())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={agregarHabilidad}
              disabled={!nuevaHabilidad.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificaciones y Credenciales
          </CardTitle>
          <CardDescription>
            Agrega tus certificaciones, licencias o cursos completados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de certificaciones */}
          <div className="space-y-2">
            {certificaciones.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">{cert}</span>
                <button
                  onClick={() => eliminarCertificacion(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Agregar certificación */}
          <div className="flex gap-2">
            <Input
              placeholder="Ej: Matrícula de Electricista ENRE 2023"
              value={nuevaCertificacion}
              onChange={(e) => setNuevaCertificacion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCertificacion())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={agregarCertificacion}
              disabled={!nuevaCertificacion.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Imágenes de Trabajos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imágenes de Trabajos Realizados
          </CardTitle>
          <CardDescription>
            Muestra fotos de tus mejores trabajos (por ahora ingresa URLs)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Galería */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagenesTrabajos.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Trabajo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => eliminarImagen(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Agregar imagen */}
          <div className="flex gap-2">
            <Input
              placeholder="URL de la imagen (https://...)"
              value={nuevaImagenUrl}
              onChange={(e) => setNuevaImagenUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarImagen())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={agregarImagen}
              disabled={!nuevaImagenUrl.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Tip: Sube tus imágenes a un servicio gratuito como{' '}
            <a href="https://imgur.com" target="_blank" className="text-blue-500 hover:underline">
              Imgur
            </a>{' '}
            y pega la URL aquí
          </p>
        </CardContent>
      </Card>

      {/* Botón de guardar (fijo en móvil) */}
      <div className="sticky bottom-4 left-0 right-0 flex justify-center md:hidden">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="shadow-lg gap-2"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
