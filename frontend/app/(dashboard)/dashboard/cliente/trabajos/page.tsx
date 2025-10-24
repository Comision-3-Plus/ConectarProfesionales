"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, Star, DollarSign, User, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { clienteService } from "@/lib/services/clienteService"
import { toast } from "sonner"

type EstadoTrabajo = "PENDIENTE_PAGO" | "PAGADO_EN_ESCROW" | "LIBERADO" | "CANCELADO"

export default function TrabajosPage() {
  const queryClient = useQueryClient()
  const [selectedTrabajo, setSelectedTrabajo] = useState<any | null>(null)
  const [action, setAction] = useState<"finalizar" | "cancelar" | "resenar" | null>(null)
  const [resenaData, setResenaData] = useState({ rating: 5, texto: "" })

  // Query para obtener trabajos
  const { data: trabajos = [], isLoading } = useQuery({
    queryKey: ['cliente-trabajos'],
    queryFn: clienteService.listTrabajos,
    staleTime: 30000,
  })

  // Mutation para finalizar trabajo
  const finalizarMutation = useMutation({
    mutationFn: (trabajoId: string) => clienteService.finalizarTrabajo(trabajoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-trabajos'] })
      toast.success('Trabajo finalizado y pago liberado')
      setAction(null)
      setSelectedTrabajo(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al finalizar trabajo')
    },
  })

  // Mutation para cancelar trabajo
  const cancelarMutation = useMutation({
    mutationFn: (trabajoId: string) => clienteService.cancelarTrabajo(trabajoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-trabajos'] })
      toast.success('Trabajo cancelado. Se procesará el reembolso')
      setAction(null)
      setSelectedTrabajo(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al cancelar trabajo')
    },
  })

  // Mutation para crear reseña
  const resenaMutation = useMutation({
    mutationFn: ({ trabajoId, data }: { trabajoId: string; data: any }) =>
      clienteService.crearResena(trabajoId, data),
    onSuccess: () => {
      toast.success('Reseña publicada exitosamente')
      setAction(null)
      setSelectedTrabajo(null)
      setResenaData({ rating: 5, texto: "" })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al publicar reseña')
    },
  })

  const handleFinalizarTrabajo = (trabajo: any) => {
    setSelectedTrabajo(trabajo)
    setAction("finalizar")
  }

  const handleCancelarTrabajo = (trabajo: any) => {
    setSelectedTrabajo(trabajo)
    setAction("cancelar")
  }

  const handleCrearResena = (trabajo: any) => {
    setSelectedTrabajo(trabajo)
    setAction("resenar")
  }

  const confirmAction = async () => {
    if (!selectedTrabajo) return

    if (action === "finalizar") {
      finalizarMutation.mutate(selectedTrabajo.id)
    } else if (action === "cancelar") {
      cancelarMutation.mutate(selectedTrabajo.id)
    } else if (action === "resenar") {
      resenaMutation.mutate({
        trabajoId: selectedTrabajo.id,
        data: {
          rating: resenaData.rating,
          comentario: resenaData.texto
        }
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE_PAGO":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="mr-1 h-3 w-3" />Pendiente de Pago</Badge>
      case "PAGADO_EN_ESCROW":
        return <Badge variant="outline" className="bg-blue-50"><Clock className="mr-1 h-3 w-3" />En Progreso</Badge>
      case "LIBERADO":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle2 className="mr-1 h-3 w-3" />Completado</Badge>
      case "CANCELADO":
      case "CANCELADO_REEMBOLSADO":
        return <Badge variant="outline" className="bg-red-50"><XCircle className="mr-1 h-3 w-3" />Cancelado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const isProcessing = finalizarMutation.isPending || cancelarMutation.isPending || resenaMutation.isPending

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const trabajosActivos = trabajos.filter((t: any) => 
    t.estado === "PENDIENTE_PAGO" || t.estado === "PAGADO_EN_ESCROW"
  )
  const trabajosFinalizados = trabajos.filter((t: any) => 
    t.estado === "LIBERADO" || t.estado === "CANCELADO"
  )

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis Trabajos</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus trabajos activos y revisa el historial
        </p>
      </div>

      {trabajosActivos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Trabajos Activos</h2>
          <div className="grid gap-4">
            {trabajosActivos.map((trabajo: any) => (
              <Card key={trabajo.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{trabajo.descripcion || "Trabajo"}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {trabajo.profesional_nombre || "Profesional"}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(trabajo.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(trabajo.estado)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monto total:</span>
                    <span className="text-2xl font-bold text-primary">${trabajo.monto?.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {trabajo.estado === "PENDIENTE_PAGO" && (
                      <Button variant="default" className="flex-1">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Completar Pago
                      </Button>
                    )}
                    {trabajo.estado === "PAGADO_EN_ESCROW" && (
                      <>
                        <Button onClick={() => handleFinalizarTrabajo(trabajo)} className="flex-1">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Finalizar y Liberar Pago
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleCancelarTrabajo(trabajo)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {trabajosFinalizados.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Historial</h2>
          <div className="grid gap-4">
            {trabajosFinalizados.map((trabajo: any) => (
              <Card key={trabajo.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{trabajo.descripcion || "Trabajo"}</CardTitle>
                      <CardDescription>
                        {trabajo.profesional_nombre || "Profesional"} • ${trabajo.monto?.toLocaleString()}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(trabajo.estado)}
                  </div>
                </CardHeader>
                {trabajo.estado === "LIBERADO" && (
                  <CardContent>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCrearResena(trabajo)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Dejar Reseña
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {trabajos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">No tienes trabajos aún</h3>
            <p className="text-muted-foreground text-center mb-4">
              Acepta una oferta para comenzar un trabajo
            </p>
            <Link href="/dashboard/cliente/ofertas">
              <Button>Ver Ofertas</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Dialog Finalizar */}
      <Dialog open={action === "finalizar"} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Trabajo</DialogTitle>
            <DialogDescription>
              ¿El trabajo se completó satisfactoriamente? Al finalizar, se liberará el pago al profesional.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedTrabajo && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Monto a liberar:</span>
                <span className="text-2xl font-bold text-primary">${selectedTrabajo.precio_final.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                El profesional recibirá el pago en su cuenta de MercadoPago.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={confirmAction} disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Finalizar y Liberar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Cancelar */}
      <Dialog open={action === "cancelar"} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Trabajo</DialogTitle>
            <DialogDescription>
              Se procesará un reembolso completo a tu cuenta. El trabajo se cancelará y el profesional será notificado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={isProcessing}>
              No Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmAction} disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Confirmar Cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reseña */}
      <Dialog open={action === "resenar"} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dejar Reseña</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia con {selectedTrabajo?.profesional_nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Calificación</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setResenaData(prev => ({ ...prev, rating }))}
                    className="text-3xl hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={rating <= resenaData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="texto">Comentario (opcional)</Label>
              <Textarea
                id="texto"
                placeholder="Describe tu experiencia..."
                value={resenaData.texto}
                onChange={(e) => setResenaData(prev => ({ ...prev, texto: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={confirmAction} disabled={isProcessing}>
              {isProcessing ? "Enviando..." : "Publicar Reseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
