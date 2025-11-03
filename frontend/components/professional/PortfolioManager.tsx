'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Plus, Trash2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { professionalService } from '@/lib/services';
import { toast } from 'sonner';
import Image from 'next/image';

interface PortfolioImage {
  id: string;
  url: string;
  titulo?: string;
  descripcion?: string;
}

export function PortfolioManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageForm, setImageForm] = useState({
    url: '',
    titulo: '',
    descripcion: '',
  });

  // Query para obtener portfolio
  const { data: rawPortfolio, isLoading } = useQuery({
    queryKey: ['profesional-portfolio'],
    queryFn: professionalService.listPortfolioItems,
  });

  // Convertir a formato esperado
  const portfolio: PortfolioImage[] = rawPortfolio?.map(item => ({
    id: item.id,
    url: item.imagenes?.[0] || '/placeholder.jpg',
    titulo: item.titulo,
    descripcion: item.descripcion,
  })) || [];

  // Mutation para agregar imagen
  const addImageMutation = useMutation({
    mutationFn: (data: typeof imageForm) => professionalService.createPortfolioItem({
      titulo: data.titulo || 'Sin título',
      descripcion: data.descripcion,
      // El backend requiere estos campos
      categoria: 'OTRO',
      fecha_completado: new Date().toISOString().split('T')[0],
    }),
    onSuccess: () => {
      toast.success('✅ Portfolio actualizado - La función completa de imágenes estará disponible próximamente');
      queryClient.invalidateQueries({ queryKey: ['profesional-portfolio'] });
      setDialogOpen(false);
      setImageForm({ url: '', titulo: '', descripcion: '' });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutation para eliminar imagen
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => professionalService.deletePortfolioItem(imageId),
    onSuccess: () => {
      toast.success('Item eliminado');
      queryClient.invalidateQueries({ queryKey: ['profesional-portfolio'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!imageForm.url.trim()) {
      toast.error('La URL de la imagen es requerida');
      return;
    }
    addImageMutation.mutate(imageForm);
  };

  const handleDelete = (imageId: string) => {
    if (confirm('¿Estás seguro de eliminar esta imagen?')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio de Trabajos</CardTitle>
            <CardDescription>
              Muestra tus mejores trabajos a clientes potenciales
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Imagen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Imagen al Portfolio</DialogTitle>
                <DialogDescription>
                  Agrega fotos de tus trabajos completados
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL de la Imagen *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={imageForm.url}
                    onChange={(e) => setImageForm({ ...imageForm, url: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    Puedes usar servicios como Imgur, Cloudinary o tu propio servidor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Renovación de cocina"
                    value={imageForm.titulo}
                    onChange={(e) => setImageForm({ ...imageForm, titulo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe el trabajo realizado..."
                    rows={3}
                    value={imageForm.descripcion}
                    onChange={(e) => setImageForm({ ...imageForm, descripcion: e.target.value })}
                  />
                </div>

                {/* Preview */}
                {imageForm.url && (
                  <div className="space-y-2">
                    <Label>Vista Previa</Label>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={imageForm.url}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={() => toast.error('URL de imagen inválida')}
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={addImageMutation.isPending || !imageForm.url}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {addImageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="aspect-video w-full" />
            ))}
          </div>
        ) : !portfolio || portfolio.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Portfolio vacío
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
              Agrega imágenes de tus trabajos completados para mostrar tu experiencia a clientes potenciales
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Imagen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.map((image) => (
              <Card key={image.id} className="overflow-hidden group relative">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.titulo || 'Portfolio'}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(image.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteImageMutation.isPending}
                    >
                      {deleteImageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {(image.titulo || image.descripcion) && (
                  <CardContent className="p-3">
                    {image.titulo && (
                      <h4 className="font-semibold text-sm text-slate-900 mb-1">
                        {image.titulo}
                      </h4>
                    )}
                    {image.descripcion && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {image.descripcion}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {portfolio && portfolio.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Consejo:</p>
              <p className="text-blue-700">
                Usa imágenes de alta calidad y antes/después para destacar tu trabajo. 
                Los perfiles con portfolio completo reciben 3x más solicitudes.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
