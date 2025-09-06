'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassService } from '@/features/student/services/master';
import { Class, ClassDto, GetClassesResponse } from '@/features/student/types/master/classTypes';
import { useOrgData } from '@/contexts/OrganizationContext';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';

// Query keys for cache management
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

export function useClassesQuery(options: UseClassesQueryOptions = {}) {
  const { organizationId, branchId, isDataReady } = useOrgData();
  const { handleApiError } = useGlobalErrorHandler();
  const queryClient = useQueryClient();
  
  const {
    pageIndex = 0,
    pageSize = 10,
    enabled = true
  } = options;

  // Fetch classes with React Query
  const classesQuery = useQuery<GetClassesResponse, Error>({
    queryKey: classQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
    queryFn: () => ClassService.getClasses({
      pageIndex,
      pageSize,
      organizationId,
      branchId,
    }),
    enabled: enabled && isDataReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Create class mutation with optimistic updates
  const createClassMutation = useMutation<Class, Error, Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>, { previousClasses: unknown }>({
    mutationFn: (classData: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => {
      const fullClassData = {
        ...classData,
        organizationId,
        branchId,
      } as ClassDto;
      return ClassService.createClass(fullClassData);
    },
    onMutate: async (newClass: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: classQueryKeys.list(organizationId, branchId, pageIndex, pageSize) 
      });

      // Snapshot previous value
      const previousClasses = queryClient.getQueryData(
        classQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
      );

      // Optimistically update cache
      queryClient.setQueryData(
        classQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
        (old: GetClassesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            classdto: {
              ...old.classdto,
              data: [
                {
                  ...newClass,
                  id: `temp-${Date.now()}`, // Temporary ID
                  organizationId,
                  branchId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as Class,
                ...old.classdto.data,
              ],
              count: old.classdto.count + 1,
            },
          };
        }
      );

      return { previousClasses };
    },
    onError: (error: Error, newClass: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>, context: { previousClasses: unknown } | undefined) => {
      // Rollback on error
      if (context?.previousClasses) {
        queryClient.setQueryData(
          classQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          context.previousClasses
        );
      }
      handleApiError(error, 'create class');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: classQueryKeys.list(organizationId, branchId, pageIndex, pageSize) 
      });
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation<Class, Error, { id: string; classData: Partial<ClassDto> }, { previousClasses: unknown }>({
    mutationFn: ({ id, classData }: { id: string; classData: Partial<ClassDto> }) => {
      const fullUpdateData = {
        ...classData,
        id,
        organizationId,
        branchId,
      };
      return ClassService.updateClass(id, fullUpdateData);
    },
    onMutate: async ({ id, classData }: { id: string; classData: Partial<ClassDto> }) => {
      await queryClient.cancelQueries({ 
        queryKey: classQueryKeys.list(organizationId, branchId, pageIndex, pageSize) 
      });

      const previousClasses = queryClient.getQueryData(
        classQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
      );

      // Optimistically update
      queryClient.setQueryData(
        classQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
        (old: GetClassesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            classdto: {
              ...old.classdto,
              data: old.classdto.data.map((cls: Class) =>
                cls.id === id ? { ...cls, ...classData, updatedAt: new Date().toISOString() } : cls
              ),
            },
          };
        }
      );

      return { previousClasses };
    },
    onError: (error: Error, variables: { id: string; classData: Partial<ClassDto> }, context: { previousClasses: unknown } | undefined) => {
      if (context?.previousClasses) {
        queryClient.setQueryData(
          classQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          context.previousClasses
        );
      }
      handleApiError(error, 'update class');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: classQueryKeys.list(organizationId, branchId, pageIndex, pageSize) 
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation<void, Error, { id: string; completeData: ClassDto }, { previousClasses: unknown }>({
    mutationFn: ({ id, completeData }) => ClassService.deleteClass(id, completeData),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ 
        queryKey: classQueryKeys.list(organizationId, branchId, pageIndex, pageSize) 
      });

      const previousClasses = queryClient.getQueryData(
        classQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
      );

      // Optimistically remove
      queryClient.setQueryData(
        classQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
        (old: GetClassesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            classdto: {
              ...old.classdto,
              data: old.classdto.data.filter((cls: Class) => cls.id !== id),
              count: old.classdto.count - 1,
            },
          };
        }
      );

      return { previousClasses };
    },
    onError: (error: Error, variables: { id: string; completeData: ClassDto }, context: { previousClasses: unknown } | undefined) => {
      if (context?.previousClasses) {
        queryClient.setQueryData(
          classQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          context.previousClasses
        );
      }
      handleApiError(error, 'delete class');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: classQueryKeys.list(organizationId, branchId, pageIndex, pageSize) 
      });
    },
  });

  return {
    // Data
    classes: classesQuery.data?.classdto?.data ?? [],
    totalCount: classesQuery.data?.classdto?.count ?? 0,
    
    // Loading states
    isLoading: classesQuery.isLoading,
    isFetching: classesQuery.isFetching,
    isError: classesQuery.isError,
    error: classesQuery.error,
    
    // Mutations
    createClass: createClassMutation.mutateAsync,
    updateClass: (id: string, classData: Partial<ClassDto>) => 
      updateClassMutation.mutateAsync({ id, classData }),
    deleteClass: (id: string, completeData: ClassDto) => deleteClassMutation.mutateAsync({ id, completeData }),
    
    // Mutation states
    isCreating: createClassMutation.isPending,
    isUpdating: updateClassMutation.isPending,
    isDeleting: deleteClassMutation.isPending,
    
    // Utilities
    refetch: classesQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: classQueryKeys.lists() }),
  };
}
