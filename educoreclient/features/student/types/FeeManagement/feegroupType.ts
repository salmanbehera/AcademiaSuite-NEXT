import { BaseEntity } from '../master/baseEntity';

// Fee Group Management Types
export interface FeeGroup extends BaseEntity {
  OrganizationId: string;
  BranchId: string;
  FeeGroupCode: string;
  FeeGroupName: string;
  Description: string;
  LateFeePolicyId?: string | null;
  DiscountPolicyId?: string | null;
  IsActive: boolean;
}

export interface FeeGroupDto {
  id?: string;
  OrganizationId: string;
  BranchId: string;
  FeeGroupCode: string;
  FeeGroupName: string;
  Description: string;
  LateFeePolicyId?: string | null;
  DiscountPolicyId?: string | null;
  IsActive?: boolean;
}

export interface CreateFeeGroupRequest {
  FeeGroupMaster: FeeGroupDto;
}

export interface GetFeeGroupsRequest {
  pageIndex?: number;
  pageSize?: number;
  OrganizationId?: string;
  BranchId?: string;
  search?: string;
  sortBy?: keyof FeeGroup;
  sortOrder?: 'asc' | 'desc';
}

export interface GetFeeGroupsResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: FeeGroup[];
  };
}

export interface CreateFeeGroupResponse {
  id: string;
}
