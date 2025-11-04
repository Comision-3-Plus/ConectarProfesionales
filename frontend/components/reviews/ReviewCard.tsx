'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Review {
  id: string;
  calificacion: number;
  comentario: string;
  fecha_creacion: string;
  cliente: {
    nombre: string;
    apellido: string;
    avatar_url?: string;
  };
  trabajo?: {
    titulo: string;
  };
}

interface ReviewCardProps {
  review: Review;
  showWorkTitle?: boolean;
}

export function ReviewCard({ review, showWorkTitle = false }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.cliente.avatar_url} />
            <AvatarFallback className="bg-orange-100 text-orange-700">
              {review.cliente.nombre[0]}
              {review.cliente.apellido[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {review.cliente.nombre} {review.cliente.apellido}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDistanceToNow(new Date(review.fecha_creacion), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                {review.calificacion.toFixed(1)}
              </Badge>
            </div>

            {/* Título del trabajo */}
            {showWorkTitle && review.trabajo && (
              <p className="text-sm font-medium text-slate-700">
                Trabajo: {review.trabajo.titulo}
              </p>
            )}

            {/* Estrellas */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.calificacion
                      ? 'fill-orange-500 text-orange-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Comentario */}
            {review.comentario && (
              <p className="text-sm text-slate-700 leading-relaxed">
                {review.comentario}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
