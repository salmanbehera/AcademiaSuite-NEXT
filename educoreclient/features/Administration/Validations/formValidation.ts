// utils/formValidation.ts
// Utility for updating a field and validating a zod schema
import { ZodSchema } from 'zod';

export function updateFieldWithValidation<T extends object>(
  form: T,
  setForm: (form: T) => void,
  setFormErrors: (errors: Record<string, string>) => void,
  schema: ZodSchema<T>,
  field: keyof T,
  value: any
) {
  const newForm = { ...form, [field]: value };
  setForm(newForm);
  const result = schema.safeParse(newForm);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach(issue => {
      if (issue.path.length > 0) {
        errors[issue.path[0]?.toString() || 'unknown'] = issue.message;
      }
    });
    setFormErrors(errors);
  } else {
    setFormErrors({});
  }
}
