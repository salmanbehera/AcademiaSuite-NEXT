import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
};

export const LateFeePolicySchema = z.object({
  ...baseSchema,
  policyName: z.string().min(1, 'Policy Name is required'),
  gracePeriodDays: z.number().min(0, 'Grace period must be 0 or more'),
  penaltyType: z.enum(['Fixed per Day', 'Percentage per Day']),
  penaltyValue: z.number().min(0, 'Penalty value must be 0 or more'),
  maxPenalty: z.number().min(0, 'Max penalty must be 0 or more'),
  isActive: z.boolean().optional(),
});

export const CreateLateFeePolicySchema = LateFeePolicySchema;
export const UpdateLateFeePolicySchema = LateFeePolicySchema.partial().extend({
  organizationId: LateFeePolicySchema.shape.organizationId,
  branchId: LateFeePolicySchema.shape.branchId,
});

export type LateFeePolicyType = z.infer<typeof LateFeePolicySchema>;
export type CreateLateFeePolicyType = z.infer<typeof CreateLateFeePolicySchema>;
export type UpdateLateFeePolicyType = z.infer<typeof UpdateLateFeePolicySchema>;

export const validateLateFeePolicy = (data: unknown) => LateFeePolicySchema.safeParse(data);
export const validateCreateLateFeePolicy = (data: unknown) => CreateLateFeePolicySchema.safeParse(data);
export const validateUpdateLateFeePolicy = (data: unknown) => UpdateLateFeePolicySchema.safeParse(data);

export class LateFeePolicyValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}
