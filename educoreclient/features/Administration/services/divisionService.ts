"use client";
import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';

import {
  Division,
  DivisionDto,
  CreateDivisionRequest,
  GetDivisionsRequest,
  GetDivisionsResponse
} from '@/features/Administration/types/divisionType';

export class DivisionService {
  private static readonly BASE = '/divisions';

  private static wrapDivision(data: Partial<DivisionDto>) {
    return { division: data };
  }

  static async getDivisions(params?: GetDivisionsRequest): Promise<GetDivisionsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetDivisionsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async getDivisionById(id: string): Promise<Division> {
    const response = await enterpriseApiClient.get<{ result: Division }>(`${this.BASE}/${id}`);
    return response.result;
  }

  static async createDivision(request: CreateDivisionRequest): Promise<Division> {
    const response = await enterpriseApiClient.post<{ result: Division }>(this.BASE, request);
    return response.result;
  }

  static async updateDivision(id: string, data: Partial<DivisionDto>): Promise<Division> {
    const payload = this.wrapDivision({ ...data, id });
    const response = await enterpriseApiClient.put<{ result: Division }>(this.BASE, payload);
    return response.result;
  }

  static async deleteDivision(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleDivisionStatus(id: string, completeData: DivisionDto, isActive: boolean): Promise<Division> {
    const payload = this.wrapDivision({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: Division }>(this.BASE, payload);
    return response.result;
  }

  static async bulkCreateDivisions(divisionsData: DivisionDto[]): Promise<Division[]> {
    const payload = { divisions: divisionsData.map(data => this.wrapDivision(data)) };
    const response = await enterpriseApiClient.post<{ result: Division[] }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }

  static async bulkDeleteDivisions(ids: string[]): Promise<void> {
    const payload = { DivisionIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchDivisions(params: GetDivisionsRequest & { search?: string }): Promise<GetDivisionsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetDivisionsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async exportDivisions(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  static async importDivisions(data: DivisionDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}
