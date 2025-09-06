"use client";
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DiscountPolicy, DiscountPolicyDto } from '@/features/student/types/FeeManagement/discountpolicyType';
import { DiscountPolicyService } from '@/features/student/services/FeeManagement/discountpolicyService';
import { API_CONFIG } from '@/lib/config';

export function useDiscountPolicy() {
	const { organizationId, branchId, isReady } = useOrganization();
	const entityContext = useMemo(() => ({ organizationId, branchId }), [organizationId, branchId]);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<keyof DiscountPolicy | undefined>(undefined);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const queryClient = useQueryClient();

	const queryKey = ['discountpolicies', organizationId, branchId, pageIndex, pageSize, searchQuery, sortBy, sortOrder] as const;
	const {
		data,
		isLoading,
		isFetching,
		error: fetchError,
	} = useQuery<any, Error>({
		queryKey,
		queryFn: async () => {
			return await DiscountPolicyService.searchDiscountPolicies({
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

	const createMutation = useMutation<any, unknown, DiscountPolicyDto>({
		mutationFn: (dto) => DiscountPolicyService.createDiscountPolicy({ discountPolicy: { ...dto, organizationId, branchId } }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});
	const updateMutation = useMutation<any, unknown, { id: string; data: Partial<DiscountPolicyDto> }>({
		mutationFn: ({ id, data }) => DiscountPolicyService.updateDiscountPolicy(id, data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});
	const deleteMutation = useMutation<any, unknown, string>({
		mutationFn: (id) => DiscountPolicyService.deleteDiscountPolicy(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});
	const bulkDeleteMutation = useMutation<any, unknown, string[]>({
		mutationFn: (ids) => DiscountPolicyService.bulkDeleteDiscountPolicies(ids),
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	});

	useEffect(() => setPageIndex(0), [searchQuery, sortBy, sortOrder, entityContext]);

	const discountpolicies: DiscountPolicy[] = data?.data ?? [];
	const sortedDiscountpolicies: DiscountPolicy[] = useMemo(() => {
		if (!sortBy) return discountpolicies;
		return [...discountpolicies].sort((a, b) => {
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
	}, [discountpolicies, sortBy, sortOrder]);
	const filteredDiscountpolicies: DiscountPolicy[] = sortedDiscountpolicies;
	const totalCount: number = data?.count ?? 0;
	const totalPages = Math.ceil(totalCount / pageSize);
	const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
	const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

	useEffect(() => {
		console.log('Fetched discountpolicies:', discountpolicies);
	}, [discountpolicies]);

	return {
		discountpolicies,
		filteredDiscountpolicies,
		searchQuery,
		loading: isLoading || isFetching,
		error: fetchError?.message ?? null,
		totalCount,
		pageIndex,
		pageSize,
		totalPages,
		startItem,
		endItem,
		searchDiscountpolicies: setSearchQuery,
		sortBy,
		sortOrder,
		setSortBy,
		setSortOrder,
		setPageIndex,
		setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
		refresh: () => queryClient.invalidateQueries({ queryKey }),
		createDiscountpolicy: (entity: DiscountPolicyDto) => createMutation.mutateAsync(entity),
		updateDiscountpolicy: (id: string, entity: Partial<DiscountPolicyDto>) => updateMutation.mutateAsync({ id, data: entity }),
		deleteDiscountpolicy: (id: string) => deleteMutation.mutateAsync(id),
		bulkDeleteDiscountpolicies: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
	};
}
