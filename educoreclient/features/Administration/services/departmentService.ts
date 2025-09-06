"use client";
import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';

import {
  Department,
  DepartmentDto,
  CreateDepartmentRequest,
  GetDepartmentsRequest,
  GetDepartmentsResponse
} from '@/features/Administration/types/departmentType';

export class DepartmentService {
  private static readonly BASE = '/departments';

  private static wrapDepartment(data: Partial<DepartmentDto>) {
    return { department: data };
  }

  static async getDepartments(params?: GetDepartmentsRequest): Promise<GetDepartmentsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      divisionId: params?.divisionId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetDepartmentsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async getDepartmentById(id: string): Promise<Department> {
    const response = await enterpriseApiClient.get<{ result: Department }>(`${this.BASE}/${id}`);
    return response.result;
  }

  static async createDepartment(request: CreateDepartmentRequest): Promise<Department> {
    const response = await enterpriseApiClient.post<{ result: Department }>(this.BASE, request);
    return response.result;
  }

  static async updateDepartment(id: string, data: Partial<DepartmentDto>): Promise<Department> {
    const payload = this.wrapDepartment({ ...data, id });
    const response = await enterpriseApiClient.put<{ result: Department }>(this.BASE, payload);
    return response.result;
  }

  static async deleteDepartment(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleDepartmentStatus(id: string, completeData: DepartmentDto, isActive: boolean): Promise<Department> {
    const payload = this.wrapDepartment({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: Department }>(this.BASE, payload);
    return response.result;
  }

  static async bulkCreateDepartments(departmentsData: DepartmentDto[]): Promise<Department[]> {
    const payload = { departments: departmentsData.map(data => this.wrapDepartment(data)) };
    const response = await enterpriseApiClient.post<{ result: Department[] }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }

  static async importDepartments(importData: DepartmentDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, { departments: importData });
  }

  static async exportDepartments(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await enterpriseApiClient.get<Blob>(`${this.BASE}/export?format=${format}`);
    return response;
  }

  static async bulkDeleteDepartments(departmentIds: string[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, { departmentIds });
  }
}
