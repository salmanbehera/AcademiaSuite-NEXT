import { API_CONFIG } from "@/lib/config";
import { apiClient as enterpriseApiClient } from "@/lib/enterprise-api-client";
import {
  LateFeePolicy,
  LateFeePolicyDto,
  CreateLateFeePolicyRequest,
  GetLateFeePoliciesRequest,
  GetLateFeePoliciesResponse,
} from "@/features/student/types/FeeManagement/latefeepolicyType";

export class LateFeePolicyService {
  private static readonly BASE = "/latefeepolicies";

  // Wraps the payload for create/update
  private static wrapLateFeePolicy(data: Partial<LateFeePolicyDto>) {
    return { lateFeePolicy: data };
  }

  static async getLateFeePolicies(
    params?: GetLateFeePoliciesRequest
  ): Promise<GetLateFeePoliciesResponse["result"]> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetLateFeePoliciesResponse>(
      `${this.BASE}/organization`,
      normalizedParams
    );
    const mappedData = response.result.data.map((item: any) => ({
      id: item.id,
      policyName: item.policyName,
      gracePeriodDays: item.gracePeriodDays,
      penaltyType: item.penaltyType,
      penaltyValue: item.penaltyValue,
      maxPenalty: item.maxPenalty,
      isActive: item.isActive,
      organizationId: item.organizationId,
      branchId: item.branchId,
    }));
    return { ...response.result, data: mappedData };
  }

  static async getLateFeePolicyById(id: string): Promise<LateFeePolicy> {
    const response = await enterpriseApiClient.get<{ result: LateFeePolicy }>(
      `${this.BASE}/${id}`
    );
    return response.result;
  }

  static async createLateFeePolicy(
    request: CreateLateFeePolicyRequest
  ): Promise<LateFeePolicy> {
    const response = await enterpriseApiClient.post<{ result: LateFeePolicy }>(
      this.BASE,
      request
    );
    return response.result;
  }

  static async updateLateFeePolicy(
    id: string,
    data: Partial<LateFeePolicyDto>
  ): Promise<LateFeePolicy> {
    // Always send all required fields for update
    // Fetch the original entity to merge with update data
    const original = await this.getLateFeePolicyById(id);

    // Merge into a plain object (not the strongly-typed DTO) so we can
    // safely normalize properties coming from `data` without triggering
    // TypeScript incompatibilities (e.g., `penaltyType` union mismatch)
    const merged: Record<string, any> = { ...original, ...data };

    // Map `id` -> `Id` on the payload object if required by backend
    const payloadObj: Record<string, any> = { ...merged };
    if (merged.id) {
      payloadObj.Id = merged.id;
      delete payloadObj.id;
    }

    const payload = this.wrapLateFeePolicy(payloadObj as any);
    const response = await enterpriseApiClient.put<{ result: LateFeePolicy }>(
      this.BASE,
      payload
    );
    return response.result;
  }

  static async deleteLateFeePolicy(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleLateFeePolicyStatus(
    id: string,
    completeData: LateFeePolicyDto,
    isActive: boolean
  ): Promise<LateFeePolicy> {
    const payload = this.wrapLateFeePolicy({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: LateFeePolicy }>(
      this.BASE,
      payload
    );
    return response.result;
  }

  static async bulkCreateLateFeePolicies(
    lateFeePoliciesData: LateFeePolicyDto[]
  ): Promise<LateFeePolicy[]> {
    const payload = {
      lateFeePolicies: lateFeePoliciesData.map((data) =>
        this.wrapLateFeePolicy(data)
      ),
    };
    const response = await enterpriseApiClient.post<{
      result: LateFeePolicy[];
    }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }

  static async bulkDeleteLateFeePolicies(ids: string[]): Promise<void> {
    const payload = { lateFeePolicyIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchLateFeePolicies(
    params: GetLateFeePoliciesRequest & { search?: string }
  ): Promise<GetLateFeePoliciesResponse["result"]> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetLateFeePoliciesResponse>(
      `${this.BASE}/organization`,
      normalizedParams
    );
    const mappedData = response.result.data.map((item: any) => ({
      id: item.id,
      policyName: item.policyName,
      gracePeriodDays: item.gracePeriodDays,
      penaltyType: item.penaltyType,
      penaltyValue: item.penaltyValue,
      maxPenalty: item.maxPenalty,
      isActive: item.isActive,
      organizationId: item.organizationId,
      branchId: item.branchId,
    }));
    return { ...response.result, data: mappedData };
  }

  static async exportLateFeePolicies(
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    const response = await enterpriseApiClient
      .getAxiosInstance()
      .get(`${this.BASE}/export-template`, {
        params: { format },
        responseType: "blob",
      });

    return response.data;
  }

  static async importLateFeePolicies(data: LateFeePolicyDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}
