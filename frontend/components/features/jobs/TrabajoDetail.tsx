'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertCircle, PlayCircle, CheckCircle, Award, XCircle, Clock, Star } from 'lucide-react';
import {
  useTrabajoById,
  useTrabajoTimeline,
  useIniciarTrabajo,
  useCompletarTrabajo,
  useAprobarTrabajo,
  useCancelarTrabajo,
} from '@/hooks/jobs';
import {
  estadoTrabajoConfig,
  getAvailableActions,
  type EstadoTrabajo,
  iniciarTrabajoSchema,
  completarTrabajoSchema,
  aprobarTrabajoSchema,
  cancelarTrabajoSchema,
  type IniciarTrabajoFormData,
  type CompletarTrabajoFormData,
  type AprobarTrabajoFormData,
  type CancelarTrabajoFormData,
} from '@/types/forms/jobs';
import { ReviewForm } from '@/components/features/reviews';

interface TrabajoDetailProps {
  trabajoId: string;
  userRole: 'cliente' | 'profesional';
}

/**
 * Componente: detalle completo de un trabajo
 * 
 * Features:
 * - Muestra estado, fechas, notas
 * - Timeline de eventos
 * - Botones de acción según rol y estado
 * - Dialogs para iniciar/completar/aprobar/cancelar
 */
