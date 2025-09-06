import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';

import {
	FeeHead,
	FeeHeadDto,
	CreateFeeHeadRequest,
	GetFeeHeadsRequest,
	GetFeeHeadsResponse
} from '@/features/student/types/FeeManagement/feeheadType';

export class FeeHeadService {
	private static readonly BASE = API_CONFIG.ENDPOINTS.FEEHEADS;

	// Only use this function for wrapping update/create payloads
	private static wrapFeeHead(data: Partial<FeeHeadDto>) {
		return { FeeHeadMaster: data };
	}

		static async getFeeHeads(params?: GetFeeHeadsRequest): Promise<GetFeeHeadsResponse['result']> {
			const normalizedParams = {
				pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
				pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
				organizationId: params?.organizationId?.toLowerCase(),
				branchId: params?.branchId?.toLowerCase(),
				...params,
			};
			const response = await enterpriseApiClient.post<GetFeeHeadsResponse>(`${this.BASE}/organization`, normalizedParams);
			// Map camelCase API fields to PascalCase for frontend, do NOT keep camelCase fields
			// Include classId and academicYearId in the mapped data
			const mappedData = response.result.data.map((item: any) => ({
				id: item.id,
				FeeHeadCode: item.feeHeadCode,
				FeeHeadName: item.feeHeadName,
				FeeFrequency: item.feeFrequency,
				DefaultGLCode: item.defaultGLCode,
				IsRefundable: item.isRefundable,
				IsActive: item.isActive,
				organizationId: item.organizationId,
				branchId: item.branchId,
				classId: item.classId, // Added property
				academicYearId: item.academicYearId, // Added property
			}));
			return { ...response.result, data: mappedData };
		}

	static async getFeeHeadById(id: string): Promise<FeeHead> {
		const response = await enterpriseApiClient.get<{ result: FeeHead }>(`${this.BASE}/${id}`);
		return response.result;
	}

	static async createFeeHead(request: CreateFeeHeadRequest): Promise<FeeHead> {
		const response = await enterpriseApiClient.post<{ result: FeeHead }>(this.BASE, request);
		return response.result;
	}

	static async updateFeeHead(id: string, data: Partial<FeeHeadDto>): Promise<FeeHead> {
		// Remove all camelCase fields from data before sending
		const pascalCaseData: any = { ...data };
		// Map id to Id for backend model binding
		if (pascalCaseData.id) {
		  pascalCaseData.Id = pascalCaseData.id;
		  delete pascalCaseData.id;
		}
		// List of camelCase fields to remove
		const camelFields = [
		  'feeHeadCode', 'feeHeadName', 'feeFrequency', 'defaultGLCode', 'isRefundable', 'isActive'
		];
		for (const key of camelFields) {
		  if (key in pascalCaseData) delete pascalCaseData[key];
		}
		const payload = this.wrapFeeHead(pascalCaseData);
		const response = await enterpriseApiClient.put<{ result: FeeHead }>(this.BASE, payload);
		return response.result;
	}

	static async deleteFeeHead(id: string): Promise<void> {
		await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
	}

	static async toggleFeeHeadStatus(id: string, completeData: FeeHeadDto, isActive: boolean): Promise<FeeHead> {
		// Always ensure id is present in the payload and use wrapFeeHead
		const payload = this.wrapFeeHead({ ...completeData, id, IsActive: isActive });
		const response = await enterpriseApiClient.put<{ result: FeeHead }>(this.BASE, payload);
		return response.result;
	}

	static async bulkCreateFeeHeads(feeHeadsData: FeeHeadDto[]): Promise<FeeHead[]> {
		const payload = { feeHeads: feeHeadsData.map(data => this.wrapFeeHead(data)) };
		const response = await enterpriseApiClient.post<{ result: FeeHead[] }>(`${this.BASE}/bulk`, payload);
		return response.result;
	}

	static async bulkDeleteFeeHeads(ids: string[]): Promise<void> {
	const payload = { FeeHeadMasterIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
	}

 

		static async searchFeeHeads(params: GetFeeHeadsRequest & { search?: string }): Promise<GetFeeHeadsResponse['result']> {
			const normalizedParams = {
				pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
				pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
				organizationId: params?.organizationId?.toLowerCase(),
				branchId: params?.branchId?.toLowerCase(),
				...params,
			};
			const response = await enterpriseApiClient.post<GetFeeHeadsResponse>(`${this.BASE}/organization`, normalizedParams);
			// Map camelCase API fields to PascalCase for frontend, do NOT keep camelCase fields
			const mappedData = response.result.data.map((item: any) => ({
				id: item.id,
				FeeHeadCode: item.feeHeadCode,
				FeeHeadName: item.feeHeadName,
				FeeFrequency: item.feeFrequency,
				DefaultGLCode: item.defaultGLCode,
				IsRefundable: item.isRefundable,
				IsActive: item.isActive,
				organizationId: item.organizationId,
				branchId: item.branchId,
			}));
			return { ...response.result, data: mappedData };
		}

	static async exportFeeHeads(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
		const response = await enterpriseApiClient.getAxiosInstance().get(
			`${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
			{
				params: { format },
				responseType: 'blob',
			}
		);
		return response.data;
	}

	static async importFeeHeads(data: FeeHeadDto[]): Promise<void> {
		await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
	}

}
