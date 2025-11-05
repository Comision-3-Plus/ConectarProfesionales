'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProfessionalCard } from '@/components/features/ProfessionalCard';
import { useSearchProfessionals } from '@/hooks/search';
import type { SearchFiltersFormData } from '@/types/forms/search';
import type { SearchResult } from '@/types';

interface SearchResultsListProps {
  /**
   * Filtros activos de búsqueda
   */
  filters: Partial<SearchFiltersFormData>;
  
  /**
   * Callback para cambiar de página
   */
  onPageChange?: (page: number) => void;
  
  /**
   * Habilitar/deshabilitar la búsqueda
   */
  enabled?: boolean;
}

/**
 * Componente inteligente que muestra la lista de resultados de búsqueda
 * 
 * Características:
 * - Usa el hook useSearchProfessionals
 * - Muestra estados de loading, empty, error
 * - Grid responsive de tarjetas
 * - Paginación (si se implementa)
 */
export function SearchResultsList({ 
  filters,
  onPageChange,
  enabled = true,
}: SearchResultsListProps) {
  // 🔧 Hook de búsqueda con filtros dinámicos
  const {
    data: resultados = [],
    isLoading,
    error,
    isFetching,
  } = useSearchProfessionals(filters, { enabled });
  
  // Paginación (del filtro)
  const currentPage = filters.page ?? 1;
  const limit = filters.limit ?? 30;
  
  // Handler de paginación
  const handleNextPage = () => {
    if (onPageChange && resultados.length === limit) {
      onPageChange(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (onPageChange && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  // 🎨 ESTADOS DE UI
  
  // Loading state (primera carga)
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <p className="text-sm text-muted-foreground">Buscando profesionales...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-red-500">Error al buscar</h3>
          <p className="text-muted-foreground">
            {(error as Error).message || 'Ocurrió un error inesperado'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (resultados.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron profesionales</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Intenta ajustar los filtros, ampliar el radio de búsqueda, o buscar por otro oficio.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // 🎨 RESULTADOS CON GRID
  return (
    <div className="space-y-6">
      {/* Header con contador de resultados */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Resultados {resultados.length > 0 && `(${resultados.length})`}
        </h2>
        
        {/* Loading indicator mientras fetching */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Actualizando...
          </div>
        )}
      </div>
      
      {/* Grid de resultados */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resultados.map((profesional: SearchResult) => (
          <ProfessionalCard
            key={profesional.id}
            professional={profesional}
          />
        ))}
      </div>
      
      {/* Paginación (si se implementa) */}
      {onPageChange && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Página {currentPage}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={resultados.length < limit}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
