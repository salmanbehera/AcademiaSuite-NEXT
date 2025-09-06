export const APP_CONFIG = {
  name: 'AcademiaSuite',
  description: 'Enterprise Education Management System',
  version: '1.0.0',
  author: 'Academia Team',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://localhost:7001/api',
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
  version: 'v1',
  endpoints: {
    auth: '/auth',
    students: '/students',
    employees: '/employees',
    payroll: '/payroll',
    inventory: '/inventory',
  },
} as const;

export const AUTH_CONFIG = {
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
  secret: process.env.NEXTAUTH_SECRET,
  apiAuth: {
    clientId: process.env.API_CLIENT_ID,
    clientSecret: process.env.API_CLIENT_SECRET,
    tokenEndpoint: process.env.API_AUTH_ENDPOINT || `${API_CONFIG.baseUrl}/auth/token`,
  },
  providers: {
    credentials: true,
    externalApi: true,
  },
} as const;

export const CACHE_CONFIG = {
  defaultTTL: 5 * 60, // 5 minutes
  longTTL: 60 * 60, // 1 hour
  shortTTL: 60, // 1 minute
} as const;

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  maxPageSize: 100,
  availablePageSizes: [5, 10, 20, 50, 100],
} as const;
