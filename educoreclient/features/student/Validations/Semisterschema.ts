import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
  academicYearId: z.string().uuid('Invalid academic year ID'),
};

export const SemisterSchema = z.object({
  ...baseSchema,
  semesterCode: z.string().min(1, 'Semester code is required'),
  semesterName: z.string().min(1, 'Semester name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isCurrentSemester: z.boolean(),
  status: z.number().int('Status must be a number'),
  isActive: z.boolean().optional(),
});

export const CreateSemisterSchema = SemisterSchema;
export const UpdateSemisterSchema = SemisterSchema.partial().extend({
  organizationId: SemisterSchema.shape.organizationId,
  branchId: SemisterSchema.shape.branchId,
  academicYearId: SemisterSchema.shape.academicYearId,
});

export type SemisterType = z.infer<typeof SemisterSchema>;
export type CreateSemisterType = z.infer<typeof CreateSemisterSchema>;
export type UpdateSemisterType = z.infer<typeof UpdateSemisterSchema>;

export const validateSemister = (data: unknown) => SemisterSchema.safeParse(data);
export const validateCreateSemister = (data: unknown) => CreateSemisterSchema.safeParse(data);
export const validateUpdateSemister = (data: unknown) => UpdateSemisterSchema.safeParse(data);

export class SemisterValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}
