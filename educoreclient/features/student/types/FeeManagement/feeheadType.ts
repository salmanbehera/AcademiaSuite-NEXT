import { BaseEntity } from '../master/baseEntity';

// Fee Head Management Types
export interface FeeHead extends BaseEntity {
  organizationId: string;
  branchId: string;
  FeeHeadCode: string;
  FeeHeadName: string;
  FeeFrequency: 'Monthly' | 'Quarterly' | 'HalfYearly' | 'Annually' | 'OneTime';
  DefaultGLCode?: string | null;
  IsRefundable: boolean;
  IsActive: boolean;
  classId?: string; // Added property
  academicYearId?: string; // Added property
}

export interface FeeHeadDto {
  id?: string;
  organizationId: string;
  branchId: string;
  FeeHeadCode: string;
  FeeHeadName: string;
  FeeFrequency: string;
  DefaultGLCode?: string | null;
  IsRefundable: boolean;
  IsActive?: boolean;
}

export interface CreateFeeHeadRequest {
  FeeHeadMaster: FeeHeadDto;
}

export interface GetFeeHeadsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof FeeHead;
  sortOrder?: 'asc' | 'desc';
}

export interface GetFeeHeadsResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: FeeHead[];
  };
}

export interface CreateFeeHeadResponse {
  id: string;
}
