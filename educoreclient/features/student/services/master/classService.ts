import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  Class, 
  ClassDto, 
  CreateClassRequest, 
  GetClassesRequest, 
  GetClassesResponse 
} from '@/features/student/types/master/classTypes';

/**
 * Enterprise Class API Service using Axios
 * Features: Request/Response interceptors, Error handling, Logging
 * Organization & Branch IDs are now handled through context
 */

export class ClassService {
  
  // Get all classes with pagination (organization-based)
  static async getClasses(params?: GetClassesRequest): Promise<GetClassesResponse> {
    const queryParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId,
      branchId: params?.branchId,
      ...params,
    };

    // Use organization-based endpoint
    return enterpriseApiClient.get<GetClassesResponse>(`${API_CONFIG.ENDPOINTS.CLASSES}/organization`, queryParams);
  }

  // Get class by ID
  static async getClassById(id: string): Promise<Class> {
    return enterpriseApiClient.get<Class>(`${API_CONFIG.ENDPOINTS.CLASSES}/${id}`);
  }

  // Create new class (organization/branch IDs handled by hooks)
  static async createClass(classData: ClassDto): Promise<Class> {
    const payload: CreateClassRequest = {
      classdto: classData,
    };
    
    return enterpriseApiClient.post<Class>(API_CONFIG.ENDPOINTS.CLASSES, payload);
  }

  // Update existing class using PUT method
  static async updateClass(id: string, classData: Partial<ClassDto>): Promise<Class> {
    const payload = {
      classdto: {
        id: id,
        ...classData,
      }
    };
    
    return enterpriseApiClient.put<Class>(API_CONFIG.ENDPOINTS.CLASSES, payload);
  }

  // Simple delete method - expects complete data from caller
  static async deleteClass(id: string, completeData: ClassDto): Promise<void> {
    const payload = {
      classdto: {
        ...completeData,
        id: id,
        isActive: false  // Soft delete
      }
    };
    
    await enterpriseApiClient.put<Class>(API_CONFIG.ENDPOINTS.CLASSES, payload);
  }

  // Toggle class status - expects complete data from caller
  static async toggleClassStatus(id: string, completeData: ClassDto, isActive: boolean): Promise<Class> {
    const payload = {
      classdto: {
        ...completeData,
        id: id,
        isActive: isActive
      }
    };
    
    return enterpriseApiClient.put<Class>(API_CONFIG.ENDPOINTS.CLASSES, payload);
  }

  // Bulk operations for enterprise use
  static async bulkCreateClasses(classesData: ClassDto[]): Promise<Class[]> {
    const payload = {
      classes: classesData.map(classData => ({ classdto: classData }))
    };
    
    return enterpriseApiClient.post<Class[]>(`${API_CONFIG.ENDPOINTS.CLASSES}/bulk`, payload);
  }

  // Note: Bulk delete is now handled in the hook layer using local state data
  // to avoid unnecessary server calls and 500 errors. The hook calls updateClass
  // directly with complete data for each item.

  // Search classes with advanced filters
  static async searchClasses(searchTerm: string, filters?: Record<string, any>): Promise<GetClassesResponse> {
    const params = {
      search: searchTerm,
      ...filters,
    };
    
    return enterpriseApiClient.get<GetClassesResponse>(`${API_CONFIG.ENDPOINTS.CLASSES}/search`, params);
  }

  // Export classes data
  static async exportClasses(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.ENDPOINTS.CLASSES}/export`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    
    return response.data;
  }
}

// Export default instance
export default ClassService;
