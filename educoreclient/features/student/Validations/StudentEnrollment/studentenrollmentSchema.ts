import { z } from 'zod';

const baseSchema = {
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID'),
  academicYearId: z.string().uuid('Invalid academic year ID'),
};

export const StudentEnrollmentSchema = z.object({
  studentdto: z.object({
    ...baseSchema,
    admissionNumber: z.string().min(1, 'Admission Number is required'),
    admissionDate: z.string().min(1, 'Admission Date is required'),
    studentCategory: z.string().min(1, 'Student Category is required'),
    stream: z.string().min(1, 'Stream is required'),
    medium: z.string().min(1, 'Medium is required'),
    transferCertificateNo: z.string().optional().nullable(),
    studentPhotoUrl: z.string().url().optional().nullable(),
    studentPhoto: z.any().optional().nullable(),
    studentBarcode: z.string().optional().nullable(),
    studentSignature: z.any().optional().nullable(),
    enquiryNumber: z.string().optional().nullable(),
    rollNumber: z.string().optional().nullable(),
    name: z.string().min(1, 'Student Name is required'),
    dateOfBirth: z.string().min(1, 'Date of Birth is required'),
    gender: z.union([z.string(), z.number()]),
    email: z.string().email('Invalid email'),
    mobile: z.string().min(1, 'Mobile is required'),
    bloodGroup: z.union([z.string(), z.number()]).optional().nullable(),
    identificationInfo: z.object({
      aadharNumber: z.string().optional().nullable(),
      panNumber: z.string().optional().nullable(),
      passportNumber: z.string().optional().nullable(),
      caste: z.string().optional().nullable(),
      religion: z.string().optional().nullable(),
      nationality: z.string().optional().nullable(),
      motherTongue: z.string().optional().nullable(),
    }),
    address: z.object({
      firstName: z.string().optional().nullable(),
      lastName: z.string().optional().nullable(),
      emailAddress: z.string().email('Invalid email').optional().nullable(),
      addressLine: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      zipCode: z.string().optional().nullable(),
    }),
    bankDetails: z.object({
      bankAccountNumber: z.string().optional().nullable(),
      bankIFSCCode: z.string().optional().nullable(),
      bankName: z.string().optional().nullable(),
      bankBranch: z.string().optional().nullable(),
      accountHolderName: z.string().optional().nullable(),
      accountType: z.string().optional().nullable(),
    }),
    emergencyContact: z.object({
      name: z.string().optional().nullable(),
      relation: z.string().optional().nullable(),
      contactNumber: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      AadharNo: z.string().optional().nullable(),
    }),
    healthRecord: z.object({
      bloodGroup: z.union([z.string(), z.number()]).optional().nullable(),
      height: z.string().optional().nullable(),
      weight: z.string().optional().nullable(),
      allergies: z.string().optional().nullable(),
      medicalConditions: z.string().optional().nullable(),
      emergencyContact: z.string().optional().nullable(),
    }),
    hostelDetails: z.object({
      hostelName: z.string().optional().nullable(),
      roomNumber: z.string().optional().nullable(),
      bedNumber: z.string().optional().nullable(),
      wardenName: z.string().optional().nullable(),
      wardenContact: z.string().optional().nullable(),
    }),
    previousSchoolDetails: z.object({
      schoolName: z.string().optional().nullable(),
      schoolBoard: z.string().optional().nullable(),
      percentage: z.union([z.string(), z.number()]).optional().nullable(),
    }),
    transportDetails: z.object({
      transportMode: z.string().optional().nullable(),
      routeNumber: z.string().optional().nullable(),
      pickupPoint: z.string().optional().nullable(),
      dropPoint: z.string().optional().nullable(),
      driverName: z.string().optional().nullable(),
      driverContact: z.string().optional().nullable(),
    }),
    
    studentStatus: z.union([z.string(), z.number()]).optional().nullable(),
    classEnrollments: z.array(z.object({
      classId: z.string().uuid('Invalid class ID'),
      sectionId: z.string().uuid('Invalid section ID'),
      academicYear: z.string().min(1, 'Academic Year is required'),
    })).optional(),
    extraCurriculars: z.array(z.object({
      activityName: z.string().optional().nullable(),
      role: z.string().optional().nullable(),
      duration: z.string().optional().nullable(),
      achievements: z.string().optional().nullable(),
    })).optional(),
    academicHistories: z.array(z.object({
      institutionName: z.string().optional().nullable(),
      courseName: z.string().optional().nullable(),
      startDate: z.string().optional().nullable(),
      endDate: z.string().optional().nullable(),
      gradeOrPercentage: z.string().optional().nullable(),
    })).optional(),
    familyMembers: z.array(z.object({
      name: z.string().optional().nullable(),
      relationship: z.string().optional().nullable(),
      mobile: z.string().optional().nullable(),
      occupation: z.string().optional().nullable(),
      parentAadhaar: z.string().optional().nullable(),
    })).optional(),
  }),
  studentPhotoBase64: z.string().optional().nullable(),
  studentSignatureBase64: z.string().optional().nullable(),
});

export type StudentEnrollmentSchemaType = z.infer<typeof StudentEnrollmentSchema>;

export const validateStudentEnrollment = (data: unknown) => StudentEnrollmentSchema.safeParse(data);

export class StudentEnrollmentValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(zodError: z.ZodError) {
    const message = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    super(message);
    this.issues = zodError.issues;
  }
}
