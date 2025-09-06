// Student module types

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: Address;
  guardianInfo: GuardianInfo;
  academicInfo: AcademicInfo;
  documents: StudentDocument[];
  avatar?: string;
  status: 'enrolled' | 'graduated' | 'transferred' | 'dropped_out' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface GuardianInfo {
  fatherName: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  primaryContact: 'father' | 'mother' | 'other';
  emergencyContact: string;
  emergencyPhone: string;
}

export interface AcademicInfo {
  classId: string;
  className: string;
  section: string;
  rollNumber: string;
  academicYear: string;
  admissionDate: Date;
  previousSchool?: string;
  transferCertificate?: string;
}

export interface StudentDocument {
  id: string;
  type: 'birth_certificate' | 'transfer_certificate' | 'id_proof' | 'address_proof' | 'photo' | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  section: string;
  capacity: number;
  currentStrength: number;
  classTeacherId: string;
  classTeacherName: string;
  subjects: Subject[];
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  credits: number;
  type: 'core' | 'elective' | 'practical';
  description?: string;
}

export interface StudentCreateRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  guardianInfo: GuardianInfo;
  classId: string;
  rollNumber: string;
  admissionDate: string;
  previousSchool?: string;
}

export interface StudentUpdateRequest extends Partial<StudentCreateRequest> {
  id: string;
}

export interface StudentSearchParams {
  search?: string;
  classId?: string;
  status?: string;
  gender?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  newAdmissions: number;
  graduatedStudents: number;
  byClass: Array<{
    className: string;
    count: number;
  }>;
  byGender: Array<{
    gender: string;
    count: number;
  }>;
}
