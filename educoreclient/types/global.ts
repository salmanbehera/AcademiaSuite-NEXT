// Global TypeScript type definitions

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'teacher'
  | 'student'
  | 'accountant'
  | 'librarian';

export type Permission = 
  | 'student:read'
  | 'student:write'
  | 'student:delete'
  | 'payroll:read'
  | 'payroll:write'
  | 'payroll:delete'
  | 'inventory:read'
  | 'inventory:write'
  | 'inventory:delete'
  | 'system:config'
  | 'user:management';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: any;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  entityId: string;
  entityType: string;
  changes: Record<string, any>;
  userId: string;
  userEmail: string;
  timestamp: Date;
  ipAddress: string;
}
