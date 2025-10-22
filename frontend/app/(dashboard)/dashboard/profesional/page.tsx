'use client';

import { useQuery } from '@tanstack/react-query';
import { professionalService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Briefcase, Star, TrendingUp } from 'lucide-react';

export default function ProfessionalDashboardPage() {
  const { data: profile } = useQuery({
    queryKey: ['professional-profile'],
    queryFn: professionalService.getMe,
  });

  const { data: ofertas } = useQuery({
    queryKey: ['professional-offers'],
    queryFn: professionalService.listOfertas,
  });

  const ofertasPendientes = ofertas?.filter((o) => o.estado === 'pendiente') || [];

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aceptada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800',
    expirada: 'bg-gray-100 text-gray-800',
  };

  const estadoLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    expirada: 'Expirada',
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mi Panel Profesional</h1>
        <p className="mt-2 text-slate-600">Gestiona tus trabajos y métricas</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Calificación
            </CardTitle>
            <Star className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {profile?.rating_promedio.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-slate-500">
              {profile?.total_resenas || 0} reseñas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Trabajos Activos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Tarifa/hora
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${profile?.tarifa_por_hora?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="offers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="offers">Ofertas ({ofertasPendientes.length})</TabsTrigger>
          <TabsTrigger value="works">Trabajos (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          {ofertasPendientes.length > 0 ? (
            ofertasPendientes.map((oferta) => (
              <Card key={oferta.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900">Oferta #{oferta.id}</h3>
                        <Badge className={estadoColors[oferta.estado]} variant="secondary">
                          {estadoLabels[oferta.estado]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{oferta.descripcion}</p>
                      <p className="text-lg font-bold text-orange-500">
                        ${oferta.precio.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No tienes ofertas pendientes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="works" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">No tienes trabajos activos</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
