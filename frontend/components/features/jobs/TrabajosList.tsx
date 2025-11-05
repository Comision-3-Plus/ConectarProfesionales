import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { type Trabajo } from '@/lib/services/trabajosService';
import { estadoTrabajoConfig, type EstadoTrabajo } from '@/types/forms/jobs';
import { useTrabajos } from '@/hooks/jobs';

interface TrabajosListProps {
  estadoFilter?: EstadoTrabajo;
  emptyMessage?: string;
}

/**
 * Componente: lista de trabajos con filtros
 * 
 * Features:
 * - Filtrar por estado (opcional)
 * - Loading/error states
 * - Cards con badge de estado
 * - Link a detalle
 */
export function TrabajosList({ estadoFilter, emptyMessage = 'No hay trabajos' }: TrabajosListProps) {
  const { data: trabajos, isLoading, error } = useTrabajos({ estado: estadoFilter });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
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
          {error instanceof Error ? error.message : 'Error al cargar trabajos'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!trabajos || trabajos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {trabajos.map((trabajo) => (
        <TrabajoCard key={trabajo.id} trabajo={trabajo} />
      ))}
    </div>
  );
}

/**
 * Card individual de trabajo
 */
function TrabajoCard({ trabajo }: { trabajo: Trabajo }) {
  const config = estadoTrabajoConfig[trabajo.estado as EstadoTrabajo];
  const IconComponent = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Trabajo #{trabajo.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              Oferta: {trabajo.oferta_id.slice(0, 8)}
            </CardDescription>
          </div>
          <Badge variant={config.badge} className={config.color}>
            <IconComponent className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Creado</p>
              <p className="font-medium">
                {new Date(trabajo.created_at).toLocaleDateString('es-AR')}
              </p>
            </div>
            {trabajo.fecha_inicio && (
              <div>
                <p className="text-muted-foreground">Iniciado</p>
                <p className="font-medium">
                  {new Date(trabajo.fecha_inicio).toLocaleDateString('es-AR')}
                </p>
              </div>
            )}
          </div>

          {/* Notas preview */}
          {trabajo.notas_profesional && (
            <div className="text-sm">
              <p className="text-muted-foreground">Notas:</p>
              <p className="line-clamp-2">{trabajo.notas_profesional}</p>
            </div>
          )}

          {/* Acción */}
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href={`/trabajos/${trabajo.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
