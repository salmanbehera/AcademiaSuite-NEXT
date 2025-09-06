import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { FeeGroup, FeeGroupDto, GetFeeGroupsResponse } from '@/features/student/types/FeeManagement/feegroupType';
import { FeeGroupService } from '@/features/student/services/FeeManagement/feegroupService';
import { API_CONFIG } from '@/lib/config';

export function useFeegroup() {
  const { organizationId, branchId, isReady } = useOrganization();
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof FeeGroup | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const queryKey = ['feegroups', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<any, Error>({
    queryKey,
    queryFn: async () => {
      return await FeeGroupService.searchFeeGroups({
        pageIndex,
        pageSize,
        OrganizationId: organizationId,
        BranchId: branchId,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
    },
    enabled: isReady,
    staleTime: 30000,
  });

  const createMutation = useMutation<any, unknown, FeeGroupDto>({
    mutationFn: (dto) => FeeGroupService.createFeeGroup({ FeeGroupMaster: { ...dto, OrganizationId: organizationId, BranchId: branchId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<FeeGroupDto> }>({
    mutationFn: ({ id, data }) => FeeGroupService.updateFeeGroup(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => FeeGroupService.deleteFeeGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => FeeGroupService.bulkDeleteFeeGroups(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  const feegroups: FeeGroup[] = data?.data ?? [];
  const sortedFeegroups: FeeGroup[] = useMemo(() => {
    if (!sortBy) return feegroups;
    return [...feegroups].sort((a, b) => {
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
  }, [feegroups, sortBy, sortOrder]);
  const filteredFeegroups: FeeGroup[] = sortedFeegroups;
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  return {
    feegroups,
    filteredFeegroups,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchFeegroups: setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createFeegroup: (entity: FeeGroupDto) => createMutation.mutateAsync(entity),
    updateFeegroup: (id: string, entity: Partial<FeeGroupDto>) => updateMutation.mutateAsync({ id, data: entity }),
    deleteFeegroup: (id: string) => deleteMutation.mutateAsync(id),
    bulkDeleteFeegroups: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
  };
}
