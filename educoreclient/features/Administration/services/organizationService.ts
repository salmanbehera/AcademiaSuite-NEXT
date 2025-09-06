"use client";
import { Organization, OrganizationDto } from '@/features/Administration/types/organizationTypes';
import { API_CONFIG } from '@/lib/config';
import { apiClient } from '@/lib/api-client';

export class OrganizationService {
  private static readonly BASE = '/organizations'; // Use string directly if not in API_CONFIG
    private static wrapOrganization(data: Partial<OrganizationDto>) {
      return { organization: data };
    }

  static async getOrganizations(params?: Record<string, any>): Promise<{ organizations: Organization[]; count: number; pageIndex: number; pageSize: number }> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION?.DEFAULT_PAGE_INDEX ?? 0,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION?.DEFAULT_PAGE_SIZE ?? 10,
      ...params,
    };
  const response = await apiClient.get(`${this.BASE}`, { params: normalizedParams });
  let result = (response as any)?.result || response?.data?.result || response?.data || response;
  let organizations = Array.isArray(result?.data) ? result.data : [];
  organizations = organizations.map((org: Organization) => ({
    ...org,
    academicYearStart: org.academicYearStart ? org.academicYearStart.split('T')[0] : org.academicYearStart,
    academicYearEnd: org.academicYearEnd ? org.academicYearEnd.split('T')[0] : org.academicYearEnd,
  }));
  let count = typeof result?.count === 'number' ? result.count : organizations.length;
  let pageIndexResp = typeof result?.pageIndex === 'number' ? result.pageIndex : normalizedParams.pageIndex;
  let pageSizeResp = typeof result?.pageSize === 'number' ? result.pageSize : normalizedParams.pageSize;
  return { organizations, count, pageIndex: pageIndexResp, pageSize: pageSizeResp };
  }

  static async getOrganizationById(id: string): Promise<Organization> {
    const response = await apiClient.get(`${this.BASE}/${id}`);
    // Try to get organization from different possible response shapes
    const org =
      response.data?.organization ||
      response.data ||
      (response as any)?.organization ||
      response;
    if (!org || !org.id) {
      throw new Error('Organization not found');
    }
    return {
      ...org,
      academicYearStart: org.academicYearStart ? org.academicYearStart.split('T')[0] : org.academicYearStart,
      academicYearEnd: org.academicYearEnd ? org.academicYearEnd.split('T')[0] : org.academicYearEnd,
    };
  }

  static async createOrganization(request: OrganizationDto) {
  return await apiClient.post(this.BASE, this.wrapOrganization(request));
  }

  static async updateOrganization(id: string, data: Partial<OrganizationDto>) {
    // AcademicYear parity: PUT to /organizations with { organization: { id, ...filteredData } }
    const filteredData: Partial<Record<string, any>> = Object.entries({ id, ...data })
      .filter(([key, value]) =>
        key !== 'organizationTypeName' &&
        value !== '' &&
        value !== null &&
        value !== undefined
      )
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Partial<Record<string, any>>);
    const payload = { organization: filteredData };
    return await apiClient.put(this.BASE, payload);
  }

  
  static async deleteOrganization(id: string) {
    return await apiClient.delete(`${this.BASE}/${id}`);
  }

  static async bulkCreateOrganizations(organizationsData: OrganizationDto[]): Promise<Organization[]> {
    const payload = { organizations: organizationsData };
  const response = await apiClient.post<{ organizations: Organization[] }>(`${this.BASE}/bulk`, payload);
  return response.data?.organizations ?? [];
  }

  static async bulkDeleteOrganizations(ids: string[]): Promise<void> {
    const payload = { OrganizationIds: ids };
    await apiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchOrganizations(searchTerm: string, filters?: Record<string, any>): Promise<Organization[]> {
    const params = {
      search: searchTerm,
      ...filters,
    };
  const response = await apiClient.get<{ organizations: Organization[] }>(`${this.BASE}/search`, { params });
  return response.data?.organizations ?? [];
  }

  static async exportOrganizations(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
  // If apiClient does not support getAxiosInstance, use fetch
  const url = `${API_CONFIG.BASE_URL}${this.BASE}/export-template?format=${format}`;
  const response = await fetch(url, { method: 'GET' });
  return await response.blob();
  }

  static async importOrganizations(data: OrganizationDto[]): Promise<void> {
    await apiClient.post<void>(`${this.BASE}/import`, data);
  }
}
