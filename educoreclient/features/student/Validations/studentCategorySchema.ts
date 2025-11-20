import { z } from "zod";

const baseSchema = {
  organizationId: z.string().uuid("Invalid organization ID"),
  branchId: z.string().uuid("Invalid branch ID"),
};

export const StudentCategorySchema = z.object({
  ...baseSchema,
  categoryName: z.string().min(1, "Category name is required"),
  categoryShortName: z.string().min(1, "Category short name is required"),
  isActive: z.boolean().optional(),
  id: z.string().uuid("Invalid category ID").optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateStudentCategorySchema = StudentCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateStudentCategorySchema =
  StudentCategorySchema.partial().extend({
    id: z.string().uuid("Invalid category ID"),
    organizationId: StudentCategorySchema.shape.organizationId,
    branchId: StudentCategorySchema.shape.branchId,
  });

export type StudentCategoryType = z.infer<typeof StudentCategorySchema>;
export type CreateStudentCategoryType = z.infer<
  typeof CreateStudentCategorySchema
>;
export type UpdateStudentCategoryType = z.infer<
  typeof UpdateStudentCategorySchema
>;

export const validateStudentCategory = (data: unknown) =>
  StudentCategorySchema.safeParse(data);
export const validateCreateStudentCategory = (data: unknown) =>
  CreateStudentCategorySchema.safeParse(data);
export const validateUpdateStudentCategory = (data: unknown) =>
  UpdateStudentCategorySchema.safeParse(data);

export class StudentCategoryValidationError extends Error {
  public issues: z.ZodIssue[];

  constructor(zodError: z.ZodError) {
    const message = zodError.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    super(message);
    this.name = "StudentCategoryValidationError";
    this.issues = zodError.issues;
  }

  getFieldErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    this.issues.forEach((issue) => {
      const field = issue.path.join(".");
      errors[field] = issue.message;
    });
    return errors;
  }
}
