import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
  semesterId: z.string().uuid('Invalid semester ID'),
};

export const ExamCycleSchema = z.object({
  ...baseSchema,
  examCycleCode: z.string().min(1, 'Exam cycle code is required'),
  examCycleName: z.string().min(1, 'Exam cycle name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean().optional(),
});

export const CreateExamCycleSchema = ExamCycleSchema;
export const UpdateExamCycleSchema = ExamCycleSchema.partial().extend({
  organizationId: ExamCycleSchema.shape.organizationId,
  branchId: ExamCycleSchema.shape.branchId,
  semesterId: ExamCycleSchema.shape.semesterId,
});

export type ExamCycleType = z.infer<typeof ExamCycleSchema>;
export type CreateExamCycleType = z.infer<typeof CreateExamCycleSchema>;
export type UpdateExamCycleType = z.infer<typeof UpdateExamCycleSchema>;

export const validateExamCycle = (data: unknown) => ExamCycleSchema.safeParse(data);
export const validateCreateExamCycle = (data: unknown) => CreateExamCycleSchema.safeParse(data);
export const validateUpdateExamCycle = (data: unknown) => UpdateExamCycleSchema.safeParse(data);

export class ExamCycleValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}
