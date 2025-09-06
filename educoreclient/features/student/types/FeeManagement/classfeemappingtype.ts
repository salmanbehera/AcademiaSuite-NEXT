import { BaseEntity } from '../master/baseEntity';

// Class Fee Mapping Types
export interface ClassFeeMapping extends BaseEntity {
  organizationId: string;
  branchId: string;
  academicYearId: string;
  classId: string;
  feeHeadIds: string[];
  isActive: boolean;
  academicYear?: string; // Added field
  className?: string; // Added field
  feeHeadNames?: string[]; // Added field
}

export interface ClassFeeMappingDto {
  id?: string;
  organizationId: string;
  branchId: string;
  academicYearId: string;
  classId: string;
  feeHeadIds: string[];
  isActive?: boolean;
}

export interface CreateClassFeeMappingRequest {
  classFeeMapping: ClassFeeMappingDto;
}

export interface GetClassFeeMappingsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  academicYearId?: string;
  classId?: string;
  search?: string;
  sortBy?: keyof ClassFeeMapping;
  sortOrder?: 'asc' | 'desc';
}

export interface GetClassFeeMappingsResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: ClassFeeMapping[];
  };
}

export interface CreateClassFeeMappingResponse {
  id: string;
}