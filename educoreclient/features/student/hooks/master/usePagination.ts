// Enhanced reusable pagination hook
import { useState, useCallback, useMemo } from 'react';
import { API_CONFIG } from '@/lib/config';

export interface UsePaginationOptions {
  initialPageSize?: number;
  initialPageIndex?: number;
}

export interface UsePaginationReturn {
  // State
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  
  // Computed values
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startItem: number;
  endItem: number;
  
  // Actions
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  reset: () => void;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPageSize = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    initialPageIndex = API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX
  } = options;

  const [pageIndex, setPageIndexState] = useState<number>(initialPageIndex);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Computed values
  const totalPages = useMemo(() => 
    Math.ceil(totalCount / pageSize), 
    [totalCount, pageSize]
  );

  const hasNextPage = useMemo(() => 
    pageIndex < totalPages - 1, 
    [pageIndex, totalPages]
  );

  const hasPrevPage = useMemo(() => 
    pageIndex > 0, 
    [pageIndex]
  );

  const startItem = useMemo(() => 
    pageIndex * pageSize + 1, 
    [pageIndex, pageSize]
  );

  const endItem = useMemo(() => 
    Math.min((pageIndex + 1) * pageSize, totalCount), 
    [pageIndex, pageSize, totalCount]
  );

  // Actions
  const setPageIndex = useCallback((index: number) => {
    const maxIndex = Math.max(0, totalPages - 1);
    const validIndex = Math.max(0, Math.min(index, maxIndex));
    setPageIndexState(validIndex);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageIndexState(0); // Reset to first page
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPageIndexState(prev => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPageIndexState(prev => prev - 1);
    }
  }, [hasPrevPage]);

  const goToFirstPage = useCallback(() => {
    setPageIndexState(0);
  }, []);

  const goToLastPage = useCallback(() => {
    setPageIndexState(Math.max(0, totalPages - 1));
  }, [totalPages]);

  const reset = useCallback(() => {
    setPageIndexState(initialPageIndex);
    setPageSizeState(initialPageSize);
    setTotalCount(0);
  }, [initialPageIndex, initialPageSize]);

  return {
    // State
    pageIndex,
    pageSize,
    totalCount,
    
    // Computed values
    totalPages,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    
    // Actions
    setPageIndex,
    setPageSize,
    setTotalCount,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    reset,
  };
}
