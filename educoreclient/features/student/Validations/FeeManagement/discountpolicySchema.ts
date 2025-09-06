import { z } from 'zod';

const baseSchema = {
	organizationId: z.string().uuid('Invalid organization ID'),
	branchId: z.string().uuid('Invalid branch ID'),
};

export const DiscountPolicySchema = z.object({
	...baseSchema,
	policyName: z.string().min(1, 'Policy Name is required'),
	discountType: z.union([z.literal(1), z.literal(2)]),
	discountValue: z.number().min(0, 'Discount value must be 0 or more'),
	appliesTo: z.enum(['All', 'SpecificHeads']),
	appliesToDetails: z.string().optional(),
	eligibilityCriteria: z.string().optional(),
	maxLimit: z.number().min(0, 'Max limit must be 0 or more'),
	effectiveFrom: z.string().min(1, 'Effective from date is required'),
	effectiveTo: z.string().min(1, 'Effective to date is required'),
	isActive: z.boolean().optional(),
});

export const CreateDiscountPolicySchema = DiscountPolicySchema;
export const UpdateDiscountPolicySchema = DiscountPolicySchema.partial().extend({
	organizationId: DiscountPolicySchema.shape.organizationId,
	branchId: DiscountPolicySchema.shape.branchId,
});

export type DiscountPolicyType = z.infer<typeof DiscountPolicySchema>;
export type CreateDiscountPolicyType = z.infer<typeof CreateDiscountPolicySchema>;
export type UpdateDiscountPolicyType = z.infer<typeof UpdateDiscountPolicySchema>;

export const validateDiscountPolicy = (data: unknown) => DiscountPolicySchema.safeParse(data);
export const validateCreateDiscountPolicy = (data: unknown) => CreateDiscountPolicySchema.safeParse(data);
export const validateUpdateDiscountPolicy = (data: unknown) => UpdateDiscountPolicySchema.safeParse(data);
