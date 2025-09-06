  
import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  AcademicYear,
  AcademicYearDto,
  CreateAcademicYearRequest,
  GetAcademicYearsRequest,
  GetAcademicYearsResponse
} from '@/features/Administration/types/academicYearTypes';



export class AcademicYearService {
  private static readonly BASE = API_CONFIG.ENDPOINTS.ACADEMIC_YEARS;

  private static wrapAcademicyear(data: Partial<AcademicYearDto>) {
    return { academicyear: data };
  }

  static async getAcademicYears(params?: GetAcademicYearsRequest): Promise<GetAcademicYearsResponse> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetAcademicYearsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response;
  }

  static async getAcademicYearById(id: string): Promise<AcademicYear> {
    return enterpriseApiClient.get<AcademicYear>(`${this.BASE}/${id}`);
  }

  static async createAcademicYear(request: CreateAcademicYearRequest): Promise<AcademicYear> {
    return enterpriseApiClient.post<AcademicYear>(this.BASE, request);
  }

  static async updateAcademicYear(id: string, data: Partial<AcademicYearDto>): Promise<AcademicYear> {
    const payload = this.wrapAcademicyear({ id, ...data });
    return enterpriseApiClient.put<AcademicYear>(this.BASE, payload);
  }

  static async deleteAcademicYear(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleAcademicYearStatus(id: string, completeData: AcademicYearDto, isActive: boolean): Promise<AcademicYear> {
    const payload = this.wrapAcademicyear({ ...completeData, id, isActive });
    return enterpriseApiClient.put<AcademicYear>(this.BASE, payload);
  }

  static async bulkCreateAcademicYears(academicYearsData: AcademicYearDto[]): Promise<AcademicYear[]> {
    const payload = { academicYears: academicYearsData.map(data => this.wrapAcademicyear(data)) };
    return enterpriseApiClient.post<AcademicYear[]>(`${this.BASE}/bulk`, payload);
  }

  static async bulkDeleteAcademicYears(ids: string[]): Promise<void> {
    const payload = { AcademicYearIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }


  static async searchAcademicYears(searchTerm: string, filters?: Record<string, any>): Promise<GetAcademicYearsResponse> {
    const params = {
      search: searchTerm,
      ...filters,
    };
    return enterpriseApiClient.get<GetAcademicYearsResponse>(`${this.BASE}/search`, params);
  }

  static async exportAcademicYears(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }
   static async importAcademicYears(data: AcademicYearDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}

 