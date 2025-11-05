import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, AlertCircle, User } from 'lucide-react';
import { useReviews, useReviewStats } from '@/hooks/reviews';
import { VALORACION_MAX } from '@/types/forms/reviews';

interface ReviewsListProps {
  profesionalId: string;
}

/**
 * Componente: lista de reseñas de un profesional
 * 
 * Features:
 * - Muestra promedio y total
 * - Cards con estrellas, comentario, cliente
 * - Loading/error states
 */
export function ReviewsList({ profesionalId }: ReviewsListProps) {
  const { data: reviews, isLoading, error } = useReviews(profesionalId);
  const { data: stats } = useReviewStats(profesionalId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Error al cargar reseñas'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Este profesional aún no tiene reseñas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      {stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{stats.promedio.toFixed(1)}</div>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: VALORACION_MAX }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(stats.promedio)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
                </p>
              </div>

              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribucion[rating as keyof typeof stats.distribucion];
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {review.cliente_avatar ? (
                      <img
                        src={review.cliente_avatar}
                        alt={review.cliente_nombre}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{review.cliente_nombre}</CardTitle>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: VALORACION_MAX }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.fecha_creacion).toLocaleDateString('es-AR')}
                </p>
              </div>
            </CardHeader>
            {review.texto_resena && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{review.texto_resena}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
