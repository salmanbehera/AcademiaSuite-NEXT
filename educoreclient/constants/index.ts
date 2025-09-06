// Application-wide constants

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  
  // Student Module
  STUDENT: {
    BASE: '/student',
    DASHBOARD: '/student/dashboard',
    MASTER: '/student/master',
    CLASS_MASTER: '/student/master/class-master',
    ADMISSION: '/student/admission',
    PROFILE: '/student/profile',
    REPORTS: '/student/reports',
  },
  
  // Payroll Module
  PAYROLL: {
    BASE: '/payroll',
    DASHBOARD: '/payroll/dashboard',
    EMPLOYEES: '/payroll/employees',
    SALARY: '/payroll/salary',
    REPORTS: '/payroll/reports',
  },
  
  // Inventory Module
  INVENTORY: {
    BASE: '/inventory',
    DASHBOARD: '/inventory/dashboard',
    ITEMS: '/inventory/items',
    CATEGORIES: '/inventory/categories',
    SUPPLIERS: '/inventory/suppliers',
    REPORTS: '/inventory/reports',
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
    SEARCH: '/students/search',
    CLASSES: '/students/classes',
  },
  
  PAYROLL: {
    BASE: '/payroll',
    EMPLOYEES: '/payroll/employees',
    SALARY: '/payroll/salary',
    BY_ID: (id: string) => `/payroll/${id}`,
  },
  
  INVENTORY: {
    BASE: '/inventory',
    ITEMS: '/inventory/items',
    CATEGORIES: '/inventory/categories',
    SUPPLIERS: '/inventory/suppliers',
    BY_ID: (id: string) => `/inventory/${id}`,
  },
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  ACCOUNTANT: 'accountant',
  LIBRARIAN: 'librarian',
} as const;

export const PERMISSIONS = {
  // Student Module
  STUDENT_READ: 'student:read',
  STUDENT_WRITE: 'student:write',
  STUDENT_DELETE: 'student:delete',
  
  // Payroll Module
  PAYROLL_READ: 'payroll:read',
  PAYROLL_WRITE: 'payroll:write',
  PAYROLL_DELETE: 'payroll:delete',
  
  // Inventory Module
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_DELETE: 'inventory:delete',
  
  // System
  SYSTEM_CONFIG: 'system:config',
  USER_MANAGEMENT: 'user:management',
} as const;

export const MODULES = {
  STUDENT: 'student',
  PAYROLL: 'payroll',
  INVENTORY: 'inventory',
  LIBRARY: 'library',
  TRANSPORT: 'transport',
  HOSTEL: 'hostel',
  EXAMINATION: 'examination',
  FINANCE: 'finance',
} as const;

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export const ACADEMIC_STATUS = {
  ENROLLED: 'enrolled',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
  DROPPED_OUT: 'dropped_out',
  SUSPENDED: 'suspended',
} as const;
