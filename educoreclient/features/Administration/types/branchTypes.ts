import { BranchType } from '../enum/branchenum';
import { BaseEntity } from './baseEntity';



export interface Branch extends BaseEntity {
  organizationId: string;
  branchCode: string;
  branchName: string;
  branchType: BranchType;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  websiteUrl?: string;
  headOfBranch: string;
  isActive: boolean;
}

export interface BranchDto {
  id?: string;
  organizationId: string;
  branchCode: string;
  branchName: string;
  branchType: BranchType;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  websiteUrl?: string;
  headOfBranch: string;
  isActive: boolean;
}

export interface CreateBranchRequest {
  branch: BranchDto;
}

export interface GetBranchesRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  /** Optional search term for filtering branches */
  search?: string;
  /** Field to sort by */
  sortBy?: keyof Branch;
  /** Sort order: ascending or descending */
  sortOrder?: 'asc' | 'desc';
}

export interface GetBranchesResponse {
  result: {
    count: number;
    data: BranchDto[];
    pageIndex: number;
    pageSize: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface BranchFormData {
  organizationId: string;
  branchCode: string;
  branchName: string;
  branchType: BranchType;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  websiteUrl?: string;
  headOfBranch: string;
  isActive?: boolean;
}