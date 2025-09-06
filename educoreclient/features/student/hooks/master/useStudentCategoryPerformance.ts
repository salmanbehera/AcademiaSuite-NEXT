'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  isLagging: boolean;
  memoryUsage?: number;
}

interface VirtualScrollConfig {
  containerHeight: number;
  itemHeight: number;
  overscan?: number;
}

interface UseStudentCategoryPerformanceOptions {
  enableVirtualScroll?: boolean;
  virtualScrollConfig?: VirtualScrollConfig;
  enablePerformanceMonitoring?: boolean;
  lagThreshold?: number; // ms threshold for considering a render as lagging
  debounceMs?: number;
}

export function useStudentCategoryPerformance<T extends { id: string }>(
  data: T[] = [],
  options: UseStudentCategoryPerformanceOptions = {}
) {
  const {
    enableVirtualScroll = false,
    virtualScrollConfig = { containerHeight: 400, itemHeight: 60, overscan: 3 },
    enablePerformanceMonitoring = true,
    lagThreshold = 100,
    debounceMs = 300,
  } = options;

  // Performance monitoring state
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    totalRenderTime: 0,
    isLagging: false,
  });

  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(virtualScrollConfig.containerHeight);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<Record<string, any>>({});

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setPerformanceMetrics(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newTotalRenderTime = prev.totalRenderTime + renderTime;
        const newAverageRenderTime = newTotalRenderTime / newRenderCount;

        return {
          renderCount: newRenderCount,
          lastRenderTime: renderTime,
          averageRenderTime: newAverageRenderTime,
          totalRenderTime: newTotalRenderTime,
          isLagging: renderTime > lagThreshold,
          memoryUsage: (performance as any).memory?.usedJSHeapSize,
        };
      });
    };
  });

  // Filtered and searched data with Student Category specific logic
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter with Student Category specific fields
    if (debouncedSearchTerm) {
      result = result.filter(item => {
        const categoryItem = item as any;
        const searchableFields = [
          categoryItem.categoryName,
          categoryItem.categoryCode,
          categoryItem.description,
          categoryItem.status,
        ].filter(field => field !== undefined && field !== null)
          .join(' ')
          .toLowerCase();
        
        return searchableFields.includes(debouncedSearchTerm.toLowerCase());
      });
    }

    // Apply additional filters with Student Category specific handling
    if (Object.keys(filterCriteria).length > 0) {
      result = result.filter(item => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          if (value === null || value === undefined || value === '') return true;
          const itemValue = (item as any)[key];
          
          // Handle status filter specially
          if (key === 'status' && Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          // Handle category type filter
          if (key === 'categoryType' && Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          if (typeof value === 'string' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          
          return itemValue === value;
        });
      });
    }

    return result;
  }, [data, debouncedSearchTerm, filterCriteria]);

  // Virtual scrolling calculations
  const virtualScrollData = useMemo(() => {
    if (!enableVirtualScroll) {
      return {
        visibleData: filteredData,
        startIndex: 0,
        endIndex: filteredData.length - 1,
        totalHeight: filteredData.length * virtualScrollConfig.itemHeight,
        offsetY: 0,
      };
    }

    const { itemHeight, overscan = 3 } = virtualScrollConfig;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(filteredData.length - 1, startIndex + visibleCount);
    
    const visibleData = filteredData.slice(startIndex, endIndex + 1);
    const totalHeight = filteredData.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
      visibleData,
      startIndex,
      endIndex,
      totalHeight,
      offsetY,
    };
  }, [enableVirtualScroll, filteredData, scrollTop, containerHeight, virtualScrollConfig]);

  // Scroll handler for virtual scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (enableVirtualScroll) {
      setScrollTop(e.currentTarget.scrollTop);
    }
  }, [enableVirtualScroll]);

  // Container resize handler
  const handleContainerResize = useCallback((height: number) => {
    setContainerHeight(height);
  }, []);

  // Search and filter handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilter = useCallback((criteria: Record<string, any>) => {
    setFilterCriteria(criteria);
  }, []);

  // Student Category specific filter handlers
  const handleStatusFilter = useCallback((statuses: string[]) => {
    setFilterCriteria(prev => ({ ...prev, status: statuses }));
  }, []);

  const handleCategoryTypeFilter = useCallback((types: string[]) => {
    setFilterCriteria(prev => ({ ...prev, categoryType: types }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterCriteria({});
  }, []);

  // Performance utilities
  const getPerformanceReport = useCallback(() => {
    const { renderCount, averageRenderTime, isLagging, memoryUsage } = performanceMetrics;
    
    return {
      status: isLagging ? 'warning' : 'good',
      recommendations: [
        ...(isLagging ? ['Consider enabling virtual scrolling for better performance'] : []),
        ...(renderCount > 100 && averageRenderTime > 50 ? ['High render frequency detected'] : []),
        ...(memoryUsage && memoryUsage > 50000000 ? ['High memory usage detected'] : []),
        ...(filteredData.length > 1000 ? ['Large dataset detected, virtual scrolling recommended'] : []),
      ],
      metrics: performanceMetrics,
    };
  }, [performanceMetrics, filteredData.length]);

  // Memoized statistics with Student Category specific metrics
  const statistics = useMemo(() => {
    const activeCategories = filteredData.filter((item: any) => item.status === 'Active').length;
    const inactiveCategories = filteredData.filter((item: any) => item.status === 'Inactive').length;
    
    return {
      totalItems: data.length,
      filteredItems: filteredData.length,
      visibleItems: virtualScrollData.visibleData.length,
      filterRatio: data.length > 0 ? (filteredData.length / data.length) * 100 : 0,
      searchActive: !!debouncedSearchTerm,
      filtersActive: Object.keys(filterCriteria).length > 0,
      // Student Category specific stats
      activeCategories,
      inactiveCategories,
      activeCategoryRatio: filteredData.length > 0 ? (activeCategories / filteredData.length) * 100 : 0,
    };
  }, [data.length, filteredData, virtualScrollData.visibleData.length, debouncedSearchTerm, filterCriteria]);

  return {
    // Data
    originalData: data,
    filteredData,
    visibleData: virtualScrollData.visibleData,
    
    // Virtual scrolling
    virtualScrollProps: enableVirtualScroll ? {
      totalHeight: virtualScrollData.totalHeight,
      offsetY: virtualScrollData.offsetY,
      onScroll: handleScroll,
      style: { height: containerHeight, overflow: 'auto' },
    } : null,
    
    // Search and filtering
    searchTerm,
    debouncedSearchTerm,
    filterCriteria,
    handleSearch,
    handleFilter,
    handleStatusFilter,
    handleCategoryTypeFilter,
    clearFilters,
    
    // Performance
    performanceMetrics,
    getPerformanceReport,
    
    // Statistics
    statistics,
    
    // Utilities
    handleContainerResize,
    isVirtualScrollEnabled: enableVirtualScroll,
    isPerformanceMonitoringEnabled: enablePerformanceMonitoring,
  };
}
