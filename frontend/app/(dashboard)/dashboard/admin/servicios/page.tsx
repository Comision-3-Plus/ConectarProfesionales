'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Zap,
  Plus,
  Package,
  RefreshCw,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';
import { toast } from 'sonner';
import { ServicioInstantaneoCreate, ServicioInstantaneoRead, OficioRead } from '@/types';

export default function ServiciosInstantPage() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOficio, setSelectedOficio] = useState<string>('');
  const [formData, setFormData] = useState<ServicioInstantaneoCreate>({
    nombre: '',
    descripcion: '',
    oficio_id: '',
  });

  // Query para obtener todos los oficios
  const {
    data: oficios,
    isLoading: loadingOficios,
  } = useQuery({
    queryKey: ['admin-oficios'],
    queryFn: () => adminService.listOficios(),
  });

  // Query para obtener servicios del oficio seleccionado
  const {
    data: servicios,
    isLoading: loadingServicios,
  } = useQuery({
    queryKey: ['admin-servicios', selectedOficio],
    queryFn: () => adminService.listServiciosInstantPorOficio(selectedOficio),
    enabled: !!selectedOficio,
  });

  // Mutation para crear servicio instantáneo
  const createMutation = useMutation({
    mutationFn: (data: ServicioInstantaneoCreate) => adminService.createServicioInstant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-servicios'] });
      toast.success('Servicio instantáneo creado exitosamente');
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(`Error al crear servicio: ${err.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      oficio_id: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre del servicio es requerido');
      return;
    }

    if (!formData.oficio_id) {
      toast.error('Debes seleccionar un oficio');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ServicioInstantaneoCreate, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalServicios = selectedOficio ? (servicios?.length || 0) : 0;

  if (loadingOficios) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Servicios Instantáneos</h1>
          <p className="text-muted-foreground">
            Gestiona servicios predefinidos con precio y duración establecida
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Crear Servicio Instantáneo</DialogTitle>
              <DialogDescription>
                Define un nuevo servicio con precio y duración predeterminados
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="oficio">Oficio *</Label>
                  <Select
                    value={formData.oficio_id}
                    onValueChange={(value) => handleInputChange('oficio_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un oficio" />
                    </SelectTrigger>
                    <SelectContent>
                      {oficios?.map((oficio: OficioRead) => (
                        <SelectItem key={oficio.id} value={oficio.id}>
                          {oficio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Servicio *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Reparación de grifo, Instalación de luz"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe qué incluye este servicio"
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
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {createMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Servicio
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-purple-500 dark:border-purple-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Oficios
              </CardTitle>
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{oficios?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500 dark:border-blue-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Servicios Activos
              </CardTitle>
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalServicios}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 dark:border-green-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Servicios en Oficio Actual
              </CardTitle>
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalServicios}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter by Oficio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtrar por Oficio</CardTitle>
            <Select
              value={selectedOficio}
              onValueChange={setSelectedOficio}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecciona un oficio" />
              </SelectTrigger>
              <SelectContent>
                {oficios?.map((oficio: OficioRead) => (
                  <SelectItem key={oficio.id} value={oficio.id}>
                    {oficio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Services List */}
      {selectedOficio && (
        <Card>
          <CardHeader>
            <CardTitle>
              Servicios de {oficios?.find((o) => o.id === selectedOficio)?.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingServicios ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : servicios && servicios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicios.map((servicio: ServicioInstantaneoRead) => (
                  <Card
                    key={servicio.id}
                    className="hover:shadow-lg transition-shadow border-l-4 border-purple-500 dark:border-purple-400"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{servicio.nombre}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: #{servicio.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {servicio.descripcion && (
                        <p className="text-sm text-muted-foreground">
                          {servicio.descripcion}
                        </p>
                      )}

                      <div className="pt-2 border-t dark:border-gray-700">
                        <p className="text-xs text-muted-foreground">
                          Creado: {new Date(servicio.fecha_creacion).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No hay servicios instantáneos
                </h3>
                <p className="text-muted-foreground mb-4">
                  Crea el primer servicio para este oficio
                </p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Servicio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Oficio Selected */}
      {!selectedOficio && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Selecciona un Oficio
            </h3>
            <p className="text-muted-foreground">
              Elige un oficio del selector para ver sus servicios instantáneos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
