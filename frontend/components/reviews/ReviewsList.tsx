'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { ResenaPublicRead } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewsListProps {
  reviews: ResenaPublicRead[];
  profesionalNombre: string;
}

export function ReviewsList({ reviews, profesionalNombre }: ReviewsListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Sin reseñas aún
        </h3>
        <p className="text-sm text-slate-500">
          {profesionalNombre} aún no tiene reseñas de clientes
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar del cliente */}
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {review.cliente_nombre.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {/* Nombre y estrellas */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {review.cliente_nombre}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {formatDate(review.fecha_creacion)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= review.rating
                            ? 'fill-orange-500 text-orange-500'
                            : 'text-slate-300'
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Comentario */}
                {review.texto_resena && (
                  <p className="text-slate-700 text-sm">
                    {review.texto_resena}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
