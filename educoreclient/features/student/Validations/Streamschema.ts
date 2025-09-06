import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
};

export const StreamSchema = z.object({
  ...baseSchema,
  // streamCode removed
  streamName: z.string().min(1, 'Stream name is required'),
  streamShortName: z.string().min(1, 'Stream short name is required'),
  displayOrder: z.number().int('Display order must be a number'),
  maxStrength: z.number().int('Max strength must be a number'),
  reservationSeats: z.number().int('Reservation seats must be a number'),
  isActive: z.boolean().optional(),
});

export const CreateStreamSchema = StreamSchema;
export const UpdateStreamSchema = StreamSchema.partial().extend({
  organizationId: StreamSchema.shape.organizationId,
  branchId: StreamSchema.shape.branchId,
});

export type StreamType = z.infer<typeof StreamSchema>;
export type CreateStreamType = z.infer<typeof CreateStreamSchema>;
export type UpdateStreamType = z.infer<typeof UpdateStreamSchema>;

export const validateStream = (data: unknown) => StreamSchema.safeParse(data);
export const validateCreateStream = (data: unknown) => CreateStreamSchema.safeParse(data);
export const validateUpdateStream = (data: unknown) => UpdateStreamSchema.safeParse(data);

export class StreamValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}
