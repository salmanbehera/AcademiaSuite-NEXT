// Fee Structure Types
import { BaseEntity } from '../master/baseEntity';

export interface FeeStructureDetail {
  feeHeadId: string;
  feeAmount: number;
  feeFrequency: string;
}

export interface FeeStructure extends BaseEntity {
  organizationId: string;
  branchId: string;
  feeGroupId: string;
  classId: string;
  semesterId: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  details: FeeStructureDetail[];
}

export interface FeeStructureDto {
  id?: string;
  organizationId: string;
  branchId: string;
  feeGroupId: string;
  classId: string;
  semesterId: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  details: FeeStructureDetail[];
}

export interface CreateFeeStructureRequest {
  feeStructure: FeeStructureDto;
}

export interface GetFeeStructuresRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof FeeStructure;
  sortOrder?: 'asc' | 'desc';
}

export interface GetFeeStructuresResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: FeeStructure[];
  };
}

export interface CreateFeeStructureResponse {
  id: string;
}

export interface FeeHeadsByClassRequest {
  organizationId: string;
  branchId: string;
  classId: string;
  academicYearId: string;
}

export interface FeeHeadByClassDto {
  feeHeadId: string;
  feeHeadCode: string;
  feeHeadName: string;
  feeAmount: number;
  feeFrequency: string;
}
