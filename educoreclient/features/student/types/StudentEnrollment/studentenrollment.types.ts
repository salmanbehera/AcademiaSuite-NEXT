// Types for Student Enrollment module

import { BaseEntity } from '../master/baseEntity';

export interface IdentificationInfo {
  aadharNumber: string;
  panNumber: string;
  passportNumber: string;
  caste: string;
  religion: string;
  nationality: string;
  motherTongue: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  emailAddress: string;
  addressLine: string;
  country: string;
  state: string;
  zipCode: string;
}

export interface BankDetails {
  bankAccountNumber: string;
  bankIFSCCode: string;
  bankName: string;
  bankBranch: string;
  accountHolderName: string;
  accountType: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  contactNumber: string;
  address: string;
  AadharNo: string;
}

export interface HealthRecord {
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string;
  medicalConditions: string;
  emergencyContact: string;
}

export interface HostelDetails {
  hostelName: string;
  roomNumber: string;
  bedNumber: string;
  wardenName: string;
  wardenContact: string;
}

export interface PreviousSchoolDetails {
  schoolName: string;
  schoolBoard: string;
  percentage: string | number;
}

export interface TransportDetails {
  transportMode: string;
  routeNumber: string;
  pickupPoint: string;
  dropPoint: string;
  driverName: string;
  driverContact: string;
}

 

export interface ClassEnrollment {
  classId: string;
  sectionId: string;
  academicYear: string;
}

export interface ExtraCurricular {
  activityName: string;
  role: string;
  duration: string;
  achievements: string;
}

export interface AcademicHistory {
  institutionName: string;
  courseName: string;
  startDate: string;
  endDate: string;
  gradeOrPercentage: string;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  mobile: string;
  occupation: string;
  parentAadhaar: string;
}

export interface StudentEnrollmentDTO extends BaseEntity {
  organizationId: string;
  branchId: string;
  academicYearId: string;
  admissionNumber: string;
  admissionDate: string;
  studentCategory: string;
  stream: string;
  medium: string;
  transferCertificateNo: string;
  studentPhotoUrl: string;
  studentPhoto: File | null;
  studentBarcode: string;
  studentSignature: File | null;
  enquiryNumber: string;
  rollNumber: string;
  name: string;
  dateOfBirth: string;
  gender: string | number;
  email: string;
  mobile: string;
  bloodGroup: string | number;
  identificationInfo: IdentificationInfo;
  address: Address;
  bankDetails: BankDetails;
  emergencyContact: EmergencyContact;
  healthRecord: HealthRecord;
  hostelDetails: HostelDetails;
  previousSchoolDetails: PreviousSchoolDetails;
  transportDetails: TransportDetails;
   studentStatus: string | number;
  classEnrollments: ClassEnrollment[];
  extraCurriculars: ExtraCurricular[];
  academicHistories: AcademicHistory[];
  familyMembers: FamilyMember[];
}

export interface StudentEnrollmentPayload {
  studentdto: StudentEnrollmentDTO;
  studentPhotoBase64: string | null;
  studentSignatureBase64: string | null;
}
