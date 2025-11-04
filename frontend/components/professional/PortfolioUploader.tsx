'use client';

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { professionalService } from '@/lib/services';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageFile {
  file: File;
  preview: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

interface PortfolioUploaderProps {
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function PortfolioUploader({ onSuccess }: PortfolioUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
  });

  // Validar archivo
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato no válido. Solo JPG, PNG o WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Archivo muy grande. Máximo 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    return null;
  };

  // Comprimir imagen
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Agregar archivos
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    
    if (images.length + filesArray.length > MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} imágenes por portfolio`);
      return;
    }

    const newImages: ImageFile[] = [];

    for (const file of filesArray) {
      const error = validateFile(file);
      
      if (error) {
        toast.error(error, { description: file.name });
        continue;
      }

      // Comprimir imagen
      const compressedFile = await compressImage(file);

      newImages.push({
        file: compressedFile,
        preview: URL.createObjectURL(compressedFile),
      });
    }

    setImages(prev => [...prev, ...newImages]);
  }, [images.length]);

  // Remover imagen
  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  // File input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!formData.titulo.trim()) {
        throw new Error('El título es requerido');
      }
      if (images.length === 0) {
        throw new Error('Debes agregar al menos una imagen');
      }

      // Crear item de portfolio
      const portfolioItem = await professionalService.createPortfolioItem({
        titulo: formData.titulo,
        descripcion: formData.descripcion || '',
      });

      // TODO: Upload de imágenes al backend
      // Por ahora solo crea el item
      // En producción: subir a S3/Cloudinary y luego asociar al item

      return portfolioItem;
    },
    onSuccess: () => {
      toast.success('✅ Portfolio actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['profesional-portfolio'] });
      setDialogOpen(false);
      setImages([]);
      setFormData({ titulo: '', descripcion: '' });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Error al subir portfolio', {
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    uploadMutation.mutate();
  };

  const handleClose = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setFormData({ titulo: '', descripcion: '' });
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => open ? setDialogOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="bg-linear-to-r from-orange-500 to-orange-600">
          <Upload className="mr-2 h-4 w-4" />
          Agregar al Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Proyecto al Portfolio</DialogTitle>
          <DialogDescription>
            Sube imágenes de tu trabajo completado. Máximo {MAX_FILES} imágenes de 5MB cada una.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Form Data */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del Proyecto *</Label>
            <Input
              id="titulo"
              placeholder="Ej: Instalación eléctrica residencial"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe brevemente el proyecto..."
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleChange}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-slate-100 rounded-full">
                  <ImageIcon className="h-8 w-8 text-slate-600" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Arrastra imágenes aquí o{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    explora tus archivos
                  </button>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG, PNG o WebP hasta 5MB ({images.length}/{MAX_FILES})
                </p>
              </div>
            </div>
          </div>

          {/* Preview de imágenes */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                    {image.error && (
                      <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center p-2">
                        <p className="text-xs text-white text-center">{image.error}</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {image.progress !== undefined && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <Progress value={image.progress} className="h-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          {images.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">Nota:</p>
                <p>Las imágenes serán comprimidas automáticamente para optimizar el tiempo de carga.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploadMutation.isPending || !formData.titulo.trim() || images.length === 0}
            className="bg-linear-to-r from-orange-500 to-orange-600"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir Portfolio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
