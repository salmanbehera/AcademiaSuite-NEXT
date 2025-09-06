'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Class } from '@/features/student/types/master/classTypes';

// Simple debounce utility to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), wait);
  };
}

interface UseClassPerformanceOptions {
  searchDebounceMs?: number;
  virtualScrollThreshold?: number;
  enableMemoization?: boolean;
}

interface UseClassPerformanceReturn {
  // Search optimization
  debouncedSearch: (query: string) => void;
  searchQuery: string;
  
  // Virtual scrolling
  visibleItems: Class[];
  scrollToIndex: (index: number) => void;
  
  // Memoized computations
  filteredClasses: Class[];
  classesCount: number;
  activeClassesCount: number;
  
  // Performance metrics
  renderTime: number;
  lastUpdateTime: Date | null;
}

export function useClassPerformance(
  classes: Class[],
  options: UseClassPerformanceOptions = {}
): UseClassPerformanceReturn {
  const {
    searchDebounceMs = 300,
    virtualScrollThreshold = 100,
    enableMemoization = true,
  } = options;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleStartIndex, setVisibleStartIndex] = useState<number>(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState<number>(50);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setLastUpdateTime(new Date());
    }, searchDebounceMs),
    [searchDebounceMs]
  );

  // Memoized filtered classes
  const filteredClasses = useMemo(() => {
    if (!enableMemoization) return classes;
    
    const startTime = performance.now();
    
    const filtered = searchQuery
      ? classes.filter(cls => 
          cls.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.classShortName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : classes;
    
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    
    return filtered;
  }, [classes, searchQuery, enableMemoization]);

  // Memoized counts
  const classesCount = useMemo(() => 
    enableMemoization ? filteredClasses.length : filteredClasses.length
  , [filteredClasses, enableMemoization]);

  const activeClassesCount = useMemo(() => 
    enableMemoization 
      ? filteredClasses.filter(cls => cls.isActive).length
      : filteredClasses.filter(cls => cls.isActive).length
  , [filteredClasses, enableMemoization]);

  // Virtual scrolling for large lists
  const visibleItems = useMemo(() => {
    if (filteredClasses.length <= virtualScrollThreshold) {
      return filteredClasses;
    }
    
    return filteredClasses.slice(visibleStartIndex, visibleEndIndex);
  }, [filteredClasses, visibleStartIndex, visibleEndIndex, virtualScrollThreshold]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    const bufferSize = 25; // Show 25 items before and after
    const start = Math.max(0, index - bufferSize);
    const end = Math.min(filteredClasses.length, index + bufferSize);
    
    setVisibleStartIndex(start);
    setVisibleEndIndex(end);
  }, [filteredClasses.length]);

  // Auto-adjust visible window based on scroll position
  useEffect(() => {
    if (filteredClasses.length <= virtualScrollThreshold) return;
    
    const handleScroll = debounce(() => {
      const scrollTop = window.scrollY;
      const itemHeight = 60; // Estimated item height
      const viewportHeight = window.innerHeight;
      
      const startIndex = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(viewportHeight / itemHeight);
      const bufferSize = 10;
      
      const newStart = Math.max(0, startIndex - bufferSize);
      const newEnd = Math.min(
        filteredClasses.length,
        startIndex + visibleCount + bufferSize
      );
      
      setVisibleStartIndex(newStart);
      setVisibleEndIndex(newEnd);
    }, 16); // 16ms for ~60fps
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredClasses.length, virtualScrollThreshold]);

  return {
    // Search optimization
    debouncedSearch,
    searchQuery,
    
    // Virtual scrolling
    visibleItems,
    scrollToIndex,
    
    // Memoized computations
    filteredClasses,
    classesCount,
    activeClassesCount,
    
    // Performance metrics
    renderTime,
    lastUpdateTime,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<{
    renderCount: number;
    averageRenderTime: number;
    lastRenderTime: number;
  }>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newAverageRenderTime = 
          (prev.averageRenderTime * prev.renderCount + renderTime) / newRenderCount;
        
        // Log performance in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${componentName}:`, {
            renderTime: `${renderTime.toFixed(2)}ms`,
            averageRenderTime: `${newAverageRenderTime.toFixed(2)}ms`,
            renderCount: newRenderCount,
          });
        }
        
        return {
          renderCount: newRenderCount,
          averageRenderTime: newAverageRenderTime,
          lastRenderTime: renderTime,
        };
      });
    };
  });

  return metrics;
}

// Memory optimization hook
export function useMemoryOptimization<T>(
  data: T[],
  keyExtractor: (item: T) => string
) {
  const [cache] = useState(() => new Map<string, T>());
  
  const optimizedData = useMemo(() => {
    const result: T[] = [];
    
    data.forEach(item => {
      const key = keyExtractor(item);
      
      // Use cached version if available and unchanged
      if (cache.has(key)) {
        const cached = cache.get(key)!;
        // Simple equality check - in production you might want deep comparison
        if (JSON.stringify(cached) === JSON.stringify(item)) {
          result.push(cached);
          return;
        }
      }
      
      // Cache new/updated item
      cache.set(key, item);
      result.push(item);
    });
    
    // Clean up cache for items no longer in data
    const currentKeys = new Set(data.map(keyExtractor));
    Array.from(cache.keys()).forEach(key => {
      if (!currentKeys.has(key)) {
        cache.delete(key);
      }
    });
    
    return result;
  }, [data, keyExtractor, cache]);
  
  return optimizedData;
}
