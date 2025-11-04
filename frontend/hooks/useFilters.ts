'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterState<T = Record<string, unknown>> {
  filters: T;
  pagination: PaginationState;
}

interface UseFiltersOptions<T> {
  initialFilters?: Partial<T>;
  initialLimit?: number;
  syncWithUrl?: boolean;
}

/**
 * Hook para manejar filtros y paginación con sincronización de URL
 */
export function useFilters<T extends Record<string, unknown>>(
  options: UseFiltersOptions<T> = {}
) {
  const {
    initialFilters = {} as T,
    initialLimit = 10,
    syncWithUrl = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializar filtros desde URL si está habilitado
  const getInitialFilters = useCallback((): T => {
    if (!syncWithUrl) return initialFilters as T;

    const urlFilters: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        // Intentar parsear números
        if (!isNaN(Number(value))) {
          urlFilters[key] = Number(value);
        } else if (value === 'true' || value === 'false') {
          urlFilters[key] = value === 'true';
        } else {
          urlFilters[key] = value;
        }
      }
    });

    return { ...initialFilters, ...urlFilters } as T;
  }, [initialFilters, searchParams, syncWithUrl]);

  const getInitialPage = useCallback((): number => {
    if (!syncWithUrl) return 1;
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  }, [searchParams, syncWithUrl]);

  const getInitialLimit = useCallback((): number => {
    if (!syncWithUrl) return initialLimit;
    const limit = searchParams.get('limit');
    return limit ? parseInt(limit, 10) : initialLimit;
  }, [initialLimit, searchParams, syncWithUrl]);

  const [filters, setFilters] = useState<T>(getInitialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    page: getInitialPage(),
    limit: getInitialLimit(),
    total: 0,
    totalPages: 0,
  });

  // Actualizar URL cuando cambien filtros o paginación
  useEffect(() => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams();
    
    // Agregar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    // Agregar paginación
    if (pagination.page > 1) {
      params.set('page', String(pagination.page));
    }
    if (pagination.limit !== initialLimit) {
      params.set('limit', String(pagination.limit));
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, pagination.page, pagination.limit, syncWithUrl, pathname, router, initialLimit]);

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset a página 1
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters as T);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [initialFilters]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const updatePagination = useCallback((total: number) => {
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages: Math.ceil(total / prev.limit),
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.page < prev.totalPages) {
        return { ...prev, page: prev.page + 1 };
      }
      return prev;
    });
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.page > 1) {
        return { ...prev, page: prev.page - 1 };
      }
      return prev;
    });
  }, []);

  const goToFirstPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const goToLastPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: prev.totalPages }));
  }, []);

  // Generar query params para API calls
  const getApiParams = useCallback(() => {
    return {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    };
  }, [filters, pagination]);

  return {
    filters,
    pagination,
    updateFilters,
    clearFilters,
    setPage,
    setLimit,
    updatePagination,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    getApiParams,
    hasFilters: Object.keys(filters).some((key) => {
      const value = filters[key];
      return value !== undefined && value !== null && value !== '';
    }),
  };
}

/**
 * Hook simplificado para búsqueda con debounce
 */
export function useSearchQuery(initialQuery = '', delay = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);

  return {
    query,
    debouncedQuery,
    setQuery,
    isSearching: query !== debouncedQuery,
  };
}

/**
 * Hook para manejar ordenamiento
 */
export function useSorting<T extends string>(initialSort: T, initialOrder: 'asc' | 'desc' = 'asc') {
  const [sortBy, setSortBy] = useState<T>(initialSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialOrder);

  const toggleSort = useCallback((field: T) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const setSort = useCallback((field: T, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  return {
    sortBy,
    sortOrder,
    toggleSort,
    setSort,
  };
}
