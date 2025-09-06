import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  ClassFeeMapping,
  ClassFeeMappingDto,
  CreateClassFeeMappingRequest,
  GetClassFeeMappingsRequest,
  GetClassFeeMappingsResponse
} from '@/features/student/types/FeeManagement/classfeemappingtype';

export class ClassFeeMappingService {
  private static readonly BASE = API_CONFIG.ENDPOINTS.CLASS_FEE_MAPPINGS;

  private static wrapClassFeeMapping(data: Partial<ClassFeeMappingDto>) {
    return { classFeeMapping: data };
  }

  static async getClassFeeMappings(params?: GetClassFeeMappingsRequest): Promise<GetClassFeeMappingsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId,
      branchId: params?.branchId,
      academicYearId: params?.academicYearId,
      classId: params?.classId,
      ...params,
    };
    const response = await enterpriseApiClient.post<GetClassFeeMappingsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async getClassFeeMappingById(id: string): Promise<ClassFeeMapping> {
    const response = await enterpriseApiClient.get<{ result: ClassFeeMapping }>(`${this.BASE}/${id}`);
    return response.result;
  }

  static async createClassFeeMapping(request: ClassFeeMappingDto): Promise<ClassFeeMapping> {
    const response = await enterpriseApiClient.post<{ result: ClassFeeMapping }>(this.BASE, request);
    return response.result;
  }

  static async updateClassFeeMapping(id: string, data: Partial<ClassFeeMappingDto>): Promise<ClassFeeMapping> {
    const payload = this.wrapClassFeeMapping(data);
    const response = await enterpriseApiClient.put<{ result: ClassFeeMapping }>(`${this.BASE}/${id}`, payload);
    return response.result;
  }

  static async deleteClassFeeMapping(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async bulkDeleteClassFeeMappings(ids: string[]): Promise<void> {
    const payload = { classFeeMappingIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async getClassFeeMappingsWithDetails(params: GetClassFeeMappingsRequest): Promise<(ClassFeeMapping & {
    academicYear: string;
    className: string;
    feeHeadNames: string[];
  })[]> {
    const response = await enterpriseApiClient.post<{ result: { data: (ClassFeeMapping & {
      academicYearId: string;
      classId: string;
      feeHeadIds: string[];
      academicYear: string;
      className: string;
      feeHeadNames: string[];
    })[] } }>(`${this.BASE}/organization`, params);

    // Transform the response to ensure additional fields are included
    return response.result.data.map((item) => ({
      ...item,
      academicYear: item.academicYear || 'N/A',
      className: item.className || 'N/A',
      feeHeadNames: item.feeHeadNames || [],
    }));
  }

  // Add a method to fetch fee heads for a specific class fee mapping
  static async getFeeHeadsForClassFeeMapping(payload: {
    organizationId: string;
    branchId: string;
    AcademicYearId: string;
    ClassId: string;
  }): Promise<Array<{ feeHeadId: string; feeHeadName: string; checked: boolean }>> {
    try {
      const endpoint = `${API_CONFIG.BASE_URL}/classfeemappings/feeheads`;
      const response = await enterpriseApiClient.post<
        Array<{ feeHeadId: string; feeHeadName: string; checked: boolean }>
      >(endpoint, payload);
      return response;
    } catch (error) {
      throw new Error('Failed to fetch fee heads. Please try again later.');
    }
  }
}