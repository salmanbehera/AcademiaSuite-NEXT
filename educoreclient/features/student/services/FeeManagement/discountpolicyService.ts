import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
	DiscountPolicy,
	DiscountPolicyDto,
	CreateDiscountPolicyRequest,
	GetDiscountPoliciesRequest,
	GetDiscountPoliciesResponse
} from '@/features/student/types/FeeManagement/discountpolicyType';

export class DiscountPolicyService {
	private static readonly BASE = '/discountpolicies';

	// Wraps the payload for create/update
	private static wrapDiscountPolicy(data: Partial<DiscountPolicyDto>) {
		return { discountPolicy: data };
	}

	static async getDiscountPolicies(params?: GetDiscountPoliciesRequest): Promise<GetDiscountPoliciesResponse['result']> {
		const normalizedParams = {
			pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
			pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
			organizationId: params?.organizationId?.toLowerCase(),
			branchId: params?.branchId?.toLowerCase(),
			...params,
		};
		const response = await enterpriseApiClient.post<GetDiscountPoliciesResponse>(`${this.BASE}/organization`, normalizedParams);
		const mappedData = response.result.data.map((item: any) => ({
			id: item.id,
			policyName: item.policyName,
			discountType: item.discountType,
			discountValue: item.discountValue,
			appliesTo: item.appliesTo,
			appliesToDetails: item.appliesToDetails,
			eligibilityCriteria: item.eligibilityCriteria,
			maxLimit: item.maxLimit,
			effectiveFrom: item.effectiveFrom,
			effectiveTo: item.effectiveTo,
			isActive: item.isActive,
			organizationId: item.organizationId,
			branchId: item.branchId,
		}));
		return { ...response.result, data: mappedData };
	}

	static async getDiscountPolicyById(id: string): Promise<DiscountPolicy> {
		const response = await enterpriseApiClient.get<{ result: DiscountPolicy }>(`${this.BASE}/${id}`);
		return response.result;
	}

	static async createDiscountPolicy(request: CreateDiscountPolicyRequest): Promise<DiscountPolicy> {
		const response = await enterpriseApiClient.post<{ result: DiscountPolicy }>(this.BASE, request);
		return response.result;
	}

	static async updateDiscountPolicy(id: string, data: Partial<DiscountPolicyDto>): Promise<DiscountPolicy> {
		// Always send all required fields for update
		// Fetch the original entity to merge with update data
		const original = await this.getDiscountPolicyById(id);
		const merged: any = { ...original, ...data };
		if (merged.id) {
			merged.Id = merged.id;
			delete merged.id;
		}
		const payload = this.wrapDiscountPolicy(merged);
		const response = await enterpriseApiClient.put<{ result: DiscountPolicy }>(this.BASE, payload);
		return response.result;
	}

	static async deleteDiscountPolicy(id: string): Promise<void> {
		await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
	}

	static async toggleDiscountPolicyStatus(id: string, completeData: DiscountPolicyDto, isActive: boolean): Promise<DiscountPolicy> {
		const payload = this.wrapDiscountPolicy({ ...completeData, id, isActive });
		const response = await enterpriseApiClient.put<{ result: DiscountPolicy }>(this.BASE, payload);
		return response.result;
	}

	static async bulkCreateDiscountPolicies(discountPoliciesData: DiscountPolicyDto[]): Promise<DiscountPolicy[]> {
		const payload = { discountPolicies: discountPoliciesData.map(data => this.wrapDiscountPolicy(data)) };
		const response = await enterpriseApiClient.post<{ result: DiscountPolicy[] }>(`${this.BASE}/bulk`, payload);
		return response.result;
	}

	static async bulkDeleteDiscountPolicies(ids: string[]): Promise<void> {
		const payload = { discountPolicyIds: ids };
		await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
	}

	static async searchDiscountPolicies(params: GetDiscountPoliciesRequest & { search?: string }): Promise<GetDiscountPoliciesResponse['result']> {
		const normalizedParams = {
			pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
			pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
			organizationId: params?.organizationId?.toLowerCase(),
			branchId: params?.branchId?.toLowerCase(),
			...params,
		};
		const response = await enterpriseApiClient.post<GetDiscountPoliciesResponse>(`${this.BASE}/organization`, normalizedParams);
		const mappedData = response.result.data.map((item: any) => ({
			id: item.id,
			policyName: item.policyName,
			discountType: item.discountType,
			discountValue: item.discountValue,
			appliesTo: item.appliesTo,
			appliesToDetails: item.appliesToDetails,
			eligibilityCriteria: item.eligibilityCriteria,
			maxLimit: item.maxLimit,
			effectiveFrom: item.effectiveFrom,
			effectiveTo: item.effectiveTo,
			isActive: item.isActive,
			organizationId: item.organizationId,
			branchId: item.branchId,
		}));
		return { ...response.result, data: mappedData };
	}

	static async exportDiscountPolicies(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
		const response = await enterpriseApiClient.getAxiosInstance().get(
			`${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
			{
				params: { format },
				responseType: 'blob',
			}
		);
		return response.data;
	}

	static async importDiscountPolicies(data: DiscountPolicyDto[]): Promise<void> {
		await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
	}
}
