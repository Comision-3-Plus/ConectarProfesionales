'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { professionalService } from '@/lib/services/professionalService';
import { publicService } from '@/lib/services/publicService';
import { ServicioInstantaneoCreate, OficioRead } from '@/types';

export default function PublicarProyectoPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ServicioInstantaneoCreate>({
    nombre: '',
    descripcion: '',
    precio_fijo: 0,
    oficio_id: '',
  });

  // Obtener oficios disponibles
  const { data: oficios = [], isLoading: loadingOficios, error: oficiosError } = useQuery({
    queryKey: ['oficios'],
    queryFn: () => publicService.getOficios(),
    retry: 1,
  });

  // Obtener mis proyectos publicados
  const { data: misProyectos = [], isLoading: loadingProyectos, error: proyectosError } = useQuery({
    queryKey: ['mis-proyectos'],
    queryFn: () => professionalService.getMisProyectosPublicados(),
    retry: false,
  });

  // Mutation para crear proyecto
  const crearMutation = useMutation({
    mutationFn: (data: ServicioInstantaneoCreate) => 
      professionalService.publicarProyecto(data),
    onSuccess: () => {
      toast.success('¡Proyecto publicado! Tu servicio ya está visible en el marketplace');
      setFormData({
        nombre: '',
        descripcion: '',
        precio_fijo: 0,
        oficio_id: '',
      });
      queryClient.invalidateQueries({ queryKey: ['mis-proyectos'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error';
      toast.error('Error al publicar: ' + errorMessage);
    },
  });

  // Mutation para eliminar proyecto
  const eliminarMutation = useMutation({
    mutationFn: (id: string) => professionalService.eliminarProyecto(id),
    onSuccess: () => {
      toast.success('Proyecto eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['mis-proyectos'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error';
      toast.error('Error al eliminar: ' + errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.oficio_id || formData.precio_fijo <= 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    crearMutation.mutate(formData);
  };

  const handleEliminar = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      eliminarMutation.mutate(id);
    }
  };

  if (loadingOficios) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Cargando oficios...</p>
        </div>
      </div>
    );
  }

  if (oficiosError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar oficios</p>
          <p className="text-sm text-muted-foreground">{String(oficiosError)}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Mostrar advertencia si es admin y no tiene perfil profesional
  const isAdminWithoutProfile = proyectosError && String(proyectosError).includes('403');

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Publicar Proyecto</h1>
        <p className="text-muted-foreground">
          Publica servicios con precio fijo para que los clientes te contraten directamente
        </p>
        {isAdminWithoutProfile && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Modo Administrador:</strong> Estás viendo esta página como administrador. 
              Para publicar proyectos, necesitas tener un perfil profesional configurado.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Formulario de Creación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Servicio
            </CardTitle>
            <CardDescription>
              Define un servicio con precio fijo que los clientes puedan contratar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Título del Servicio *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Reparación de grifo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe qué incluye el servicio..."
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  maxLength={500}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oficio">Oficio *</Label>
                <Select
                  value={formData.oficio_id}
                  onValueChange={(value) => setFormData({ ...formData, oficio_id: value })}
                >
                  <SelectTrigger id="oficio">
                    <SelectValue placeholder="Selecciona un oficio" />
                  </SelectTrigger>
                  <SelectContent>
                    {oficios.map((oficio: OficioRead) => (
                      <SelectItem key={oficio.id} value={oficio.id}>
                        {oficio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio Fijo ($) *</Label>
                <Input
                  id="precio"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="5000"
                  value={formData.precio_fijo || ''}
                  onChange={(e) => setFormData({ ...formData, precio_fijo: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={crearMutation.isPending}
              >
                {crearMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Publicar Servicio
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Proyectos Publicados */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Servicios Publicados</CardTitle>
            <CardDescription>
              Gestiona los servicios que has publicado en el marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProyectos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : misProyectos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aún no has publicado ningún servicio</p>
                <p className="text-sm mt-2">Completa el formulario para empezar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {misProyectos.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{proyecto.nombre}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {proyecto.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary ml-4">
                        ${proyecto.precio_fijo?.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {proyecto.oficio?.nombre}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleEliminar(proyecto.id)}
                        disabled={eliminarMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