export function TrabajoDetail({ trabajoId, userRole }: TrabajoDetailProps) {
  const { data: trabajo, isLoading, error } = useTrabajoById(trabajoId);
  const { data: timeline, isLoading: timelineLoading } = useTrabajoTimeline(trabajoId);

  const [dialogOpen, setDialogOpen] = useState<
    'iniciar' | 'completar' | 'aprobar' | 'cancelar' | null
  >(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !trabajo) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Error al cargar trabajo'}
        </AlertDescription>
      </Alert>
    );
  }

  const config = estadoTrabajoConfig[trabajo.estado as EstadoTrabajo];
  const IconComponent = config.icon;
  const actions = getAvailableActions(trabajo.estado as EstadoTrabajo, userRole);

  return (
    <div className="space-y-6">
      {/* Información principal */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Trabajo #{trabajo.id.slice(0, 8)}</CardTitle>
              <CardDescription>Oferta: {trabajo.oferta_id.slice(0, 8)}</CardDescription>
            </div>
            <Badge variant={config.badge} className={config.color}>
              <IconComponent className="mr-2 h-4 w-4" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fechas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Creado</p>
              <p className="font-medium">
                {new Date(trabajo.created_at).toLocaleDateString('es-AR')}
              </p>
            </div>
            {trabajo.fecha_inicio && (
              <div>
                <p className="text-sm text-muted-foreground">Iniciado</p>
                <p className="font-medium">
                  {new Date(trabajo.fecha_inicio).toLocaleDateString('es-AR')}
                </p>
              </div>
            )}
            {trabajo.fecha_fin && (
              <div>
                <p className="text-sm text-muted-foreground">Completado</p>
                <p className="font-medium">
                  {new Date(trabajo.fecha_fin).toLocaleDateString('es-AR')}
                </p>
              </div>
            )}
            {trabajo.fecha_aprobacion && (
              <div>
                <p className="text-sm text-muted-foreground">Aprobado</p>
                <p className="font-medium">
                  {new Date(trabajo.fecha_aprobacion).toLocaleDateString('es-AR')}
                </p>
              </div>
            )}
          </div>

          {/* Notas */}
          {trabajo.notas_profesional && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Notas del Profesional
              </h3>
              <p className="text-sm bg-muted p-3 rounded-md">{trabajo.notas_profesional}</p>
            </div>
          )}
          {trabajo.notas_cliente && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Notas del Cliente
              </h3>
              <p className="text-sm bg-muted p-3 rounded-md">{trabajo.notas_cliente}</p>
            </div>
          )}

          {/* Imágenes */}
          {trabajo.imagenes && trabajo.imagenes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Imágenes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {trabajo.imagenes.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {actions.canIniciar && (
              <Button onClick={() => setDialogOpen('iniciar')}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Iniciar Trabajo
              </Button>
            )}
            {actions.canCompletar && (
              <Button onClick={() => setDialogOpen('completar')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar Trabajo
              </Button>
            )}
            {actions.canAprobar && (
              <Button onClick={() => setDialogOpen('aprobar')}>
                <Award className="mr-2 h-4 w-4" />
                Aprobar y Liberar Pago
              </Button>
            )}
            {actions.canCancelar && (
              <Button variant="destructive" onClick={() => setDialogOpen('cancelar')}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Trabajo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial</CardTitle>
          <CardDescription>Eventos y cambios de estado</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : timeline && timeline.length > 0 ? (
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="flex gap-3 pb-4 border-b last:border-0">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{event.descripcion}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.usuario_nombre} •{' '}
                      {new Date(event.created_at).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay eventos registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Review Form - Solo si trabajo está APROBADO y usuario es cliente */}
      {trabajo.estado === 'APROBADO' && userRole === 'cliente' && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Califica el Trabajo
            </CardTitle>
            <CardDescription>
              Comparte tu experiencia con este profesional. Tu reseña ayuda a otros usuarios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm 
              trabajoId={trabajoId}
              profesionalId={trabajo.profesional_id}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <IniciarDialog
        open={dialogOpen === 'iniciar'}
        onOpenChange={(open) => setDialogOpen(open ? 'iniciar' : null)}
        trabajoId={trabajoId}
      />
      <CompletarDialog
        open={dialogOpen === 'completar'}
        onOpenChange={(open) => setDialogOpen(open ? 'completar' : null)}
        trabajoId={trabajoId}
      />
      <AprobarDialog
        open={dialogOpen === 'aprobar'}
        onOpenChange={(open) => setDialogOpen(open ? 'aprobar' : null)}
        trabajoId={trabajoId}
      />
      <CancelarDialog
        open={dialogOpen === 'cancelar'}
        onOpenChange={(open) => setDialogOpen(open ? 'cancelar' : null)}
        trabajoId={trabajoId}
      />
    </div>
  );
}

// ============================================================================
// DIALOGS
// ============================================================================

function IniciarDialog({
  open,
  onOpenChange,
  trabajoId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabajoId: string;
}) {
  const mutation = useIniciarTrabajo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IniciarTrabajoFormData>({
    resolver: zodResolver(iniciarTrabajoSchema),
    defaultValues: { trabajoId, notas_profesional: '' },
  });

  const onSubmit = (data: IniciarTrabajoFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar Trabajo</DialogTitle>
          <DialogDescription>
            Confirma que vas a comenzar a trabajar en esta solicitud
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notas_profesional">Notas (Opcional)</Label>
            <Textarea
              id="notas_profesional"
              placeholder="Comentarios iniciales..."
              {...register('notas_profesional')}
            />
            {errors.notas_profesional && (
              <p className="text-sm text-destructive">{errors.notas_profesional.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Iniciando...' : 'Iniciar Trabajo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CompletarDialog({
  open,
  onOpenChange,
  trabajoId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabajoId: string;
}) {
  const mutation = useCompletarTrabajo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompletarTrabajoFormData>({
    resolver: zodResolver(completarTrabajoSchema),
    defaultValues: { trabajoId, notas_profesional: '', imagenes: [] },
  });

  const onSubmit = (data: CompletarTrabajoFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar Trabajo</DialogTitle>
          <DialogDescription>
            Describe lo realizado. El cliente recibirá una notificación para aprobar el trabajo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notas_profesional">Resumen del trabajo realizado *</Label>
            <Textarea
              id="notas_profesional"
              placeholder="Describe brevemente lo que realizaste..."
              {...register('notas_profesional')}
            />
            <p className="text-xs text-muted-foreground">Mínimo 10 caracteres</p>
            {errors.notas_profesional && (
              <p className="text-sm text-destructive">{errors.notas_profesional.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Completando...' : 'Completar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AprobarDialog({
  open,
  onOpenChange,
  trabajoId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabajoId: string;
}) {
  const mutation = useAprobarTrabajo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AprobarTrabajoFormData>({
    resolver: zodResolver(aprobarTrabajoSchema),
    defaultValues: { trabajoId, notas_cliente: '' },
  });

  const onSubmit = (data: AprobarTrabajoFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar Trabajo</DialogTitle>
          <DialogDescription>
            El pago será liberado al profesional. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notas_cliente">Comentarios (Opcional)</Label>
            <Textarea
              id="notas_cliente"
              placeholder="Feedback sobre el trabajo..."
              {...register('notas_cliente')}
            />
            {errors.notas_cliente && (
              <p className="text-sm text-destructive">{errors.notas_cliente.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Aprobando...' : 'Aprobar y Liberar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelarDialog({
  open,
  onOpenChange,
  trabajoId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabajoId: string;
}) {
  const mutation = useCancelarTrabajo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelarTrabajoFormData>({
    resolver: zodResolver(cancelarTrabajoSchema),
    defaultValues: { trabajoId, motivo: '' },
  });

  const onSubmit = (data: CancelarTrabajoFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Trabajo</DialogTitle>
          <DialogDescription>
            El trabajo será cancelado. Según las políticas, el pago puede ser reembolsado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de cancelación *</Label>
            <Textarea
              id="motivo"
              placeholder="Explica brevemente el motivo..."
              {...register('motivo')}
            />
            <p className="text-xs text-muted-foreground">Mínimo 20 caracteres</p>
            {errors.motivo && (
              <p className="text-sm text-destructive">{errors.motivo.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Volver
            </Button>
            <Button type="submit" variant="destructive" disabled={mutation.isPending}>
              {mutation.isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
