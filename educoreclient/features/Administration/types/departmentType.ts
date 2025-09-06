import { z } from 'zod';
import { DepartmentSchema, CreateDepartmentSchema, UpdateDepartmentSchema } from '../Validations/departmentSchemas';
import { BaseEntity } from './baseEntity';

export type DepartmentType = z.infer<typeof DepartmentSchema>;
export type CreateDepartmentType = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentType = z.infer<typeof UpdateDepartmentSchema>;

export interface Department extends BaseEntity {
  organizationId: string;
  branchId: string;
  divisionId: string;
  departmentName: string;
  departmentCode: string;
  description?: string;
  departmentHeadId?: string;
  ParentDepartmentId?: string;
  isActive: boolean;
}

export interface DepartmentDto {
  id?: string;
  organizationId: string;
  branchId: string;
  divisionId: string;
  departmentName: string;
  departmentCode: string;
  description?: string;
  departmentHeadId?: string;
  ParentDepartmentId?: string;
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  department: DepartmentDto;
}

export interface GetDepartmentsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  divisionId?: string;
  /** Optional search term for filtering departments */
  search?: string;
  /** Field to sort by */
  sortBy?: keyof Department;
  /** Sort order: ascending or descending */
  sortOrder?: 'asc' | 'desc';
}

export interface GetDepartmentsResponse {
  result: {
    count: number;
    data: DepartmentDto[];
    pageIndex: number;
    pageSize: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface DepartmentFormData {
  organizationId: string;
  branchId: string;
  divisionId: string;
  departmentName: string;
  departmentCode: string;
  description?: string;
  departmentHeadId?: string;
  ParentDepartmentId?: string;
  isActive?: boolean;
}
