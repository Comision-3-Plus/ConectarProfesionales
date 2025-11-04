/**
 * Dashboard del Profesional - Versión Simplificada
 * Panel con estadísticas, CTAs y estado del perfil
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Star, 
  DollarSign, 
  Briefcase, 
  Clock,
  Award,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ProfesionalDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const nombreProfesional = user?.nombre || 'Profesional';

  // Estadísticas simuladas
  const stats = {
    gananciasMes: 125000,
    trabajosCompletados: 23,
    calificacionPromedio: 4.8
  };

  // Ofertas pendientes simuladas
  const ofertasPendientes = [
    {
      id: 1,
      cliente: 'María González',
      servicio: 'Reparación de tubería',
      fecha: 'Hace 1 hora'
    },
    {
      id: 2,
      cliente: 'Carlos Ruiz',
      servicio: 'Instalación eléctrica',
      fecha: 'Hace 3 horas'
    },
    {
      id: 3,
      cliente: 'Ana Martínez',
      servicio: 'Pintura de habitación',
      fecha: 'Hace 1 día'
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Tu Panel de Profesional, {nombreProfesional}
          </h1>
          <p className="text-lg text-slate-600">
            Gestiona tus servicios, ofertas y perfil profesional
          </p>
        </div>
        <Button
          onClick={() => router.push('/perfil/editar')}
          variant="outline"
          className="gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Editar mi Perfil
        </Button>
      </div>

      <Separator className="mb-8" />

      {/* Call to Action Principal */}
      <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg">
        <CardContent className="p-8 text-center">
          <PlusCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            ¿Listo para más trabajos?
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Publica un nuevo servicio para que los clientes puedan contratarte directamente
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/dashboard/profesional/publicar">
              Publicar un Nuevo Servicio
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Estadísticas Clave */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Estadísticas Clave</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ganancias del Mes */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Ganancias del Mes
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ${stats.gananciasMes.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+18% vs mes anterior</p>
                </div>
                <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trabajos Completados */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Trabajos Completados
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.trabajosCompletados}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">En total este mes</p>
                </div>
                <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calificación Promedio */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Calificación Promedio
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-orange-600">
                      {stats.calificacionPromedio}
                    </p>
                    <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
                  </div>
                  <p className="text-xs text-orange-600 mt-1">Basado en 47 reseñas</p>
                </div>
                <div className="h-14 w-14 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enlace a Editar Perfil */}
      <Card className="mb-8 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            Gestión de Perfil
          </CardTitle>
          <CardDescription>
            Mantén tu información profesional actualizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 mb-1">
                Un perfil completo y actualizado te ayuda a conseguir más clientes
              </p>
              <p className="text-sm text-slate-500">
                Agrega tu biografía, tarifa por hora, experiencia y portfolio
              </p>
            </div>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Link href="/perfil/editar">
                Editar mi Perfil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ofertas Pendientes de Responder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Ofertas Pendientes de Responder
            <Badge className="ml-2 bg-orange-500 hover:bg-orange-600">
              {ofertasPendientes.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Solicitudes de clientes esperando tu respuesta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ofertasPendientes.length > 0 ? (
            <div className="space-y-3">
              {ofertasPendientes.map((oferta) => (
                <div
                  key={oferta.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-10 w-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {oferta.cliente.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{oferta.cliente}</p>
                        <p className="text-sm text-slate-600">{oferta.servicio}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-500">{oferta.fecha}</p>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Responder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No tienes ofertas pendientes</p>
              <p className="text-sm mt-2">
                Las solicitudes de clientes aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
