"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Clock, CheckCircle2, XCircle, DollarSign, User, Calendar, Loader2 } from "lucide-react"
import { professionalService } from "@/lib/services/professionalService"

type EstadoTrabajo = "PENDIENTE_PAGO" | "PAGADO_EN_ESCROW" | "LIBERADO" | "CANCELADO"

const estadoColors = {
  PENDIENTE_PAGO: "bg-yellow-500",
  PAGADO_EN_ESCROW: "bg-blue-500",
  LIBERADO: "bg-green-500",
  CANCELADO: "bg-red-500"
}

const estadoLabels = {
  PENDIENTE_PAGO: "Esperando Pago",
  PAGADO_EN_ESCROW: "Pago en Escrow",
  LIBERADO: "Completado",
  CANCELADO: "Cancelado"
}

const estadoIcons = {
  PENDIENTE_PAGO: Clock,
  PAGADO_EN_ESCROW: DollarSign,
  LIBERADO: CheckCircle2,
  CANCELADO: XCircle
}

export default function TrabajosProfesionalPage() {
  // Query para obtener trabajos
  const { data: trabajos = [], isLoading } = useQuery({
    queryKey: ['professional-trabajos'],
    queryFn: professionalService.listTrabajos,
    staleTime: 30000,
  })

  const trabajosActivos = trabajos.filter((t: any) => 
    t.estado === "PENDIENTE_PAGO" || t.estado === "PAGADO_EN_ESCROW"
  )

  const trabajosFinalizados = trabajos.filter((t: any) => 
    t.estado === "LIBERADO"
  )

  const trabajosCancelados = trabajos.filter((t: any) => 
    t.estado === "CANCELADO"
  )

  const renderTrabajo = (trabajo: any) => {
    const Icon = estadoIcons[trabajo.estado as EstadoTrabajo]
    
    return (
      <Card key={trabajo.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg">{trabajo.cliente_nombre || "Cliente"}</CardTitle>
                <Badge className={estadoColors[trabajo.estado as EstadoTrabajo]}>
                  <Icon className="h-3 w-3 mr-1" />
                  {estadoLabels[trabajo.estado as EstadoTrabajo]}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Inicio: {new Date(trabajo.fecha_inicio).toLocaleDateString()}
                {trabajo.fecha_finalizacion && (
                  <> • Fin: {new Date(trabajo.fecha_finalizacion).toLocaleDateString()}</>
                )}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${trabajo.monto?.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Monto total</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Descripción:</h4>
            <p className="text-muted-foreground">{trabajo.descripcion}</p>
          </div>

          {trabajo.estado === "PENDIENTE_PAGO" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Esperando Pago del Cliente</p>
                  <p className="text-sm text-yellow-700">
                    El cliente aceptó tu oferta. Podrás comenzar el trabajo cuando realice el pago.
                  </p>
                </div>
              </div>
            </div>
          )}

          {trabajo.estado === "PAGADO_EN_ESCROW" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Pago Asegurado en Escrow</p>
                  <p className="text-sm text-blue-700">
                    El dinero está retenido de forma segura. Completa el trabajo y el cliente liberará el pago.
                  </p>
                </div>
              </div>
            </div>
          )}

          {trabajo.estado === "LIBERADO" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Trabajo Completado</p>
                  <p className="text-sm text-green-700">
                    El pago fue liberado y transferido a tu cuenta. ¡Excelente trabajo!
                  </p>
                  {trabajo.fecha_finalizacion && (
                    <p className="text-xs text-green-600 mt-1">
                      Finalizado el {new Date(trabajo.fecha_finalizacion).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {trabajo.estado === "CANCELADO" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Trabajo Cancelado</p>
                  <p className="text-sm text-red-700">
                    Este trabajo fue cancelado. El pago fue reembolsado al cliente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Trabajos</h1>
        <p className="text-muted-foreground">
          Gestiona tus trabajos activos y completados
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trabajos Activos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trabajosActivos.length}</div>
            <p className="text-xs text-muted-foreground">En progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trabajosFinalizados.length}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${trabajosFinalizados.reduce((sum: number, t: any) => sum + (t.monto || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">De trabajos completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activos">
            Activos ({trabajosActivos.length})
          </TabsTrigger>
          <TabsTrigger value="finalizados">
            Completados ({trabajosFinalizados.length})
          </TabsTrigger>
          <TabsTrigger value="cancelados">
            Cancelados ({trabajosCancelados.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="space-y-4">
          {trabajosActivos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes trabajos activos</h3>
                <p className="text-muted-foreground">
                  Los trabajos aparecerán aquí cuando los clientes acepten tus ofertas
                </p>
              </CardContent>
            </Card>
          ) : (
            trabajosActivos.map(renderTrabajo)
          )}
        </TabsContent>

        <TabsContent value="finalizados" className="space-y-4">
          {trabajosFinalizados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes trabajos completados aún</h3>
                <p className="text-muted-foreground">
                  Los trabajos finalizados aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            trabajosFinalizados.map(renderTrabajo)
          )}
        </TabsContent>

        <TabsContent value="cancelados" className="space-y-4">
          {trabajosCancelados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes trabajos cancelados</h3>
                <p className="text-muted-foreground">
                  ¡Excelente! Mantén tu historial limpio
                </p>
              </CardContent>
            </Card>
          ) : (
            trabajosCancelados.map(renderTrabajo)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
