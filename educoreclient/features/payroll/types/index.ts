// Payroll module types

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: Address;
  position: Position;
  department: Department;
  employment: EmploymentInfo;
  salary: SalaryInfo;
  bankDetails: BankDetails;
  documents: EmployeeDocument[];
  avatar?: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
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

export interface Position {
  id: string;
  title: string;
  level: 'junior' | 'senior' | 'lead' | 'manager' | 'director';
  description?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  headName?: string;
}

export interface EmploymentInfo {
  joinDate: Date;
  confirmationDate?: Date;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  workSchedule: 'regular' | 'flexible' | 'remote';
  probationPeriod?: number; // in months
  noticePeriod: number; // in days
}

export interface SalaryInfo {
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  grossSalary: number;
  netSalary: number;
  currency: string;
  payrollCycle: 'monthly' | 'bi_weekly' | 'weekly';
  effectiveDate: Date;
}

export interface Allowance {
  id: string;
  type: 'house_rent' | 'transport' | 'medical' | 'food' | 'bonus' | 'overtime' | 'other';
  name: string;
  amount: number;
  isPercentage: boolean;
  isTaxable: boolean;
}

export interface Deduction {
  id: string;
  type: 'tax' | 'provident_fund' | 'insurance' | 'loan' | 'advance' | 'other';
  name: string;
  amount: number;
  isPercentage: boolean;
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface EmployeeDocument {
  id: string;
  type: 'resume' | 'id_proof' | 'address_proof' | 'educational' | 'experience' | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeId_display: string;
  month: number;
  year: number;
  payPeriod: {
    startDate: Date;
    endDate: Date;
  };
  earnings: PayslipItem[];
  deductions: PayslipItem[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  workingDays: number;
  paidDays: number;
  status: 'draft' | 'processed' | 'paid';
  generatedAt: Date;
  paidAt?: Date;
}

export interface PayslipItem {
  name: string;
  amount: number;
  type: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'sick' | 'casual' | 'earned' | 'maternity' | 'paternity' | 'unpaid';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  comments?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  hoursWorked: number;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'on_leave';
  remarks?: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  departmentWise: Array<{
    departmentName: string;
    employeeCount: number;
    totalPayroll: number;
  }>;
  positionWise: Array<{
    positionTitle: string;
    employeeCount: number;
    averageSalary: number;
  }>;
}
