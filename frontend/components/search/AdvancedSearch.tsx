'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, DollarSign, Star, X, SlidersHorizontal } from 'lucide-react';
import { publicService } from '@/lib/services';

interface SearchFilters {
  query: string;
  oficio_id?: string;
  radio_km?: number;
  precio_min?: number;
  precio_max?: number;
  rating_min?: number;
  disponible?: boolean;
  orden?: 'distancia' | 'rating' | 'precio_asc' | 'precio_desc' | 'trabajos';
  lat?: number;
  lng?: number;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export function AdvancedSearch({ onSearch, initialFilters }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters?.query || '',
    oficio_id: initialFilters?.oficio_id,
    radio_km: initialFilters?.radio_km || 10,
    precio_min: initialFilters?.precio_min,
    precio_max: initialFilters?.precio_max,
    rating_min: initialFilters?.rating_min || 0,
    disponible: initialFilters?.disponible,
    orden: initialFilters?.orden || 'distancia',
  });

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
        },
        (error) => {
          console.log('Geolocation error:', error);
          // No mostrar error, solo no filtrar por ubicación
        }
      );
    }
  }, []);

  // Query para oficios
  const { data: oficios } = useQuery({
    queryKey: ['oficios'],
    queryFn: publicService.getOficios,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const handleSearch = () => {
    // Limpiar filtros vacíos
    const cleanFilters: SearchFilters = {
      query: filters.query,
    };

    if (filters.oficio_id) cleanFilters.oficio_id = filters.oficio_id;
    if (filters.radio_km) cleanFilters.radio_km = filters.radio_km;
    if (filters.precio_min) cleanFilters.precio_min = filters.precio_min;
    if (filters.precio_max) cleanFilters.precio_max = filters.precio_max;
    if (filters.rating_min && filters.rating_min > 0) cleanFilters.rating_min = filters.rating_min;
    if (filters.disponible !== undefined) cleanFilters.disponible = filters.disponible;
    if (filters.orden) cleanFilters.orden = filters.orden;
    if (filters.lat) cleanFilters.lat = filters.lat;
    if (filters.lng) cleanFilters.lng = filters.lng;

    onSearch(cleanFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      radio_km: 10,
      rating_min: 0,
      orden: 'distancia',
      lat: filters.lat,
      lng: filters.lng,
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const activeFiltersCount = [
    filters.oficio_id,
    filters.precio_min,
    filters.precio_max,
    filters.rating_min && filters.rating_min > 0,
    filters.disponible,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Barra de búsqueda principal */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar profesionales, servicios..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            Buscar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Oficio */}
              <div className="space-y-2">
                <Label>Oficio</Label>
                <Select
                  value={filters.oficio_id}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, oficio_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los oficios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los oficios</SelectItem>
                    {oficios?.map((oficio) => (
                      <SelectItem key={oficio.id} value={oficio.id}>
                        {oficio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar por */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select
                  value={filters.orden}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, orden: value as SearchFilters['orden'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distancia">Más cercanos</SelectItem>
                    <SelectItem value="rating">Mejor calificados</SelectItem>
                    <SelectItem value="precio_asc">Menor precio</SelectItem>
                    <SelectItem value="precio_desc">Mayor precio</SelectItem>
                    <SelectItem value="trabajos">Más trabajos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Radio de búsqueda */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Radio de búsqueda
                </Label>
                <span className="text-sm font-medium text-slate-700">
                  {filters.radio_km} km
                </span>
              </div>
              <Slider
                value={[filters.radio_km || 10]}
                onValueChange={(value: number[]) => setFilters(prev => ({ ...prev, radio_km: value[0] }))}
                min={1}
                max={50}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Rango de precio */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Rango de precio por hora
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.precio_min || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      precio_min: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    min={0}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.precio_max || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      precio_max: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Rating mínimo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Calificación mínima
                </Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        rating_min: star === prev.rating_min ? 0 : star 
                      }))}
                      className="transition-colors"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= (filters.rating_min || 0)
                            ? 'fill-orange-500 text-orange-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disponible"
                checked={filters.disponible || false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, disponible: checked as boolean }))
                }
              />
              <Label htmlFor="disponible" className="cursor-pointer">
                Solo profesionales disponibles
              </Label>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSearch} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>

            {/* Filtros activos */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {filters.oficio_id && (
                  <Badge variant="secondary" className="gap-1">
                    {oficios?.find(o => o.id === filters.oficio_id)?.nombre}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, oficio_id: undefined }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.precio_min && (
                  <Badge variant="secondary" className="gap-1">
                    Desde ${filters.precio_min}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, precio_min: undefined }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.precio_max && (
                  <Badge variant="secondary" className="gap-1">
                    Hasta ${filters.precio_max}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, precio_max: undefined }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.rating_min && filters.rating_min > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.rating_min}+ estrellas
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, rating_min: 0 }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.disponible && (
                  <Badge variant="secondary" className="gap-1">
                    Disponibles
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, disponible: undefined }))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
