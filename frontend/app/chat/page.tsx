"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { MessageSquare, Sparkles, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { ChatList } from "@/components/chat/ChatList"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ChatListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>("")
  const [selectedUserPhoto, setSelectedUserPhoto] = useState<string | undefined>()
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatList, setShowChatList] = useState(true)

  // Detectar vista móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSelectChat = (chatId: string, userName: string, userPhoto?: string) => {
    console.log('📩 Chat seleccionado:', { chatId, userName, userPhoto });
    setSelectedChatId(chatId)
    setSelectedUserName(userName)
    setSelectedUserPhoto(userPhoto)
    // En móvil, ocultar lista al seleccionar chat
    if (isMobileView) {
      setShowChatList(false)
    }
  }

  const handleBackToList = () => {
    setShowChatList(true)
    setSelectedChatId(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full shadow-2xl border-2">
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Mensajería Instantánea</h3>
            <p className="text-muted-foreground mb-6">
              Inicia sesión para acceder a tus conversaciones en tiempo real
            </p>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Iniciar Sesión
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Header mejorado */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Mensajes
                  <Sparkles className="h-5 w-5 text-orange-500" />
                </h1>
                <p className="text-xs text-muted-foreground">
                  {user.nombre} • Chat en tiempo real
                </p>
              </div>
            </div>
            
            {/* Botón volver en móvil cuando hay chat seleccionado */}
            {isMobileView && selectedChatId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToList}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className={cn(
          "grid gap-4 h-[calc(100vh-140px)]",
          isMobileView ? "grid-cols-1" : "lg:grid-cols-[380px,1fr]"
        )}>
          {/* Lista de chats */}
          <div className={cn(
            "transition-all duration-300",
            isMobileView && !showChatList && "hidden"
          )}>
            <Card className="overflow-hidden h-full shadow-xl border-2">
              <ChatList 
                onChatSelect={handleSelectChat}
                selectedChatId={selectedChatId || undefined}
              />
            </Card>
          </div>

          {/* Ventana de chat */}
          <div className={cn(
            "transition-all duration-300",
            isMobileView && showChatList && "hidden"
          )}>
            <Card className="overflow-hidden h-full shadow-xl border-2">
              {selectedChatId ? (
                <ChatWindow
                  chatId={selectedChatId}
                  otherUserName={selectedUserName}
                  otherUserPhoto={selectedUserPhoto}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-b from-muted/20 to-background">
                  <div className="relative">
                    {/* Efecto de fondo */}
                    <div className="absolute inset-0 blur-3xl opacity-20">
                      <div className="h-32 w-32 rounded-full bg-orange-500 animate-pulse" />
                    </div>
                    
                    {/* Icono principal */}
                    <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-6 shadow-lg border-2 border-orange-500/20">
                      <MessageSquare className="h-12 w-12 text-orange-500" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">
                    Selecciona una conversación
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Elige un chat existente de la lista o inicia una nueva conversación
                  </p>

                  {/* Stats decorativos */}
                  <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
                    <div className="p-4 rounded-xl bg-muted/50 border">
                      <div className="text-2xl font-bold text-primary">🔒</div>
                      <p className="text-xs text-muted-foreground mt-1">Seguro</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border">
                      <div className="text-2xl font-bold text-primary">⚡</div>
                      <p className="text-xs text-muted-foreground mt-1">Instantáneo</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border">
                      <div className="text-2xl font-bold text-primary">💬</div>
                      <p className="text-xs text-muted-foreground mt-1">En tiempo real</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
