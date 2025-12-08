// Central configuration for the application
export const API_CONFIG = {
  // Base API URL - uses environment variable or fallback
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7051",

  // API Endpoints
  ENDPOINTS: {
    CLASSES: "/classes",
    ACADEMIC_YEARS: "/academicyears",
    SECTIONS: "/sections",
    STUDENTS: "/students",
    TEACHERS: "/teachers",
    STUDENT_CATEGORY: "/studentcategory",
    SEMISTERS: "/semesters",
    EXAM_CYCLES: "/examcycles",
    STREAMS: "/streams",
    FEEHEADS: "/feeheadmasters",
    FEEGROUPS: "/feegroups",
    CLASS_FEE_MAPPINGS: "/classfeemappings",
    STUDENTENROLLMENT: "/studentenrollments",
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_PAGE_INDEX: 0,
  },

  // Request timeout (defaults to 60 seconds to handle longer backend processes)
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "60000"),
} as const;

// Default organization and branch IDs
// In a real application, these would come from user authentication/selection
export const DEFAULT_ORG_CONFIG = {
  organizationId:
    process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ||
    "5a5af950-15bb-488f-b3eb-d1c28ddf1130",
  branchId:
    process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ||
    "9b508033-d3ad-428b-b01b-836216ea0cee",
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
