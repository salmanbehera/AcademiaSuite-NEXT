import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  FeeGroup,
  FeeGroupDto,
  CreateFeeGroupRequest,
  GetFeeGroupsRequest,
  GetFeeGroupsResponse
} from '@/features/student/types/FeeManagement/feegroupType';

export class FeeGroupService {
  private static readonly BASE = API_CONFIG.ENDPOINTS.FEEGROUPS || '/feegroups';

  // Only use this function for wrapping update/create payloads
  private static wrapFeeGroup(data: Partial<FeeGroupDto>) {
    return { FeeGroupMaster: data };
  }

  static async getFeeGroups(params?: GetFeeGroupsRequest): Promise<GetFeeGroupsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      OrganizationId: params?.OrganizationId,
      BranchId: params?.BranchId,
      ...params,
    };
    const response = await enterpriseApiClient.post<GetFeeGroupsResponse>(`${this.BASE}/organization`, normalizedParams);
    // Map camelCase API fields to PascalCase for frontend, do NOT keep camelCase fields
    const mappedData = response.result.data.map((item: any) => ({
      id: item.id,
      OrganizationId: item.organizationId,
      BranchId: item.branchId,
      FeeGroupCode: item.feeGroupCode,
      FeeGroupName: item.feeGroupName,
      Description: item.description,
      LateFeePolicyId: item.lateFeePolicyId,
      DiscountPolicyId: item.discountPolicyId,
      IsActive: item.isActive,
    }));
    return { ...response.result, data: mappedData };
  }

  static async getFeeGroupById(id: string): Promise<FeeGroup> {
    const response = await enterpriseApiClient.get<{ result: FeeGroup }>(`${this.BASE}/${id}`);
    return response.result;
  }

  static async createFeeGroup(request: CreateFeeGroupRequest): Promise<FeeGroup> {
    const response = await enterpriseApiClient.post<{ result: FeeGroup }>(this.BASE, request);
    return response.result;
  }

  static async updateFeeGroup(id: string, data: Partial<FeeGroupDto>): Promise<FeeGroup> {
    const pascalCaseData: any = { ...data };
    if (pascalCaseData.id) {
      pascalCaseData.Id = pascalCaseData.id;
      delete pascalCaseData.id;
    }
    // Remove all camelCase fields from data before sending
    const camelFields = [
      'feeGroupCode', 'feeGroupName', 'description', 'lateFeePolicyId', 'discountPolicyId', 'isActive', 'organizationId', 'branchId'
    ];
    for (const key of camelFields) {
      if (key in pascalCaseData) delete pascalCaseData[key];
    }
    const payload = this.wrapFeeGroup(pascalCaseData);
    const response = await enterpriseApiClient.put<{ result: FeeGroup }>(this.BASE, payload);
    return response.result;
  }

  static async deleteFeeGroup(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleFeeGroupStatus(id: string, completeData: FeeGroupDto, isActive: boolean): Promise<FeeGroup> {
    const payload = this.wrapFeeGroup({ ...completeData, id, IsActive: isActive });
    const response = await enterpriseApiClient.put<{ result: FeeGroup }>(this.BASE, payload);
    return response.result;
  }

  static async bulkCreateFeeGroups(feeGroupsData: FeeGroupDto[]): Promise<FeeGroup[]> {
    const payload = { feeGroups: feeGroupsData.map(data => this.wrapFeeGroup(data)) };
    const response = await enterpriseApiClient.post<{ result: FeeGroup[] }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }

  static async bulkDeleteFeeGroups(ids: string[]): Promise<void> {
    const payload = { FeeGroupMasterIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchFeeGroups(params: GetFeeGroupsRequest & { search?: string }): Promise<GetFeeGroupsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      OrganizationId: params?.OrganizationId,
      BranchId: params?.BranchId,
      ...params,
    };
    const response = await enterpriseApiClient.post<GetFeeGroupsResponse>(`${this.BASE}/organization`, normalizedParams);
    const mappedData = response.result.data.map((item: any) => ({
      id: item.id,
      OrganizationId: item.organizationId,
      BranchId: item.branchId,
      FeeGroupCode: item.feeGroupCode,
      FeeGroupName: item.feeGroupName,
      Description: item.description,
      LateFeePolicyId: item.lateFeePolicyId,
      DiscountPolicyId: item.discountPolicyId,
      IsActive: item.isActive,
    }));
    return { ...response.result, data: mappedData };
  }

  static async exportFeeGroups(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  static async importFeeGroups(data: FeeGroupDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}
