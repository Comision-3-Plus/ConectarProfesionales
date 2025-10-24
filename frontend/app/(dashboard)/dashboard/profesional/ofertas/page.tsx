"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, XCircle, MessageSquare, Calendar, Loader2 } from "lucide-react"
import { professionalService } from "@/lib/services/professionalService"
import Link from "next/link"

type EstadoOferta = "OFERTADO" | "ACEPTADO" | "RECHAZADO" | "EXPIRADO"

const estadoColors = {
  OFERTADO: "bg-blue-500",
  ACEPTADO: "bg-green-500",
  RECHAZADO: "bg-red-500",
  EXPIRADO: "bg-gray-500"
}

const estadoLabels = {
  OFERTADO: "Pendiente",
  ACEPTADO: "Aceptada",
  RECHAZADO: "Rechazada",
  EXPIRADO: "Expirada"
}

const estadoIcons = {
  OFERTADO: Clock,
  ACEPTADO: CheckCircle2,
  RECHAZADO: XCircle,
  EXPIRADO: Clock
}

export default function OfertasProfesionalPage() {
  const [filtro, setFiltro] = useState<EstadoOferta | "TODOS">("TODOS")

  // Query para obtener ofertas
  const { data: ofertas = [], isLoading } = useQuery({
    queryKey: ['professional-ofertas'],
    queryFn: professionalService.listOfertas,
    staleTime: 30000,
  })

  const ofertasFiltradas = filtro === "TODOS" 
    ? ofertas 
    : ofertas.filter((o: any) => o.estado === filtro)

  const contadores = {
    TODOS: ofertas.length,
    OFERTADO: ofertas.filter((o: any) => o.estado === "OFERTADO").length,
    ACEPTADO: ofertas.filter((o: any) => o.estado === "ACEPTADO").length,
    RECHAZADO: ofertas.filter((o: any) => o.estado === "RECHAZADO").length,
    EXPIRADO: ofertas.filter((o: any) => o.estado === "EXPIRADO").length
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
        <h1 className="text-3xl font-bold">Mis Ofertas Enviadas</h1>
        <p className="text-muted-foreground">
          Ofertas que has enviado a tus clientes
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filtro === "TODOS" ? "default" : "outline"}
          onClick={() => setFiltro("TODOS")}
        >
          Todas ({contadores.TODOS})
        </Button>
        <Button
          variant={filtro === "OFERTADO" ? "default" : "outline"}
          onClick={() => setFiltro("OFERTADO")}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pendientes ({contadores.OFERTADO})
        </Button>
        <Button
          variant={filtro === "ACEPTADO" ? "default" : "outline"}
          onClick={() => setFiltro("ACEPTADO")}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Aceptadas ({contadores.ACEPTADO})
        </Button>
        <Button
          variant={filtro === "RECHAZADO" ? "default" : "outline"}
          onClick={() => setFiltro("RECHAZADO")}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Rechazadas ({contadores.RECHAZADO})
        </Button>
      </div>

      {/* Lista de ofertas */}
      {ofertasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filtro === "TODOS" 
                ? "No has enviado ofertas aún"
                : `No tienes ofertas ${filtro === "TODOS" ? "" : estadoLabels[filtro].toLowerCase()}`}
            </h3>
            <p className="text-muted-foreground mb-6">
              Cuando chatees con clientes, puedes enviarles ofertas formales
            </p>
            <Link href="/chat">
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Ir a Mensajes
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ofertasFiltradas.map((oferta: any) => {
            const Icon = estadoIcons[oferta.estado as EstadoOferta]
            return (
              <Card key={oferta.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          Oferta para {oferta.cliente_nombre || "Cliente"}
                        </CardTitle>
                        <Badge className={estadoColors[oferta.estado as EstadoOferta]}>
                          <Icon className="h-3 w-3 mr-1" />
                          {estadoLabels[oferta.estado as EstadoOferta]}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Enviada el {new Date(oferta.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${oferta.precio?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Descripción del trabajo:</h4>
                    <p className="text-muted-foreground">{oferta.descripcion}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/chat/${oferta.chat_id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ver Chat
                      </Button>
                    </Link>

                    {oferta.estado === "ACEPTADO" && oferta.trabajo_id && (
                      <Link href={`/dashboard/profesional/trabajos`} className="flex-1">
                        <Button className="w-full">
                          Ver Trabajo
                        </Button>
                      </Link>
                    )}

                    {oferta.estado === "RECHAZADO" && (
                      <Link href={`/chat/${oferta.chat_id}`} className="flex-1">
                        <Button variant="default" className="w-full">
                          Enviar Nueva Oferta
                        </Button>
                      </Link>
                    )}
                  </div>

                  {oferta.estado === "ACEPTADO" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">Oferta Aceptada</p>
                          <p className="text-sm text-green-700">
                            El cliente aceptó tu oferta. Espera a que realice el pago para comenzar el trabajo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
