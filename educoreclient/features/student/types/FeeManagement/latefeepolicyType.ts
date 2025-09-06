// Late Fee Policy Types
import { BaseEntity } from '../master/baseEntity';
export interface LateFeePolicy extends BaseEntity {
  organizationId: string;
  branchId: string;
  policyName: string;
  gracePeriodDays: number;
  penaltyType: 'Fixed per Day' | 'Percentage per Day';
  penaltyValue: number;
  maxPenalty: number;
  isActive: boolean;
}

export interface LateFeePolicyDto {
  id?: string;
  organizationId: string;
  branchId: string;
  policyName: string;
  gracePeriodDays: number;
  penaltyType: string;
  penaltyValue: number;
  maxPenalty: number;
  isActive?: boolean;
}

export interface CreateLateFeePolicyRequest {
  lateFeePolicy: LateFeePolicyDto;
}

export interface GetLateFeePoliciesRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof LateFeePolicy;
  sortOrder?: 'asc' | 'desc';
}

export interface GetLateFeePoliciesResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: LateFeePolicy[];
  };
}

export interface CreateLateFeePolicyResponse {
  id: string;
}
