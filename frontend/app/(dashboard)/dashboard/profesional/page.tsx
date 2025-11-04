/**
 * Dashboard Principal - Profesional
 * Vista completa con métricas, trabajos activos, ofertas, portfolio y perfil
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
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { professionalService } from '@/lib/services';
import { TrabajoRead, OfertaRead } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { GraficosIngresos } from '@/components/features/GraficosIngresos';
import { ActividadReciente } from '@/components/features/ActividadReciente';
import { PortfolioManager } from '@/components/professional/PortfolioManager';

// Tipo temporal para profile hasta que se actualice el tipo oficial
type ProfileData = {
  rating_promedio?: number;
  tarifa_hora?: number;
  nivel?: string;
  puntos_xp?: number;
  comision_porcentaje?: number;
};

export default function ProfesionalDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ofertas');

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profesional-profile'],
    queryFn: professionalService.getMe,
  });

  const { data: trabajos, isLoading: trabajosLoading } = useQuery({
    queryKey: ['profesional-trabajos'],
    queryFn: professionalService.listTrabajos,
  });

  const { data: ofertas, isLoading: ofertasLoading } = useQuery({
    queryKey: ['profesional-ofertas'],
    queryFn: professionalService.listOfertas,
  });

  // Cast profile a ProfileData
  const profileData = profile as ProfileData | undefined;

  // Métricas calculadas
  const metrics = {
    activos: trabajos?.filter(t => t.estado_escrow === 'PAGADO_EN_ESCROW').length || 0,
    completados: trabajos?.filter(t => t.estado_escrow === 'LIBERADO').length || 0,
    ingresosTotal: trabajos
      ?.filter(t => t.estado_escrow === 'LIBERADO')
      .reduce((sum, t) => sum + (t.monto_liberado || 0), 0) || 0,
    ofertasPendientes: ofertas?.filter(o => o.estado === 'PENDIENTE').length || 0,
    calificacion: profileData?.rating_promedio || 0,
    tarifa: profileData?.tarifa_hora || 0,
    nivel: profileData?.nivel || 'BRONCE',
    xp: profileData?.puntos_xp || 0,
    comision: profileData?.comision_porcentaje || 15,
  };

  // Calcular progreso al siguiente nivel
  const nivelXP = {
    BRONCE: 0,
    PLATA: 1000,
    ORO: 5000,
    DIAMANTE: 20000,
  };

  const siguienteNivel = metrics.nivel === 'BRONCE' ? 'PLATA' 
    : metrics.nivel === 'PLATA' ? 'ORO' 
    : metrics.nivel === 'ORO' ? 'DIAMANTE' 
    : 'DIAMANTE';

  const xpActual = metrics.xp;
  const xpNivelActual = nivelXP[metrics.nivel as keyof typeof nivelXP];
  const xpSiguienteNivel = nivelXP[siguienteNivel as keyof typeof nivelXP];
  const progresoXP = metrics.nivel === 'DIAMANTE' 
    ? 100 
    : ((xpActual - xpNivelActual) / (xpSiguienteNivel - xpNivelActual)) * 100;

  // Handlers
  const handleChat = () => {
    router.push('/dashboard/profesional/chat');
  };

  const handleEditProfile = () => {
    toast.info('Función de edición de perfil próximamente');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Mi Dashboard Profesional
            </h1>
            <p className="text-slate-600">
              Gestiona tus trabajos, ofertas y perfil profesional
            </p>
          </div>
          <Button
            onClick={handleEditProfile}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Calificación */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Calificación</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-bold text-orange-600">{metrics.calificacion.toFixed(1)}</p>
                  <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
                </div>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarifa */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tarifa por Hora</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {formatCurrency(metrics.tarifa)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trabajos Activos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Trabajos Activos</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.activos}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos Totales */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(metrics.ingresosTotal)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gamificación */}
      <Card className="mb-8 border-2 border-gradient-to-r from-orange-500 to-orange-600">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nivel */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium text-slate-600">Nivel Profesional</p>
              </div>
              <Badge 
                className={`text-lg px-4 py-1 ${
                  metrics.nivel === 'DIAMANTE' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                  metrics.nivel === 'ORO' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  metrics.nivel === 'PLATA' ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  'bg-gradient-to-r from-orange-700 to-orange-800'
                }`}
              >
                {metrics.nivel}
              </Badge>
            </div>

            {/* XP */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium text-slate-600">Puntos de Experiencia</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{metrics.xp} XP</p>
              {metrics.nivel !== 'DIAMANTE' && (
                <p className="text-xs text-slate-500 mt-1">
                  {xpSiguienteNivel - xpActual} XP para {siguienteNivel}
                </p>
              )}
            </div>

            {/* Comisión */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium text-slate-600">Comisión Actual</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{metrics.comision}%</p>
              <p className="text-xs text-slate-500 mt-1">
                Por transacción
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          {metrics.nivel !== 'DIAMANTE' && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Progreso al siguiente nivel</span>
                <span className="font-semibold text-orange-600">{Math.round(progresoXP)}%</span>
              </div>
              <Progress value={progresoXP} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Análisis y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ingresos */}
        <GraficosIngresos 
          ingresosMensuales={[
            { mes: 'Nov', monto: 85000 },
            { mes: 'Oct', monto: 72000 },
            { mes: 'Sep', monto: 68000 },
            { mes: 'Ago', monto: 58000 },
            { mes: 'Jul', monto: 52000 },
          ]}
          totalIngresos={metrics.ingresosTotal}
          comparacionMesAnterior={18.1}
        />

        {/* Actividad Reciente */}
        <ActividadReciente 
          actividades={[
            {
              id: '1',
              tipo: 'oferta_aceptada' as const,
              descripcion: 'Cliente aceptó tu oferta de electricidad',
              fecha: new Date(Date.now() - 1 * 60 * 60 * 1000),
              monto: 32000
            },
            {
              id: '2',
              tipo: 'trabajo_completado' as const,
              descripcion: 'Trabajo de plomería finalizado y fondos liberados',
              fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
              monto: 45000
            },
            {
              id: '3',
              tipo: 'mensaje' as const,
              descripcion: 'Nuevo mensaje de Ana García',
              fecha: new Date(Date.now() - 12 * 60 * 60 * 1000),
            },
            {
              id: '4',
              tipo: 'oferta_recibida' as const,
              descripcion: 'Solicitud de presupuesto para reparación',
              fecha: new Date(Date.now() - 20 * 60 * 60 * 1000),
            },
          ].slice(0, 5)}
        />
      </div>

      {/* Tabs con contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">\
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ofertas">
            Mis Ofertas
            {metrics.ofertasPendientes > 0 && (
              <Badge className="ml-2 bg-orange-500 hover:bg-orange-600">
                {metrics.ofertasPendientes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activos">Trabajos Activos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Tab: Mis Ofertas */}
        <TabsContent value="ofertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas Enviadas</CardTitle>
              <CardDescription>
                Gestiona las ofertas que has enviado a clientes
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
                  <p className="text-slate-500 font-medium">No has enviado ofertas aún</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Comunícate con clientes para enviar ofertas de trabajo
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ofertas.map((oferta) => (
                    <OfertaProfesionalCard
                      key={oferta.id}
                      oferta={oferta}
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
                Trabajos con pago en escrow actualmente
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
                      <TrabajoProfesionalCard
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
                Historial de proyectos finalizados y pagados
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
                      <TrabajoProfesionalCard
                        key={trabajo.id}
                        trabajo={trabajo}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Portfolio */}
        <TabsContent value="portfolio" className="space-y-4">
          <PortfolioManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente OfertaProfesionalCard
interface OfertaProfesionalCardProps {
  oferta: OfertaRead;
  onChat: () => void;
}

function OfertaProfesionalCard({ oferta, onChat }: OfertaProfesionalCardProps) {
  const estadoConfig = {
    PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
    ACEPTADA: { label: 'Aceptada', color: 'bg-green-500', icon: CheckCircle2 },
    RECHAZADA: { label: 'Rechazada', color: 'bg-red-500', icon: XCircle },
  };

  const config = estadoConfig[oferta.estado as keyof typeof estadoConfig] || estadoConfig.PENDIENTE;
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                {oferta.cliente_nombre?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">
                  {oferta.cliente_nombre || 'Cliente'}
                </h3>
                <Badge className={`${config.color} text-white`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              {oferta.descripcion && (
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                  {oferta.descripcion}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(oferta.precio_ofertado || oferta.precio_final)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Enviada: {new Date(oferta.fecha_creacion).toLocaleDateString('es-AR')}</span>
            </div>
          </div>

          {oferta.estado === 'PENDIENTE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onChat}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente TrabajoProfesionalCard
interface TrabajoProfesionalCardProps {
  trabajo: TrabajoRead;
  onChat?: () => void;
  showActions?: boolean;
}

function TrabajoProfesionalCard({ trabajo, onChat, showActions }: TrabajoProfesionalCardProps) {
  const estadoConfig = {
    PENDIENTE_PAGO: { label: 'Pendiente de Pago', color: 'bg-yellow-500', icon: Clock },
    PAGADO_EN_ESCROW: { label: 'Pago en Escrow', color: 'bg-blue-500', icon: DollarSign },
    LIBERADO: { label: 'Completado y Pagado', color: 'bg-green-500', icon: CheckCircle2 },
    CANCELADO_REEMBOLSADO: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
  };

  const config = estadoConfig[trabajo.estado_escrow as keyof typeof estadoConfig] || estadoConfig.PENDIENTE_PAGO;
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                {trabajo.cliente_nombre?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">
                  {trabajo.cliente_nombre || 'Cliente'}
                </h3>
                <Badge className={`${config.color} text-white`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              {trabajo.descripcion && (
                <p className="text-sm text-slate-600 mt-2">{trabajo.descripcion}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(trabajo.precio_final)}
            </p>
            {trabajo.monto_liberado && trabajo.estado_escrow === 'LIBERADO' && (
              <p className="text-sm text-green-600 font-medium mt-1">
                +{formatCurrency(trabajo.monto_liberado)} recibido
              </p>
            )}
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
          </div>

          {showActions && onChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={onChat}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
