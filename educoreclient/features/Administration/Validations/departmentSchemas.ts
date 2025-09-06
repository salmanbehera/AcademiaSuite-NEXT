import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
  divisionId: z.string().uuid('Invalid division ID'),
};

export const DepartmentSchema = z.object({
  ...baseSchema,
  departmentName: z.string().trim().min(1, 'Department name is required').max(100, 'Department name must not exceed 100 characters'),
  departmentCode: z.string().trim().min(1, 'Department code is required').max(50, 'Department code must not exceed 50 characters'),
  description: z.string().trim().max(500, 'Description must not exceed 500 characters').optional(),
  // departmentHeadId: z.string().uuid('Invalid department head ID').optional(),
  isActive: z.boolean().default(true),
});

export const CreateDepartmentSchema = DepartmentSchema;
export const UpdateDepartmentSchema = DepartmentSchema.partial().extend({
  organizationId: DepartmentSchema.shape.organizationId,
  branchId: DepartmentSchema.shape.branchId,
  divisionId: DepartmentSchema.shape.divisionId,
});

export type DepartmentType = z.infer<typeof DepartmentSchema>;
export type CreateDepartmentType = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentType = z.infer<typeof UpdateDepartmentSchema>;

export const validateDepartment = (data: unknown) => DepartmentSchema.safeParse(data);
export const validateCreateDepartment = (data: unknown) => CreateDepartmentSchema.safeParse(data);
export const validateUpdateDepartment = (data: unknown) => UpdateDepartmentSchema.safeParse(data);

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

export const withDepartmentValidation = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
};
