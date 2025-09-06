import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
};

export const DivisionSchema = z.object({
  ...baseSchema,
  divisionName: z.string().trim().min(1, 'Division name is required').max(100, 'Division name must not exceed 100 characters'),
  divisionCode: z.string().trim().min(1, 'Division code is required').max(50, 'Division code must not exceed 50 characters'),
  description: z.string().trim().max(500, 'Description must not exceed 500 characters').optional(),
  divisionHeadId: z.string().uuid('Invalid division head ID').optional(),
  isActive: z.boolean().default(true),
});

export const CreateDivisionSchema = DivisionSchema;
export const UpdateDivisionSchema = DivisionSchema.partial().extend({
  organizationId: DivisionSchema.shape.organizationId,
  branchId: DivisionSchema.shape.branchId,
});

export type DivisionType = z.infer<typeof DivisionSchema>;
export type CreateDivisionType = z.infer<typeof CreateDivisionSchema>;
export type UpdateDivisionType = z.infer<typeof UpdateDivisionSchema>;

export const validateDivision = (data: unknown) => DivisionSchema.safeParse(data);
export const validateCreateDivision = (data: unknown) => CreateDivisionSchema.safeParse(data);
export const validateUpdateDivision = (data: unknown) => UpdateDivisionSchema.safeParse(data);

export class ValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(`Validation failed: ${message}`);
    this.name = 'ValidationError';
    this.issues = zodError.issues;
  }
  getFieldErrors(): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    this.issues.forEach(issue => {
      const fieldPath = issue.path.join('.');
      fieldErrors[fieldPath] = issue.message;
    });
    return fieldErrors;
  }
}

export const withDivisionValidation = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
};
