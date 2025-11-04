'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/lib/services';

interface ReviewFormProps {
  trabajoId: string;
  profesionalId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ trabajoId, profesionalId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      return reviewService.createReview({
        trabajo_id: trabajoId,
        profesional_id: profesionalId,
        calificacion: rating,
        comentario,
        recomendaria: rating >= 4,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', profesionalId] });
      queryClient.invalidateQueries({ queryKey: ['trabajo', trabajoId] });
      toast.success('¡Reseña publicada con éxito!');
      setRating(0);
      setComentario('');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Error al publicar la reseña', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    if (comentario.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }

    createReviewMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deja tu reseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Calificación</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-orange-500 text-orange-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-slate-600">
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario</Label>
            <Textarea
              id="comentario"
              placeholder="Cuéntanos sobre tu experiencia con este profesional..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-slate-500 text-right">
              {comentario.length}/500 caracteres
            </p>
          </div>

          {/* Botón */}
          <Button
            type="submit"
            className="w-full"
            disabled={createReviewMutation.isPending || rating === 0 || comentario.length < 10}
          >
            {createReviewMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Publicar Reseña
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
