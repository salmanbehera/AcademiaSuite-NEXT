// Central configuration for the application
export const API_CONFIG = {
  // Base API URL - uses environment variable or fallback
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7051',
  
  // API Endpoints
  ENDPOINTS: {
    CLASSES: '/classes',
    ACADEMIC_YEARS: '/academicyears',
    SECTIONS: '/sections',
    STUDENTS: '/students',
    TEACHERS: '/teachers',
    STUDENT_CATEGORY: '/studentcategory',
    SEMISTERS: '/semesters',
    EXAM_CYCLES: '/examcycles',
    STREAMS: '/streams',
    FEEHEADS: '/feeheadmasters',
    FEEGROUPS: '/feegroups',
    CLASS_FEE_MAPPINGS: '/classfeemappings',
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_PAGE_INDEX: 0,
  },
  
  // Request timeout (defaults to 60 seconds to handle longer backend processes)
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000'),
} as const;

// Default organization and branch IDs
// In a real application, these would come from user authentication/selection
export const DEFAULT_ORG_CONFIG = {
  organizationId: process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || "9d1015db-1e10-4ef5-9250-f8b9b16b9a78",
  branchId: process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID || "8024d2f8-74aa-494f-bda0-a197e634fffc",
} as const;

// API Response wrapper type
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Pagination response type
export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}
