import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
 
import {
  Semister,
  SemisterDto,
  CreateSemisterRequest,
  GetSemistersRequest,
  GetSemistersResponse
} from '@/features/student/types/master/semisterTypes';
import { toIsoDate } from '@/lib/utils/dateUtils';


export class SemisterService {
  private static readonly BASE = API_CONFIG.ENDPOINTS.SEMISTERS;


  // Only use this function for wrapping update/create payloads
  private static wrapSemester(data: Partial<SemisterDto>) {
    return { semester: data };
  }

  static async getSemisters(params?: GetSemistersRequest): Promise<GetSemistersResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetSemistersResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async getSemisterById(id: string): Promise<Semister> {
    const response = await enterpriseApiClient.get<{ result: Semister }>(`${this.BASE}/${id}`);
    return response.result;
  }

  


  static async createSemister(request: CreateSemisterRequest): Promise<Semister> {
    const response = await enterpriseApiClient.post<{ result: Semister }>(this.BASE, request);
    return response.result;
  }

  static async updateSemister(id: string, data: Partial<SemisterDto>): Promise<Semister> {
    // Always ensure id is present in the payload and use wrapSemester
    const payload = this.wrapSemester({ ...data, id });
    const response = await enterpriseApiClient.put<{ result: Semister }>(this.BASE, payload);
    return response.result;
  }

     static async deleteSemister(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleSemisterStatus(id: string, completeData: SemisterDto, isActive: boolean): Promise<Semister> {
    // Always ensure id is present in the payload and use wrapSemester
    const payload = this.wrapSemester({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: Semister }>(this.BASE, payload);
    return response.result;
  }

  static async bulkCreateSemisters(semistersData: SemisterDto[]): Promise<Semister[]> {
  const payload = { semisters: semistersData.map(data => this.wrapSemester(data)) };
    const response = await enterpriseApiClient.post<{ result: Semister[] }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }


  
  static async bulkDeleteSemisters(ids: string[]): Promise<void> {
    const payload = { SemisterIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchSemisters(params: GetSemistersRequest & { search?: string }): Promise<GetSemistersResponse['result']> {
    // POST to /semisters/organization with search and filters in body, like AcademicYearService
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetSemistersResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async exportSemisters(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  static async importSemisters(data: SemisterDto[]): Promise<void> {
    
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }

   

}
