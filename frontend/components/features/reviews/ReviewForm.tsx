'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useCreateReview } from '@/hooks/reviews';
import {
  createReviewSchema,
  type CreateReviewFormData,
  valoracionConfig,
  VALORACION_MAX,
} from '@/types/forms/reviews';

interface ReviewFormProps {
  trabajoId: string;
  profesionalId: string;
  onSuccess?: () => void;
}

/**
 * Componente: formulario para crear una reseña
 * 
 * Features:
 * - Star rating interactivo
 * - Comentario opcional
 * - Validación con Zod
 * - Toast de éxito/error
 */
export function ReviewForm({ trabajoId, profesionalId, onSuccess }: ReviewFormProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const mutation = useCreateReview();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      trabajo_id: trabajoId,
      profesional_id: profesionalId,
      valoracion: 5,
      comentario: '',
    },
  });

  const currentRating = watch('valoracion');

  const onSubmit = (data: CreateReviewFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const displayRating = hoveredStar || currentRating;
  const config = valoracionConfig[displayRating as keyof typeof valoracionConfig];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dejar Reseña</CardTitle>
        <CardDescription>Comparte tu experiencia con este profesional</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label>Calificación *</Label>
            <div className="flex gap-2">
              {Array.from({ length: VALORACION_MAX }, (_, i) => {
                const starValue = i + 1;
                const filled = starValue <= displayRating;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setValue('valoracion', starValue)}
                    onMouseEnter={() => setHoveredStar(starValue)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="text-4xl hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {config && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{config.label}:</span> {config.description}
              </p>
            )}
            {errors.valoracion && (
              <p className="text-sm text-destructive">{errors.valoracion.message}</p>
            )}
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario (Opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Describe tu experiencia con este profesional..."
              rows={4}
              {...register('comentario')}
            />
            <p className="text-xs text-muted-foreground">Máximo 500 caracteres</p>
            {errors.comentario && (
              <p className="text-sm text-destructive">{errors.comentario.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Publicando...' : 'Publicar Reseña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
