// Payroll API service for external .NET Core API

import { apiClient, ApiResponse } from '@/lib/api-client';
import { API_CONFIG } from '@/config/app.config';
import {
  Employee,
  Payslip,
  LeaveRequest,
  Attendance,
  PayrollSummary,
  Position,
  Department,
} from '@/features/payroll/types';

export class PayrollService {
  private readonly baseEndpoint = API_CONFIG.endpoints.payroll;

  // Employee Management
  async getEmployees(params?: any): Promise<ApiResponse<Employee[]>> {
    return apiClient.get<Employee[]>('/employees', { params });
  }

  async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    return apiClient.get<Employee>(`/employees/${id}`);
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Employee>> {
    return apiClient.post<Employee>('/employees', employee);
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return apiClient.put<Employee>(`/employees/${id}`, employee);
  }

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/employees/${id}`);
  }

  // Payroll Management
  async getPayslips(params?: any): Promise<ApiResponse<Payslip[]>> {
    return apiClient.get<Payslip[]>(`${this.baseEndpoint}/payslips`, { params });
  }

  async getPayslipById(id: string): Promise<ApiResponse<Payslip>> {
    return apiClient.get<Payslip>(`${this.baseEndpoint}/payslips/${id}`);
  }

  async generatePayslips(month: number, year: number, employeeIds?: string[]): Promise<ApiResponse<Payslip[]>> {
    return apiClient.post<Payslip[]>(`${this.baseEndpoint}/payslips/generate`, {
      month,
      year,
      employeeIds
    });
  }

  async processPayslips(payslipIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.baseEndpoint}/payslips/process`, {
      payslipIds
    });
  }

  // Leave Management
  async getLeaveRequests(params?: any): Promise<ApiResponse<LeaveRequest[]>> {
    return apiClient.get<LeaveRequest[]>(`${this.baseEndpoint}/leave-requests`, { params });
  }

  async createLeaveRequest(leaveRequest: Omit<LeaveRequest, 'id' | 'appliedAt'>): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post<LeaveRequest>(`${this.baseEndpoint}/leave-requests`, leaveRequest);
  }

  async approveLeaveRequest(id: string, comments?: string): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post<LeaveRequest>(`${this.baseEndpoint}/leave-requests/${id}/approve`, {
      comments
    });
  }

  async rejectLeaveRequest(id: string, comments: string): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post<LeaveRequest>(`${this.baseEndpoint}/leave-requests/${id}/reject`, {
      comments
    });
  }

  // Attendance Management
  async getAttendance(params?: any): Promise<ApiResponse<Attendance[]>> {
    return apiClient.get<Attendance[]>(`${this.baseEndpoint}/attendance`, { params });
  }

  async markAttendance(employeeId: string, date: string, status: string): Promise<ApiResponse<Attendance>> {
    return apiClient.post<Attendance>(`${this.baseEndpoint}/attendance`, {
      employeeId,
      date,
      status
    });
  }

  async bulkMarkAttendance(attendanceData: Array<{
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
  }>): Promise<ApiResponse<Attendance[]>> {
    return apiClient.post<Attendance[]>(`${this.baseEndpoint}/attendance/bulk`, attendanceData);
  }

  // Department Management
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    return apiClient.get<Department[]>('/departments');
  }

  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Department>> {
    return apiClient.post<Department>('/departments', department);
  }

  async updateDepartment(id: string, department: Partial<Department>): Promise<ApiResponse<Department>> {
    return apiClient.put<Department>(`/departments/${id}`, department);
  }

  // Position Management
  async getPositions(): Promise<ApiResponse<Position[]>> {
    return apiClient.get<Position[]>('/positions');
  }

  async createPosition(position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Position>> {
    return apiClient.post<Position>('/positions', position);
  }

  // Reports and Analytics
  async getPayrollSummary(month?: number, year?: number): Promise<ApiResponse<PayrollSummary>> {
    return apiClient.get<PayrollSummary>(`${this.baseEndpoint}/summary`, {
      params: { month, year }
    });
  }

  async getEmployeePayrollReport(employeeId: string, startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${this.baseEndpoint}/reports/employee/${employeeId}`, {
      params: { startDate, endDate }
    });
  }

  // Export functionality
  async exportPayslips(month: number, year: number, format: 'csv' | 'excel' | 'pdf'): Promise<Blob> {
    const response = await fetch(
      apiClient.buildUrl(`${this.baseEndpoint}/payslips/export`, { month, year, format }),
      {
        headers: {
          'Authorization': `Bearer ${apiClient.getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

// Create singleton instance
export const payrollService = new PayrollService();

// Export default instance
export default payrollService;
