
import { BaseEntity } from './baseEntity';

// Semister Management Types
export interface Semister extends BaseEntity {
  organizationId: string;
  branchId: string;
  semesterCode: string;
  semesterName: string;
  startDate: string;
  endDate: string;
  isCurrentSemester: boolean;
  status: string;
  isActive: boolean;
}

export interface SemisterDto {
  id?: string;
  organizationId: string;
  branchId: string;
  semesterCode: string;
  semesterName: string;
  startDate: string;
  endDate: string;
  isCurrentSemester: boolean;
  status: string;
  isActive?: boolean;
}

export interface CreateSemisterRequest {
  semester: SemisterDto;
}

export interface GetSemistersRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof Semister;
  sortOrder?: 'asc' | 'desc';
}

export interface GetSemistersResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Semister[];
  };
}
export interface CreateSemisterResponse {
  id: string;
}
