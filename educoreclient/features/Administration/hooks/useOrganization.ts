"use client";


import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrganizationService } from '@/features/Administration/services/organizationService';
import { Organization, OrganizationDto } from '@/features/Administration/types/organizationTypes';
import { API_CONFIG } from '@/lib/config';

export function useOrganization() {
  // Local pagination and search state
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof Organization | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  // Reset to first page on search, sort change
  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder]);

  // React Query for fetching organizations
  const queryKey = ['organizations', pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<{ organizations: Organization[]; count: number; pageIndex: number; pageSize: number }, Error>({
    queryKey,
    queryFn: async () => {
      const { organizations, count, pageIndex: pageIdx, pageSize: pageSz } = await OrganizationService.getOrganizations({
        pageIndex,
        pageSize,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
      return { organizations, count, pageIndex: pageIdx, pageSize: pageSz };
    },
    staleTime: 30000,
  });

  // Mutations for create, update, delete with invalidation
  const createMutation = useMutation<any, unknown, OrganizationDto>({
    mutationFn: (dto) => OrganizationService.createOrganization(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<OrganizationDto> }>({
    mutationFn: ({ id, data }) => OrganizationService.updateOrganization(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => OrganizationService.deleteOrganization(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => OrganizationService.bulkDeleteOrganizations(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const organizations: Organization[] = data?.organizations ?? [];
  const sortedOrganizations: Organization[] = useMemo(() => {
    if (!sortBy) return organizations;
    return [...organizations].sort((a, b) => {
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
  }, [organizations, sortBy, sortOrder]);
  const filteredOrganizations: Organization[] = sortedOrganizations;
  const totalCount: number = data?.count ?? 0;
  const totalPages: number = Math.ceil(totalCount / pageSize);
  const startItem: number = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem: number = Math.min((pageIndex + 1) * pageSize, totalCount);

  return {
    organizations: sortedOrganizations,
    filteredOrganizations,
    loading: isLoading || isFetching,
    error: fetchError?.message,
    createOrganization: (entity: OrganizationDto) => createMutation.mutateAsync(entity),
    updateOrganization: (id: string, data: Partial<OrganizationDto>) => updateMutation.mutateAsync({ id, data }),
    deleteOrganization: (id: string) => deleteMutation.mutateAsync(id),
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
    bulkDeleteOrganizations: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder
  };
}
