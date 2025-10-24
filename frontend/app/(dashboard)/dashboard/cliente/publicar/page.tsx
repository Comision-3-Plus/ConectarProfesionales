"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function PublicarProyectoPage() {
  const router = useRouter()

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/dashboard/cliente">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>¿Cómo encontrar profesionales?</CardTitle>
          <CardDescription>
            Conecta directamente con profesionales calificados para tu proyecto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <div>
                <h4 className="font-semibold">Explora profesionales</h4>
                <p className="text-sm text-muted-foreground">
                  Busca por oficio, ubicación y calificaciones. Revisa perfiles, portfolios y reseñas.
                </p>
                <Link href="/browse" className="mt-2 inline-block">
                  <Button variant="outline" size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Explorar Profesionales
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <div>
                <h4 className="font-semibold">Inicia una conversación</h4>
                <p className="text-sm text-muted-foreground">
                  Contacta al profesional que te interese y describe tu proyecto en detalle.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <div>
                <h4 className="font-semibold">Recibe ofertas personalizadas</h4>
                <p className="text-sm text-muted-foreground">
                  Los profesionales te enviarán propuestas con precios y detalles del servicio.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                4
              </div>
              <div>
                <h4 className="font-semibold">Elige y paga de forma segura</h4>
                <p className="text-sm text-muted-foreground">
                  Acepta la oferta que prefieras. Tu dinero estará protegido hasta que el trabajo se complete.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <Link href="/browse">
              <Button size="lg">
                <Search className="mr-2 h-5 w-5" />
                Buscar Profesionales
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="outline">
                <MessageSquare className="mr-2 h-5 w-5" />
                Mis Conversaciones
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💡 Consejos para obtener mejores ofertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">✅ Sé específico</h4>
            <p className="text-sm text-muted-foreground">
              Describe claramente qué necesitas, materiales, plazos y presupuesto estimado
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">✅ Comparte fotos</h4>
            <p className="text-sm text-muted-foreground">
              Las imágenes ayudan a los profesionales a entender mejor el trabajo
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">✅ Revisa perfiles</h4>
            <p className="text-sm text-muted-foreground">
              Mira el portfolio y las reseñas antes de solicitar una oferta
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">✅ Compara ofertas</h4>
            <p className="text-sm text-muted-foreground">
              Contacta a varios profesionales para comparar precios y servicios
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
