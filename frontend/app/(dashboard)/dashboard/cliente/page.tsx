'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewModal } from '@/components/features/ReviewModal';
import { Briefcase, Clock, CheckCircle, Star } from 'lucide-react';

export default function ClienteDashboardPage() {
  const [selectedWorkForReview, setSelectedWorkForReview] = useState<number | null>(null);

  const { data: trabajos } = useQuery({
    queryKey: ['client-works'],
    queryFn: clienteApi.getMyProjects,
  });

  const handleFinalizeWork = async (workId: number) => {
    try {
      await clienteApi.finalizeWork(workId);
      setSelectedWorkForReview(workId);
    } catch (error) {
      console.error('Error finalizando trabajo:', error);
    }
  };

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    en_progreso: 'bg-blue-100 text-blue-800',
    finalizado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  };

  const estadoLabels: Record<string, string> = {
    pendiente: 'Pendiente de Pago',
    en_progreso: 'En Progreso',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  };

  const estadoIcons: Record<string, React.ReactNode> = {
    pendiente: <Clock className="h-4 w-4" />,
    en_progreso: <Briefcase className="h-4 w-4" />,
    finalizado: <CheckCircle className="h-4 w-4" />,
    cancelado: <CheckCircle className="h-4 w-4" />,
  };

  const trabajosPendientes = trabajos?.filter((t) => t.estado === 'pendiente') || [];
  const trabajosActivos = trabajos?.filter((t) => t.estado === 'en_progreso') || [];
  const trabajosFinalizados = trabajos?.filter((t) => t.estado === 'finalizado') || [];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mi Panel de Cliente</h1>
        <p className="mt-2 text-slate-600">Gestiona tus proyectos y ofertas</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Proyectos Activos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{trabajosActivos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pendientes de Pago
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{trabajosPendientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{trabajosFinalizados.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Activos ({trabajosActivos.length})</TabsTrigger>
          <TabsTrigger value="pending">Pendientes ({trabajosPendientes.length})</TabsTrigger>
          <TabsTrigger value="completed">Completados ({trabajosFinalizados.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {trabajosActivos.length > 0 ? (
            trabajosActivos.map((trabajo) => (
              <Card key={trabajo.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      {estadoIcons[trabajo.estado]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Trabajo #{trabajo.id}</h3>
                      <Badge className={estadoColors[trabajo.estado]} variant="secondary">
                        {estadoLabels[trabajo.estado]}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFinalizeWork(trabajo.id)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Finalizar Trabajo
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No tienes proyectos activos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {trabajosPendientes.length > 0 ? (
            trabajosPendientes.map((trabajo) => (
              <Card key={trabajo.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                      {estadoIcons[trabajo.estado]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Trabajo #{trabajo.id}</h3>
                      <Badge className={estadoColors[trabajo.estado]} variant="secondary">
                        {estadoLabels[trabajo.estado]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No tienes pagos pendientes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {trabajosFinalizados.length > 0 ? (
            trabajosFinalizados.map((trabajo) => (
              <Card key={trabajo.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      {estadoIcons[trabajo.estado]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Trabajo #{trabajo.id}</h3>
                      <Badge className={estadoColors[trabajo.estado]} variant="secondary">
                        {estadoLabels[trabajo.estado]}
                      </Badge>
                    </div>
                  </div>
                  <Star className="h-6 w-6 fill-orange-500 text-orange-500" />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No tienes proyectos completados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedWorkForReview && (
        <ReviewModal
          workId={selectedWorkForReview}
          open={!!selectedWorkForReview}
          onOpenChange={(open) => !open && setSelectedWorkForReview(null)}
        />
      )}
    </div>
  );
}
