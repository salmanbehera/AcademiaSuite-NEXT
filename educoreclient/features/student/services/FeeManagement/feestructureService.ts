// Fee Structure Service
import { API_CONFIG } from "@/lib/config";
import { apiClient as enterpriseApiClient } from "@/lib/enterprise-api-client";
import {
  FeeStructure,
  FeeStructureDto,
  CreateFeeStructureRequest,
  GetFeeStructuresRequest,
  GetFeeStructuresResponse,
  FeeHeadsByClassRequest,
  FeeHeadByClassDto,
} from "@/features/student/types/FeeManagement/feestructureType";

export class FeeStructureService {
  private static readonly BASE = "/feestructures";

  // Wraps the payload for create/update
  private static wrapFeeStructure(data: Partial<FeeStructureDto>) {
    return { feeStructure: data };
  }

  static async getFeeStructures(
    params?: GetFeeStructuresRequest
  ): Promise<GetFeeStructuresResponse["result"]> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetFeeStructuresResponse>(
      `${this.BASE}/organization`,
      normalizedParams
    );
    return response.result;
  }

  static async getFeeStructureById(id: string): Promise<FeeStructure> {
    const response = await enterpriseApiClient.get<FeeStructure>(
      `${this.BASE}/${id}`
    );
    return response;
  }

  static async createFeeStructure(
    request: CreateFeeStructureRequest
  ): Promise<FeeStructure> {
    const response = await enterpriseApiClient.post<{ result: FeeStructure }>(
      this.BASE,
      request
    );
    return response.result;
  }

  static async updateFeeStructure(
    id: string,
    data: Partial<FeeStructureDto>
  ): Promise<FeeStructure> {
    // Always send all required fields for update
    // Fetch the original entity to merge with update data
    const original = await this.getFeeStructureById(id);
    // Always use details from the form data, not the original
    const merged: any = { ...original, ...data, details: data.details };
    if (merged.id) {
      merged.Id = merged.id;
      delete merged.id;
    }
    const payload = this.wrapFeeStructure(merged);
    const response = await enterpriseApiClient.put<{ result: FeeStructure }>(
      this.BASE,
      payload
    );
    return response.result;
  }

  static async deleteFeeStructure(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleFeeStructureStatus(
    id: string,
    completeData: FeeStructureDto,
    isActive: boolean
  ): Promise<FeeStructure> {
    const payload = this.wrapFeeStructure({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: FeeStructure }>(
      this.BASE,
      payload
    );
    return response.result;
  }

  static async bulkCreateFeeStructures(
    feeStructuresData: FeeStructureDto[]
  ): Promise<FeeStructure[]> {
    const payload = {
      feeStructures: feeStructuresData.map((data) =>
        this.wrapFeeStructure(data)
      ),
    };
    const response = await enterpriseApiClient.post<{ result: FeeStructure[] }>(
      `${this.BASE}/bulk`,
      payload
    );
    return response.result;
  }

  static async bulkDeleteFeeStructures(ids: string[]): Promise<void> {
    const payload = { feeStructureIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchFeeStructures(
    params: GetFeeStructuresRequest & { search?: string }
  ): Promise<GetFeeStructuresResponse["result"]> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetFeeStructuresResponse>(
      `${this.BASE}/organization`,
      normalizedParams
    );
    return response.result;
  }

  static async exportFeeStructures(
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

  static async importFeeStructures(data: FeeStructureDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }

  static async getFeeHeadsByClass(
    request: FeeHeadsByClassRequest
  ): Promise<FeeHeadByClassDto[]> {
    const response = await enterpriseApiClient.post<FeeHeadByClassDto[]>(
      `${this.BASE}/feeheads-by-class`,
      request
    );
    return response;
  }
}
