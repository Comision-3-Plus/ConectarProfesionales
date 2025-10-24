"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Send,
  ArrowLeft,
  MoreVertical,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Mensaje {
  id: string
  texto: string
  autorId: string
  autorNombre: string
  timestamp: string
  leido: boolean
}

interface Oferta {
  id: string
  profesionalId: string
  descripcion: string
  precio: number
  estado: "OFERTADO" | "ACEPTADO" | "RECHAZADO"
  fechaCreacion: string
}

interface ChatData {
  id: string
  otroUsuarioId: string
  otroUsuarioNombre: string
  otroUsuarioAvatar?: string
  esProfesional: boolean
}

const mockChat: ChatData = {
  id: "chat-1",
  otroUsuarioId: "user-2",
  otroUsuarioNombre: "Juan Pérez (Plomero)",
  otroUsuarioAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
  esProfesional: true
}

const mockMensajes: Mensaje[] = [
  {
    id: "1",
    texto: "Hola! Vi tu perfil y me interesa tu oferta de plomería",
    autorId: "current-user",
    autorNombre: "Tú",
    timestamp: "2024-10-24T10:00:00",
    leido: true
  },
  {
    id: "2",
    texto: "Hola! Con gusto. Contame qué necesitás y te paso presupuesto",
    autorId: "user-2",
    autorNombre: "Juan Pérez",
    timestamp: "2024-10-24T10:05:00",
    leido: true
  },
  {
    id: "3",
    texto: "Necesito instalar cañerías nuevas en la cocina. Aproximadamente 5 metros lineales.",
    autorId: "current-user",
    autorNombre: "Tú",
    timestamp: "2024-10-24T10:10:00",
    leido: true
  }
]

const mockOfertas: Oferta[] = [
  {
    id: "oferta-1",
    profesionalId: "user-2",
    descripcion: "Instalación completa de cañerías en cocina (5 metros). Incluye materiales y mano de obra.",
    precio: 15000,
    estado: "OFERTADO",
    fechaCreacion: "2024-10-24T10:15:00"
  }
]

