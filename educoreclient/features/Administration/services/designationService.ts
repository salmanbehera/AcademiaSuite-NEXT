"use client";
import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';

import {
  Designation,
  DesignationDto,
  CreateDesignationRequest,
  GetDesignationsRequest,
  GetDesignationsResponse
} from '@/features/Administration/types/designationType';

export class DesignationService {
  private static readonly BASE = '/designations';

  private static wrapDesignation(data: Partial<DesignationDto>) {
    return { designation: data };
  }

  static async getDesignations(params?: GetDesignationsRequest): Promise<GetDesignationsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetDesignationsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async getDesignationById(id: string): Promise<Designation> {
    const response = await enterpriseApiClient.get<{ result: Designation }>(`${this.BASE}/${id}`);
    return response.result;
  }

  static async createDesignation(request: CreateDesignationRequest): Promise<Designation> {
    const response = await enterpriseApiClient.post<{ result: Designation }>(this.BASE, request);
    return response.result;
  }

  static async updateDesignation(id: string, data: Partial<DesignationDto>): Promise<Designation> {
    const payload = this.wrapDesignation({ ...data, id });
    const response = await enterpriseApiClient.put<{ result: Designation }>(this.BASE, payload);
    return response.result;
  }

  static async deleteDesignation(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleDesignationStatus(id: string, completeData: DesignationDto, isActive: boolean): Promise<Designation> {
    const payload = this.wrapDesignation({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: Designation }>(this.BASE, payload);
    return response.result;
  }

  static async bulkCreateDesignations(designationsData: DesignationDto[]): Promise<Designation[]> {
    const payload = { designations: designationsData.map(data => this.wrapDesignation(data)) };
    const response = await enterpriseApiClient.post<{ result: Designation[] }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }

  static async bulkDeleteDesignations(ids: string[]): Promise<void> {
    const payload = { DesignationIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchDesignations(params: GetDesignationsRequest & { search?: string }): Promise<GetDesignationsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetDesignationsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async exportDesignations(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  static async importDesignations(data: DesignationDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}
