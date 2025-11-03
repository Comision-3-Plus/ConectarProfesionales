"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Search,
  MessageSquare
} from "lucide-react"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatConversation } from "@/lib/services/chatService"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function ChatListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSelectConversation = (conversation: ChatConversation) => {
    router.push(`/chat/${conversation.id}`)
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inicia sesión para ver tus mensajes</h3>
            <p className="text-muted-foreground">
              Debes estar autenticado para acceder al chat
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-orange-500" />
          Mensajes
        </h1>
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

      {/* Lista de conversaciones con Firebase */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <ConversationList
            onSelectConversation={handleSelectConversation}
          />
        </CardContent>
      </Card>
    </div>
  )
}
