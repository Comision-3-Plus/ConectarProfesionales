'use client';

/**
 * Página de lista de trabajos
 * Muestra todos los trabajos del usuario (como profesional o cliente)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trabajosService, type Trabajo } from '@/lib/services/trabajosService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function TrabajosPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'activos' | 'completados' | 'cancelados'>('activos');

  useEffect(() => {
    loadTrabajos();
  }, []);

  const loadTrabajos = async () => {
    try {
      setLoading(true);
      const data = await trabajosService.getMyTrabajos();
      setTrabajos(data);
    } catch (error) {
      console.error('Error loading trabajos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      PENDIENTE_PAGO: { variant: 'outline' as const, className: 'bg-orange-50 text-orange-700 border-orange-200', icon: Clock },
      PAGADO: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      EN_PROCESO: { variant: 'default' as const, className: 'bg-blue-500', icon: Briefcase },
      COMPLETADO: { variant: 'outline' as const, className: 'bg-purple-50 text-purple-700 border-purple-200', icon: CheckCircle },
      APROBADO: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      CANCELADO: { variant: 'destructive' as const, className: '', icon: XCircle }
    };
    
    const config = variants[estado as keyof typeof variants] || variants.PENDIENTE_PAGO;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {estado.replace('_', ' ')}
      </Badge>
    );
  };

  const getFilteredTrabajos = () => {
    switch (filter) {
      case 'activos':
        return trabajos.filter(t => 
          ['PENDIENTE_PAGO', 'PAGADO', 'EN_PROCESO', 'COMPLETADO'].includes(t.estado)
        );
      case 'completados':
        return trabajos.filter(t => t.estado === 'APROBADO');
      case 'cancelados':
        return trabajos.filter(t => t.estado === 'CANCELADO');
      default:
        return trabajos;
    }
  };

  const filteredTrabajos = getFilteredTrabajos();

  // Agrupar por rol
  const trabajosComoProfesional = filteredTrabajos.filter(t => t.profesional_id === user?.id);
  const trabajosComoCliente = filteredTrabajos.filter(t => t.cliente_id === user?.id);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Briefcase className="h-8 w-8" />
            Mis Trabajos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos tus trabajos activos y completados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrar por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activos">
                Activos ({trabajos.filter(t => ['PENDIENTE_PAGO', 'PAGADO', 'EN_PROCESO', 'COMPLETADO'].includes(t.estado)).length})
              </TabsTrigger>
              <TabsTrigger value="completados">
                Completados ({trabajos.filter(t => t.estado === 'APROBADO').length})
              </TabsTrigger>
              <TabsTrigger value="cancelados">
                Cancelados ({trabajos.filter(t => t.estado === 'CANCELADO').length})
              </TabsTrigger>
              <TabsTrigger value="todos">
                Todos ({trabajos.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tabs: Como Profesional / Como Cliente */}
      <Tabs defaultValue="profesional">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profesional">
            Como Profesional ({trabajosComoProfesional.length})
          </TabsTrigger>
          <TabsTrigger value="cliente">
            Como Cliente ({trabajosComoCliente.length})
          </TabsTrigger>
        </TabsList>

        {/* Como Profesional */}
        <TabsContent value="profesional" className="space-y-4 mt-6">
          {trabajosComoProfesional.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No tienes trabajos {filter !== 'todos' ? `${filter}` : ''} como profesional
                </p>
              </CardContent>
            </Card>
          ) : (
            trabajosComoProfesional.map((trabajo) => (
              <Card key={trabajo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Trabajo #{trabajo.id.slice(0, 8)}
                        </h3>
                        {getEstadoBadge(trabajo.estado)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-3">
                        <div>
                          <span className="font-medium">Creado:</span>{' '}
                          {formatDate(trabajo.created_at)}
                        </div>
                        {trabajo.fecha_inicio && (
                          <div>
                            <span className="font-medium">Iniciado:</span>{' '}
                            {formatDate(trabajo.fecha_inicio)}
                          </div>
                        )}
                        {trabajo.fecha_fin && (
                          <div>
                            <span className="font-medium">Finalizado:</span>{' '}
                            {formatDate(trabajo.fecha_fin)}
                          </div>
                        )}
                        {trabajo.fecha_aprobacion && (
                          <div>
                            <span className="font-medium">Aprobado:</span>{' '}
                            {formatDate(trabajo.fecha_aprobacion)}
                          </div>
                        )}
                      </div>

                      {trabajo.notas_profesional && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          <span className="font-medium">Nota:</span> {trabajo.notas_profesional}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => router.push(`/trabajos/${trabajo.id}`)}
                      variant="outline"
                    >
                      Ver Detalle
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Como Cliente */}
        <TabsContent value="cliente" className="space-y-4 mt-6">
          {trabajosComoCliente.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No tienes trabajos {filter !== 'todos' ? `${filter}` : ''} como cliente
                </p>
              </CardContent>
            </Card>
          ) : (
            trabajosComoCliente.map((trabajo) => (
              <Card key={trabajo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Trabajo #{trabajo.id.slice(0, 8)}
                        </h3>
                        {getEstadoBadge(trabajo.estado)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-3">
                        <div>
                          <span className="font-medium">Creado:</span>{' '}
                          {formatDate(trabajo.created_at)}
                        </div>
                        {trabajo.fecha_inicio && (
                          <div>
                            <span className="font-medium">Iniciado:</span>{' '}
                            {formatDate(trabajo.fecha_inicio)}
                          </div>
                        )}
                        {trabajo.fecha_fin && (
                          <div>
                            <span className="font-medium">Finalizado:</span>{' '}
                            {formatDate(trabajo.fecha_fin)}
                          </div>
                        )}
                        {trabajo.fecha_aprobacion && (
                          <div>
                            <span className="font-medium">Aprobado:</span>{' '}
                            {formatDate(trabajo.fecha_aprobacion)}
                          </div>
                        )}
                      </div>

                      {trabajo.notas_cliente && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          <span className="font-medium">Nota:</span> {trabajo.notas_cliente}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => router.push(`/trabajos/${trabajo.id}`)}
                      variant="outline"
                    >
                      Ver Detalle
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Stats */}
      {trabajos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {trabajos.filter(t => ['PENDIENTE_PAGO', 'PAGADO', 'EN_PROCESO', 'COMPLETADO'].includes(t.estado)).length}
                </p>
                <p className="text-xs text-muted-foreground">Trabajos Activos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {trabajos.filter(t => t.estado === 'APROBADO').length}
                </p>
                <p className="text-xs text-muted-foreground">Completados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {trabajos.filter(t => t.estado === 'EN_PROCESO').length}
                </p>
                <p className="text-xs text-muted-foreground">En Proceso</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {trabajos.filter(t => t.estado === 'CANCELADO').length}
                </p>
                <p className="text-xs text-muted-foreground">Cancelados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
