'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Wrench,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';
import { toast } from 'sonner';
import { OficioCreate, OficioRead } from '@/types';

export default function OficiosPage() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OficioCreate>({
    nombre: '',
    descripcion: '',
  });

  // Query para obtener todos los oficios
  const {
    data: oficios,
    isLoading,
  } = useQuery({
    queryKey: ['admin-oficios'],
    queryFn: () => adminService.listOficios(),
  });

  // Mutation para crear oficio
  const createMutation = useMutation({
    mutationFn: (data: OficioCreate) => adminService.createOficio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-oficios'] });
      toast.success('Oficio creado exitosamente');
      setCreateDialogOpen(false);
      setFormData({ nombre: '', descripcion: '' });
    },
    onError: (err: Error) => {
      toast.error(`Error al crear oficio: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre del oficio es requerido');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof OficioCreate, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Oficios</h1>
          <p className="text-muted-foreground">
            Administra las categorías de servicios profesionales
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Oficio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Oficio</DialogTitle>
              <DialogDescription>
                Define una nueva categoría de servicios profesionales
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Oficio *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Plomería, Electricidad, Carpintería"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe los servicios incluidos en esta categoría"
                    value={formData.descripcion || ''}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {createMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Oficio
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card className="border-l-4 border-blue-500 dark:border-blue-400">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Oficios
            </CardTitle>
            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{oficios?.length || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Categorías activas en la plataforma
          </p>
        </CardContent>
      </Card>

      {/* Oficios Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Oficios Disponibles</h2>
        
        {oficios && oficios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oficios.map((oficio: OficioRead) => (
              <Card
                key={oficio.id}
                className="hover:shadow-lg transition-shadow border-l-4 border-blue-500 dark:border-blue-400"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg">
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{oficio.nombre}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: #{oficio.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {oficio.descripcion || 'Sin descripción'}
                  </p>

                  <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Creado: {new Date(oficio.fecha_creacion).toLocaleDateString('es-AR')}
                    </span>
                    
                    {/* Botones de acción deshabilitados por ahora */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled
                        title="Función próximamente"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        disabled
                        title="Función próximamente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay oficios registrados
              </h3>
              <p className="text-muted-foreground mb-4">
                Crea el primer oficio para comenzar a organizar los servicios
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Primer Oficio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
