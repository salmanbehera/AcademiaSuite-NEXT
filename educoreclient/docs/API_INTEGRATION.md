# External .NET Core API Integration Guide

## 🔌 API Configuration

Your AcademiaSuite Next.js frontend is now configured to work with an external .NET Core API instead of a local database. Here's what has been set up:

### 📁 Key Configuration Files

1. **`.env.example`** - Updated with API-specific environment variables
2. **`config/app.config.ts`** - API endpoints and configuration
3. **`lib/api-client.ts`** - HTTP client for API communication
4. **`lib/auth/auth-service.ts`** - Authentication service
5. **`features/*/services/`** - Module-specific API services

## 🛠️ Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and update with your .NET Core API details:

```env
# External .NET Core API Configuration
NEXT_PUBLIC_API_BASE_URL="https://your-dotnet-api.com/api"
API_BASE_URL="https://your-dotnet-api.com/api"

# Authentication
API_CLIENT_ID="your-api-client-id"
API_CLIENT_SECRET="your-api-client-secret"
API_AUTH_ENDPOINT="https://your-dotnet-api.com/auth/token"
```

### 2. Expected .NET Core API Endpoints

Your .NET Core API should implement the following endpoints:

#### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### Student Module Endpoints
```
GET    /api/students
GET    /api/students/{id}
POST   /api/students
PUT    /api/students/{id}
DELETE /api/students/{id}
GET    /api/students/search?q={query}
GET    /api/students/stats
POST   /api/students/bulk
PUT    /api/students/bulk
DELETE /api/students/bulk

GET    /api/classes
POST   /api/classes
PUT    /api/classes/{id}
DELETE /api/classes/{id}
```

#### Payroll Module Endpoints
```
GET    /api/employees
GET    /api/employees/{id}
POST   /api/employees
PUT    /api/employees/{id}
DELETE /api/employees/{id}

GET    /api/payroll/payslips
POST   /api/payroll/payslips/generate
POST   /api/payroll/payslips/process

GET    /api/payroll/leave-requests
POST   /api/payroll/leave-requests
POST   /api/payroll/leave-requests/{id}/approve
POST   /api/payroll/leave-requests/{id}/reject

GET    /api/payroll/attendance
POST   /api/payroll/attendance
POST   /api/payroll/attendance/bulk
```

#### Inventory Module Endpoints
```
GET    /api/inventory/items
GET    /api/inventory/items/{id}
POST   /api/inventory/items
PUT    /api/inventory/items/{id}
DELETE /api/inventory/items/{id}

GET    /api/inventory/categories
POST   /api/inventory/categories
PUT    /api/inventory/categories/{id}

GET    /api/inventory/suppliers
POST   /api/inventory/suppliers
PUT    /api/inventory/suppliers/{id}

GET    /api/inventory/purchase-orders
POST   /api/inventory/purchase-orders
PUT    /api/inventory/purchase-orders/{id}
```

## 📊 Expected Response Format

All API responses should follow this structure:

```json
{
  "success": true,
  "data": { /* your data here */ },
  "message": "Operation successful",
  "pagination": {  // For paginated responses
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

For errors:
```json
{
  "success": false,
  "error": "Error message",
  "errors": {  // For validation errors
    "field1": ["Error message 1"],
    "field2": ["Error message 2"]
  }
}
```

## 🔐 Authentication Flow

1. **Login**: POST to `/api/auth/login` with credentials
2. **Token Storage**: Store `accessToken` and `refreshToken` in localStorage
3. **API Requests**: Include `Authorization: Bearer {token}` header
4. **Token Refresh**: Use `/api/auth/refresh` when token expires
5. **Logout**: Clear tokens and call `/api/auth/logout`

## 🧪 TypeScript Support

The Prisma schema is kept for TypeScript type generation only. It won't connect to any database but provides type safety for your frontend:

```typescript
// Types are available from the schema
import { Student, Employee, InventoryItem } from '@prisma/client';

// But data comes from API services
import { studentService } from '@/features/student/services';

const students = await studentService.getStudents();
```

## 🚀 Usage Examples

### Student Service
```typescript
import { studentService } from '@/features/student/services';

// Get all students
const students = await studentService.getStudents({
  page: 1,
  limit: 10,
  search: 'john'
});

// Create new student
const newStudent = await studentService.createStudent({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  // ... other fields
});
```

### Authentication
```typescript
import { authService } from '@/lib/auth/auth-service';

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}
```

## 🔧 Customization

### Adding New Endpoints
1. Update `config/app.config.ts` with new endpoint paths
2. Add methods to appropriate service files
3. Update TypeScript types if needed

### Error Handling
The API client includes automatic error handling, timeout management, and token refresh logic.

### Caching
Consider implementing Redis caching for frequently accessed data to improve performance.

## 📝 Next Steps

1. **Install Dependencies**: 
   ```bash
   npm install @tanstack/react-query zustand
   ```

2. **Configure API Base URL** in your environment variables

3. **Implement corresponding endpoints** in your .NET Core API

4. **Test the integration** with your API

Your frontend is now ready to work with your external .NET Core API! 🎉
