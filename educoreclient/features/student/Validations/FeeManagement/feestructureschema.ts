// Fee Structure Validation Schema
import { z } from 'zod';
import { FEE_FREQUENCY_OPTIONS } from '@/features/student/Constants/FeeManagement/feestructure.constants';

const feeFrequencyEnum = z.enum([
  'Monthly',
  'Quarterly',
  'HalfYearly',
  'Annually',
  'OneTime',
]);

export const feeStructureDetailSchema = z.object({
  feeHeadId: z.string().min(1, 'Fee Head is required'),
  feeAmount: z.number().min(0, 'Fee Amount must be non-negative'),
  feeFrequency: feeFrequencyEnum,
});

export const feeStructureBaseSchema = z.object({
  organizationId: z.string().min(1, 'Organization is required'),
  branchId: z.string().min(1, 'Branch is required'),
  feeGroupId: z.string().min(1, 'Fee Group is required'),
  classId: z.string().min(1, 'Class is required'),
  semesterId: z.string().min(1, 'Semester is required'),
  academicYearId: z.string().min(1, 'Academic Year is required'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  isActive: z.boolean().optional(),
  details: z.array(feeStructureDetailSchema).min(1, 'At least one fee head is required'),
});

export const createFeeStructureSchema = feeStructureBaseSchema;
export const updateFeeStructureSchema = feeStructureBaseSchema.extend({ id: z.string().optional() });

export type FeeStructureDetailInput = z.infer<typeof feeStructureDetailSchema>;
export type FeeStructureInput = z.infer<typeof feeStructureBaseSchema>;

export function validateFeeStructure(data: unknown) {
  return feeStructureBaseSchema.safeParse(data);
}
