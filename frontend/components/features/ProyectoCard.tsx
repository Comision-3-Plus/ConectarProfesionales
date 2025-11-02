'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { MapPin, Star, Briefcase } from 'lucide-react';
import { ServicioInstantaneoRead } from '@/types';

interface ProyectoCardProps {
  proyecto: ServicioInstantaneoRead;
  onContratar?: (proyectoId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function ProyectoCard({ 
  proyecto, 
  onContratar, 
  showActions = true,
  className = '' 
}: ProyectoCardProps) {
  const handleContratar = () => {
    if (onContratar) {
      onContratar(proyecto.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 line-clamp-2">
                {proyecto.nombre}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {proyecto.descripcion || 'Servicio profesional disponible'}
              </CardDescription>
            </div>
            {proyecto.profesional && (
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={proyecto.profesional.nombre} alt={proyecto.profesional.nombre || 'Profesional'} />
                <AvatarFallback>
                  {proyecto.profesional.nombre?.charAt(0).toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-3">
            {/* Profesional Info */}
            {proyecto.profesional && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">{proyecto.profesional.nombre}</span>
                {proyecto.profesional.rating_promedio && (
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{proyecto.profesional.rating_promedio.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Oficio */}
            {proyecto.oficio && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {proyecto.oficio.nombre}
                </Badge>
              </div>
            )}

            {/* Oficio Category (en lugar de ubicación por ahora) */}
            {proyecto.oficio?.categoria && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{proyecto.oficio.categoria}</span>
              </div>
            )}

            {/* Precio */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Precio fijo</span>
              <span className="text-2xl font-bold text-primary">
                ${proyecto.precio_fijo?.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter>
            <Button 
              onClick={handleContratar} 
              className="w-full"
              size="lg"
            >
              Contratar Servicio
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
