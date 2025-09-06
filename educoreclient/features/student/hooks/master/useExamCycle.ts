import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { ExamCycle, ExamCycleDto, GetExamCyclesResponse } from '@/features/student/types/master/examcycleType';
import { ExamCycleService } from '@/features/student/services/master/examcycleService';
import { API_CONFIG } from '@/lib/config';
import { useEntityManager } from '@/hooks/shared/useEntityManager';

export function useExamCycle() {
  const { organizationId, branchId, isReady } = useOrganization();
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof ExamCycle | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const queryKey = ['examCycles', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<GetExamCyclesResponse['result'], Error>({
    queryKey,
    queryFn: async () => {
      return await ExamCycleService.searchExamCycles({
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

  const createMutation = useMutation<any, unknown, ExamCycleDto>({
    mutationFn: (dto) => {
      // Always override with current org/branch
      return ExamCycleService.createExamCycle({
        examCycle: {
          ...dto,
          organizationId,
          branchId,
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<ExamCycleDto> }>({
    mutationFn: ({ id, data }) => ExamCycleService.updateExamCycle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => ExamCycleService.deleteExamCycle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => ExamCycleService.bulkDeleteExamCycles(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  const examCycles: ExamCycle[] = data?.data ?? [];
  const sortedExamCycles: ExamCycle[] = useMemo(() => {
    if (!sortBy) return examCycles;
    return [...examCycles].sort((a, b) => {
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
  }, [examCycles, sortBy, sortOrder]);
  const filteredExamCycles: ExamCycle[] = sortedExamCycles;
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  return {
    examCycles,
    filteredExamCycles,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchExamCycles: setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createExamCycle: (entity: ExamCycleDto) => createMutation.mutateAsync(entity),
    updateExamCycle: (id: string, entity: Partial<ExamCycleDto>) => updateMutation.mutateAsync({ id, data: entity }),
    deleteExamCycle: (id: string) => deleteMutation.mutateAsync(id),
    bulkDeleteExamCycles: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
  };
}
