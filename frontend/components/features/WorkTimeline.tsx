/**
 * WorkTimeline - Componente de línea de tiempo del trabajo
 * Muestra el progreso visual del trabajo desde la oferta hasta la revisión
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Hammer,
  Star,
  XCircle,
  DollarSign,
  FileText
} from 'lucide-react';

export type EstadoTrabajo = 
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'APROBADO'
  | 'CANCELADO';

export interface TimelineStep {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTrabajo;
  fecha?: string;
  icon: React.ElementType;
  completed: boolean;
  current: boolean;
  failed: boolean;
}

interface WorkTimelineProps {
  estadoActual: EstadoTrabajo;
  fechaCreacion?: string;
  fechaPago?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaAprobacion?: string;
  fechaCancelacion?: string;
  className?: string;
}

export function WorkTimeline({
  estadoActual,
  fechaCreacion,
  fechaPago,
  fechaInicio,
  fechaFin,
  fechaAprobacion,
  fechaCancelacion,
  className
}: WorkTimelineProps) {
  // Determinar qué pasos están completados
  const isCompleted = (estado: EstadoTrabajo) => {
    const order: EstadoTrabajo[] = [
      'PENDIENTE_PAGO',
      'PAGADO',
      'EN_PROCESO',
      'COMPLETADO',
      'APROBADO'
    ];
    
    const currentIndex = order.indexOf(estadoActual);
    const stepIndex = order.indexOf(estado);
    
    return stepIndex <= currentIndex;
  };

  const isCancelled = estadoActual === 'CANCELADO';

  const steps: TimelineStep[] = [
    {
      id: 'oferta',
      titulo: 'Oferta Aceptada',
      descripcion: 'El cliente aceptó la propuesta',
      estado: 'PENDIENTE_PAGO',
      fecha: fechaCreacion,
      icon: FileText,
      completed: true,
      current: estadoActual === 'PENDIENTE_PAGO' && !isCancelled,
      failed: isCancelled
    },
    {
      id: 'pago',
      titulo: 'Pago Confirmado',
      descripcion: 'Fondos retenidos en escrow',
      estado: 'PAGADO',
      fecha: fechaPago,
      icon: CreditCard,
      completed: isCompleted('PAGADO'),
      current: estadoActual === 'PAGADO' && !isCancelled,
      failed: isCancelled && !fechaPago
    },
    {
      id: 'proceso',
      titulo: 'Trabajo en Proceso',
      descripcion: 'El profesional está trabajando',
      estado: 'EN_PROCESO',
      fecha: fechaInicio,
      icon: Hammer,
      completed: isCompleted('EN_PROCESO'),
      current: estadoActual === 'EN_PROCESO' && !isCancelled,
      failed: isCancelled && !fechaInicio
    },
    {
      id: 'completado',
      titulo: 'Trabajo Completado',
      descripcion: 'Pendiente de aprobación del cliente',
      estado: 'COMPLETADO',
      fecha: fechaFin,
      icon: CheckCircle2,
      completed: isCompleted('COMPLETADO'),
      current: estadoActual === 'COMPLETADO' && !isCancelled,
      failed: isCancelled && !fechaFin
    },
    {
      id: 'aprobado',
      titulo: 'Trabajo Aprobado',
      descripcion: 'Pago liberado al profesional',
      estado: 'APROBADO',
      fecha: fechaAprobacion,
      icon: Star,
      completed: isCompleted('APROBADO'),
      current: estadoActual === 'APROBADO' && !isCancelled,
      failed: isCancelled && !fechaAprobacion
    }
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {isCancelled ? (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Trabajo Cancelado
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 text-primary" />
                Progreso del Trabajo
              </>
            )}
          </h3>
          {isCancelled && fechaCancelacion && (
            <p className="text-sm text-muted-foreground">
              Cancelado el {formatDate(fechaCancelacion)}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative pb-10 last:pb-0">
                {/* Línea vertical */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-4 top-10 w-0.5 h-full -ml-px",
                      step.completed && !step.failed
                        ? "bg-gradient-to-b from-green-500 to-green-300"
                        : step.failed
                        ? "bg-red-200"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}

                {/* Contenido del paso */}
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className="relative">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                        step.completed && !step.failed
                          ? "bg-green-500 border-green-500 text-white"
                          : step.current && !step.failed
                          ? "bg-primary border-primary text-primary-foreground animate-pulse"
                          : step.failed
                          ? "bg-red-100 border-red-500 text-red-500"
                          : "bg-background border-gray-300 text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={cn(
                          "font-medium text-sm",
                          step.completed && !step.failed && "text-green-700 dark:text-green-400",
                          step.current && !step.failed && "text-primary font-semibold",
                          step.failed && "text-red-500 line-through"
                        )}
                      >
                        {step.titulo}
                      </h4>
                      {step.completed && !step.failed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          ✓ Completado
                        </Badge>
                      )}
                      {step.current && !step.failed && (
                        <Badge variant="default" className="text-xs animate-pulse">
                          En curso
                        </Badge>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs",
                        step.failed ? "text-red-400" : "text-muted-foreground"
                      )}
                    >
                      {step.descripcion}
                    </p>
                    {step.fecha && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(step.fecha)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones según estado */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          {estadoActual === 'PENDIENTE_PAGO' && !isCancelled && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Esperando Pago</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El cliente debe realizar el pago para que el trabajo pueda comenzar.
                </p>
              </div>
            </div>
          )}

          {estadoActual === 'PAGADO' && !isCancelled && (
            <div className="flex items-start gap-3">
              <Hammer className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Listo para Comenzar</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El pago fue confirmado. El profesional puede iniciar el trabajo.
                </p>
              </div>
            </div>
          )}

          {estadoActual === 'EN_PROCESO' && !isCancelled && (
            <div className="flex items-start gap-3">
              <Hammer className="h-5 w-5 text-primary mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium">Trabajo en Progreso</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El profesional está trabajando en tu proyecto.
                </p>
              </div>
            </div>
          )}

          {estadoActual === 'COMPLETADO' && !isCancelled && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Pendiente de Aprobación</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El profesional marcó el trabajo como completado. Revisa y aprueba para liberar el pago.
                </p>
              </div>
            </div>
          )}

          {estadoActual === 'APROBADO' && !isCancelled && (
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Trabajo Finalizado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El trabajo fue completado y el pago liberado al profesional. ¡No olvides dejar una reseña!
                </p>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">Trabajo Cancelado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El trabajo fue cancelado. {fechaPago ? 'El monto será reembolsado.' : 'No se realizó ningún cargo.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
