import { BaseEntity } from './baseEntity';

// ExamCycle Management Types
export interface ExamCycle extends BaseEntity {
  organizationId: string;
  branchId: string;
  semesterId: string;
  examCycleCode: string;
  examCycleName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string; // <-- Added status property
}

export interface ExamCycleDto {
  id?: string;
  organizationId: string;
  branchId: string;
  semesterId: string;
  examCycleCode: string;
  examCycleName: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface CreateExamCycleRequest {
  examCycle: ExamCycleDto;
}

export interface GetExamCyclesRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof ExamCycle;
  sortOrder?: 'asc' | 'desc';
}

export interface GetExamCyclesResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: ExamCycle[];
  };
}

export interface CreateExamCycleResponse {
  id: string;
}
