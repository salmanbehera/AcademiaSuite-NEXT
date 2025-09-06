import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Designation, DesignationDto, GetDesignationsResponse } from '@/features/Administration/types/designationType';
import { DesignationService } from '@/features/Administration/services/designationService';
import { API_CONFIG } from '@/lib/config';

export function useDesignation() {
  const { organizationId, branchId, isReady } = useOrganization();
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof Designation | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const queryKey = ['designations', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<any, Error>({
    queryKey,
    queryFn: async () => {
      return await DesignationService.searchDesignations({
        pageIndex,
        pageSize,
        organizationId,
        branchId,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
    },
    enabled: isReady,
    staleTime: 30000,
  });

  const createMutation = useMutation<any, unknown, DesignationDto>({
    mutationFn: (dto) => DesignationService.createDesignation({ designation: { ...dto, organizationId, branchId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<DesignationDto> }>({
    mutationFn: ({ id, data }) => DesignationService.updateDesignation(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => DesignationService.deleteDesignation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => DesignationService.bulkDeleteDesignations(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  const designations: Designation[] = data?.data ?? [];
  const sortedDesignations: Designation[] = useMemo(() => {
    if (!sortBy) return designations;
    return [...designations].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortOrder === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
      }
      return 0;
    });
  }, [designations, sortBy, sortOrder]);
  const filteredDesignations: Designation[] = sortedDesignations;
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  return {
    designations,
    filteredDesignations,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchDesignations: setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createDesignation: (entity: DesignationDto) => createMutation.mutateAsync(entity),
    updateDesignation: (id: string, entity: Partial<DesignationDto>) => updateMutation.mutateAsync({ id, data: entity }),
    deleteDesignation: (id: string) => deleteMutation.mutateAsync(id),
    bulkDeleteDesignations: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
  };
}
