import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
};

export const FeeHeadSchema = z.object({
  ...baseSchema,
  FeeHeadCode: z.string().min(1, 'Fee Head Code is required'),
  FeeHeadName: z.string().min(1, 'Fee Head Name is required'),
  FeeFrequency: z.enum(['Monthly', 'Quarterly', 'HalfYearly', 'Annually', 'OneTime']),
  DefaultGLCode: z.string().optional().nullable(),
  IsRefundable: z.boolean(),
  IsActive: z.boolean().optional(),
});

export const CreateFeeHeadSchema = FeeHeadSchema;
export const UpdateFeeHeadSchema = FeeHeadSchema.partial().extend({
  organizationId: FeeHeadSchema.shape.organizationId,
  branchId: FeeHeadSchema.shape.branchId,
});

export type FeeHeadType = z.infer<typeof FeeHeadSchema>;
export type CreateFeeHeadType = z.infer<typeof CreateFeeHeadSchema>;
export type UpdateFeeHeadType = z.infer<typeof UpdateFeeHeadSchema>;

export const validateFeeHead = (data: unknown) => FeeHeadSchema.safeParse(data);
export const validateCreateFeeHead = (data: unknown) => CreateFeeHeadSchema.safeParse(data);
export const validateUpdateFeeHead = (data: unknown) => UpdateFeeHeadSchema.safeParse(data);

export class FeeHeadValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}
