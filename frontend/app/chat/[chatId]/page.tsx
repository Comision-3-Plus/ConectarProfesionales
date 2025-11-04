"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { ofertasService, type Oferta } from "@/lib/services/ofertasService"

export default function ChatDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const chatId = params.chatId as string
  
  const { user } = useAuthStore()
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [isLoadingOfertas, setIsLoadingOfertas] = useState(true)
  
  // Estados para crear oferta (solo profesionales)
  const [showCrearOferta, setShowCrearOferta] = useState(false)
  const [ofertaForm, setOfertaForm] = useState({
    descripcion: "",
    precio: ""
  })
  const [isCreatingOferta, setIsCreatingOferta] = useState(false)

  // Obtener datos del otro usuario desde searchParams
  const otherUserName = searchParams.get('name') || 'Usuario'
  const otherUserPhoto = searchParams.get('photo') || undefined

  useEffect(() => {
    // Cargar ofertas asociadas a este chat
    const loadOfertas = async () => {
      if (!user || !chatId) return
      
      try {
        setIsLoadingOfertas(true)
        const data = await ofertasService.getOfertasByChat(chatId)
        setOfertas(data)
      } catch (error) {
        console.error('Error al cargar ofertas:', error)
        // No mostrar error si es 404 (endpoint no existe aún)
        setOfertas([])
      } finally {
        setIsLoadingOfertas(false)
      }
    }

    loadOfertas()
  }, [chatId, user])

  const handleCrearOferta = async () => {
    if (!ofertaForm.descripcion.trim() || !ofertaForm.precio) {
      toast.error("Completa todos los campos")
      return
    }

    if (!user) {
      toast.error("Debes iniciar sesión")
      return
    }

    const precio = parseFloat(ofertaForm.precio)
    if (isNaN(precio) || precio <= 0) {
      toast.error("El precio debe ser mayor a 0")
      return
    }

    setIsCreatingOferta(true)
    try {
      // Obtener cliente_id del searchParams o del chat
      const clienteId = searchParams.get('cliente_id') || ''
      
      const nuevaOferta = await ofertasService.createOferta({
        cliente_id: clienteId,
        chat_id: chatId,
        descripcion: ofertaForm.descripcion,
        precio_final: precio
      })
      
      setOfertas([...ofertas, nuevaOferta])

      toast.success("✅ Oferta enviada correctamente")
      setShowCrearOferta(false)
      setOfertaForm({ descripcion: "", precio: "" })
    } catch (error: any) {
      console.error('Error al crear oferta:', error)
      toast.error(error.message || "No se pudo enviar la oferta")
    } finally {
      setIsCreatingOferta(false)
    }
  }

  const handleAceptarOferta = async (ofertaId: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión")
      return
    }

    try {
      const response = await ofertasService.acceptOferta(ofertaId)
      
      toast.success("✅ Oferta aceptada - Redirigiendo a MercadoPago...", {
        description: "Procede al pago para confirmar el trabajo"
      })
      
      // Actualizar estado localmente
      setOfertas(ofertas.map((o: Oferta) => 
        o.id === ofertaId ? { ...o, estado: "ACEPTADO" as const } : o
      ))
      
      // Redirigir a MercadoPago después de 2 segundos
      if (response.payment_url) {
        setTimeout(() => {
          window.location.href = response.payment_url
        }, 2000)
      }
    } catch (error: any) {
      console.error('Error al aceptar oferta:', error)
      toast.error(error.message || "No se pudo aceptar la oferta")
    }
  }

  const handleRechazarOferta = async (ofertaId: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión")
      return
    }

    try {
      await ofertasService.rejectOferta(ofertaId)

      setOfertas(ofertas.map((o: Oferta) => 
        o.id === ofertaId ? { ...o, estado: "RECHAZADO" as const } : o
      ))

      toast.success("Oferta rechazada")
    } catch (error: any) {
      console.error('Error al rechazar oferta:', error)
      toast.error(error.message || "No se pudo rechazar la oferta")
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Debes iniciar sesión para acceder al chat</p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const esProfesional = user.rol === 'PROFESSIONAL'

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-4">
        <Link href="/chat">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a mensajes
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ventana de chat - 2 columnas en desktop */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-200px)] lg:h-[700px]">
            <ChatWindow
              chatId={chatId}
              otherUserName={otherUserName}
              otherUserPhoto={otherUserPhoto}
            />
          </Card>
        </div>

        {/* Panel lateral - Ofertas y acciones - 1 columna en desktop */}
        <div className="space-y-4">
          {/* Botón para crear oferta (solo profesionales) */}
          {esProfesional && (
            <Button 
              onClick={() => setShowCrearOferta(true)} 
              className="w-full"
              size="lg"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Enviar Oferta Formal
            </Button>
          )}

          {/* Lista de ofertas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ofertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOfertas ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : ofertas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No hay ofertas aún</p>
                  {esProfesional && (
                    <p className="mt-2 text-xs">
                      Crea una oferta formal para este cliente
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {ofertas.map((oferta: Oferta) => (
                    <Card 
                      key={oferta.id} 
                      className={`border-2 ${
                        oferta.estado === "OFERTADO" ? "border-blue-300 bg-blue-50/50" :
                        oferta.estado === "ACEPTADO" ? "border-green-300 bg-green-50/50" :
                        oferta.estado === "PAGADO" ? "border-purple-300 bg-purple-50/50" :
                        "border-red-300 bg-red-50/50"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={
                            oferta.estado === "OFERTADO" ? "bg-blue-500" :
                            oferta.estado === "ACEPTADO" ? "bg-green-500" : 
                            oferta.estado === "PAGADO" ? "bg-purple-500" : "bg-red-500"
                          }>
                            {oferta.estado === "OFERTADO" ? "Pendiente" :
                             oferta.estado === "ACEPTADO" ? "Aceptada - Pendiente Pago" : 
                             oferta.estado === "PAGADO" ? "Pagada" : "Rechazada"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(oferta.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{oferta.descripcion}</p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-green-600">
                            ${Number(oferta.precio_final).toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Botones solo para clientes y ofertas pendientes */}
                        {!esProfesional && oferta.estado === "OFERTADO" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleRechazarOferta(oferta.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAceptarOferta(oferta.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aceptar y Pagar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog crear oferta */}
      <Dialog open={showCrearOferta} onOpenChange={setShowCrearOferta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Oferta Formal</DialogTitle>
            <DialogDescription>
              Crea una oferta formal para este cliente. Incluye una descripción detallada del trabajo y el precio total.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
              <Textarea
                id="descripcion"
                placeholder="Ejemplo: Instalación de cañerías en cocina (5 metros lineales). Incluye materiales, mano de obra y garantía de 6 meses."
                rows={5}
                value={ofertaForm.descripcion}
                onChange={(e) => setOfertaForm({ ...ofertaForm, descripcion: e.target.value })}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {ofertaForm.descripcion.length}/500 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio Total ($) *</Label>
              <Input
                id="precio"
                type="number"
                placeholder="15000"
                min="0"
                step="0.01"
                value={ofertaForm.precio}
                onChange={(e) => setOfertaForm({ ...ofertaForm, precio: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                El cliente pagará mediante MercadoPago
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCrearOferta(false)}
              disabled={isCreatingOferta}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCrearOferta}
              disabled={isCreatingOferta || !ofertaForm.descripcion.trim() || !ofertaForm.precio}
            >
              {isCreatingOferta ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Oferta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
