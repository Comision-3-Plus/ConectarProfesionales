'use client';

/**
 * Página de Trabajos del Profesional - REFACTORIZADA
 * Golden Path: composition pattern, < 50 líneas
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrabajosList } from '@/components/features/jobs';
import { EstadoTrabajo } from '@/types/forms/jobs';
export default function TrabajosProfesionalPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Trabajos</h1>
        <p className="text-muted-foreground">
          Gestiona tus trabajos activos y completados
        </p>
      </div>

      <Tabs defaultValue="activos">
        <TabsList>
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="finalizados">Completados</TabsTrigger>
          <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
        </TabsList>
        <TabsContent value="activos" className="mt-6 space-y-4">
          <TrabajosList
            estadoFilter={EstadoTrabajo.EN_PROCESO}
            emptyMessage="No tienes trabajos activos. Los trabajos aparecerán aquí cuando los clientes acepten tus ofertas"
          />
        </TabsContent>
        <TabsContent value="finalizados" className="mt-6 space-y-4">
          <TrabajosList
            estadoFilter={EstadoTrabajo.APROBADO}
            emptyMessage="No tienes trabajos completados aún"
          />
        </TabsContent>
        <TabsContent value="cancelados" className="mt-6 space-y-4">
          <TrabajosList
            estadoFilter={EstadoTrabajo.CANCELADO}
            emptyMessage="No tienes trabajos cancelados. ¡Excelente! Mantén tu historial limpio"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
