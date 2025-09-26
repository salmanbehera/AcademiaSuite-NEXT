import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  StudentEnrollmentPayload,
  StudentEnrollmentDTO,
} from '@/features/student/types/StudentEnrollment/studentenrollment.types';

export class StudentEnrollmentService {
  private static readonly BASE = API_CONFIG.ENDPOINTS.STUDENTENROLLMENT;

  // Wrap payload for backend
  private static wrapEnrollment(data: Partial<StudentEnrollmentDTO>) {
    return { studentdto: data };
  }

  static async createStudentEnrollment(payload: StudentEnrollmentPayload): Promise<any> {
    const response = await enterpriseApiClient.post<any>(`${this.BASE}`, payload);
    return response;
  }

  static async updateStudentEnrollment(payload: StudentEnrollmentPayload): Promise<any> {
    const response = await enterpriseApiClient.put<any>(`${this.BASE}`, payload);
    return response;
  }

  static async deleteStudentEnrollment(studentId: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${studentId}`);
  }

  static async getStudentEnrollmentById(id: string): Promise<StudentEnrollmentDTO> {
    const response = await enterpriseApiClient.get<{ students: StudentEnrollmentDTO }>(`${this.BASE}/${id}`);
    return response.students;
  }

  static async getStudentEnrollments(params: {
    organizationId: string;
    branchId: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<any> {
    const normalizedParams = {
      organizationId: params.organizationId,
      branchId: params.branchId,
      pageIndex: params.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    };
    // Use the correct backend endpoint and query param style
    const response = await enterpriseApiClient.get<any>(
      `/admissions/studentenrollment/by-organization`,
      normalizedParams
    );
    return response;
  }

  // Bulk create student enrollments
  static async bulkCreateStudentEnrollments(enrollments: StudentEnrollmentPayload[]): Promise<any> {
    const payload = { studentEnrollments: enrollments };
    const response = await enterpriseApiClient.post<any>(`${this.BASE}/bulk`, payload);
    return response;
  }

  // Bulk delete student enrollments
  static async bulkDeleteStudentEnrollments(ids: string[]): Promise<void> {
    const payload = { studentEnrollmentIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  // Toggle student enrollment status
  static async toggleStudentEnrollmentStatus(id: string, completeData: StudentEnrollmentDTO, isActive: boolean): Promise<any> {
    const payload = this.wrapEnrollment({ ...completeData, id, studentStatus: isActive ? 'Active' : 'Inactive' });
    const response = await enterpriseApiClient.put<any>(this.BASE, payload);
    return response;
  }

  // Export student enrollments (CSV or Excel)
  static async exportStudentEnrollments(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // Import student enrollments
  static async importStudentEnrollments(data: StudentEnrollmentPayload[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}
