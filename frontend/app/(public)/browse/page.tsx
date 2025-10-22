'use client';

import { useState } from 'react';
import { ProfessionalCard } from '@/components/features/ProfessionalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchService, publicService } from '@/lib/services';
import type { SearchFilters } from '@/types';

export default function BrowsePage() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch oficios (público, sin auth)
  const { data: oficios } = useQuery({
    queryKey: ['oficios', 'public'],
    queryFn: () => publicService.getOficios(),
  });

  // Fetch professionals with filters (sin oficios por ahora)
  const { data, isLoading } = useQuery({
    queryKey: ['professionals', 'search', filters, page],
    queryFn: () => searchService.searchProfessionals(filters),
    enabled: false, // Deshabilitar búsqueda automática hasta tener ubicación
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const FilterSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="mb-4 w-full text-orange-500"
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <Separator />

      {/* Oficio Filter */}
      <div className="space-y-2">
        <Label htmlFor="oficio">Oficio</Label>
        <Select
          value={filters.oficio_id?.toString()}
          onValueChange={(value) => handleFilterChange('oficio_id', parseInt(value))}
        >
          <SelectTrigger id="oficio">
            <SelectValue placeholder="Todos los oficios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los oficios</SelectItem>
            {oficios?.map((oficio) => (
              <SelectItem key={oficio.id} value={oficio.id.toString()}>
                {oficio.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nivel Filter */}
      <div className="space-y-2">
        <Label htmlFor="nivel">Nivel de Experiencia</Label>
        <Select
          value={filters.nivel}
          onValueChange={(value) =>
            handleFilterChange('nivel', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger id="nivel">
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="intermedio">Intermedio</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tarifa Filter */}
      <div className="space-y-2">
        <Label>Tarifa por Hora (USD)</Label>
        <div className="space-y-2">
          <div>
            <Label htmlFor="tarifa_min" className="text-xs text-slate-500">
              Mínimo
            </Label>
            <Input
              id="tarifa_min"
              type="number"
              placeholder="0"
              value={filters.tarifa_min || ''}
              onChange={(e) =>
                handleFilterChange('tarifa_min', e.target.value ? parseFloat(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <Label htmlFor="tarifa_max" className="text-xs text-slate-500">
              Máximo
            </Label>
            <Input
              id="tarifa_max"
              type="number"
              placeholder="1000"
              value={filters.tarifa_max || ''}
              onChange={(e) =>
                handleFilterChange('tarifa_max', e.target.value ? parseFloat(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <Label htmlFor="rating">Calificación Mínima</Label>
        <Select
          value={filters.rating_min?.toString()}
          onValueChange={(value) =>
            handleFilterChange('rating_min', value === 'all' ? undefined : parseFloat(value))
          }
        >
          <SelectTrigger id="rating">
            <SelectValue placeholder="Cualquier calificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier calificación</SelectItem>
            <SelectItem value="4.5">4.5+ ⭐</SelectItem>
            <SelectItem value="4">4.0+ ⭐</SelectItem>
            <SelectItem value="3.5">3.5+ ⭐</SelectItem>
            <SelectItem value="3">3.0+ ⭐</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Explorar Profesionales
          </h1>
          <p className="mt-2 text-slate-600">
            {data ? `${data.total} profesionales encontrados` : 'Cargando...'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters - Desktop */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <FilterSection />
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              {hasActiveFilters ? 'Filtros activos' : 'Mostrar filtros'}
            </Button>
          </div>

          {/* Mobile Filters */}
          {mobileFiltersOpen && (
            <div className="lg:hidden">
              <Card>
                <CardContent className="pt-6">
                  <FilterSection />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-lg border border-slate-200 bg-white"
                  />
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((professional) => (
                    <ProfessionalCard key={professional.id} professional={professional} />
                  ))}
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-slate-600">
                      Página {page} de {data.pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === data.pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-slate-500">
                    No se encontraron profesionales con estos filtros.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
