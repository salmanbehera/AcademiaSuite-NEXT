// useAcademicYears.ts
// -------------------
// Custom hook managing AcademicYear entities using a generic entity manager.
// Provides server-side pagination, debounced search, CRUD ops and refresh.
'use client';

import { useOrganization } from '@/contexts/OrganizationContext';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AcademicYearService } from '@/features/Administration/services/academicYearService';
import { AcademicYear, AcademicYearDto, GetAcademicYearsResponse } from '@/features/Administration/types/academicYearTypes';
import { API_CONFIG } from '@/lib/config';

/**
 * Hook return shape aligned to legacy API but backed by useEntityManager
 */
export function useAcademicYears() {
  const { organizationId, branchId, isReady } = useOrganization();

  // Prepare a stable context object to avoid infinite fetch loops
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  // Local pagination and search state
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  // Sorting state
  const [sortBy, setSortBy] = useState<keyof AcademicYear | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  // React Query for fetching academic years
  const queryKey = ['academicYears', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<GetAcademicYearsResponse['result'], Error>({
    queryKey,
    queryFn: async () => {
      const response = await AcademicYearService.getAcademicYears({
        pageIndex,
        pageSize,
        organizationId,
        branchId,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
      return response.result;
    },
    enabled: isReady,
    staleTime: 30000,
  });

  // Mutations for create, update, delete with invalidation
  const createMutation = useMutation<any, unknown, AcademicYearDto>({
    mutationFn: (dto) =>
      AcademicYearService.createAcademicYear({ academicyear: { ...dto, organizationId, branchId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<AcademicYear> }>({
    mutationFn: ({ id, data }) => AcademicYearService.updateAcademicYear(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    // Call DELETE endpoint by ID only
    mutationFn: (id) => AcademicYearService.deleteAcademicYear(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // Bulk delete mutation for best practice
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => AcademicYearService.bulkDeleteAcademicYears(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // Reset to first page on search, sort or context change
  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  // Expose values and handlers matching legacy shape
  // Ensure typed AcademicYear array to avoid implicit any in consumers
  const years: AcademicYear[] = data?.data ?? [];
  // Apply client-side sorting if requested
  const sortedYears: AcademicYear[] = useMemo(() => {
    if (!sortBy) return years;
    return [...years].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortOrder === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }
      return 0;
    });
  }, [years, sortBy, sortOrder]);
  const filteredYears: AcademicYear[] = sortedYears;
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);
  return {
    academicYears: years,
    filteredYears: filteredYears,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchAcademicYears: setSearchQuery,
    // Sorting controls
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createAcademicYear: (entity: AcademicYearDto) => createMutation.mutateAsync(entity),
    updateAcademicYear: (id: string, entity: Partial<AcademicYear>) => updateMutation.mutateAsync({ id, data: entity }),
    deleteAcademicYear: (id: string) => deleteMutation.mutateAsync(id),
    bulkDeleteAcademicYears: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
  };
}
