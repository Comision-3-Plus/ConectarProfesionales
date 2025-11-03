/**
 * Dashboard Principal - Cliente
 * Vista completa con métricas, trabajos activos, ofertas recibidas, historial
 */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Star,
  MessageCircle,
  Calendar,
  MapPin,
  Plus
} from 'lucide-react';
import { clienteService } from '@/lib/services';
import { TrabajoRead, OfertaRead } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraficosGastos } from '@/components/features/GraficosGastos';
import { ActividadReciente } from '@/components/features/ActividadReciente';
import { CreateReviewDialog } from '@/components/reviews/CreateReviewDialog';

export default function ClienteDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ofertas');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTrabajoForReview, setSelectedTrabajoForReview] = useState<{id: string; profesionalNombre: string} | null>(null);

  // Queries
  const { data: trabajos, isLoading: trabajosLoading } = useQuery({
    queryKey: ['cliente-trabajos'],
    queryFn: clienteService.listTrabajos,
  });

  const { data: ofertas, isLoading: ofertasLoading } = useQuery({
    queryKey: ['cliente-ofertas'],
    queryFn: clienteService.listOfertas,
  });

  // Métricas calculadas
  const metrics = {
    activos: trabajos?.filter(t => 
      t.estado_escrow === 'PAGADO_EN_ESCROW'
    ).length || 0,
    pendientesPago: ofertas?.filter(o => 
      o.estado === 'PENDIENTE'
    ).length || 0,
    completados: trabajos?.filter(t => t.estado_escrow === 'LIBERADO').length || 0,
    totalGastado: trabajos
      ?.filter(t => t.estado_escrow === 'LIBERADO')
      .reduce((sum, t) => sum + (t.precio_final || 0), 0) || 0,
  };

  // Handlers
  const handleAcceptOferta = async (ofertaId: string) => {
    try {
      const result = await clienteService.acceptOferta(ofertaId);
      toast.success('Oferta aceptada. Redirigiendo al pago...');
      
      if (result.payment_url) {
        window.location.href = result.payment_url;
      }
    } catch (error) {
      console.error('Error al aceptar oferta:', error);
      toast.error('Error al aceptar oferta');
    }
  };

  const handleRejectOferta = async (ofertaId: string) => {
    try {
      await clienteService.rejectOferta(ofertaId);
      toast.success('Oferta rechazada');
    } catch (error) {
      console.error('Error al rechazar oferta:', error);
      toast.error('Error al rechazar oferta');
    }
  };

  const handleChat = () => {
    router.push(`/dashboard/cliente/chat`);
  };

  const handleReview = (trabajoId: string, profesionalNombre: string) => {
    setSelectedTrabajoForReview({ id: trabajoId, profesionalNombre });
    setReviewDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mi Dashboard
          </h1>
          <p className="text-slate-600">
            Gestiona tus proyectos y profesionales contratados
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all"
        >
          <Link href="/dashboard/cliente/publicar">
            <Plus className="h-4 w-4 mr-2" />
            Publicar Proyecto
          </Link>
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Proyectos Activos</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{metrics.activos}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes de Pago</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.pendientesPago}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completados</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{metrics.completados}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Gastado</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {formatCurrency(metrics.totalGastado)}
                </p>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Análisis y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Gastos */}
        <GraficosGastos 
          gastos={[
            {
              categoria: 'Plomería',
              monto: 45000,
              color: '#3b82f6',
              porcentaje: 35
            },
            {
              categoria: 'Electricidad',
              monto: 32000,
              color: '#f59e0b',
              porcentaje: 25
            },
            {
              categoria: 'Pintura',
              monto: 28000,
              color: '#8b5cf6',
              porcentaje: 22
            },
            {
              categoria: 'Carpintería',
              monto: 23000,
              color: '#10b981',
              porcentaje: 18
            },
          ]}
          totalGastado={metrics.totalGastado}
        />

        {/* Actividad Reciente */}
        <ActividadReciente 
          actividades={[
            {
              id: '1',
              tipo: 'oferta_recibida' as const,
              descripcion: 'Nueva oferta de Juan Pérez para reparación de plomería',
              fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
              monto: 15000
            },
            {
              id: '2',
              tipo: 'pago_realizado' as const,
              descripcion: 'Pago realizado para trabajo de electricidad',
              fecha: new Date(Date.now() - 5 * 60 * 60 * 1000),
              monto: 32000
            },
            {
              id: '3',
              tipo: 'trabajo_completado' as const,
              descripcion: 'Trabajo de pintura completado satisfactoriamente',
              fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
            {
              id: '4',
              tipo: 'mensaje' as const,
              descripcion: 'Nuevo mensaje de María López',
              fecha: new Date(Date.now() - 36 * 60 * 60 * 1000),
            },
          ].slice(0, 5)}
        />
      </div>

      {/* Tabs con contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">\
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ofertas" className="relative">
            Ofertas Recibidas
            {metrics.pendientesPago > 0 && (
              <Badge className="ml-2 bg-orange-500 hover:bg-orange-600">
                {metrics.pendientesPago}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activos">Trabajos Activos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* Tab: Ofertas Recibidas */}
        <TabsContent value="ofertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas de Profesionales</CardTitle>
              <CardDescription>
                Revisa y acepta las ofertas que mejor se ajusten a tus necesidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ofertasLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : !ofertas || ofertas.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No tienes ofertas pendientes</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Las ofertas de profesionales aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ofertas
                    .filter(o => o.estado === 'PENDIENTE')
                    .map((oferta) => (
                      <OfertaCard
                        key={oferta.id}
                        oferta={oferta}
                        onAccept={handleAcceptOferta}
                        onReject={handleRejectOferta}
                        onChat={handleChat}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Trabajos Activos */}
        <TabsContent value="activos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proyectos en Curso</CardTitle>
              <CardDescription>
                Sigue el progreso de tus trabajos activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trabajosLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : !trabajos || trabajos.filter(t => t.estado_escrow === 'PAGADO_EN_ESCROW').length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No tienes trabajos activos</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Tus proyectos en curso aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trabajos
                    .filter(t => t.estado_escrow === 'PAGADO_EN_ESCROW')
                    .map((trabajo) => (
                      <TrabajoCard
                        key={trabajo.id}
                        trabajo={trabajo}
                        onChat={handleChat}
                        showActions
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trabajos Completados</CardTitle>
              <CardDescription>
                Historial de proyectos finalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trabajosLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : !trabajos || trabajos.filter(t => t.estado_escrow === 'LIBERADO' || t.estado_escrow === 'CANCELADO_REEMBOLSADO').length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No hay trabajos completados aún</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Tu historial de proyectos aparecerá aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trabajos
                    .filter(t => t.estado_escrow === 'LIBERADO' || t.estado_escrow === 'CANCELADO_REEMBOLSADO')
                    .map((trabajo) => (
                      <TrabajoCard
                        key={trabajo.id}
                        trabajo={trabajo}
                        onReview={handleReview}
                        showReviewButton={trabajo.estado_escrow === 'LIBERADO'}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Reseñas */}
      {selectedTrabajoForReview && (
        <CreateReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          trabajoId={selectedTrabajoForReview.id}
          profesionalNombre={selectedTrabajoForReview.profesionalNombre}
        />
      )}
    </div>
  );
}

// Componente OfertaCard
interface OfertaCardProps {
  oferta: OfertaRead;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onChat: (profesionalId: string) => void;
}

function OfertaCard({ oferta, onAccept, onReject, onChat }: OfertaCardProps) {
  const expiresAt = oferta.expires_at ? new Date(oferta.expires_at) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días por defecto
  const isExpired = expiresAt < new Date();

  return (
    <Card className={isExpired ? 'opacity-60' : 'border-orange-200'}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                {oferta.profesional_nombre?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                {oferta.profesional_nombre || 'Profesional'}
              </h3>
              <p className="text-sm text-slate-500">{oferta.oficio_nombre || 'Servicio'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(oferta.precio_ofertado || oferta.precio_final)}
            </p>
            {oferta.estado === 'ACEPTADA' && (
              <Badge className="mt-1 bg-green-500">Aceptada</Badge>
            )}
            {oferta.estado === 'RECHAZADA' && (
              <Badge variant="destructive" className="mt-1">Rechazada</Badge>
            )}
            {isExpired && (
              <Badge variant="secondary" className="mt-1">Expirada</Badge>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-slate-700 text-sm whitespace-pre-wrap">
            {oferta.descripcion}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Expira: {expiresAt.toLocaleDateString('es-AR')}</span>
            </div>
          </div>

          {oferta.estado === 'PENDIENTE' && !isExpired && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChat(oferta.profesional_id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(oferta.id)}
              >
                Rechazar
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => onAccept(oferta.id)}
              >
                Aceptar y Pagar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente TrabajoCard
interface TrabajoCardProps {
  trabajo: TrabajoRead;
  onChat?: (profesionalId: string) => void;
  onReview?: (trabajoId: string, profesionalNombre: string) => void;
  showActions?: boolean;
  showReviewButton?: boolean;
}

function TrabajoCard({ trabajo, onChat, onReview, showActions, showReviewButton }: TrabajoCardProps) {
  const estadoConfig = {
    PENDIENTE_PAGO: { label: 'Pendiente de Pago', color: 'bg-yellow-500', icon: Clock },
    PAGADO_EN_ESCROW: { label: 'Pago en Escrow', color: 'bg-blue-500', icon: DollarSign },
    EN_PROGRESO: { label: 'En Progreso', color: 'bg-orange-500', icon: Briefcase },
    LIBERADO: { label: 'Completado', color: 'bg-green-500', icon: CheckCircle2 },
    CANCELADO: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
  };

  const config = estadoConfig[trabajo.estado as keyof typeof estadoConfig] || estadoConfig.PENDIENTE_PAGO;
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                {trabajo.profesional_nombre?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">
                  {trabajo.profesional_nombre || 'Profesional'}
                </h3>
                <Badge className={`${config.color} text-white`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">{trabajo.oficio_nombre || 'Servicio'}</p>
              {trabajo.descripcion && (
                <p className="text-sm text-slate-600 mt-2">{trabajo.descripcion}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(trabajo.precio_final)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {trabajo.fecha_inicio && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(trabajo.fecha_inicio).toLocaleDateString('es-AR')}</span>
              </div>
            )}
            {trabajo.descripcion && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Ubicación</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {showActions && onChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChat(trabajo.profesional_id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
            )}
            {showReviewButton && onReview && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => onReview(trabajo.id, trabajo.profesional_nombre || 'Profesional')}
              >
                <Star className="h-4 w-4 mr-1" />
                Dejar Reseña
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
