'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Briefcase } from 'lucide-react';
import { ProyectoCard } from '@/components/features/ProyectoCard';
import { publicService } from '@/lib/services/publicService';
import { clienteService } from '@/lib/services/clienteService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { OficioRead } from '@/types';

export default function ProyectosMarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [oficioFilter, setOficioFilter] = useState<string | undefined>(undefined);
  const [contratandoId, setContratandoId] = useState<string | null>(null);

  // Obtener oficios para filtro
  const { data: oficios = [], isLoading: loadingOficios } = useQuery({
    queryKey: ['oficios'],
    queryFn: () => publicService.getOficios(),
  });

  // Obtener proyectos publicados
  const { data: proyectos = [], isLoading: loadingProyectos, refetch } = useQuery({
    queryKey: ['proyectos-publicados', oficioFilter],
    queryFn: () => publicService.getProyectosPublicados({ 
      oficio_id: oficioFilter 
    }),
  });

  const handleContratar = async (proyectoId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para contratar servicios');
      router.push('/auth/login');
      return;
    }

    if (user.rol !== 'CLIENTE') {
      toast.error('Solo los clientes pueden contratar servicios');
      return;
    }

    setContratandoId(proyectoId);
    try {
      const response = await clienteService.contratarProyecto(proyectoId);
      toast.success('¡Servicio contratado! Procede al pago para confirmar');
      
      // Redirigir al link de pago de MercadoPago
      if (response.payment_url) {
        window.location.href = response.payment_url;
      }
    } catch (error: any) {
      console.error('Error al contratar:', error);
      toast.error(error.response?.data?.detail || 'Error al contratar el servicio');
    } finally {
      setContratandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Marketplace de Servicios
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Encuentra profesionales con precios fijos y contrata al instante
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 w-full">
                <Select
                  value={oficioFilter || 'all'}
                  onValueChange={(value) => setOficioFilter(value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por oficio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los oficios</SelectItem>
                    {oficios.map((oficio: OficioRead) => (
                      <SelectItem key={oficio.id} value={oficio.id}>
                        {oficio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {proyectos.length} {proyectos.length === 1 ? 'servicio' : 'servicios'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {loadingProyectos ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : proyectos.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No hay servicios disponibles
                </h3>
                <p>
                  {oficioFilter 
                    ? 'Prueba seleccionando otro oficio'
                    : 'Los profesionales publicarán servicios pronto'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proyectos.map((proyecto) => (
              <ProyectoCard
                key={proyecto.id}
                proyecto={proyecto}
                onContratar={handleContratar}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
