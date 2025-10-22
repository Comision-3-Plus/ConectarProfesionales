'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@/lib/api';
import { toast } from 'sonner';

interface ReviewModalProps {
  workId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewModal({ workId, open, onOpenChange }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: (data: { calificacion: number; comentario?: string }) =>
      clienteApi.createReview(workId, data),
    onSuccess: () => {
      toast.success('Reseña enviada correctamente');
      queryClient.invalidateQueries({ queryKey: ['works'] });
      onOpenChange(false);
      setRating(5);
      setComment('');
    },
    onError: () => {
      toast.error('Error al enviar la reseña');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({
      calificacion: rating,
      comentario: comment || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Califica el trabajo realizado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Calificación</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-orange-500 text-orange-500'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-slate-700">
              Comentario (opcional)
            </label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos sobre tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? 'Enviando...' : 'Enviar Reseña'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
