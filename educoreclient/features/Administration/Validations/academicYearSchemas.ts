import { z } from 'zod';
 

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
};

export const AcademicYearSchema = z.object({
  ...baseSchema,
  //should check numeric format like 2023-2024
  yearCode: z.string().trim()
  .min(1, 'Academic Year is required')
  .refine(val => val === '' || /^\d{4}-\d{2}$/.test(val), 'Invalid academic year format'),
  startDate: z.string().trim().min(1, 'Start date is required'),
  endDate: z.string().trim().min(1, 'End date is required'),
  //isCurrentYear: z.literal(true, { message: "You must select current year." }),
  isAdmissionOpen: z.boolean(),
  isCurrentYear: z.boolean(),
  status: z.string()
    .trim()
    .min(1, 'Status is required'),
    // .refine(
    //   (val) => ['Active', 'Inactive', 'Archived'].includes(val),
    //   {
    //     message: 'Status must be Active, Inactive, or Archived',
    //   }
    // ),
  isActive: z.boolean().default(true),
});

export const CreateAcademicYearSchema = AcademicYearSchema;
export const UpdateAcademicYearSchema = AcademicYearSchema.partial().extend({
  organizationId: AcademicYearSchema.shape.organizationId,
  branchId: AcademicYearSchema.shape.branchId,
});

export type AcademicYearType = z.infer<typeof AcademicYearSchema>;
export type CreateAcademicYearType = z.infer<typeof CreateAcademicYearSchema>;
export type UpdateAcademicYearType = z.infer<typeof UpdateAcademicYearSchema>;

export const validateAcademicYear = (data: unknown) => AcademicYearSchema.safeParse(data);
export const validateCreateAcademicYear = (data: unknown) => CreateAcademicYearSchema.safeParse(data);
export const validateUpdateAcademicYear = (data: unknown) => UpdateAcademicYearSchema.safeParse(data);

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

export const withAcademicYearValidation = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
};
