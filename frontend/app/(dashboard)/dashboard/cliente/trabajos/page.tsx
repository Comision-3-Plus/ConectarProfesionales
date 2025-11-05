'use client';

/**
 * Página de Trabajos del Cliente - REFACTORIZADA
 * Golden Path: composition pattern, < 50 líneas
 */

import { TrabajosList } from '@/components/features/jobs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EstadoTrabajo } from '@/types/forms/jobs';

export default function TrabajosClientePage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis Trabajos</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus trabajos activos y revisa el historial
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Trabajos Activos</h2>
        <TrabajosList
          estadoFilter={EstadoTrabajo.EN_PROCESO}
          emptyMessage="No tienes trabajos activos"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Historial</h2>
        <TrabajosList
          estadoFilter={EstadoTrabajo.APROBADO}
          emptyMessage="No tienes trabajos completados"
        />
      </div>

      <div className="text-center">
        <Link href="/dashboard/cliente/ofertas">
          <Button>Ver Ofertas</Button>
        </Link>
      </div>
    </div>
  );
}