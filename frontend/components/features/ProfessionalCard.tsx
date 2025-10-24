'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import type { SearchResult } from '@/types';
import { motion } from 'framer-motion';

interface ProfessionalCardProps {
  professional: SearchResult;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const { nombre, apellido, oficio, tarifa_por_hora, calificacion_promedio, cantidad_resenas, avatar_url, nivel_profesional } =
    professional;

  const nivelLabels: Record<string, string> = {
    BRONCE: 'Bronce',
    PLATA: 'Plata',
    ORO: 'Oro',
    DIAMANTE: 'Diamante',
  };

  const nivelColors: Record<string, string> = {
    BRONCE: 'bg-green-100 text-green-800',
    PLATA: 'bg-blue-100 text-blue-800',
    ORO: 'bg-purple-100 text-purple-800',
    DIAMANTE: 'bg-orange-100 text-orange-800',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link href={`/profile/${professional.id}`}>
        <Card className="h-full cursor-pointer border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatar_url} alt={nombre} />
                <AvatarFallback className="bg-orange-500 text-lg text-white">
                  {nombre[0]}{apellido[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {nombre} {apellido}
                </h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                  <span className="text-sm font-medium text-slate-900">
                    {calificacion_promedio.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">({cantidad_resenas})</span>
                </div>
                <Badge className={nivelColors[nivel_profesional]} variant="secondary">
                  {nivelLabels[nivel_profesional]}
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">{oficio}</Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 bg-slate-50 px-6 py-4">
            {tarifa_por_hora ? (
              <div className="flex w-full items-center justify-between">
                <span className="text-sm text-slate-600">Tarifa por hora</span>
                <span className="text-lg font-bold text-orange-500">
                  ${tarifa_por_hora.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-sm text-slate-500">Tarifa a convenir</span>
            )}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
