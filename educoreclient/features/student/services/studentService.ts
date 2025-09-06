import { Student, StudentFormData } from '@/types/api-types';
import { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api-types';
import { apiClient } from '@/lib/enterprise-api-client';

/**
 * Enterprise Student Service using Axios
 * Features: Request/Response interceptors, Error handling, Logging, File uploads
 */
export class StudentService {
  private readonly baseUrl = '/api/students';

  /**
   * Get paginated list of students
   */
  async getStudents(params?: PaginationParams): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>(this.baseUrl, {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || '',
      classId: params?.classId || '',
      status: params?.status || '',
      academicYear: params?.academicYear || '',
    });
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string): Promise<Student> {
    return apiClient.get<Student>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new student
   */
  async createStudent(studentData: StudentFormData): Promise<Student> {
    return apiClient.post<Student>(this.baseUrl, studentData);
  }

  /**
   * Update existing student
   */
  async updateStudent(id: string, studentData: Partial<StudentFormData>): Promise<Student> {
    return apiClient.put<Student>(`${this.baseUrl}/${id}`, studentData);
  }

  /**
   * Delete student
   */
  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle student status (active/inactive)
   */
  async toggleStudentStatus(id: string, status: boolean): Promise<Student> {
    return apiClient.patch<Student>(`${this.baseUrl}/${id}/status`, {
      isActive: status,
    });
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId: string): Promise<Student[]> {
    return apiClient.get<Student[]>(`${this.baseUrl}/by-class/${classId}`);
  }

  /**
   * Generate admission number
   */
  async generateAdmissionNumber(academicYear: string): Promise<string> {
    const response = await apiClient.post<{ admissionNumber: string }>(
      `${this.baseUrl}/generate-admission-number`,
      { academicYear }
    );
    return response.admissionNumber;
  }

  /**
   * Upload student documents with progress tracking
   */
  async uploadDocuments(
    studentId: string, 
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    for (const file of files) {
      await apiClient.uploadFile(
        `${this.baseUrl}/${studentId}/documents`,
        file,
        onProgress
      );
    }
  }

  /**
   * Get student statistics
   */
  async getStudentStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    newAdmissions: number;
    graduatedStudents: number;
  }> {
    return apiClient.get<{
      totalStudents: number;
      activeStudents: number;
      newAdmissions: number;
      graduatedStudents: number;
    }>(`${this.baseUrl}/stats`);
  }
}

// Export singleton instance
export const studentService = new StudentService();
