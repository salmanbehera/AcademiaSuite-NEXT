import { z } from 'zod';
import { BranchType } from '../enum/branchenum';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
};

export const BranchSchema = z.object({
  ...baseSchema,
  branchCode: z.string().trim().min(1, 'Branch code is required'),
  branchName: z.string().trim().min(1, 'Branch name is required'),
  branchType: z.nativeEnum(BranchType),
  address1: z.string().trim().min(1, 'Address 1 is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().trim().min(1, 'Country is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  contactNumber: z.string().trim().min(1, 'Contact number is required'),
  email: z.string().email('Invalid email'),
  headOfBranch: z.string().trim().min(1, 'Head of branch is required'),
  isActive: z.boolean().default(true),
});

export const CreateBranchSchema = BranchSchema;
export const UpdateBranchSchema = BranchSchema.partial().extend({
  organizationId: BranchSchema.shape.organizationId,
});

export type BranchTypeSchema = z.infer<typeof BranchSchema>;
export type CreateBranchType = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchType = z.infer<typeof UpdateBranchSchema>;

export const validateBranch = (data: unknown) => BranchSchema.safeParse(data);
export const validateCreateBranch = (data: unknown) => CreateBranchSchema.safeParse(data);
export const validateUpdateBranch = (data: unknown) => UpdateBranchSchema.safeParse(data);

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

export const withBranchValidation = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
};
