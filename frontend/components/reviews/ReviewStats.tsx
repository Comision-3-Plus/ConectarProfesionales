'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

interface ReviewStatsProps {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function ReviewStats({ totalReviews, averageRating, ratingDistribution }: ReviewStatsProps) {
  const getRatingPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex gap-1 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-orange-500 text-orange-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
              const percentage = getRatingPercentage(count);

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium text-slate-700">{rating}</span>
                    <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-slate-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Porcentajes */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-slate-600">Recomendado</p>
            <p className="text-2xl font-bold text-green-600">
              {totalReviews > 0
                ? Math.round(
                    ((ratingDistribution[4] + ratingDistribution[5]) / totalReviews) * 100
                  )
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Excelente</p>
            <p className="text-2xl font-bold text-orange-600">
              {totalReviews > 0
                ? Math.round((ratingDistribution[5] / totalReviews) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
