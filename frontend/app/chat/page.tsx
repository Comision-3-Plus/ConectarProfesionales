"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search,
  MessageSquare,
  Circle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Chat {
  id: string
  otroUsuarioNombre: string
  otroUsuarioAvatar?: string
  ultimoMensaje: string
  fechaUltimoMensaje: string
  mensajesNoLeidos: number
  esProfesional: boolean
}

const mockChats: Chat[] = [
  {
    id: "chat-1",
    otroUsuarioNombre: "María González",
    otroUsuarioAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    ultimoMensaje: "Perfecto, entonces quedamos para mañana a las 10",
    fechaUltimoMensaje: "2024-10-24T14:30:00",
    mensajesNoLeidos: 2,
    esProfesional: false
  },
  {
    id: "chat-2",
    otroUsuarioNombre: "Juan Pérez (Plomero)",
    otroUsuarioAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
    ultimoMensaje: "Te envié la oferta formal. Revisala y me avisas",
    fechaUltimoMensaje: "2024-10-24T12:15:00",
    mensajesNoLeidos: 0,
    esProfesional: true
  },
  {
    id: "chat-3",
    otroUsuarioNombre: "Carlos Rodríguez",
    otroUsuarioAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    ultimoMensaje: "Gracias por el trabajo! Quedó excelente",
    fechaUltimoMensaje: "2024-10-23T18:45:00",
    mensajesNoLeidos: 0,
    esProfesional: false
  },
  {
    id: "chat-4",
    otroUsuarioNombre: "Ana Martínez (Electricista)",
    otroUsuarioAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    ultimoMensaje: "Necesito más detalles sobre la instalación",
    fechaUltimoMensaje: "2024-10-22T10:20:00",
    mensajesNoLeidos: 1,
    esProfesional: true
  }
]

export default function ChatListPage() {
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // TODO: Cargar chats desde Firebase
    // const unsubscribe = onSnapshot(
    //   collection(db, 'chats'),
    //   where('participantes', 'array-contains', currentUserId),
    //   (snapshot) => {
    //     const chatsData = snapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data()
    //     }))
    //     setChats(chatsData)
    //   }
    // )
    // return () => unsubscribe()
  }, [])

  const chatsFiltrados = searchQuery
    ? chats.filter(chat => 
        chat.otroUsuarioNombre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    const ahora = new Date()
    const diff = ahora.getTime() - date.getTime()
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return "Ahora"
    if (minutos < 60) return `Hace ${minutos}m`
    if (horas < 24) return `Hace ${horas}h`
    if (dias < 7) return `Hace ${dias}d`
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mensajes</h1>
        <p className="text-muted-foreground">
          Gestiona tus conversaciones con clientes y profesionales
        </p>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de chats */}
      {chatsFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No se encontraron conversaciones" : "No tienes conversaciones aún"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Intenta con otro término de búsqueda"
                : "Cuando contactes a un profesional o un cliente te contacte, aparecerá aquí"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chatsFiltrados.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={chat.otroUsuarioAvatar || "/default-avatar.png"}
                        alt={chat.otroUsuarioNombre}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      {chat.mensajesNoLeidos > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                          {chat.mensajesNoLeidos}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {chat.otroUsuarioNombre}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatFecha(chat.fechaUltimoMensaje)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate flex-1 ${
                          chat.mensajesNoLeidos > 0 
                            ? "font-semibold text-foreground" 
                            : "text-muted-foreground"
                        }`}>
                          {chat.ultimoMensaje}
                        </p>
                        {chat.mensajesNoLeidos > 0 && (
                          <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{chats.length}</div>
            <p className="text-sm text-muted-foreground">Conversaciones totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">
              {chats.reduce((sum, chat) => sum + chat.mensajesNoLeidos, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Mensajes sin leer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">
              {chats.filter(c => c.esProfesional).length}
            </div>
            <p className="text-sm text-muted-foreground">Con profesionales</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
