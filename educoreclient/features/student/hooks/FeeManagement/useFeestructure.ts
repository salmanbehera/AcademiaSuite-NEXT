import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { FeeStructure, FeeStructureDto, FeeHeadsByClassRequest, FeeHeadByClassDto } from '@/features/student/types/FeeManagement/feestructureType';
import { FeeStructureService } from '@/features/student/services/FeeManagement/feestructureService';
import { API_CONFIG } from '@/lib/config';

export function useFeestructure() {
  const { organizationId, branchId, isReady } = useOrganization();
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof FeeStructure | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const queryKey = ['feestructures', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<any, Error>({
    queryKey,
    queryFn: async () => {
      return await FeeStructureService.searchFeeStructures({
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

  const createMutation = useMutation<any, unknown, FeeStructureDto>({
    mutationFn: (dto) => FeeStructureService.createFeeStructure({ feeStructure: { ...dto, organizationId, branchId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<FeeStructureDto> }>({
    mutationFn: ({ id, data }) => FeeStructureService.updateFeeStructure(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => FeeStructureService.deleteFeeStructure(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => FeeStructureService.bulkDeleteFeeStructures(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  const feestructures: FeeStructure[] = data?.data ?? [];
  const sortedFeestructures: FeeStructure[] = useMemo(() => {
    if (!sortBy) return feestructures;
    return [...feestructures].sort((a, b) => {
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
  }, [feestructures, sortBy, sortOrder]);

  const filteredFeestructures: FeeStructure[] = sortedFeestructures;
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);


  // Fetch fee heads by class and academic year
  const fetchFeeHeadsByClass = async (params: FeeHeadsByClassRequest): Promise<FeeHeadByClassDto[]> => {
    return FeeStructureService.getFeeHeadsByClass(params);
  };

  return {
    feestructures,
    filteredFeestructures,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchFeestructures: setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createFeestructure: (entity: FeeStructureDto) => createMutation.mutateAsync(entity),
    updateFeestructure: (id: string, entity: Partial<FeeStructureDto>) => updateMutation.mutateAsync({ id, data: entity }),
    deleteFeestructure: (id: string) => deleteMutation.mutateAsync(id),
    bulkDeleteFeestructures: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
    fetchFeeHeadsByClass,
  };
}
