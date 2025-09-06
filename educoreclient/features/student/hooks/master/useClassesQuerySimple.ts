'use client';

import { useMemo, useCallback, useState } from 'react';
import { Class, ClassDto } from '@/features/student/types/master/classTypes';
import { useOrgData } from '@/contexts/OrganizationContext';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';

// Simple query keys for organization
export const classQueryKeys = {
  all: ['classes'] as const,
  lists: () => [...classQueryKeys.all, 'list'] as const,
  list: (orgId: string, branchId: string, pageIndex: number, pageSize: number) =>
    [...classQueryKeys.lists(), { orgId, branchId, pageIndex, pageSize }] as const,
  details: () => [...classQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...classQueryKeys.details(), id] as const,
};

interface UseClassesQueryOptions {
  pageIndex?: number;
  pageSize?: number;
  enabled?: boolean;
}

// Simplified version without React Query
export function useClassesQuerySimple(options: UseClassesQueryOptions = {}) {
  const { organizationId, branchId, isDataReady } = useOrgData();
  const { handleApiError } = useGlobalErrorHandler();
  
  const {
    pageIndex = 0,
    pageSize = 10,
    enabled = true
  } = options;

  // State management
  const [classes, setClasses] = useState<Class[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch classes function
  const fetchClasses = useCallback(async () => {
    if (!enabled || !isDataReady) return;
    
    setIsLoading(true);
    setIsFetching(true);
    setIsError(false);
    setError(null);

    try {
      // This would be your actual API call
      // const response = await ClassService.getClasses({
      //   pageIndex,
      //   pageSize,
      //   organizationId,
      //   branchId,
      // });
      // setClasses(response.classdto.data);
      // setTotalCount(response.classdto.count);
      
      // Mock data for now
      console.log('Fetching classes with:', { organizationId, branchId, pageIndex, pageSize });
      
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      handleApiError(err, 'fetch classes');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [enabled, isDataReady, pageIndex, pageSize, organizationId, branchId, handleApiError]);

  // Create class
  const createClass = useCallback(async (classData: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsCreating(true);
    try {
      const fullClassData = {
        ...classData,
        organizationId,
        branchId,
      } as ClassDto;
      
      // Mock API call
      console.log('Creating class:', fullClassData);
      
      // Refresh after create
      await fetchClasses();
      
    } catch (err) {
      handleApiError(err, 'create class');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [organizationId, branchId, fetchClasses, handleApiError]);

  // Update class
  const updateClass = useCallback(async (id: string, classData: Partial<ClassDto>) => {
    setIsUpdating(true);
    try {
      const fullUpdateData = {
        ...classData,
        id,
        organizationId,
        branchId,
      };
      
      // Mock API call
      console.log('Updating class:', fullUpdateData);
      
      // Refresh after update
      await fetchClasses();
      
    } catch (err) {
      handleApiError(err, 'update class');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [organizationId, branchId, fetchClasses, handleApiError]);

  // Delete class
  const deleteClass = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      // Mock API call
      console.log('Deleting class:', id);
      
      // Refresh after delete
      await fetchClasses();
      
    } catch (err) {
      handleApiError(err, 'delete class');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [fetchClasses, handleApiError]);

  // Refetch function
  const refetch = useCallback(() => {
    return fetchClasses();
  }, [fetchClasses]);

  // Invalidate function (mock)
  const invalidate = useCallback(() => {
    console.log('Cache invalidated');
    return fetchClasses();
  }, [fetchClasses]);

  return {
    // Data
    classes,
    totalCount,
    
    // Loading states
    isLoading,
    isFetching,
    isError,
    error,
    
    // Mutations
    createClass,
    updateClass,
    deleteClass,
    
    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,
    
    // Utilities
    refetch,
    invalidate,
  };
}
