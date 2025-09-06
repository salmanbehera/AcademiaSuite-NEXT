// Discount Policy Types
import { BaseEntity } from '../master/baseEntity';

export interface DiscountPolicy extends BaseEntity {
	organizationId: string;
	branchId: string;
	policyName: string;
	discountType: 1 | 2;
	discountValue: number;
	appliesTo: 'All' | 'SpecificHeads';
	appliesToDetails: string;
	eligibilityCriteria: string;
	maxLimit: number;
	effectiveFrom: string;
	effectiveTo: string;
	isActive: boolean;
}

export interface DiscountPolicyDto {
	id?: string;
	organizationId: string;
	branchId: string;
	policyName: string;
	discountType: number;
	discountValue: number;
	appliesTo: string;
	appliesToDetails: string;
	eligibilityCriteria: string;
	maxLimit: number;
	effectiveFrom: string;
	effectiveTo: string;
	isActive?: boolean;
}

export interface CreateDiscountPolicyRequest {
	discountPolicy: DiscountPolicyDto;
}

export interface GetDiscountPoliciesRequest {
	pageIndex?: number;
	pageSize?: number;
	organizationId?: string;
	branchId?: string;
	search?: string;
	sortBy?: keyof DiscountPolicy;
	sortOrder?: 'asc' | 'desc';
}

export interface GetDiscountPoliciesResponse {
	result: {
		pageIndex: number;
		pageSize: number;
		count: number;
		data: DiscountPolicy[];
	};
}

export interface CreateDiscountPolicyResponse {
	id: string;
}
