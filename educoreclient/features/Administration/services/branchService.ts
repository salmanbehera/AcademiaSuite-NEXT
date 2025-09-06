"use client";
import { Branch, BranchDto } from '@/features/Administration/types/branchTypes';
import { API_CONFIG } from '@/lib/config';
import { apiClient } from '@/lib/api-client';

export class BranchService {
  private static readonly BASE = '/branches';
  private static wrapBranch(data: Partial<BranchDto>) {
    return { branch: data };
  }

  static async getBranches(params?: Record<string, any>): Promise<{ branches: Branch[]; count: number; pageIndex: number; pageSize: number }> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION?.DEFAULT_PAGE_INDEX ?? 0,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION?.DEFAULT_PAGE_SIZE ?? 10,
      ...params,
    };
    const response = await apiClient.get(`${this.BASE}`, { params: normalizedParams });
    let result = (response as any)?.result || response?.data?.result || response?.data || response;
    let branches = Array.isArray(result?.data) ? result.data : [];
    let count = typeof result?.count === 'number' ? result.count : branches.length;
    let pageIndexResp = typeof result?.pageIndex === 'number' ? result.pageIndex : normalizedParams.pageIndex;
    let pageSizeResp = typeof result?.pageSize === 'number' ? result.pageSize : normalizedParams.pageSize;
    return { branches, count, pageIndex: pageIndexResp, pageSize: pageSizeResp };
  }

  static async getBranchById(id: string): Promise<Branch> {
    const response = await apiClient.get(`${this.BASE}/${id}`);
    // Try to get branch from different possible response shapes
    const branch =
      response.data?.branch ||
      (response.data?.result?.data && Array.isArray(response.data.result.data) ? response.data.result.data[0] : undefined) ||
      ((response as any).result?.data && Array.isArray((response as any).result.data) ? (response as any).result.data[0] : undefined) ||
      response.data ||
      response;
    if (!branch || !branch.id) {
      throw new Error('Branch not found');
    }
    return branch;
  }

  static async createBranch(request: BranchDto) {
    return await apiClient.post(this.BASE, this.wrapBranch(request));
  }

  static async updateBranch(id: string, data: Partial<BranchDto>) {
    const filteredData: Partial<Record<string, any>> = Object.entries({ id, ...data })
      .filter(([key, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined
      )
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Partial<Record<string, any>>);
    const payload = { branch: filteredData };
    return await apiClient.put(this.BASE, payload);
  }

  static async deleteBranch(id: string) {
    return await apiClient.delete(`${this.BASE}/${id}`);
  }

  static async bulkCreateBranches(branchesData: BranchDto[]): Promise<Branch[]> {
    const payload = { branches: branchesData };
    const response = await apiClient.post<{ branches: Branch[] }>(`${this.BASE}/bulk`, payload);
    return response.data?.branches ?? [];
  }

  static async bulkDeleteBranches(ids: string[]): Promise<void> {
    const payload = { BranchIds: ids };
    await apiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchBranches(searchTerm: string, filters?: Record<string, any>): Promise<Branch[]> {
    const params = {
      search: searchTerm,
      ...filters,
    };
    const response = await apiClient.get<{ branches: Branch[] }>(`${this.BASE}/search`, { params });
    return response.data?.branches ?? [];
  }

  static async exportBranches(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const url = `${API_CONFIG.BASE_URL}${this.BASE}/export-template?format=${format}`;
    const response = await fetch(url, { method: 'GET' });
    return await response.blob();
  }

  static async importBranches(data: BranchDto[]): Promise<void> {
    await apiClient.post<void>(`${this.BASE}/import`, data);
  }
}
