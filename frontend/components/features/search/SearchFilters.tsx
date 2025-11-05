'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  SlidersHorizontal, 
  Loader2, 
  MapPin,
  DollarSign,
  Star,
  Zap,
  Briefcase,
} from 'lucide-react';
import { useOficios } from '@/hooks/common';
import { 
  searchFiltersSchema, 
  defaultSearchFilters,
  type SearchFiltersFormData,
} from '@/types/forms/search';

interface SearchFiltersProps {
  /**
   * Callback que se ejecuta cuando los filtros cambian
   */
  onFiltersChange: (filters: SearchFiltersFormData) => void;
  
  /**
   * Valores iniciales para los filtros
   */
  initialFilters?: Partial<SearchFiltersFormData>;
  
  /**
   * Mostrar/ocultar filtros avanzados inicialmente
   */
  showAdvancedFilters?: boolean;
}

/**
 * Componente inteligente para filtros de búsqueda de profesionales
 * 
 * Características:
 * - Formulario con react-hook-form + Zod
 * - Búsqueda rápida (q)
 * - Filtros avanzados (oficio, ubicación, radio, tarifas, rating)
 * - Toggle para filtros avanzados
 * - Emite cambios con onFiltersChange
 */
export function SearchFilters({ 
  onFiltersChange,
  initialFilters = defaultSearchFilters,
  showAdvancedFilters = false,
}: SearchFiltersProps) {
  // 🔧 Hook de oficios
  const { data: oficios = [], isLoading: loadingOficios } = useOficios();
  
  // 📝 Form con react-hook-form + Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(searchFiltersSchema) as any,
    defaultValues: { ...defaultSearchFilters, ...initialFilters },
  });
  
  // Estado local para mostrar/ocultar filtros avanzados
  const [showAdvanced, setShowAdvanced] = React.useState(showAdvancedFilters);
  
  // 🎯 Handler de submit
  const onSubmit = (data: SearchFiltersFormData) => {
    // Mapear oficio_id a oficio (nombre)
    if (data.oficio_id && oficios.length > 0) {
      const oficioSeleccionado = oficios.find((o: any) => o.id === data.oficio_id);
      if (oficioSeleccionado) {
        data.oficio = (oficioSeleccionado as any).nombre;
      }
    }
    
    onFiltersChange(data);
  };
  
  // Búsqueda al presionar Enter
  const handleQuickSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar Profesionales
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Búsqueda rápida */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ej: Plomero, Electricista, Pintor..."
                {...register('q')}
                onKeyDown={handleQuickSearch}
              />
            </div>
            
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {/* Filtros avanzados (colapsables) */}
          {showAdvanced && (
            <div className="border-t pt-4 space-y-4">
              {/* Fila 1: Oficio y Radio */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Oficio */}
                <div className="space-y-2">
                  <Label htmlFor="oficio_id">
                    <Briefcase className="inline h-4 w-4 mr-1" />
                    Oficio
                  </Label>
                  
                  <Select
                    value={watch('oficio_id') || 'all'}
                    onValueChange={(value) => 
                      setValue('oficio_id', value === 'all' ? '' : value)
                    }
                  >
                    <SelectTrigger id="oficio_id">
                      <SelectValue placeholder="Todos los oficios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los oficios</SelectItem>
                      {loadingOficios ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </SelectItem>
                      ) : (
                        oficios.map((oficio: any) => (
                          <SelectItem key={oficio.id} value={String(oficio.id)}>
                            {oficio.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Radio de búsqueda */}
                <div className="space-y-2">
                  <Label htmlFor="radio_km">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Radio de búsqueda
                  </Label>
                  
                  <Select
                    value={String(watch('radio_km'))}
                    onValueChange={(value) => setValue('radio_km', Number(value))}
                  >
                    <SelectTrigger id="radio_km">
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
              
              {/* Fila 2: Ubicación (Lat/Lon) */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ubicacion_lat">
                    Latitud <span className="text-xs text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="ubicacion_lat"
                    type="number"
                    step="0.0001"
                    placeholder="-34.6037"
                    {...register('ubicacion_lat')}
                  />
                  {errors.ubicacion_lat && (
                    <p className="text-xs text-red-500">{errors.ubicacion_lat.message as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ubicacion_lon">
                    Longitud <span className="text-xs text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="ubicacion_lon"
                    type="number"
                    step="0.0001"
                    placeholder="-58.3816"
                    {...register('ubicacion_lon')}
                  />
                  {errors.ubicacion_lon && (
                    <p className="text-xs text-red-500">{errors.ubicacion_lon.message as string}</p>
                  )}
                </div>
              </div>
              
              {/* Fila 3: Rango de Tarifas */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tarifa_min">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Tarifa mínima ($/hora)
                  </Label>
                  <Input
                    id="tarifa_min"
                    type="number"
                    min="0"
                    placeholder="Ej: 500"
                    {...register('tarifa_min', { valueAsNumber: true })}
                  />
                  {errors.tarifa_min && (
                    <p className="text-xs text-red-500">{errors.tarifa_min.message as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tarifa_max">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Tarifa máxima ($/hora)
                  </Label>
                  <Input
                    id="tarifa_max"
                    type="number"
                    min="0"
                    placeholder="Ej: 2000"
                    {...register('tarifa_max', { valueAsNumber: true })}
                  />
                  {errors.tarifa_max && (
                    <p className="text-xs text-red-500">{errors.tarifa_max.message as string}</p>
                  )}
                </div>
              </div>
              
              {/* Fila 4: Rating mínimo y switches */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rating_min">
                    <Star className="inline h-4 w-4 mr-1" />
                    Rating mínimo
                  </Label>
                  <Select
                    value={watch('rating_min')?.toString() || 'all'}
                    onValueChange={(value) => 
                      setValue('rating_min', value === 'all' ? undefined : Number(value))
                    }
                  >
                    <SelectTrigger id="rating_min">
                      <SelectValue placeholder="Cualquier rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquier rating</SelectItem>
                      <SelectItem value="1">1+ estrellas</SelectItem>
                      <SelectItem value="2">2+ estrellas</SelectItem>
                      <SelectItem value="3">3+ estrellas</SelectItem>
                      <SelectItem value="4">4+ estrellas</SelectItem>
                      <SelectItem value="5">5 estrellas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ordenar_por">Ordenar por</Label>
                  <Select
                    value={watch('ordenar_por')}
                    onValueChange={(value: any) => setValue('ordenar_por', value)}
                  >
                    <SelectTrigger id="ordenar_por">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating (mayor primero)</SelectItem>
                      <SelectItem value="precio">Precio (menor primero)</SelectItem>
                      <SelectItem value="distancia">Distancia (más cerca)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Fila 5: Switch para disponibles ahora */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <Label htmlFor="solo_disponibles_ahora" className="cursor-pointer">
                    Solo profesionales disponibles ahora
                  </Label>
                </div>
                <Switch
                  id="solo_disponibles_ahora"
                  checked={watch('solo_disponibles_ahora')}
                  onCheckedChange={(checked) => setValue('solo_disponibles_ahora', checked)}
                />
              </div>
              
              {/* Tip */}
              <p className="text-xs text-muted-foreground">
                💡 Tip: Deja latitud/longitud vacías para buscar sin filtro de ubicación
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
