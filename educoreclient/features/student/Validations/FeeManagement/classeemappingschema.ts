import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
  academicYearId: z.string().uuid('Invalid academic year ID'),
  classId: z.string().uuid('Invalid class ID'),
};

export const ClassFeeMappingSchema = z.object({
  ...baseSchema,
  feeHeadIds: z.array(z.string().uuid('Invalid fee head ID')),
  isActive: z.boolean().optional(),
});

export const CreateClassFeeMappingSchema = ClassFeeMappingSchema;
export const UpdateClassFeeMappingSchema = ClassFeeMappingSchema.partial().extend({
  organizationId: ClassFeeMappingSchema.shape.organizationId,
  branchId: ClassFeeMappingSchema.shape.branchId,
});

export type ClassFeeMappingType = z.infer<typeof ClassFeeMappingSchema>;
export type CreateClassFeeMappingType = z.infer<typeof CreateClassFeeMappingSchema>;
export type UpdateClassFeeMappingType = z.infer<typeof UpdateClassFeeMappingSchema>;

export const validateClassFeeMapping = (data: unknown) => ClassFeeMappingSchema.safeParse(data);
export const validateCreateClassFeeMapping = (data: unknown) => CreateClassFeeMappingSchema.safeParse(data);
export const validateUpdateClassFeeMapping = (data: unknown) => UpdateClassFeeMappingSchema.safeParse(data);

export class ClassFeeMappingValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}