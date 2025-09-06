import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';

import {
  ExamCycle,
  ExamCycleDto,
  CreateExamCycleRequest,
  GetExamCyclesRequest,
  GetExamCyclesResponse
} from '@/features/student/types/master/examcycleType';
import { toIsoDate } from '@/lib/utils/dateUtils';

export class ExamCycleService {
  private static readonly BASE = API_CONFIG.ENDPOINTS.EXAM_CYCLES;

  // Only use this function for wrapping update/create payloads
  private static wrapExamCycle(data: Partial<ExamCycleDto>) {
    return { examCycle: data };
  }

  static async getExamCycles(params?: GetExamCyclesRequest): Promise<GetExamCyclesResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetExamCyclesResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async getExamCycleById(id: string): Promise<ExamCycle> {
    const response = await enterpriseApiClient.get<{ result: ExamCycle }>(`${this.BASE}/${id}`);
    return response.result;
  }

  static async createExamCycle(request: CreateExamCycleRequest): Promise<ExamCycle> {
    const response = await enterpriseApiClient.post<{ result: ExamCycle }>(this.BASE, request);
    return response.result;
  }

  static async updateExamCycle(id: string, data: Partial<ExamCycleDto>): Promise<ExamCycle> {
    const payload = this.wrapExamCycle({ ...data, id });
    const response = await enterpriseApiClient.put<{ result: ExamCycle }>(this.BASE, payload);
    return response.result;
  }

  static async deleteExamCycle(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleExamCycleStatus(id: string, completeData: ExamCycleDto, isActive: boolean): Promise<ExamCycle> {
    const payload = this.wrapExamCycle({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: ExamCycle }>(this.BASE, payload);
    return response.result;
  }

  static async bulkCreateExamCycles(examCyclesData: ExamCycleDto[]): Promise<ExamCycle[]> {
    const payload = { examCycles: examCyclesData.map(data => this.wrapExamCycle(data)) };
    const response = await enterpriseApiClient.post<{ result: ExamCycle[] }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }

  static async bulkDeleteExamCycles(ids: string[]): Promise<void> {
    const payload = { ExamCycleIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchExamCycles(params: GetExamCyclesRequest & { search?: string }): Promise<GetExamCyclesResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetExamCyclesResponse>(`${this.BASE}/organization`, normalizedParams);
    // Defensive: ensure result shape is always { pageIndex, pageSize, count, data }
    if (response && response.result && Array.isArray(response.result.data)) {
      return response.result;
    } else if (response && Array.isArray(response.result)) {
      // fallback for legacy/incorrect API: result is array
      return {
        pageIndex: normalizedParams.pageIndex,
        pageSize: normalizedParams.pageSize,
        count: response.result.length,
        data: response.result,
      };
    } else {
      return { pageIndex: 0, pageSize: 0, count: 0, data: [] };
    }
  }

  static async exportExamCycles(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  static async importExamCycles(data: ExamCycleDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}
