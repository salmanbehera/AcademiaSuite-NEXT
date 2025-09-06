import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import {
  ClassFeeMapping,
  ClassFeeMappingDto,
  GetClassFeeMappingsResponse
} from '@/features/student/types/FeeManagement/classfeemappingtype';
import { ClassFeeMappingService } from '@/features/student/services/FeeManagement/classfeemappingService';
import { API_CONFIG } from '@/lib/config';

export function useClassFeeMapping() {
  const { organizationId, branchId, isReady } = useOrganization();
  const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof ClassFeeMapping | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const queryKey = ['classfeemappings', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<any, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await ClassFeeMappingService.getClassFeeMappingsWithDetails({
          pageIndex,
          pageSize,
          organizationId,
          branchId,
          search: searchQuery,
          sortBy,
          sortOrder,
        });
      } catch (error) {
        console.error('Error fetching class fee mappings:', error);
        throw error;
      }
    },
    enabled: isReady,
    staleTime: 30000,
  });

  // Explicitly include organizationId and branchId in the payload
  const createMutation = useMutation<any, unknown, ClassFeeMappingDto>({
    mutationFn: (dto) => {
      const payload = {
        ...dto,
        organizationId,
        branchId,
      };
      return ClassFeeMappingService.createClassFeeMapping(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  // Explicitly include organizationId and branchId in the update payload
  const updateMutation = useMutation<any, unknown, { id: string; data: Partial<ClassFeeMappingDto> }>({
    mutationFn: ({ id, data }) => {
      const payload = {
        ...data,
        organizationId,
        branchId,
      };
      return ClassFeeMappingService.updateClassFeeMapping(id, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (id) => ClassFeeMappingService.deleteClassFeeMapping(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const bulkDeleteMutation = useMutation<any, unknown, string[]>({
    mutationFn: (ids) => ClassFeeMappingService.bulkDeleteClassFeeMappings(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

  const classFeeMappings: ClassFeeMapping[] = data?.data ?? [];
  const totalCount: number = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  const transformedData = data?.map((item: ClassFeeMapping) => ({
    ...item,
    academicYear: item.academicYear || 'N/A',
    className: item.className || 'N/A',
    feeHeadNames: item.feeHeadNames || [],
  })) as (ClassFeeMapping & {
    academicYear: string;
    className: string;
    feeHeadNames: string[];
  })[];

  // Add a function to fetch fee heads for a specific class fee mapping
  const fetchFeeHeads = async (payload: {
    organizationId: string;
    branchId: string;
    AcademicYearId: string;
    ClassId: string;
  }) => {
    return await ClassFeeMappingService.getFeeHeadsForClassFeeMapping(payload);
  };

  return {
    classFeeMappings: transformedData,
    searchQuery,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchClassFeeMappings: setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createClassFeeMapping: (entity: ClassFeeMappingDto) => createMutation.mutateAsync(entity),
    updateClassFeeMapping: (id: string, entity: Partial<ClassFeeMappingDto>) => updateMutation.mutateAsync({ id, data: entity }),
    deleteClassFeeMapping: (id: string) => deleteMutation.mutateAsync(id),
    bulkDeleteClassFeeMappings: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
    fetchFeeHeads, // Include the new fetchFeeHeads function
  };
}