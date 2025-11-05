'use client';

/**
 * Página de lista de trabajos - REFACTORIZADA
 * Golden Path: composition pattern, < 50 líneas
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase } from 'lucide-react';
import { TrabajosList } from '@/components/features/jobs';
import { EstadoTrabajo } from '@/types/forms/jobs';

export default function TrabajosPage() {
  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase className="h-8 w-8" />
          Mis Trabajos
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona todos tus trabajos activos y completados
        </p>
      </div>

      <Tabs defaultValue="activos">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="completados">Completados</TabsTrigger>
          <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
          <TabsTrigger value="todos">Todos</TabsTrigger>
        </TabsList>
        <TabsContent value="activos" className="mt-6">
          <TrabajosList
            estadoFilter={EstadoTrabajo.EN_PROCESO}
            emptyMessage="No tienes trabajos activos"
          />
        </TabsContent>
        <TabsContent value="completados" className="mt-6">
          <TrabajosList
            estadoFilter={EstadoTrabajo.APROBADO}
            emptyMessage="No tienes trabajos completados"
          />
        </TabsContent>
        <TabsContent value="cancelados" className="mt-6">
          <TrabajosList
            estadoFilter={EstadoTrabajo.CANCELADO}
            emptyMessage="No tienes trabajos cancelados"
          />
        </TabsContent>
        <TabsContent value="todos" className="mt-6">
          <TrabajosList emptyMessage="No tienes trabajos" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
