# AcademiaSuite Project Structure

## 📁 Folder Structure

```
educoreclient/
├── app/                          # Next.js App Router
│   ├── (modules)/               # Route groups for logical separation
│   │   ├── (Student)/           # Student module routes
│   │   ├── (PayRoll)/           # Payroll module routes
│   │   └── (Inventory)/         # Inventory module routes
│   ├── api/                     # API routes
│   │   └── v1/                  # API versioning
│   │       ├── students/        # Student API endpoints
│   │       ├── payroll/         # Payroll API endpoints
│   │       └── inventory/       # Inventory API endpoints
│   ├── auth/                    # Authentication pages
│   └── globals.css              # Global styles
│
├── features/                    # Feature-based organization
│   ├── student/                 # Student feature
│   │   ├── components/          # Student-specific components
│   │   ├── hooks/               # Student-specific hooks
│   │   ├── services/            # Student API services
│   │   ├── types/               # Student TypeScript types
│   │   └── utils/               # Student utilities
│   ├── payroll/                 # Payroll feature
│   └── inventory/               # Inventory feature
│
├── components/                  # Shared components
│   ├── ui/                      # Basic UI components (buttons, inputs, etc.)
│   ├── layout/                  # Layout components (sidebar, header, etc.)
│   ├── forms/                   # Reusable form components
│   ├── tables/                  # Data table components
│   └── charts/                  # Chart components
│
├── lib/                         # Utility libraries
│   ├── auth/                    # Authentication utilities
│   ├── database/                # Database configuration
│   ├── utils/                   # General utilities
│   └── validations/             # Validation schemas
│
├── hooks/                       # Global custom hooks
├── store/                       # Global state management
├── types/                       # Global TypeScript types
├── services/                    # Global API services
├── constants/                   # Application constants
├── providers/                   # React providers
├── middleware/                  # Next.js middleware
├── config/                      # Configuration files
│
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma           # Prisma schema
│   └── migrations/             # Database migrations
│
├── __tests__/                   # Testing
│   ├── components/             # Component tests
│   ├── api/                    # API tests
│   └── e2e/                    # End-to-end tests
│
├── docs/                       # Documentation
└── public/                     # Static assets
```

## 🎯 Purpose of Each Directory

### `/features`
Feature-based organization for better maintainability and scalability. Each feature contains its own components, hooks, services, types, and utilities.

### `/components`
- `ui/` - Basic reusable UI components (Button, Input, Modal, etc.)
- `layout/` - Layout-specific components (Sidebar, Header, Footer)
- `forms/` - Complex form components
- `tables/` - Data table components with sorting, filtering
- `charts/` - Chart and visualization components

### `/lib`
- `auth/` - Authentication utilities and configurations
- `database/` - Database connection and utilities
- `utils/` - General utility functions
- `validations/` - Zod schemas for data validation

### `/app/api/v1`
RESTful API endpoints organized by module with versioning support.

### `/store`
Global state management using Zustand for application-wide state.

### `/hooks`
Custom React hooks that are used across multiple features.

### `/types`
Global TypeScript type definitions and interfaces.

### `/constants`
Application-wide constants and configuration values.

### `/providers`
React context providers for themes, authentication, etc.

### `/middleware`
Next.js middleware for authentication, rate limiting, etc.

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables: Copy `.env.example` to `.env.local`
3. Set up database: `npx prisma migrate dev`
4. Run development server: `npm run dev`

## 📚 Development Guidelines

- Follow the feature-based architecture
- Use TypeScript for type safety
- Write tests for components and API endpoints
- Follow the established folder structure
- Use proper naming conventions
