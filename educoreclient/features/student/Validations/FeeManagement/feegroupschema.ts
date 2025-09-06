import { z } from 'zod';

const baseSchema = {
  OrganizationId: z.string().uuid('Invalid organization ID'),
  BranchId: z.string().uuid('Invalid branch ID'),
};

export const FeeGroupSchema = z.object({
  ...baseSchema,
  FeeGroupCode: z.string().min(1, 'Fee Group Code is required'),
  FeeGroupName: z.string().min(1, 'Fee Group Name is required'),
  Description: z.string().optional().nullable(),
  LateFeePolicyId: z.string().uuid('Invalid late fee policy ID').optional().nullable(),
  DiscountPolicyId: z.string().uuid('Invalid discount policy ID').optional().nullable(),
  IsActive: z.boolean().optional(),
});

export const CreateFeeGroupSchema = FeeGroupSchema;
export const UpdateFeeGroupSchema = FeeGroupSchema.partial().extend({
  OrganizationId: FeeGroupSchema.shape.OrganizationId,
  BranchId: FeeGroupSchema.shape.BranchId,
});

export type FeeGroupType = z.infer<typeof FeeGroupSchema>;
export type CreateFeeGroupType = z.infer<typeof CreateFeeGroupSchema>;
export type UpdateFeeGroupType = z.infer<typeof UpdateFeeGroupSchema>;

export const validateFeeGroup = (data: unknown) => FeeGroupSchema.safeParse(data);
export const validateCreateFeeGroup = (data: unknown) => CreateFeeGroupSchema.safeParse(data);
export const validateUpdateFeeGroup = (data: unknown) => UpdateFeeGroupSchema.safeParse(data);

export class FeeGroupValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}
