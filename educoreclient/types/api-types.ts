// Alternative approach: Manual TypeScript types
// No Prisma dependency needed

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  status?: string;
  academicYear?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

export interface Student extends BaseEntity {
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string; // ISO date string
  gender: Gender;
  rollNumber: string;
  academicYear: string;
  admissionDate: string; // ISO date string
  previousSchool?: string;
  avatar?: string;
  status: StudentStatus;
  
  // Address
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Guardian Information
  fatherName: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  primaryContact: ContactType;
  emergencyContact: string;
  emergencyPhone: string;

  // Relations (just IDs from API)
  classId: string;
 // class?: Class; // Optional populated relation
  //documents?: StudentDocument[];
}

export interface Employee extends BaseEntity {
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  joinDate: string;
  confirmationDate?: string;
  employmentType: EmploymentType;
  workSchedule: WorkSchedule;
  probationPeriod?: number;
  noticePeriod: number;
  avatar?: string;
  status: EmployeeStatus;
  
  // Address
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Position and Department
  positionId: string;
  position?: Position;
  departmentId: string;
  department?: Department;

  // Bank Details
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface InventoryItem extends BaseEntity {
  itemCode: string;
  name: string;
  description?: string;
  status: ItemStatus;
  tags: string[];
  images: string[];
  
  // Stock Information
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unit: string;
  reservedStock: number;
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  discount: number;
  taxRate: number;
  currency: string;
  
  // Location
  warehouse: string;
  zone?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  
  // Relations
  categoryId: string;
  category?: Category;
  supplierId: string;
  supplier?: Supplier;
}

// Enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  ACCOUNTANT = 'ACCOUNTANT',
  LIBRARIAN = 'LIBRARIAN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum StudentStatus {
  ENROLLED = 'ENROLLED',
  GRADUATED = 'GRADUATED',
  TRANSFERRED = 'TRANSFERRED',
  DROPPED_OUT = 'DROPPED_OUT',
  SUSPENDED = 'SUSPENDED',
}

export enum ContactType {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  OTHER = 'OTHER',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export enum WorkSchedule {
  REGULAR = 'REGULAR',
  FLEXIBLE = 'FLEXIBLE',
  REMOTE = 'REMOTE',
}

export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

// Class Management
export interface ClassDto extends BaseEntity {
  className: string;
  classShortName: string;
  displayOrder: number;
  maxStrength: number;
  reservationSeats: number;
  isActive: boolean;
}

// Student Form Data for Create/Update
export interface StudentFormData {
  // Basic Information
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: Gender;
  academicYear: string;
  classId: string;
  previousSchool?: string;
  
  // Address Information
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Guardian Information
  fatherName: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  primaryContact: ContactType;
  emergencyContact: string;
  emergencyPhone: string;
}

// Class Management Types
// export interface Class extends BaseEntity {
//   organizationId: string;
//   branchId: string;
//   className: string;
//   classShortName: string;
//   displayOrder: number;
//   maxStrength: number;
//   reservationSeats: number;
//   isActive: boolean;
// }

// export interface ClassDto {
//   organizationId: string;
//   branchId: string;
//   className: string;
//   classShortName: string;
//   displayOrder: number;
//   maxStrength: number;
//   reservationSeats: number;
//   isActive: boolean;
// }

// export interface CreateClassRequest {
//   classdto: ClassDto;
// }

// export interface GetClassesRequest {
//   pageIndex?: number;
//   pageSize?: number;
//   organizationId?: string;
//   branchId?: string;
// }

// export interface GetClassesResponse {
//   classdto: {
//     pageIndex: number;
//     pageSize: number;
//     count: number;
//     data: Class[];
//   };
// }

// Section Management Types


// Position and Department types for employees
export interface Position extends BaseEntity {
  title: string;
  description?: string;
  isActive: boolean;
}

export interface Department extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
}

// Category and Supplier types for inventory
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Supplier extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface Section extends BaseEntity {
  organizationId: string;
  branchId: string;
  sectionName: string;
  sectionShortName: string;
  maxStrength: number;
  currentStrength?: number;
  displayOrder: number;
  isActive: boolean;
}
// Section Types (consolidated)
export interface SectionDto {
  id?: string;
  organizationId: string;
  branchId: string;
  sectionName: string;
  sectionShortName: string;
  displayOrder: number;
  maxStrength: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionRequest {
  sectiondto: SectionDto;
}

export interface GetSectionsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
}

export interface GetSectionsResponse {
  sectiondto: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Section[];
  };
}

// Student Category Types
export interface StudentCategory extends BaseEntity {
  organizationId: string;
  branchId: string;
  categoryName: string;
  categoryShortName: string;
  isActive: boolean;
}

export interface StudentCategoryDto {
  id?: string;
  organizationId: string;
  branchId: string;
  categoryName: string;
  categoryShortName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentCategoryRequest {
  studentcategorydto: StudentCategoryDto;
}

export interface GetStudentCategoriesRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
}

export interface GetStudentCategoriesResponse {
  studentcategorydto: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: StudentCategory[];
  };
}
