"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Star, DollarSign, Loader2, SlidersHorizontal, CheckCircle2 } from "lucide-react"
import { searchService } from "@/lib/services/searchService"
import { publicService } from "@/lib/services/publicService"
import Link from "next/link"
import Image from "next/image"

export default function ExplorarProfesionalesPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams, setSearchParams] = useState({
    q: "",
    oficio_id: "",
    lat: "",
    lng: "",
    radio_km: 10
  })

  // Query para obtener oficios
  const { data: oficios = [] } = useQuery({
    queryKey: ['oficios'],
    queryFn: publicService.getOficios,
    staleTime: 300000, // 5 minutos
  })

  // Query para búsqueda de profesionales (solo se ejecuta cuando hay query o oficio_id)
  const { data: resultados = [], isLoading, refetch } = useQuery({
    queryKey: ['search-professionals', searchParams],
    queryFn: () => searchService.searchProfessionals(searchParams),
    enabled: false, // No auto-fetch, solo cuando user hace clic en buscar
    staleTime: 30000,
  })

  const handleSearch = () => {
    refetch()
  }

  const handleQuickSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Explorar Profesionales</h1>
        <p className="text-muted-foreground">
          Encuentra el profesional perfecto para tu proyecto
        </p>
      </div>

      {/* Búsqueda rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Profesionales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ej: Plomero, Electricista, Pintor..."
                value={searchParams.q}
                onChange={(e) => setSearchParams({ ...searchParams, q: e.target.value })}
                onKeyDown={handleQuickSearch}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oficio">Oficio</Label>
                  <Select
                    value={searchParams.oficio_id}
                    onValueChange={(value) => setSearchParams({ ...searchParams, oficio_id: value })}
                  >
                    <SelectTrigger id="oficio">
                      <SelectValue placeholder="Todos los oficios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los oficios</SelectItem>
                      {oficios.map((oficio: any) => (
                        <SelectItem key={oficio.id} value={oficio.id}>
                          {oficio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radio">Radio de búsqueda (km)</Label>
                  <Select
                    value={searchParams.radio_km.toString()}
                    onValueChange={(value) => setSearchParams({ ...searchParams, radio_km: Number(value) })}
                  >
                    <SelectTrigger id="radio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                      <SelectItem value="100">100 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitud (opcional)</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    placeholder="-34.6037"
                    value={searchParams.lat}
                    onChange={(e) => setSearchParams({ ...searchParams, lat: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitud (opcional)</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    placeholder="-58.3816"
                    value={searchParams.lng}
                    onChange={(e) => setSearchParams({ ...searchParams, lng: e.target.value })}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Tip: Deja latitud/longitud vacías para buscar sin filtro de ubicación
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Resultados {resultados.length > 0 && `(${resultados.length})`}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : resultados.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron profesionales</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros o ampliar el radio de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resultados.map((prof: any) => (
              <Link key={prof.user_id} href={`/profesional/${prof.user_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Image
                          src={prof.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prof.nombre_completo}`}
                          alt={prof.nombre_completo}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        {prof.kyc_estado === "APROBADO" && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {prof.nombre_completo}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{prof.rating_promedio?.toFixed(1) || "N/A"}</span>
                          <span className="text-muted-foreground">
                            ({prof.total_resenas || 0} reseñas)
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Oficios */}
                    <div className="flex flex-wrap gap-1">
                      {prof.oficios?.slice(0, 3).map((oficio: any) => (
                        <Badge key={oficio.id} variant="secondary" className="text-xs">
                          {oficio.nombre}
                        </Badge>
                      ))}
                      {prof.oficios?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{prof.oficios.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Tarifa */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        ${prof.tarifa_por_hora?.toLocaleString()}/hora
                      </div>
                      {prof.distancia_km !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {prof.distancia_km.toFixed(1)} km
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
