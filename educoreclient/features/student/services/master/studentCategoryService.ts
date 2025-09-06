import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  StudentCategory,
  StudentCategoryDto,
  CreateStudentCategoryRequest,
  GetStudentCategoriesRequest,
  GetStudentCategoriesResponse
} from '@/types/api-types';

/**
 * Enterprise Student Category API Service using Axios
 * Features: Request/Response interceptors, Error handling, Logging
 * Organization & Branch IDs are handled through context
 */
export class StudentCategoryService {
  // Import student categories data (CSV/Excel)
  static async importStudentCategories(file: File, format: 'csv' | 'excel' = 'csv'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    const response = await enterpriseApiClient.getAxiosInstance().post(
      `${API_CONFIG.ENDPOINTS.STUDENT_CATEGORY}/import`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  }
  
  // Get all student categories with pagination
  static async getStudentCategories(params?: GetStudentCategoriesRequest): Promise<GetStudentCategoriesResponse> {
    const queryParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId,
      branchId: params?.branchId,
      ...params,
    };
    const response = await enterpriseApiClient.get<GetStudentCategoriesResponse>(API_CONFIG.ENDPOINTS.STUDENT_CATEGORY, queryParams);
    // eslint-disable-next-line no-console
    console.log('StudentCategoryService.getStudentCategories response:', response);
    return response;
  }

  // Get student category by ID
  static async getStudentCategoryById(id: string): Promise<StudentCategory> {
    return enterpriseApiClient.get<StudentCategory>(`${API_CONFIG.ENDPOINTS.STUDENT_CATEGORY}/${id}`);
  }

  // Create new student category
  static async createStudentCategory(categoryData: StudentCategoryDto): Promise<StudentCategory> {
    const payload: CreateStudentCategoryRequest = {
      studentcategorydto: categoryData,
    };
    return enterpriseApiClient.post<StudentCategory>(API_CONFIG.ENDPOINTS.STUDENT_CATEGORY, payload);
  }

  // Update existing student category using PUT method
  static async updateStudentCategory(id: string, categoryData: Partial<StudentCategoryDto>): Promise<StudentCategory> {
    // Ensure complete payload by merging with existing data if needed
    let completeData = categoryData;
    const requiredFields = ['organizationId', 'branchId', 'categoryName'];
    const hasAllRequired = requiredFields.every(field => categoryData[field as keyof StudentCategoryDto] != null);
    if (!hasAllRequired) {
      const existingCategory = await this.getStudentCategoryById(id);
      completeData = { ...existingCategory, ...categoryData };
    }
    const payload = { studentcategorydto: { ...completeData, id } };
    try {
      const response = await enterpriseApiClient.put<StudentCategory>(API_CONFIG.ENDPOINTS.STUDENT_CATEGORY, payload);
      return response;
    } catch (error: any) {
      console.error('UpdateStudentCategory Error:', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || error.message);
    }
  }

  // Soft delete student category (set isActive to false)
static async deleteStudentCategory({ id, organizationId, branchId }: { id: string; organizationId: string; branchId: string }): Promise<{ isSuccess: boolean; [key: string]: any }> {
    // Use only the ID and required fields for soft delete
    // No need to fetch category, just send minimal payload
    const payload = {
      studentcategorydto: {
        id,
        organizationId,
        branchId,
        isActive: false
      }
    };
    // eslint-disable-next-line no-console
    console.log('deleteStudentCategory payload:', payload);
    try {
      const response = await enterpriseApiClient.put<{ isSuccess: boolean; [key: string]: any }>(API_CONFIG.ENDPOINTS.STUDENT_CATEGORY, payload);
      return response;
    } catch (error: any) {
      console.error('DeleteStudentCategory Error:', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || error.message);
    }
  }

  // Toggle student category status (active/inactive)
  static async toggleStudentCategoryStatus(id: string, isActive: boolean): Promise<StudentCategory> {
    const existingCategory = await this.getStudentCategoryById(id);
    return this.updateStudentCategory(id, { ...existingCategory, isActive });
  }

  // Bulk create student categories
  static async bulkCreateStudentCategories(categoriesData: StudentCategoryDto[]): Promise<StudentCategory[]> {
    const payload = {
      categories: categoriesData.map(categoryData => ({ studentcategorydto: categoryData }))
    };
    return enterpriseApiClient.post<StudentCategory[]>(`${API_CONFIG.ENDPOINTS.STUDENT_CATEGORY}/bulk`, payload);
  }

  // Bulk soft delete student categories
  static async bulkDeleteStudentCategories(ids: string[]): Promise<void> {
    await Promise.all(ids.map(async (id) => {
      const existingCategory = await this.getStudentCategoryById(id);
      return this.updateStudentCategory(id, { ...existingCategory, isActive: false });
    }));
  }

  // Search student categories
  static async searchStudentCategories(searchTerm: string, filters?: Record<string, any>): Promise<GetStudentCategoriesResponse> {
    const params = { search: searchTerm, ...filters };
    return enterpriseApiClient.get<GetStudentCategoriesResponse>(`${API_CONFIG.ENDPOINTS.STUDENT_CATEGORY}/search`, params);
  }

  // Export student categories data
  static async exportStudentCategories(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.ENDPOINTS.STUDENT_CATEGORY}/export`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }
}
