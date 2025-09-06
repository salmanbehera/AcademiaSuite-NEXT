import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Department, DepartmentDto, GetDepartmentsResponse } from '@/features/Administration/types/departmentType';
import { DepartmentService } from '@/features/Administration/services/departmentService';
import { API_CONFIG } from '@/lib/config';

export function useDepartment() {
  const { organizationId, branchId, isReady } = useOrganization();
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof Department | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const queryKey = ['departments', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<any, Error>({
    queryKey,
    queryFn: async () => {
      return await DepartmentService.getDepartments({
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

  const createMutation = useMutation<any, unknown, DepartmentDto>({
    mutationFn: (dto) => DepartmentService.createDepartment({ department: { ...dto, organizationId, branchId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<DepartmentDto> }>({
    mutationFn: ({ id, data }) => DepartmentService.updateDepartment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => DepartmentService.deleteDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => DepartmentService.bulkDeleteDepartments(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  const departments: Department[] = data?.data ?? [];
  const totalCount: number = data?.count ?? 0;
  const totalPages: number = Math.ceil(totalCount / pageSize);
  const startItem: number = pageIndex * pageSize + 1;
  const endItem: number = Math.min(startItem + pageSize - 1, totalCount);

  return {
    departments,
    filteredDepartments: departments,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchDepartments: setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize,
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createDepartment: createMutation.mutateAsync,
    updateDepartment: updateMutation.mutateAsync,
    deleteDepartment: deleteMutation.mutateAsync,
    bulkDeleteDepartments: bulkDeleteMutation.mutateAsync,
  };
}
