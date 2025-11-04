'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  MessageSquare,
  DollarSign,
  FileText,
  Star,
  Package,
  Truck,
  Home
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface TimelineEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  timestamp: Date;
  icon?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

interface TimelineProps {
  events: TimelineEvent[];
  variant?: 'default' | 'compact';
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircle2,
  clock: Clock,
  alert: AlertCircle,
  error: XCircle,
  message: MessageSquare,
  dollar: DollarSign,
  file: FileText,
  star: Star,
  package: Package,
  truck: Truck,
  home: Home,
};

const typeColors = {
  info: {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-700',
    icon: 'text-blue-600',
  },
  success: {
    bg: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-700',
    icon: 'text-green-600',
  },
  warning: {
    bg: 'bg-orange-100',
    border: 'border-orange-500',
    text: 'text-orange-700',
    icon: 'text-orange-600',
  },
  error: {
    bg: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: 'text-red-600',
  },
};

export function Timeline({ events, variant = 'default' }: TimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No hay eventos en el historial</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const colors = typeColors[event.type];
        const IconComponent = event.icon ? iconMap[event.icon] : Clock;
        const isLast = index === events.length - 1;

        if (variant === 'compact') {
          return (
            <div key={event.id} className="flex gap-3 items-start">
              <div className={`shrink-0 h-8 w-8 rounded-full ${colors.bg} flex items-center justify-center`}>
                <IconComponent className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: es })}
                  </Badge>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={event.id} className="relative">
            {/* Línea vertical conectora */}
            {!isLast && (
              <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200" />
            )}

            <Card className={`border-l-4 ${colors.border}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Icono */}
                  <div className={`shrink-0 h-12 w-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className={`font-semibold ${colors.text}`}>
                        {event.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: es })}
                      </Badge>
                    </div>

                    {event.description && (
                      <p className="text-sm text-slate-700 mb-2">
                        {event.description}
                      </p>
                    )}

                    {/* Metadata adicional */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-md">
                        <dl className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key}>
                              <dt className="font-medium text-slate-600 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </dt>
                              <dd className="text-slate-900">{String(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}

                    {/* Timestamp exacto */}
                    <p className="text-xs text-slate-500 mt-2">
                      {event.timestamp.toLocaleString('es-AR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Helper para crear eventos de timeline desde estados de trabajo
 * Este helper es un ejemplo - ajusta los tipos según tu modelo de datos
 */
export function createWorkTimeline(trabajo: {
  id: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  fecha_asignacion?: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  fecha_pago?: string;
  precio_estimado?: number;
  precio_final?: number;
  estado_escrow?: string;
  profesional_id?: string;
  motivo_cancelacion?: string;
  profesional?: {
    usuario?: {
      nombre?: string;
    };
  };
  resena?: {
    fecha_creacion: string;
    calificacion: number;
  };
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Evento de creación
  events.push({
    id: `${trabajo.id}-created`,
    type: 'info',
    title: 'Trabajo creado',
    description: 'El trabajo fue publicado y está esperando ofertas',
    timestamp: new Date(trabajo.fecha_creacion),
    icon: 'file',
    metadata: {
      estado: trabajo.estado,
      precio: trabajo.precio_estimado ? `$${trabajo.precio_estimado}` : 'A convenir',
    },
  });

  // Evento de oferta aceptada (si aplica)
  if (trabajo.profesional_id && trabajo.fecha_asignacion) {
    events.push({
      id: `${trabajo.id}-assigned`,
      type: 'success',
      title: 'Oferta aceptada',
      description: 'Se aceptó una oferta de un profesional',
      timestamp: new Date(trabajo.fecha_asignacion),
      icon: 'check',
      metadata: {
        profesional: trabajo.profesional?.usuario?.nombre || 'Profesional',
        precio_final: trabajo.precio_final ? `$${trabajo.precio_final}` : undefined,
      },
    });
  }

  // Evento de pago (si aplica)
  if (trabajo.estado_escrow === 'PAGADO_EN_ESCROW' || trabajo.estado_escrow === 'LIBERADO') {
    events.push({
      id: `${trabajo.id}-paid`,
      type: 'success',
      title: 'Pago recibido',
      description: 'El pago fue procesado y está en garantía',
      timestamp: new Date(trabajo.fecha_pago || trabajo.fecha_actualizacion || trabajo.fecha_creacion),
      icon: 'dollar',
      metadata: {
        monto: trabajo.precio_final ? `$${trabajo.precio_final}` : undefined,
        estado_escrow: trabajo.estado_escrow,
      },
    });
  }

  // Evento de inicio (si aplica)
  if (trabajo.fecha_inicio) {
    events.push({
      id: `${trabajo.id}-started`,
      type: 'info',
      title: 'Trabajo iniciado',
      description: 'El profesional comenzó el trabajo',
      timestamp: new Date(trabajo.fecha_inicio),
      icon: 'truck',
    });
  }

  // Evento de finalización (si aplica)
  if (trabajo.fecha_finalizacion) {
    events.push({
      id: `${trabajo.id}-finished`,
      type: 'success',
      title: 'Trabajo finalizado',
      description: 'El profesional completó el trabajo',
      timestamp: new Date(trabajo.fecha_finalizacion),
      icon: 'package',
    });
  }

  // Evento de reseña (si aplica)
  if (trabajo.resena) {
    events.push({
      id: `${trabajo.id}-review`,
      type: 'info',
      title: 'Reseña publicada',
      description: 'El cliente dejó una reseña sobre el trabajo',
      timestamp: new Date(trabajo.resena.fecha_creacion),
      icon: 'star',
      metadata: {
        calificacion: `${trabajo.resena.calificacion}/5`,
      },
    });
  }

  // Evento de cancelación (si aplica)
  if (trabajo.estado === 'CANCELADO') {
    events.push({
      id: `${trabajo.id}-cancelled`,
      type: 'error',
      title: 'Trabajo cancelado',
      description: trabajo.motivo_cancelacion || 'El trabajo fue cancelado',
      timestamp: new Date(trabajo.fecha_actualizacion || trabajo.fecha_creacion),
      icon: 'error',
    });
  }

  // Ordenar por fecha descendente (más reciente primero)
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
