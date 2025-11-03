'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { clienteService } from '@/lib/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabajoId: string;
  profesionalNombre: string;
}

export function CreateReviewDialog({ 
  open, 
  onOpenChange, 
  trabajoId, 
  profesionalNombre 
}: CreateReviewDialogProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const createReviewMutation = useMutation({
    mutationFn: () => clienteService.crearResena(trabajoId, {
      rating: rating,
      texto_resena: comment,
    }),
    onSuccess: () => {
      toast.success('✅ Reseña publicada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['cliente-trabajos'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(`Error al publicar reseña: ${error.message}`);
    },
  });

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }
    createReviewMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calificar Trabajo</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con {profesionalNombre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Calificación *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      star <= (hoverRating || rating)
                        ? 'fill-orange-500 text-orange-500'
                        : 'text-slate-300'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-slate-600">
                  {rating === 1 && 'Muy malo'}
                  {rating === 2 && 'Malo'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bueno'}
                  {rating === 5 && 'Excelente'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario *</Label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos sobre tu experiencia... ¿Qué te pareció el trabajo? ¿Fue puntual? ¿El resultado cumplió tus expectativas?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-slate-500">
              Mínimo 10 caracteres ({comment.length}/10)
            </p>
          </div>

          {/* Preview */}
          {rating > 0 && comment.length >= 10 && (
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">Vista previa:</p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= rating
                        ? 'fill-orange-500 text-orange-500'
                        : 'text-slate-300'
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 italic">&ldquo;{comment}&rdquo;</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createReviewMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending || rating === 0 || comment.trim().length < 10}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {createReviewMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Publicar Reseña
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
