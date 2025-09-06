// Academic Year Types
import { BaseEntity } from './baseEntity';
import { AcademicYearStatus } from '../enum/AcademicYearStatus';
export interface AcademicYear extends BaseEntity {
  
  organizationId: string;
  branchId: string;
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrentYear: boolean;
  isAdmissionOpen: boolean;
  status: string;
  isActive: boolean;
}

export interface AcademicYearDto {
  id?: string;
  organizationId: string;
  branchId: string;
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrentYear: boolean;
  isAdmissionOpen: boolean;
  status: string;
  isActive: boolean;
}

export interface CreateAcademicYearRequest {
  /** Matches the C# minimal API DTO’s property name exactly */
  academicyear: AcademicYearDto; // Matches the C# minimal API DTO’s property name `academicyear`
}

export interface GetAcademicYearsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  /** Optional search term for filtering academic years */
  search?: string;
  /** Field to sort by */
  sortBy?: keyof AcademicYear;
  /** Sort order: ascending or descending */
  sortOrder?: 'asc' | 'desc';
}

export interface GetAcademicYearsResponse {
  result: {
    count: number;
    data: AcademicYear[];
    pageIndex: number;
    pageSize: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface AcademicYearFormData {
  yearCode: string; // e.g. "2023-2024"
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    isCurrentYear: boolean;
    isAdmissionOpen: boolean;
    status: AcademicYearStatus; // e.g. "Active", "Inactive"
    isActive?: boolean; // Optional, defaults to true
}