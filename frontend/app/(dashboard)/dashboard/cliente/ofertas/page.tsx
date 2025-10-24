"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, XCircle, Clock, DollarSign, User, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { clienteService } from "@/lib/services/clienteService"
import { toast } from "sonner"

export default function OfertasPage() {
  const queryClient = useQueryClient()
  const [selectedOferta, setSelectedOferta] = useState<any | null>(null)
  const [action, setAction] = useState<"accept" | "reject" | null>(null)

  // Query para obtener ofertas
  const { data: ofertas = [], isLoading } = useQuery({
    queryKey: ['cliente-ofertas'],
    queryFn: clienteService.listOfertas,
    staleTime: 30000,
  })

  // Mutation para aceptar oferta
  const acceptMutation = useMutation({
    mutationFn: (ofertaId: string) => clienteService.acceptOferta(ofertaId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-ofertas'] })
      toast.success('Oferta aceptada. Redirigiendo al pago...')
      // Redirigir a MercadoPago
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al aceptar oferta')
    },
  })

  // Mutation para rechazar oferta
  const rejectMutation = useMutation({
    mutationFn: (ofertaId: string) => clienteService.rejectOferta(ofertaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-ofertas'] })
      toast.success('Oferta rechazada')
      setAction(null)
      setSelectedOferta(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al rechazar oferta')
    },
  })

  const handleAcceptOferta = async (oferta: any) => {
    setSelectedOferta(oferta)
    setAction("accept")
  }

  const handleRejectOferta = async (oferta: any) => {
    setSelectedOferta(oferta)
    setAction("reject")
  }

  const confirmAction = async () => {
    if (!selectedOferta || !action) return

    if (action === "accept") {
      acceptMutation.mutate(selectedOferta.id)
    } else {
      rejectMutation.mutate(selectedOferta.id)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "OFERTADO":
        return <Badge variant="outline" className="bg-blue-50"><Clock className="mr-1 h-3 w-3" />Pendiente</Badge>
      case "ACEPTADO":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle2 className="mr-1 h-3 w-3" />Aceptada</Badge>
      case "RECHAZADO":
        return <Badge variant="outline" className="bg-red-50"><XCircle className="mr-1 h-3 w-3" />Rechazada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const isProcessing = acceptMutation.isPending || rejectMutation.isPending

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const ofertasPendientes = ofertas.filter((o: any) => o.estado === "OFERTADO")
  const ofertasResueltas = ofertas.filter((o: any) => o.estado !== "OFERTADO")

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ofertas Recibidas</h1>
        <p className="text-muted-foreground mt-2">
          Revisa y gestiona las propuestas de profesionales para tus proyectos
        </p>
      </div>

      {ofertasPendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pendientes de Revisión ({ofertasPendientes.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {ofertasPendientes.map((oferta: any) => (
              <Card key={oferta.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={oferta.profesional_avatar_url || undefined} />
                        <AvatarFallback>
                          {oferta.profesional_nombre?.[0] || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {oferta.profesional_nombre || "Profesional"}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>⭐ {oferta.profesional_rating?.toFixed(1) || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    {getEstadoBadge(oferta.estado)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <FileText className="h-4 w-4" />
                      <span>Propuesta</span>
                    </div>
                    <p className="text-sm">{oferta.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <DollarSign className="h-6 w-6" />
                    ${oferta.precio?.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Oferta recibida el {new Date(oferta.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/chat/${oferta.chat_id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Ver Perfil y Chat
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRejectOferta(oferta)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleAcceptOferta(oferta)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Aceptar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {ofertasResueltas.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Historial</h2>
          <div className="grid gap-4">
            {ofertasResueltas.map((oferta: any) => (
              <Card key={oferta.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={oferta.profesional_avatar_url || undefined} />
                        <AvatarFallback>
                          {oferta.profesional_nombre?.[0] || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {oferta.profesional_nombre || "Profesional"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">${oferta.precio?.toLocaleString()}</p>
                      </div>
                    </div>
                    {getEstadoBadge(oferta.estado)}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {ofertas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes ofertas aún</h3>
            <p className="text-muted-foreground text-center mb-4">
              Publica un proyecto para empezar a recibir propuestas de profesionales
            </p>
            <Link href="/dashboard/cliente/publicar">
              <Button>Publicar Proyecto</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Dialogs de confirmación */}
      <Dialog open={action === "accept"} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceptar Oferta</DialogTitle>
            <DialogDescription>
              Al aceptar esta oferta, se creará un trabajo y serás redirigido a MercadoPago para realizar el pago seguro.
              El dinero quedará en garantía hasta que el trabajo se complete.
            </DialogDescription>
          </DialogHeader>
          {selectedOferta && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Profesional:</span>
                <span>{selectedOferta.profesional_nombre} {selectedOferta.profesional_apellido}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Monto a pagar:</span>
                <span className="text-2xl font-bold text-primary">${selectedOferta.precio_final.toLocaleString()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={confirmAction} disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Continuar al Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={action === "reject"} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Oferta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas rechazar esta oferta? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmAction} disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Rechazar Oferta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
