// Refactored useClasses with separated pagination logic
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Class, ClassDto } from '@/features/student/types/master/classTypes';
import { ClassService } from '@/features/student/services/master';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { usePagination } from './usePagination';

export interface UseClassesOptions {
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseClassesReturn {
  classes: Class[];
  loading: boolean;
  error: string | null;
  
  // Pagination (delegated to usePagination)
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startItem: number;
  endItem: number;
  
  // Actions
  fetchClasses: () => Promise<void>;
  createClass: (classData: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<Class | null>;
  updateClass: (id: string, classData: Partial<ClassDto>) => Promise<Class | null>;
  deleteClass: (id: string) => Promise<boolean>;
  bulkDeleteClasses: (ids: string[]) => Promise<boolean>;
  toggleClassStatus: (id: string, isActive: boolean) => Promise<boolean>;
  importClasses: (file: File, onProgress?: (progress: number) => void) => Promise<{ success: number; errors: any[] } | null>;
  
  // Pagination actions (delegated to usePagination)
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useClassesRefactored(options: UseClassesOptions = {}): UseClassesReturn {
  const { organizationId, branchId, isReady } = useOrganization();
  const { handleApiError } = useGlobalErrorHandler();
  const { 
    pageSize: initialPageSize,
    autoFetch = true 
  } = options;

  // Use the reusable pagination hook
  const pagination = usePagination({ 
    initialPageSize 
  });

  // Helper function to inject org data
  const withOrgData = useCallback(<T extends Record<string, any>>(data: T) => ({
    ...data,
    organizationId,
    branchId,
  }), [organizationId, branchId]);

  // Local state (only what's specific to classes)
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    if (!isReady) {
      setError('Organization context is loading...');
      return;
    }

    if (!organizationId || !branchId) {
      setError('Organization and Branch information required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ClassService.getClasses({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        organizationId,
        branchId,
      });

      setClasses(response.classdto.data);
      pagination.setTotalCount(response.classdto.count);
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetch classes');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, pagination.pageIndex, pagination.pageSize, handleApiError, pagination.setTotalCount]);

  // Create class
  const createClass = useCallback(async (
    classData: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Class | null> => {
    if (!isReady || !organizationId || !branchId) {
      setError('Organization context not ready');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const fullClassData = withOrgData(classData) as ClassDto;
      const newClass = await ClassService.createClass(fullClassData);
      
      // Refresh the entire list to ensure data consistency
      await fetchClasses();
      
      return newClass;
    } catch (err) {
      const errorMessage = handleApiError(err, 'create class');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, withOrgData, handleApiError, fetchClasses]);

  // ... (other CRUD operations would be similar)

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && isReady && organizationId && branchId) {
      fetchClasses();
    }
  }, [autoFetch, isReady, fetchClasses, organizationId, branchId]);

  return {
    classes,
    loading,
    error,
    
    // Pagination state (from usePagination)
    totalCount: pagination.totalCount,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPrevPage: pagination.hasPrevPage,
    startItem: pagination.startItem,
    endItem: pagination.endItem,
    
    // Actions
    fetchClasses,
    createClass,
    updateClass: async () => null, // Placeholder
    deleteClass: async () => false, // Placeholder
    bulkDeleteClasses: async () => false, // Placeholder
    toggleClassStatus: async () => false, // Placeholder
    importClasses: async () => null, // Placeholder
    
    // Pagination actions (from usePagination)
    setPageIndex: pagination.setPageIndex,
    setPageSize: pagination.setPageSize,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    goToFirstPage: pagination.goToFirstPage,
    goToLastPage: pagination.goToLastPage,
    
    // Refresh
    refresh: fetchClasses,
  };
}
