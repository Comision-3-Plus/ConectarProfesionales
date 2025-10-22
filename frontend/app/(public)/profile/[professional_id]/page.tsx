'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicService } from '@/lib/services';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioGallery } from '@/components/features/PortfolioGallery';
import { Star, MessageCircle, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ professional_id: string }>;
}) {
  const resolvedParams = use(params);
  const professionalId = parseInt(resolvedParams.professional_id);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const { data: professional, isLoading } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => publicService.getProfessionalProfile(professionalId.toString()),
  });

  const handleContactClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // TODO: Implementar navegación al chat
    router.push(`/dashboard/cliente?chat=${professionalId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-lg bg-white" />
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">Profesional no encontrado</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { user, nivel_experiencia, tarifa_por_hora, rating_promedio, total_resenas, oficios, biografia } =
    professional;

  const nivelLabels: Record<string, string> = {
    junior: 'Junior',
    intermedio: 'Intermedio',
    senior: 'Senior',
  };

  const nivelColors: Record<string, string> = {
    junior: 'bg-green-100 text-green-800',
    intermedio: 'bg-blue-100 text-blue-800',
    senior: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              {/* Avatar */}
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage src={user.avatar_url} alt={user.nombre} />
                <AvatarFallback className="bg-orange-500 text-2xl text-white">
                  {user.nombre[0]}
                  {user.apellido[0]}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {user.nombre} {user.apellido}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className={nivelColors[nivel_experiencia]} variant="secondary">
                      {nivelLabels[nivel_experiencia]}
                    </Badge>
                    {oficios.slice(0, 3).map((oficio) => (
                      <Badge key={oficio.id} variant="outline">
                        {oficio.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span className="font-medium text-slate-900">{rating_promedio.toFixed(1)}</span>
                    <span className="text-slate-500">({total_resenas} reseñas)</span>
                  </div>
                  {tarifa_por_hora && (
                    <div className="flex items-center space-x-1 text-slate-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${tarifa_por_hora.toFixed(2)}/hora</span>
                    </div>
                  )}
                </div>

                {/* Biography */}
                {biografia && (
                  <p className="text-slate-700">{biografia}</p>
                )}
              </div>

              {/* CTA */}
              <div className="w-full sm:w-auto">
                <Button
                  onClick={handleContactClick}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contactar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas ({total_resenas})</TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioGallery items={professional.portfolio_items || []} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* TODO: Fetch and display reviews */}
                  <p className="text-center text-slate-500">
                    Las reseñas se cargarán desde la API
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
