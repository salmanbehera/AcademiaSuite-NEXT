import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  Section,
  SectionDto,
  CreateSectionRequest,
  GetSectionsRequest,
  GetSectionsResponse
} from '@/features/student/types/master/sectionTypes';

/**
 * Enterprise Section API Service using Axios
 * Features: Request/Response interceptors, Error handling, Logging
 * Organization & Branch IDs are handled through context
 */
export class SectionService {
  
  // Get all sections with pagination
  static async getSections(params?: GetSectionsRequest): Promise<GetSectionsResponse> {
    const queryParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId,
      branchId: params?.branchId,
      ...params,
    };

    return enterpriseApiClient.get<GetSectionsResponse>(API_CONFIG.ENDPOINTS.SECTIONS, queryParams);
  }

  // Get section by ID
  static async getSectionById(id: string): Promise<Section> {
    return enterpriseApiClient.get<Section>(`${API_CONFIG.ENDPOINTS.SECTIONS}/${id}`);
  }

  // Create new section
  static async createSection(sectionData: SectionDto): Promise<Section> {
    const payload: CreateSectionRequest = {
      sectiondto: sectionData,
    };
    
    return enterpriseApiClient.post<Section>(API_CONFIG.ENDPOINTS.SECTIONS, payload);
  }

  // Update existing section using PUT method
  static async updateSection(id: string, sectionData: Partial<SectionDto>): Promise<Section> {
    const payload = {
      sectiondto: {
        id: id,
        ...sectionData,
      }
    };
    
    return enterpriseApiClient.put<Section>(API_CONFIG.ENDPOINTS.SECTIONS, payload);
  }

  // Simple delete method - expects complete data from caller
  static async deleteSection(id: string, completeData: SectionDto): Promise<void> {
    const payload = {
      sectiondto: {
        ...completeData,
        id: id,
        isActive: false  // Soft delete
      }
    };
    
    await enterpriseApiClient.put<Section>(API_CONFIG.ENDPOINTS.SECTIONS, payload);
  }

  // Toggle section status - expects complete data from caller
  static async toggleSectionStatus(id: string, completeData: SectionDto, isActive: boolean): Promise<Section> {
    const payload = {
      sectiondto: {
        ...completeData,
        id: id,
        isActive: isActive
      }
    };
    
    return enterpriseApiClient.put<Section>(API_CONFIG.ENDPOINTS.SECTIONS, payload);
  }

  // Bulk operations for enterprise use
  static async bulkCreateSections(sectionsData: SectionDto[]): Promise<Section[]> {
    const payload = {
      sections: sectionsData.map(sectionData => ({ sectiondto: sectionData }))
    };
    return enterpriseApiClient.post<Section[]>(`${API_CONFIG.ENDPOINTS.SECTIONS}/bulk`, payload);
  }

  // Note: Bulk delete is now handled in the hook layer using local state data
  // to avoid unnecessary server calls and 500 errors. The hook calls updateSection
  // directly with complete data for each item.

  // Search sections with advanced filters
  static async searchSections(searchTerm: string, filters?: Record<string, any>): Promise<GetSectionsResponse> {
    const params = {
      search: searchTerm,
      ...filters,
    };
    return enterpriseApiClient.get<GetSectionsResponse>(`${API_CONFIG.ENDPOINTS.SECTIONS}/search`, params);
  }

  // Export sections data
  static async exportSections(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.ENDPOINTS.SECTIONS}/export`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }
}
