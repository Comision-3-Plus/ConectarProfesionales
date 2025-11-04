'use client';

/**
 * Página de detalle de trabajo
 * Muestra el progreso, timeline y acciones disponibles
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trabajosService, type Trabajo, type TimelineEvent } from '@/lib/services/trabajosService';
import { WorkTimeline } from '@/components/features/WorkTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowLeft,
  CheckCircle,
  Play,
  XCircle,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrabajoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const trabajoId = params.trabajoId as string;

  const [trabajo, setTrabajo] = useState<Trabajo | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notas, setNotas] = useState('');

  // Determinar rol del usuario en este trabajo
  const isProfesional = user?.id === trabajo?.profesional_id;
  const isCliente = user?.id === trabajo?.cliente_id;

  useEffect(() => {
    loadTrabajo();
    loadTimeline();
  }, [trabajoId]);

  const loadTrabajo = async () => {
    try {
      setLoading(true);
      const data = await trabajosService.getTrabajoById(trabajoId);
      setTrabajo(data);
    } catch (error) {
      console.error('Error loading trabajo:', error);
      router.push('/trabajos');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const events = await trabajosService.getTrabajoTimeline(trabajoId);
      setTimeline(events);
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  const handleIniciar = async () => {
    if (!trabajo) return;
    
    try {
      setActionLoading(true);
      const updated = await trabajosService.iniciarTrabajo(trabajoId, notas || undefined);
      setTrabajo(updated);
      setNotas('');
      await loadTimeline();
    } catch (error) {
      console.error('Error iniciando trabajo:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompletar = async () => {
    if (!trabajo) return;
    
    try {
      setActionLoading(true);
      const updated = await trabajosService.completarTrabajo(trabajoId, notas || undefined);
      setTrabajo(updated);
      setNotas('');
      await loadTimeline();
    } catch (error) {
      console.error('Error completando trabajo:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!trabajo) return;
    
    try {
      setActionLoading(true);
      const updated = await trabajosService.aprobarTrabajo(trabajoId, notas || undefined);
      setTrabajo(updated);
      setNotas('');
      await loadTimeline();
      toast.success('¡Trabajo aprobado! No olvides dejar una reseña.');
    } catch (error) {
      console.error('Error aprobando trabajo:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!trabajo) return;
    
    if (!confirm('¿Estás seguro de cancelar este trabajo?')) return;
    
    try {
      setActionLoading(true);
      const updated = await trabajosService.cancelarTrabajo(trabajoId);
      setTrabajo(updated);
      await loadTimeline();
    } catch (error) {
      console.error('Error cancelando trabajo:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      PENDIENTE_PAGO: { variant: 'outline' as const, className: 'bg-orange-50 text-orange-700 border-orange-200' },
      PAGADO: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200' },
      EN_PROCESO: { variant: 'default' as const, className: 'bg-blue-500' },
      COMPLETADO: { variant: 'outline' as const, className: 'bg-purple-50 text-purple-700 border-purple-200' },
      APROBADO: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200' },
      CANCELADO: { variant: 'destructive' as const, className: '' }
    };
    
    const config = variants[estado as keyof typeof variants] || variants.PENDIENTE_PAGO;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {estado.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!trabajo) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Trabajo no encontrado</p>
            <Button onClick={() => router.push('/trabajos')} className="mt-4">
              Ver mis trabajos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/trabajos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trabajo #{trabajo.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">
              Creado el {formatDate(trabajo.created_at)}
            </p>
          </div>
        </div>
        {getEstadoBadge(trabajo.estado)}
      </div>

      {/* Timeline */}
      <WorkTimeline
        estadoActual={trabajo.estado}
        fechaCreacion={trabajo.created_at}
        fechaPago={trabajo.estado === 'PAGADO' || trabajo.estado === 'EN_PROCESO' || trabajo.estado === 'COMPLETADO' || trabajo.estado === 'APROBADO' ? trabajo.created_at : undefined}
        fechaInicio={trabajo.fecha_inicio}
        fechaFin={trabajo.fecha_fin}
        fechaAprobacion={trabajo.fecha_aprobacion}
      />

      {/* Notas */}
      {(trabajo.notas_profesional || trabajo.notas_cliente) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trabajo.notas_profesional && (
              <div>
                <p className="text-sm font-medium mb-1">Notas del Profesional:</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {trabajo.notas_profesional}
                </p>
              </div>
            )}
            {trabajo.notas_cliente && (
              <div>
                <p className="text-sm font-medium mb-1">Notas del Cliente:</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {trabajo.notas_cliente}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Imágenes */}
      {trabajo.imagenes && trabajo.imagenes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imágenes del Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {trabajo.imagenes.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      {trabajo.estado !== 'CANCELADO' && trabajo.estado !== 'APROBADO' && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>
              {isProfesional && 'Gestiona el progreso del trabajo'}
              {isCliente && 'Gestiona la aprobación del trabajo'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de notas */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Agregar nota (opcional)
              </label>
              <Textarea
                placeholder="Escribe una nota sobre esta acción..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
              />
            </div>

            <Separator />

            {/* Botones según rol y estado */}
            <div className="flex flex-wrap gap-3">
              {/* Profesional: Iniciar trabajo */}
              {isProfesional && trabajo.estado === 'PAGADO' && (
                <Button
                  onClick={handleIniciar}
                  disabled={actionLoading}
                  className="flex-1 min-w-[200px]"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Trabajo
                </Button>
              )}

              {/* Profesional: Completar trabajo */}
              {isProfesional && trabajo.estado === 'EN_PROCESO' && (
                <Button
                  onClick={handleCompletar}
                  disabled={actionLoading}
                  className="flex-1 min-w-[200px]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Completado
                </Button>
              )}

              {/* Cliente: Aprobar trabajo */}
              {isCliente && trabajo.estado === 'COMPLETADO' && (
                <Button
                  onClick={handleAprobar}
                  disabled={actionLoading}
                  className="flex-1 min-w-[200px]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar y Liberar Pago
                </Button>
              )}

              {/* Ambos: Cancelar */}
              {trabajo.estado !== 'APROBADO' && (
                <Button
                  variant="destructive"
                  onClick={handleCancelar}
                  disabled={actionLoading}
                  className="flex-1 min-w-[200px]"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Trabajo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de eventos */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.descripcion}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por {event.usuario_nombre} • {formatDate(event.created_at)}
                    </p>
                    {event.estado_anterior && event.estado_nuevo && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.estado_anterior}
                        </Badge>
                        <span className="text-xs">→</span>
                        <Badge variant="outline" className="text-xs">
                          {event.estado_nuevo}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
