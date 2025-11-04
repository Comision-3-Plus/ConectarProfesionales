/**
 * Dashboard del Cliente - Versión Simplificada
 * Bienvenida, CTA principal y actividad reciente
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ClienteDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const nombreCliente = user?.nombre || 'Cliente';

  // Datos simulados para actividad reciente
  const actividadReciente = [
    {
      id: 1,
      tipo: 'chat',
      descripcion: 'Nuevo mensaje de Juan Pérez (Plomero)',
      fecha: 'Hace 2 horas',
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      id: 2,
      tipo: 'trabajo',
      descripcion: 'Trabajo de electricidad en progreso',
      fecha: 'Hace 1 día',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      id: 3,
      tipo: 'completado',
      descripcion: 'Reparación de plomería completada',
      fecha: 'Hace 3 días',
      icon: CheckCircle2,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Título de Bienvenida */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Bienvenido, {nombreCliente}
        </h1>
        <p className="text-lg text-slate-600">
          Encuentra al profesional ideal para tu proyecto
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Call to Action Principal */}
      <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg">
        <CardContent className="p-8 text-center">
          <Search className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            ¿Necesitas un profesional?
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Explora nuestro directorio de profesionales verificados y encuentra al indicado para tu proyecto
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/explorar">
              Encontrar un Profesional
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Actividad Reciente</CardTitle>
          <CardDescription>
            Tus trabajos en curso y chats recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actividadReciente.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
                >
                  <div className={`mt-1 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.descripcion}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.fecha}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {actividadReciente.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>No tienes actividad reciente</p>
              <p className="text-sm mt-2">Comienza publicando un proyecto o buscando profesionales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección Mis Trabajos en Curso (Simulada) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Mis Trabajos en Curso</CardTitle>
          <CardDescription>
            Proyectos activos y pendientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No tienes trabajos activos</p>
            <p className="text-sm mt-2">
              Cuando contrates a un profesional, tus proyectos aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sección Mis Chats Recientes (Simulada) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Mis Chats Recientes</CardTitle>
          <CardDescription>
            Conversaciones con profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No tienes chats recientes</p>
            <p className="text-sm mt-2">
              Tus conversaciones con profesionales aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