export default function ChatDetailPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const { toast } = useToast()
  
  const [chat, setChat] = useState<ChatData>(mockChat)
  const [mensajes, setMensajes] = useState<Mensaje[]>(mockMensajes)
  const [ofertas, setOfertas] = useState<Oferta[]>(mockOfertas)
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [enviando, setEnviando] = useState(false)
  
  // Estados para crear oferta (solo profesionales)
  const [showCrearOferta, setShowCrearOferta] = useState(false)
  const [ofertaForm, setOfertaForm] = useState({
    descripcion: "",
    precio: ""
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = "current-user" // TODO: Obtener del contexto de autenticación

  useEffect(() => {
    // TODO: Cargar chat y mensajes desde Firebase
    // const unsubscribe = onSnapshot(
    //   doc(db, 'chats', chatId),
    //   (doc) => {
    //     setChat(doc.data())
    //   }
    // )

    // const unsubscribeMensajes = onSnapshot(
    //   collection(db, 'chats', chatId, 'mensajes'),
    //   orderBy('timestamp', 'asc'),
    //   (snapshot) => {
    //     setMensajes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    //   }
    // )

    // return () => {
    //   unsubscribe()
    //   unsubscribeMensajes()
    // }
  }, [chatId])

  useEffect(() => {
    // Scroll al último mensaje
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return

    setEnviando(true)
    try {
      // TODO: Enviar mensaje a Firebase
      // await addDoc(collection(db, 'chats', chatId, 'mensajes'), {
      //   texto: nuevoMensaje,
      //   autorId: currentUserId,
      //   autorNombre: 'Tú',
      //   timestamp: serverTimestamp(),
      //   leido: false
      // })

      // Mock: agregar mensaje localmente
      const nuevoMensajeObj: Mensaje = {
        id: Date.now().toString(),
        texto: nuevoMensaje,
        autorId: currentUserId,
        autorNombre: "Tú",
        timestamp: new Date().toISOString(),
        leido: false
      }
      setMensajes([...mensajes, nuevoMensajeObj])
      setNuevoMensaje("")
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleCrearOferta = async () => {
    if (!ofertaForm.descripcion.trim() || !ofertaForm.precio) {
      toast({
        title: "❌ Error",
        description: "Completa todos los campos",
        variant: "destructive"
      })
      return
    }

    try {
      // TODO: Crear oferta en backend
      // await fetchAPI('/api/v1/professional/ofertas', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     chat_id: chatId,
      //     descripcion: ofertaForm.descripcion,
      //     precio: parseFloat(ofertaForm.precio)
      //   })
      // })

      const nuevaOferta: Oferta = {
        id: Date.now().toString(),
        profesionalId: currentUserId,
        descripcion: ofertaForm.descripcion,
        precio: parseFloat(ofertaForm.precio),
        estado: "OFERTADO",
        fechaCreacion: new Date().toISOString()
      }
      setOfertas([...ofertas, nuevaOferta])

      toast({
        title: "✅ Oferta enviada",
        description: "El cliente recibirá tu oferta formal"
      })

      setShowCrearOferta(false)
      setOfertaForm({ descripcion: "", precio: "" })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo enviar la oferta",
        variant: "destructive"
      })
    }
  }

  const handleAceptarOferta = async (ofertaId: string) => {
    try {
      // TODO: Aceptar oferta en backend
      // const response = await fetchAPI(`/api/v1/cliente/ofertas/${ofertaId}/accept`, {
      //   method: 'POST'
      // })
      // window.location.href = response.payment_url

      toast({
        title: "🚧 En desarrollo",
        description: "Serás redirigido a MercadoPago para pagar"
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo aceptar la oferta",
        variant: "destructive"
      })
    }
  }

  const handleRechazarOferta = async (ofertaId: string) => {
    try {
      // TODO: Rechazar oferta en backend
      // await fetchAPI(`/api/v1/cliente/ofertas/${ofertaId}/reject`, {
      //   method: 'POST'
      // })

      setOfertas(ofertas.map(o => 
        o.id === ofertaId ? { ...o, estado: "RECHAZADO" as const } : o
      ))

      toast({
        title: "Oferta rechazada",
        description: "Se notificó al profesional"
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo rechazar la oferta",
        variant: "destructive"
      })
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const esMiMensaje = (mensaje: Mensaje) => mensaje.autorId === currentUserId

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Image
              src={chat.otroUsuarioAvatar || "/default-avatar.png"}
              alt={chat.otroUsuarioNombre}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <CardTitle className="text-lg">{chat.otroUsuarioNombre}</CardTitle>
              {chat.esProfesional && (
                <p className="text-sm text-muted-foreground">Profesional verificado</p>
              )}
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Área de mensajes */}
      <Card className="mb-4 h-[500px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${esMiMensaje(mensaje) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  esMiMensaje(mensaje)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{mensaje.texto}</p>
                <p className={`text-xs mt-1 ${
                  esMiMensaje(mensaje) ? "text-blue-100" : "text-gray-500"
                }`}>
                  {formatTime(mensaje.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Ofertas integradas en el chat */}
          {ofertas.map((oferta) => (
            <div key={oferta.id} className="my-4">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5" />
                    Oferta Formal
                    <Badge className={
                      oferta.estado === "OFERTADO" ? "bg-blue-500" :
                      oferta.estado === "ACEPTADO" ? "bg-green-500" : "bg-red-500"
                    }>
                      {oferta.estado === "OFERTADO" ? "Pendiente" :
                       oferta.estado === "ACEPTADO" ? "Aceptada" : "Rechazada"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{oferta.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        ${oferta.precio.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enviada el {new Date(oferta.fechaCreacion).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Botones solo para clientes y ofertas pendientes */}
                    {!chat.esProfesional && oferta.estado === "OFERTADO" && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRechazarOferta(oferta.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAceptarOferta(oferta.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Aceptar y Pagar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input de mensaje */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleEnviarMensaje()}
            />
            <Button onClick={handleEnviarMensaje} disabled={enviando || !nuevoMensaje.trim()}>
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Botón para crear oferta (solo profesionales) */}
      {chat.esProfesional && (
        <Button onClick={() => setShowCrearOferta(true)} className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Enviar Oferta Formal
        </Button>
      )}

      {/* Dialog crear oferta */}
      <Dialog open={showCrearOferta} onOpenChange={setShowCrearOferta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Oferta Formal</DialogTitle>
            <DialogDescription>
              Crea una oferta formal para este cliente. Incluye una descripción detallada y el precio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
              <Textarea
                id="descripcion"
                placeholder="Detalla qué incluye el trabajo, materiales, plazos, etc."
                rows={4}
                value={ofertaForm.descripcion}
                onChange={(e) => setOfertaForm({ ...ofertaForm, descripcion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio Total ($) *</Label>
              <Input
                id="precio"
                type="number"
                placeholder="15000"
                value={ofertaForm.precio}
                onChange={(e) => setOfertaForm({ ...ofertaForm, precio: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCrearOferta(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearOferta}>
              Enviar Oferta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
