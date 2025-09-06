import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { FeeHead, FeeHeadDto, GetFeeHeadsResponse } from '@/features/student/types/FeeManagement/feeheadType';
import { FeeHeadService } from '@/features/student/services/FeeManagement/feeheadService';
import { API_CONFIG } from '@/lib/config';
import { useEntityManager } from '@/hooks/shared/useEntityManager';

export function useFeehead() {
	const { organizationId, branchId, isReady } = useOrganization();
	const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<keyof FeeHead | undefined>(undefined);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const queryClient = useQueryClient();

	// React Query for fetching fee heads
	const queryKey = ['feeheads', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
	const {
		data,
		isLoading,
		isFetching,
		error: fetchError,
	} = useQuery<any, Error>({
		queryKey,
		queryFn: async () => {
			return await FeeHeadService.searchFeeHeads({
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

	// Mutations for create, update, delete with invalidation
	const createMutation = useMutation<any, unknown, FeeHeadDto>({
		mutationFn: (dto) => FeeHeadService.createFeeHead({ FeeHeadMaster: { ...dto, organizationId, branchId } }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});
	const updateMutation = useMutation<any, unknown, { id: string; data: Partial<FeeHeadDto> }>({
		mutationFn: ({ id, data }) => FeeHeadService.updateFeeHead(id, data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});
	const deleteMutation = useMutation<any, unknown, string>({
		mutationFn: (id) => FeeHeadService.deleteFeeHead(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});
	const bulkDeleteMutation = useMutation<any, unknown, string[]>({
		mutationFn: (ids) => FeeHeadService.bulkDeleteFeeHeads(ids),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});

	useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

	const feeheads: FeeHead[] = data?.data ?? [];
	const sortedFeeheads: FeeHead[] = useMemo(() => {
		if (!sortBy) return feeheads;
		return [...feeheads].sort((a, b) => {
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
	}, [feeheads, sortBy, sortOrder]);
	const filteredFeeheads: FeeHead[] = sortedFeeheads;
	const totalCount: number = data?.count ?? 0;
	const totalPages = Math.ceil(totalCount / pageSize);
	const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
	const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

	// Add a console log to debug the `feeheads` data
	useEffect(() => {
		console.log('Fetched feeheads:', feeheads);
	}, [feeheads]);

	return {
		feeheads,
		filteredFeeheads,
		searchQuery,
		loading: isLoading || isFetching,
		error: fetchError?.message ?? null,
		totalCount,
		pageIndex,
		pageSize,
		totalPages,
		startItem,
		endItem,
		searchFeeheads: setSearchQuery,
		sortBy,
		sortOrder,
		setSortBy,
		setSortOrder,
		setPageIndex,
		setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
		refresh: () => queryClient.invalidateQueries({ queryKey }),
		createFeehead: (entity: FeeHeadDto) => createMutation.mutateAsync(entity),
		updateFeehead: (id: string, entity: Partial<FeeHeadDto>) => updateMutation.mutateAsync({ id, data: entity }),
		deleteFeehead: (id: string) => deleteMutation.mutateAsync(id),
		bulkDeleteFeeheads: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
	};
}
