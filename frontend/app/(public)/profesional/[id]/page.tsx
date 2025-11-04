"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Star,
  MapPin,
  DollarSign,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Award,
  Calendar,
  Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { publicService } from "@/lib/services/publicService"
import { chatService } from "@/lib/services/chatService"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"

export default function PerfilPublicoProfesionalPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const profesionalId = params.id as string
  const [isContacting, setIsContacting] = useState(false)

  // Query para obtener perfil público
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['public-professional-profile', profesionalId],
    queryFn: () => publicService.getProfessionalProfile(profesionalId),
    staleTime: 60000, // 1 minuto
  })

  // Query para obtener portfolio
  const { data: portfolio = [], isLoading: loadingPortfolio } = useQuery({
    queryKey: ['public-professional-portfolio', profesionalId],
    queryFn: () => publicService.getProfessionalPortfolio(profesionalId),
    staleTime: 60000,
  })

  const isLoading = loadingProfile || loadingPortfolio

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Profesional no encontrado</h3>
            <p className="text-muted-foreground mb-4">
              El perfil que buscas no existe o ha sido eliminado
            </p>
            <Link href="/explorar">
              <Button>Explorar Profesionales</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  const nivelColors = {
    BRONCE: "bg-orange-700 text-white",
    PLATA: "bg-gray-400 text-gray-900",
    ORO: "bg-yellow-500 text-gray-900",
    PLATINO: "bg-purple-600 text-white"
  }

  const serviciosInstantaneos = profile.servicios_instantaneos || []
  const resenas = profile.resenas || []

  /**
   * Función para manejar el contacto con el profesional
   * Crea o obtiene un chat room existente y redirige al usuario
   */
  const handleContactProfessional = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para contactar al profesional', {
        description: 'Te redirigiremos a la página de inicio de sesión',
      })
      router.push('/login')
      return
    }

    if (user.id === profesionalId) {
      toast.error('No puedes contactarte a ti mismo')
      return
    }

    setIsContacting(true)

    try {
      // Crear o obtener el chat room
      const chatId = await chatService.getOrCreateChatRoom(
        profesionalId,
        user.id,
        `${user.nombre} ${user.apellido}`,
        profile.nombre_completo
      )

      // Redirigir al chat
      toast.success('Redirigiendo al chat...')
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error('Error al crear chat:', error)
      toast.error('No se pudo iniciar el chat', {
        description: 'Por favor, intenta nuevamente más tarde',
      })
    } finally {
      setIsContacting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header del perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <Image
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.nombre_completo}`}
                alt={profile.nombre_completo}
                width={120}
                height={120}
                className="rounded-full"
              />
              {profile.kyc_estado === "APROBADO" && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold">{profile.nombre_completo}</h1>
                  {profile.nivel && (
                    <Badge className={nivelColors[profile.nivel as keyof typeof nivelColors]}>
                      <Award className="h-4 w-4 mr-1" />
                      {profile.nivel}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{profile.rating_promedio?.toFixed(1) || "N/A"}</span>
                    <span className="text-muted-foreground">
                      ({profile.total_resenas || 0} reseñas)
                    </span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {profile.trabajos_completados || 0} trabajos completados
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.oficios?.map((oficio: any) => (
                  <Badge key={oficio.id} variant="default">
                    {oficio.nombre}
                  </Badge>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tarifa por hora</p>
                    <p className="font-semibold">${profile.tarifa_por_hora?.toLocaleString() || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Radio de cobertura</p>
                    <p className="font-semibold">{profile.radio_cobertura_km || 0} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Miembro desde</p>
                    <p className="font-semibold">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de contactar - visible solo si está autenticado */}
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
                  onClick={handleContactProfessional}
                  disabled={isContacting}
                >
                  {isContacting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Iniciando chat...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Iniciar Chat
                    </>
                  )}
                </Button>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contactar Profesional
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Servicios instantáneos */}
      {serviciosInstantaneos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⚡ Servicios Instantáneos</CardTitle>
            <CardDescription>
              Servicios rápidos que este profesional puede realizar de inmediato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {serviciosInstantaneos.map((servicio: any) => (
                <Badge key={servicio.id} variant="outline" className="px-3 py-1">
                  {servicio.nombre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Portfolio y Reseñas */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="portfolio">
            Portfolio ({portfolio.length})
          </TabsTrigger>
          <TabsTrigger value="resenas">
            Reseñas ({resenas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          {portfolio.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Este profesional aún no ha agregado trabajos a su portfolio
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {portfolio.map((item: any) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    {item.imagenes_urls && item.imagenes_urls.length > 0 ? (
                      <Image
                        src={item.imagenes_urls[0]}
                        alt={item.titulo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Briefcase className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {item.imagenes_urls && item.imagenes_urls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        +{item.imagenes_urls.length - 1} fotos
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.titulo}</CardTitle>
                    <CardDescription>{item.descripcion}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resenas" className="space-y-4">
          {resenas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Este profesional aún no tiene reseñas
                </p>
              </CardContent>
            </Card>
          ) : (
            resenas.map((resena: any) => (
              <Card key={resena.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {resena.cliente_avatar_url && (
                      <Image
                        src={resena.cliente_avatar_url}
                        alt={resena.cliente_nombre}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{resena.cliente_nombre}</p>
                          {resena.trabajo_descripcion && (
                            <p className="text-sm text-muted-foreground">
                              {resena.trabajo_descripcion}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {renderStars(resena.rating)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(resena.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {resena.comentario && (
                        <p className="text-muted-foreground">{resena.comentario}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
