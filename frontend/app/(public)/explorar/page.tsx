'use client';

import React from 'react';
import { SearchFilters, SearchResultsList } from '@/components/features/search';
import { defaultSearchFilters, type SearchFiltersFormData } from '@/types/forms/search';

/**
 * Página de exploración de profesionales
 * 
 * LIMPIA Y SIMPLE:
 * - Solo orquestación de componentes feature
 * - Sin useState para datos de servidor (React Query lo maneja)
 * - Un solo useState para filtros activos
 * - SearchFilters: Formulario inteligente que emite cambios
 * - SearchResultsList: Muestra resultados con loading/empty states
 */
export default function ExplorarProfesionalesPage() {
  // 🎯 Estado local SOLO para los filtros activos (UI state, no server state)
  const [activeFilters, setActiveFilters] = React.useState<Partial<SearchFiltersFormData>>(
    defaultSearchFilters
  );
  
  // Handler cuando los filtros cambian
  const handleFiltersChange = (newFilters: SearchFiltersFormData) => {
    setActiveFilters({
      ...newFilters,
      page: 1, // Resetear a página 1 cuando cambian filtros
    });
  };
  
  // Handler para cambiar de página
  const handlePageChange = (page: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      page,
    }));
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Explorar Profesionales</h1>
        <p className="text-muted-foreground">
          Encuentra el profesional perfecto para tu proyecto
        </p>
      </div>
      
      {/* Filtros de búsqueda */}
      <SearchFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={activeFilters}
      />
      
      {/* Resultados */}
      <SearchResultsList
        filters={activeFilters}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
