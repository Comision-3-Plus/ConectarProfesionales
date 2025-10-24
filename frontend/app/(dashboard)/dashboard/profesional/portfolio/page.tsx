"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Image as ImageIcon, Trash2, Loader2, Upload } from "lucide-react"
import { professionalService } from "@/lib/services/professionalService"
import { toast } from "sonner"
import Image from "next/image"

export default function PortfolioPage() {
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [imagenes, setImagenes] = useState<File[]>([])

  // Query para obtener portfolio
  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ['professional-portfolio'],
    queryFn: professionalService.listPortfolio,
    staleTime: 30000,
  })

  // Mutation para crear portfolio item
  const createMutation = useMutation({
    mutationFn: (data: { titulo: string; descripcion: string }) =>
      professionalService.createPortfolioItem(data),
    onSuccess: async (createdItem: any) => {
      // Si hay imágenes, subirlas
      if (imagenes.length > 0) {
        try {
          for (const imagen of imagenes) {
            await professionalService.uploadPortfolioImage(createdItem.id, imagen)
          }
        } catch (error) {
          toast.error('Error al subir imágenes')
        }
      }
      queryClient.invalidateQueries({ queryKey: ['professional-portfolio'] })
      toast.success('Item creado correctamente')
      setOpenDialog(false)
      setTitulo("")
      setDescripcion("")
      setImagenes([])
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al crear item')
    },
  })

  // Mutation para eliminar portfolio item
  const deleteMutation = useMutation({
    mutationFn: (id: string) => professionalService.deletePortfolioItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-portfolio'] })
      toast.success('Item eliminado del portfolio')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al eliminar item')
    },
  })

  const handleSave = () => {
    if (!titulo.trim()) {
      toast.error('El título es obligatorio')
      return
    }

    createMutation.mutate({ titulo, descripcion })
  }

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este item del portfolio?")) {
      deleteMutation.mutate(id)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Portfolio</h1>
          <p className="text-muted-foreground">
            Muestra tus mejores trabajos a los clientes
          </p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Item
        </Button>
      </div>

      {portfolio.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Portfolio vacío</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Agrega trabajos que hayas realizado para mostrar tu experiencia
            </p>
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {item.imagenes_urls && item.imagenes_urls.length > 0 ? (
                  <Image
                    src={item.imagenes_urls[0]}
                    alt={item.titulo}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {item.imagenes_urls && item.imagenes_urls.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    +{item.imagenes_urls.length - 1} fotos
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{item.titulo}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMutation.isPending}
                  className="w-full"
                >
                  {deleteMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Eliminando...</>
                  ) : (
                    <><Trash2 className="h-4 w-4 mr-2" />Eliminar</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Item de Portfolio</DialogTitle>
            <DialogDescription>
              Agrega un nuevo trabajo a tu portfolio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ej: Instalación eléctrica completa - Casa en Palermo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el trabajo realizado, materiales usados, tiempo, etc."
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagenes">Imágenes (máx. 5)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="imagenes"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files).slice(0, 5)
                      setImagenes(files)
                    }
                  }}
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {imagenes.length > 0 
                  ? `${imagenes.length} archivo(s) seleccionado(s)`
                  : "Selecciona hasta 5 imágenes"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
