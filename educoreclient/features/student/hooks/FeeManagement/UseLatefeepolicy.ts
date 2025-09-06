import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { LateFeePolicy, LateFeePolicyDto, GetLateFeePoliciesResponse } from '@/features/student/types/FeeManagement/latefeepolicyType';
import { LateFeePolicyService } from '@/features/student/services/FeeManagement/latefeepolicyService';
import { API_CONFIG } from '@/lib/config';

export function useLatefeepolicy() {
  const { organizationId, branchId, isReady } = useOrganization();
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof LateFeePolicy | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const queryKey = ['latefeepolicies', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<any, Error>({
    queryKey,
    queryFn: async () => {
      return await LateFeePolicyService.searchLateFeePolicies({
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

  const createMutation = useMutation<any, unknown, LateFeePolicyDto>({
    mutationFn: (dto) => LateFeePolicyService.createLateFeePolicy({ lateFeePolicy: { ...dto, organizationId, branchId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<LateFeePolicyDto> }>({
    mutationFn: ({ id, data }) => LateFeePolicyService.updateLateFeePolicy(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => LateFeePolicyService.deleteLateFeePolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => LateFeePolicyService.bulkDeleteLateFeePolicies(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  const latefeepolicies: LateFeePolicy[] = data?.data ?? [];
  const sortedLatefeepolicies: LateFeePolicy[] = useMemo(() => {
    if (!sortBy) return latefeepolicies;
    return [...latefeepolicies].sort((a, b) => {
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
  }, [latefeepolicies, sortBy, sortOrder]);
  const filteredLatefeepolicies: LateFeePolicy[] = sortedLatefeepolicies;
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  useEffect(() => {
    console.log('Fetched latefeepolicies:', latefeepolicies);
  }, [latefeepolicies]);

  return {
    latefeepolicies,
    filteredLatefeepolicies,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchLatefeepolicies: setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createLatefeepolicy: (entity: LateFeePolicyDto) => createMutation.mutateAsync(entity),
    updateLatefeepolicy: (id: string, entity: Partial<LateFeePolicyDto>) => updateMutation.mutateAsync({ id, data: entity }),
    deleteLatefeepolicy: (id: string) => deleteMutation.mutateAsync(id),
    bulkDeleteLatefeepolicies: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
  };
}
