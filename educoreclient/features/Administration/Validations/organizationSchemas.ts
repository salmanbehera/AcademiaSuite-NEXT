
import { z } from 'zod';
import { OrganizationType } from '../enum/OrganizationTypeenum';


const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID').optional(),
};

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



export const withOrganizationValidation = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
};


export const OrganizationSchema = z.object({
  ...baseSchema,
  organizationCode: z.string().trim().min(1, 'Organization code is required'),
  organizationName: z.string().trim().min(1, 'Organization name is required'),
  organizationType: z.nativeEnum(OrganizationType),
  affiliationBoard: z.string().trim().min(1, 'Affiliation board is required'),
 // logoUrl: z.string().url('Invalid logo URL'),
 // establishedYear: z.number().int().min(1800, 'Year must be >= 1800'),
 // registrationNumber: z.string().trim().min(1, 'Registration number is required'),
  //panTinTaxId: z.string().trim().min(1, 'PAN/TIN/Tax ID is required'),
  address1: z.string().trim().min(1, 'Address 1 is required'),
 // address2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().trim().min(1, 'Country is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
 // landmark: z.string().trim().optional(),
 // latitude: z.number().optional(),
//  longitude: z.number().optional(),
  contactNumber: z.string().trim().min(1, 'Contact number is required'),
 // alternateContactNumber: z.string().trim().optional(),
  email: z.string().email('Invalid email'),
 // websiteUrl: z.string().url('Invalid website URL').optional(),
  headOfOrganization: z.string().trim().min(1, 'Head of organization is required'),
  academicYearStart: z.string().trim().min(1, 'Academic year start is required'),
  academicYearEnd: z.string().trim().min(1, 'Academic year end is required'),
 // timezone: z.string().trim().min(1, 'Timezone is required'),
 // currency: z.string().trim().min(1, 'Currency is required'),
 // locale: z.string().trim().min(1, 'Locale is required'),
  isActive: z.boolean().default(true),
});


export const validateOrganization = (data: unknown) => OrganizationSchema.safeParse(data);
export const validateCreateOrganization = (data: unknown) => CreateOrganizationSchema.safeParse(data);
export const validateUpdateOrganization = (data: unknown) => UpdateOrganizationSchema.safeParse(data);


export const CreateOrganizationSchema = OrganizationSchema;
export const UpdateOrganizationSchema = OrganizationSchema.partial().extend({
  organizationId: OrganizationSchema.shape.organizationId,
});

export type OrganizationTypeSchema = z.infer<typeof OrganizationSchema>;
export type CreateOrganizationType = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationType = z.infer<typeof UpdateOrganizationSchema>;
