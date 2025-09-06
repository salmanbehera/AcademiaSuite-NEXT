"use client";
import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BranchService } from '@/features/Administration/services/branchService';
import { Branch, BranchDto } from '@/features/Administration/types/branchTypes';
import { API_CONFIG } from '@/lib/config';

export function useBranch() {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof Branch | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder]);

  const queryKey = ['branches', pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<{ branches: Branch[]; count: number; pageIndex: number; pageSize: number }, Error>({
    queryKey,
    queryFn: async () => {
      const { branches, count, pageIndex: pageIdx, pageSize: pageSz } = await BranchService.getBranches({
        pageIndex,
        pageSize,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
      return { branches, count, pageIndex: pageIdx, pageSize: pageSz };
    },
    staleTime: 30000,
  });

  const createMutation = useMutation<any, unknown, BranchDto>({
    mutationFn: (dto) => BranchService.createBranch(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<BranchDto> }>({
    mutationFn: ({ id, data }) => BranchService.updateBranch(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => BranchService.deleteBranch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => BranchService.bulkDeleteBranches(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const branches: Branch[] = data?.branches ?? [];
  const sortedBranches: Branch[] = useMemo(() => {
    if (!sortBy) return branches;
    return [...branches].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return (sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal));
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [branches, sortBy, sortOrder]);
  const filteredBranches: Branch[] = sortedBranches;
  const totalCount: number = data?.count ?? 0;
  const totalPages: number = Math.ceil(totalCount / pageSize);
  const startItem: number = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem: number = Math.min((pageIndex + 1) * pageSize, totalCount);

  return {
    branches: sortedBranches,
    filteredBranches,
    loading: isLoading || isFetching,
    error: fetchError?.message,
    createBranch: (entity: BranchDto) => createMutation.mutateAsync(entity),
    updateBranch: (id: string, data: Partial<BranchDto>) => updateMutation.mutateAsync({ id, data }),
    deleteBranch: (id: string) => deleteMutation.mutateAsync(id),
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    searchQuery,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    totalCount,
    totalPages,
    startItem,
    endItem,
    bulkDeleteBranches: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder
  };
}
