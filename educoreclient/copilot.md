# Student Feature Development Guidelines

> **Purpose**: This file provides standardized patterns and templates for creating new features in the student module. Follow these patterns to maintain consistency and best practices.

## Architecture Patterns

### Feature-Based Structure

```
features/student/
├── components/        # React components (organized by feature)
│   ├── FeatureName/
│   │   ├── FeatureList.tsx       # List/Table component
│   │   ├── FeatureForm.tsx       # Create/Edit form
│   │   └── FeatureCard.tsx       # Card/Detail view (optional)
├── hooks/            # Custom React hooks
│   ├── master/       # Domain-specific hooks (useClasses, useSections)
│   └── shared/       # Reusable hooks (useGenericCRUD, useCancellableRequest)
├── services/         # API service layers
│   ├── master/       # Core services (ClassService, SectionService)
│   └── FeatureName/  # Feature-specific services
├── types/            # TypeScript interfaces
│   ├── master/       # Core types (classTypes.ts, sectionTypes.ts)
│   └── FeatureName/  # Feature-specific types
├── utils/            # Utility functions (csvImportHelper, commonHelpers)
├── pages/            # Page components
│   └── FeatureName/  # Feature pages
├── Validations/      # Validation schemas (Zod)
└── Constants/        # Constants and enums
```

## Type Safety Standards

### ✅ DO: Use Proper Types

```typescript
// Use specific interfaces
interface GetStudentsResponse {
  students: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Student[];
  };
}

// Services must have explicit return types
static async getStudents(params: GetStudentsRequest): Promise<GetStudentsResponse> {
  return enterpriseApiClient.get<GetStudentsResponse>(endpoint, params);
}
```

### ❌ DON'T: Use 'any'

```typescript
// Bad
const handleData = (data: any) => { ... }
static async getData(): Promise<any> { ... }

// Good
const handleData = (data: StudentDto) => { ... }
static async getData(): Promise<StudentDto[]> { ... }
```

## Service Layer Pattern

### Standard Service Structure

```typescript
import { API_CONFIG } from "@/lib/config";
import { apiClient as enterpriseApiClient } from "@/lib/enterprise-api-client";
import { EntityDto, GetEntitiesResponse } from "../types";

export class EntityService {
  // Get all with pagination
  static async getEntities(
    params: GetEntitiesRequest
  ): Promise<GetEntitiesResponse> {
    const queryParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId,
      branchId: params?.branchId,
      ...params,
    };
    return enterpriseApiClient.get<GetEntitiesResponse>(
      API_CONFIG.ENDPOINTS.ENTITY,
      queryParams
    );
  }

  // Get by ID
  static async getEntityById(id: string): Promise<Entity> {
    return enterpriseApiClient.get<Entity>(
      `${API_CONFIG.ENDPOINTS.ENTITY}/${id}`
    );
  }

  // Create
  static async createEntity(data: EntityDto): Promise<Entity> {
    const payload = { entitydto: data };
    return enterpriseApiClient.post<Entity>(
      API_CONFIG.ENDPOINTS.ENTITY,
      payload
    );
  }

  // Update
  static async updateEntity(
    id: string,
    data: Partial<EntityDto>
  ): Promise<Entity> {
    const payload = { entitydto: { ...data, id } };
    return enterpriseApiClient.put<Entity>(
      API_CONFIG.ENDPOINTS.ENTITY,
      payload
    );
  }

  // Soft delete
  static async deleteEntity(
    id: string,
    completeData: EntityDto
  ): Promise<void> {
    const payload = { entitydto: { ...completeData, id, isActive: false } };
    await enterpriseApiClient.put<Entity>(API_CONFIG.ENDPOINTS.ENTITY, payload);
  }
}
```

## Hook Patterns

### Option 1: Use Generic CRUD Hook (Recommended for Standard CRUD)

```typescript
import {
  createGenericCRUDHook,
  GenericCRUDService,
} from "../shared/useGenericCRUD";
import { EntityService } from "@/services";

// Create service adapter
const serviceAdapter: GenericCRUDService<Entity, EntityDto> = {
  getAll: async (params) => {
    const response = await EntityService.getEntities(params);
    return { entitydto: response.entitydto };
  },
  getById: (id) => EntityService.getEntityById(id),
  create: (data) => EntityService.createEntity(data),
  update: (id, data) => EntityService.updateEntity(id, data),
  delete: (id, data) => EntityService.deleteEntity(id, data),
};

// Create hook
export const useEntities = createGenericCRUDHook<Entity, EntityDto>(
  serviceAdapter,
  "entities",
  "entitydto"
);

// Usage in components
const { items, isLoading, create, update, remove } = useEntities({
  pageSize: 10,
});
```

### Option 2: Custom Hook with React Query (For Complex Logic)

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgData } from "@/contexts/OrganizationContext";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";
import { useCallback } from "react";

export const queryKeys = {
  all: ["entities"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (
    orgId: string,
    branchId: string,
    pageIndex: number,
    pageSize: number
  ) =>
    [...queryKeys.lists(), { orgId, branchId, pageIndex, pageSize }] as const,
};

export function useEntities(options = {}) {
  const { organizationId, branchId, isDataReady } = useOrgData();
  const { handleApiError } = useGlobalErrorHandler();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.list(organizationId, branchId, pageIndex, pageSize),
    queryFn: () =>
      EntityService.getEntities({
        organizationId,
        branchId,
        pageIndex,
        pageSize,
      }),
    enabled: isDataReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      EntityService.createEntity({ ...data, organizationId, branchId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() }),
  });

  return {
    items: query.data?.entitydto?.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
  };
}
```

### Option 3: Traditional Hook (Legacy, Avoid for New Features)

```typescript
// Only use if React Query is not suitable
// Prefer Option 1 or 2 for new features
```

## Error Handling

### ✅ DO: Consistent Error Handling

```typescript
try {
  const result = await EntityService.createEntity(data);
  return result;
} catch (err: any) {
  // Check for abort errors (request cancellation)
  if (err.name !== "AbortError") {
    const errorMessage = handleApiError(err, "create entity");
    setError(errorMessage);
  }
  return null;
}
```

### ✅ DO: Early Returns for Validation

```typescript
const createEntity = useCallback(
  async (data: EntityDto) => {
    if (!isReady || !organizationId || !branchId) {
      setError("Organization context not ready");
      return null;
    }

    // Continue with creation
  },
  [isReady, organizationId, branchId]
);
```

### ❌ DON'T: Console.log in Production

```typescript
// Bad
console.log("Debug:", data);
console.error("Error:", error);

// Good - Use error handler
handleApiError(error, "operation name");
```

## CSV Import/Export Pattern

### Use Shared CSV Utility

```typescript
import {
  parseCSVFile,
  csvTransformers,
  exportToCSV,
} from "@/features/student/utils/csvImportHelper";

// Import
const importEntities = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  const result = await parseCSVFile<EntityDto>(
    file,
    {
      headerMap: {
        Name: "name",
        Code: "code",
        Status: "isActive",
      },
      requiredFields: ["name", "code"],
      transformers: {
        isActive: csvTransformers.toBoolean,
        displayOrder: csvTransformers.toNumber,
      },
      validateRow: (data, rowIndex) => {
        if (!data.name) return "Name is required";
        return null;
      },
    },
    onProgress
  );

  // Process results
  for (const item of result.data) {
    await EntityService.createEntity(withOrgData(item));
  }

  return { success: result.success, errors: result.errors };
};

// Export
const exportEntities = () => {
  exportToCSV(
    entities,
    [
      { key: "name", header: "Name" },
      { key: "code", header: "Code" },
      { key: "isActive", header: "Status" },
    ],
    "entities.csv"
  );
};
```

## Request Cancellation

### Use AbortController for Cleanup

```typescript
import { useCancellableRequest } from "../shared/useCancellableRequest";

function useDataFetch() {
  const { signal, cancelPendingRequests } = useCancellableRequest();

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data", { signal });
      return response.json();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        throw err;
      }
    }
  };

  return { fetchData, cancel: cancelPendingRequests };
}
```

## Component Patterns

### ✅ DO: Proper Organization Context

```typescript
"use client";

import { useOrganization } from "@/contexts/OrganizationContext";
import { useEntities } from "@/features/student/hooks/master";

export default function EntityPage() {
  const { organizationId, branchId, isReady } = useOrganization();
  const { items, isLoading, create, update, remove } = useEntities();

  if (!isReady) {
    return <div>Loading organization context...</div>;
  }

  return <div>{/* Component content */}</div>;
}
```

### ✅ DO: Proper State Management

```typescript
// Use React Query for server state
const { items, isLoading } = useEntities();

// Use useState only for UI state
const [showForm, setShowForm] = useState(false);
const [selectedItem, setSelectedItem] = useState<Entity | null>(null);
```

## Validation Patterns

### Use Zod Schemas

```typescript
import { z } from "zod";

export const entitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().min(2, "Code must be at least 2 characters"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().positive().optional(),
});

export type EntityFormData = z.infer<typeof entitySchema>;
```

## Performance Best Practices

### ✅ DO: Memoization

```typescript
// Memoize expensive computations
const filteredItems = useMemo(
  () => items.filter((item) => item.isActive),
  [items]
);

// Memoize callbacks
const handleCreate = useCallback(
  async (data: EntityDto) => {
    await create(data);
  },
  [create]
);
```

### ✅ DO: Optimistic Updates

```typescript
// React Query handles this automatically
// For manual implementation:
const updateMutation = useMutation({
  mutationFn: updateEntity,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ["entities"] });
    const previous = queryClient.getQueryData(["entities"]);

    queryClient.setQueryData(["entities"], (old) => ({
      ...old,
      data: old.data.map((item) =>
        item.id === newData.id ? { ...item, ...newData } : item
      ),
    }));

    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(["entities"], context.previous);
  },
});
```

### ✅ DO: Proper Pagination

```typescript
const { items, totalCount, pageIndex, pageSize, setPageIndex, setPageSize } =
  useEntities({ pageSize: 10 });

// Computed values
const totalPages = Math.ceil(totalCount / pageSize);
const hasNextPage = pageIndex < totalPages - 1;
const hasPrevPage = pageIndex > 0;
```

## File Naming Conventions

- **Components**: PascalCase - `EntityForm.tsx`, `EntityList.tsx`
- **Hooks**: camelCase with 'use' prefix - `useEntities.ts`, `useEntityForm.ts`
- **Services**: PascalCase with 'Service' suffix - `EntityService.ts`
- **Types**: camelCase with 'Types' suffix - `entityTypes.ts`
- **Utils**: camelCase - `csvImportHelper.ts`, `commonHelpers.ts`
- **Pages**: camelCase - `entity.tsx`, `entityManagement.tsx`

## Import Order

```typescript
// 1. External libraries
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

// 2. Internal absolute imports (@/)
import { useOrganization } from "@/contexts/OrganizationContext";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";

// 3. Feature-specific imports
import { EntityService } from "@/features/student/services/master";
import { Entity, EntityDto } from "@/features/student/types/master/entityTypes";

// 4. Relative imports
import { parseCSVFile } from "../utils/csvImportHelper";
```

## Code Review Checklist

### Before Submitting Code

- [ ] No `any` types used
- [ ] All functions have return types
- [ ] Error handling implemented
- [ ] No console.log statements
- [ ] Proper TypeScript types/interfaces
- [ ] React Query used for server state
- [ ] Organization context properly handled
- [ ] Request cancellation for async operations
- [ ] Optimistic updates for mutations
- [ ] Proper memoization (useMemo, useCallback)
- [ ] CSV import uses shared utility
- [ ] Validation schemas defined
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Accessibility considered

## Common Anti-Patterns to Avoid

### ❌ Don't Duplicate CRUD Logic

```typescript
// Bad - Writing same CRUD logic in every hook
export function useEntities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... 500 lines of repeated code
}

// Good - Use generic CRUD hook
export const useEntities = createGenericCRUDHook(
  serviceAdapter,
  "entities",
  "entitydto"
);
```

### ❌ Don't Embed CSV Parsing in Hooks

```typescript
// Bad - CSV parsing embedded in hook (200+ lines)
const importData = async (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    // ... complex parsing logic
  };
};

// Good - Use shared utility
const importData = async (file) => {
  const result = await parseCSVFile(file, config);
  // Process results
};
```

### ❌ Don't Mix Server and UI State

```typescript
// Bad - Using useState for server data
const [entities, setEntities] = useState([]);
useEffect(() => {
  fetchEntities().then(setEntities);
}, []);

// Good - React Query for server state
const { data: entities } = useQuery({
  queryKey: ["entities"],
  queryFn: fetchEntities,
});
```

## Testing Guidelines

### Unit Tests for Services

```typescript
describe("EntityService", () => {
  it("should fetch entities with pagination", async () => {
    const result = await EntityService.getEntities({
      pageIndex: 0,
      pageSize: 10,
    });
    expect(result.entitydto.data).toBeDefined();
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useEntities } from "./useEntities";

describe("useEntities", () => {
  it("should fetch and return entities", async () => {
    const { result } = renderHook(() => useEntities());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toBeDefined();
  });
});
```

## Step-by-Step: Creating a New Feature

### Step 1: Define Types (`types/FeatureName/entityTypes.ts`)

```typescript
import { BaseEntity } from "../master/baseEntity";

// Main entity interface
export interface Entity extends BaseEntity {
  organizationId: string;
  branchId: string;
  entityName: string;
  entityCode: string;
  displayOrder: number;
  description?: string;
  isActive: boolean;
}

// DTO for API requests
export interface EntityDto {
  id?: string;
  organizationId: string;
  branchId: string;
  entityName: string;
  entityCode: string;
  displayOrder: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Create request wrapper
export interface CreateEntityRequest {
  entitydto: EntityDto;
}

// Get request parameters
export interface GetEntitiesRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof Entity;
  sortOrder?: "asc" | "desc";
}

// Get response structure
export interface GetEntitiesResponse {
  entitydto: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Entity[];
  };
}
```

### Step 2: Create Constants (`Constants/entity.constants.ts`)

```typescript
// Default values
export const ENTITY_DEFAULTS = {
  PAGE_SIZE: 10,
  DISPLAY_ORDER: 1,
  IS_ACTIVE: true,
} as const;

// Status options
export const ENTITY_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

// Table columns configuration
export const ENTITY_COLUMNS = [
  { key: "entityCode", label: "Code", sortable: true },
  { key: "entityName", label: "Name", sortable: true },
  { key: "displayOrder", label: "Order", sortable: true },
  { key: "isActive", label: "Status", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
] as const;

// CSV headers mapping
export const ENTITY_CSV_HEADERS = {
  "Entity Name": "entityName",
  "Entity Code": "entityCode",
  "Display Order": "displayOrder",
  Description: "description",
  Status: "isActive",
} as const;
```

### Step 3: Create Validation Schema (`Validations/entitySchema.ts`)

```typescript
import { z } from "zod";

export const entitySchema = z.object({
  entityName: z
    .string()
    .min(1, "Entity name is required")
    .max(100, "Entity name must be less than 100 characters")
    .trim(),

  entityCode: z
    .string()
    .min(2, "Entity code must be at least 2 characters")
    .max(20, "Entity code must be less than 20 characters")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Entity code can only contain letters, numbers, hyphens and underscores"
    )
    .trim(),

  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .positive("Display order must be positive")
    .default(1),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  isActive: z.boolean().default(true),
});

export type EntityFormData = z.infer<typeof entitySchema>;

// Validation helper
export const validateEntity = (data: unknown) => {
  return entitySchema.safeParse(data);
};
```

### Step 4: Create Service (`services/FeatureName/entityService.ts`)

```typescript
import { API_CONFIG } from "@/lib/config";
import { apiClient as enterpriseApiClient } from "@/lib/enterprise-api-client";
import {
  Entity,
  EntityDto,
  CreateEntityRequest,
  GetEntitiesRequest,
  GetEntitiesResponse,
} from "@/features/student/types/FeatureName/entityTypes";

/**
 * Entity API Service
 * Handles all API operations for entities
 */
export class EntityService {
  private static readonly ENDPOINT = API_CONFIG.ENDPOINTS.ENTITY; // Define in config

  /**
   * Get all entities with pagination
   */
  static async getEntities(
    params?: GetEntitiesRequest
  ): Promise<GetEntitiesResponse> {
    const queryParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId,
      branchId: params?.branchId,
      ...params,
    };

    return enterpriseApiClient.get<GetEntitiesResponse>(
      this.ENDPOINT,
      queryParams
    );
  }

  /**
   * Get entity by ID
   */
  static async getEntityById(id: string): Promise<Entity> {
    return enterpriseApiClient.get<Entity>(`${this.ENDPOINT}/${id}`);
  }

  /**
   * Create new entity
   */
  static async createEntity(data: EntityDto): Promise<Entity> {
    const payload: CreateEntityRequest = { entitydto: data };
    return enterpriseApiClient.post<Entity>(this.ENDPOINT, payload);
  }

  /**
   * Update existing entity
   */
  static async updateEntity(
    id: string,
    data: Partial<EntityDto>
  ): Promise<Entity> {
    const payload = { entitydto: { ...data, id } };
    return enterpriseApiClient.put<Entity>(this.ENDPOINT, payload);
  }

  /**
   * Soft delete entity
   */
  static async deleteEntity(
    id: string,
    completeData: EntityDto
  ): Promise<void> {
    const payload = { entitydto: { ...completeData, id, isActive: false } };
    await enterpriseApiClient.put<Entity>(this.ENDPOINT, payload);
  }

  /**
   * Toggle entity status
   */
  static async toggleEntityStatus(
    id: string,
    completeData: EntityDto,
    isActive: boolean
  ): Promise<Entity> {
    const payload = { entitydto: { ...completeData, id, isActive } };
    return enterpriseApiClient.put<Entity>(this.ENDPOINT, payload);
  }

  /**
   * Bulk create entities
   */
  static async bulkCreateEntities(
    entitiesData: EntityDto[]
  ): Promise<Entity[]> {
    const payload = {
      entities: entitiesData.map((data) => ({ entitydto: data })),
    };
    return enterpriseApiClient.post<Entity[]>(`${this.ENDPOINT}/bulk`, payload);
  }

  /**
   * Export entities to CSV/Excel
   */
  static async exportEntities(format: "csv" | "excel" = "csv"): Promise<Blob> {
    const response = await enterpriseApiClient
      .getAxiosInstance()
      .get(`${this.ENDPOINT}/export`, {
        params: { format },
        responseType: "blob",
      });
    return response.data;
  }
}

export default EntityService;
```

### Step 5: Create Hook (`hooks/FeatureName/useEntities.ts`)

```typescript
"use client";

import {
  createGenericCRUDHook,
  GenericCRUDService,
} from "../shared/useGenericCRUD";
import { EntityService } from "@/features/student/services/FeatureName/entityService";
import {
  Entity,
  EntityDto,
} from "@/features/student/types/FeatureName/entityTypes";
import {
  parseCSVFile,
  csvTransformers,
  exportToCSV,
} from "@/features/student/utils/csvImportHelper";
import { useCallback, useMemo } from "react";
import { useOrgData } from "@/contexts/OrganizationContext";
import {
  ENTITY_CSV_HEADERS,
  ENTITY_COLUMNS,
} from "@/features/student/Constants/entity.constants";

// Service adapter for generic CRUD
const entityServiceAdapter: GenericCRUDService<Entity, EntityDto> = {
  getAll: async (params) => {
    const response = await EntityService.getEntities(params);
    return { entitydto: response.entitydto };
  },
  getById: (id) => EntityService.getEntityById(id),
  create: (data) => EntityService.createEntity(data),
  update: (id, data) => EntityService.updateEntity(id, data),
  delete: (id, data) => EntityService.deleteEntity(id, data),
};

// Create base hook
const useEntitiesCRUD = createGenericCRUDHook<Entity, EntityDto>(
  entityServiceAdapter,
  "entities",
  "entitydto"
);

export interface UseEntitiesOptions {
  pageIndex?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook for managing entities
 * Provides CRUD operations, CSV import/export, and computed values
 */
export function useEntities(options: UseEntitiesOptions = {}) {
  const { organizationId, branchId } = useOrgData();
  const crudHook = useEntitiesCRUD(options);

  // CSV Import
  const importEntities = useCallback(
    async (file: File, onProgress?: (progress: number) => void) => {
      try {
        const result = await parseCSVFile<EntityDto>(
          file,
          {
            headerMap: ENTITY_CSV_HEADERS,
            requiredFields: ["entityName", "entityCode"],
            transformers: {
              displayOrder: csvTransformers.toNumber,
              isActive: csvTransformers.toBoolean,
            },
            validateRow: (data, rowIndex) => {
              if (!data.entityName || !data.entityCode) {
                return "Entity Name and Code are required";
              }
              return null;
            },
          },
          onProgress
        );

        const importErrors = [...result.errors];
        let successCount = 0;

        for (let i = 0; i < result.data.length; i++) {
          try {
            await crudHook.create({
              ...result.data[i],
              organizationId,
              branchId,
            } as any);
            successCount++;
          } catch (error: any) {
            importErrors.push({
              row: i + 2,
              message: error.message || "Failed to create entity",
            });
          }
        }

        return { success: successCount, errors: importErrors };
      } catch (error: any) {
        return {
          success: 0,
          errors: [
            { row: 0, message: error.message || "Failed to import entities" },
          ],
        };
      }
    },
    [crudHook, organizationId, branchId]
  );

  // CSV Export
  const exportEntities = useCallback(() => {
    const columns = ENTITY_COLUMNS.filter((col) => col.key !== "actions").map(
      (col) => ({
        key: col.key as keyof Entity,
        header: col.label,
      })
    );

    exportToCSV(crudHook.items, columns, "entities.csv");
  }, [crudHook.items]);

  // Bulk delete with error handling
  const bulkDeleteEntities = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return true;

      try {
        const itemsToDelete = ids
          .map((id) => {
            const item = crudHook.items.find((e) => e.id === id);
            return item ? { id, data: item as unknown as EntityDto } : null;
          })
          .filter(
            (item): item is { id: string; data: EntityDto } => item !== null
          );

        await crudHook.bulkDelete(itemsToDelete);
        return true;
      } catch (error) {
        console.error("Bulk delete failed:", error);
        return false;
      }
    },
    [crudHook]
  );

  // Toggle status helper
  const toggleEntityStatus = useCallback(
    async (id: string, isActive: boolean) => {
      const entity = crudHook.items.find((e) => e.id === id);
      if (!entity) return false;

      try {
        await crudHook.toggleStatus(
          id,
          isActive,
          entity as unknown as EntityDto
        );
        return true;
      } catch (error) {
        return false;
      }
    },
    [crudHook]
  );

  // Computed values
  const activeEntitiesCount = useMemo(
    () => crudHook.items.filter((e) => e.isActive).length,
    [crudHook.items]
  );

  const inactiveEntitiesCount = useMemo(
    () => crudHook.items.filter((e) => !e.isActive).length,
    [crudHook.items]
  );

  return {
    // Base CRUD
    ...crudHook,

    // Renamed for clarity
    entities: crudHook.items,
    loading: crudHook.isLoading,
    fetchEntities: crudHook.refetch,
    createEntity: crudHook.create,
    updateEntity: crudHook.update,
    deleteEntity: (id: string) => {
      const item = crudHook.items.find((e) => e.id === id);
      return item
        ? crudHook.remove(id, item as unknown as EntityDto)
        : Promise.reject("Item not found");
    },

    // Extended operations
    importEntities,
    exportEntities,
    bulkDeleteEntities,
    toggleEntityStatus,

    // Computed values
    activeEntitiesCount,
    inactiveEntitiesCount,

    // Utilities
    refresh: crudHook.refetch,
  };
}

export type UseEntitiesReturn = ReturnType<typeof useEntities>;
```

### Step 6: Create Form Component (`components/FeatureName/EntityForm.tsx`)

```typescript
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  entitySchema,
  EntityFormData,
} from "@/features/student/Validations/entitySchema";
import { Entity } from "@/features/student/types/FeatureName/entityTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface EntityFormProps {
  entity?: Entity | null;
  onSubmit: (data: EntityFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EntityForm({
  entity,
  onSubmit,
  onCancel,
  isLoading = false,
}: EntityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      entityName: entity?.entityName || "",
      entityCode: entity?.entityCode || "",
      displayOrder: entity?.displayOrder || 1,
      description: entity?.description || "",
      isActive: entity?.isActive ?? true,
    },
  });

  // Update form when entity changes
  useEffect(() => {
    if (entity) {
      reset({
        entityName: entity.entityName,
        entityCode: entity.entityCode,
        displayOrder: entity.displayOrder,
        description: entity.description,
        isActive: entity.isActive,
      });
    }
  }, [entity, reset]);

  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Entity Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Entity Name <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("entityName")}
          placeholder="Enter entity name"
          disabled={isLoading}
        />
        {errors.entityName && (
          <p className="text-sm text-red-500 mt-1">
            {errors.entityName.message}
          </p>
        )}
      </div>

      {/* Entity Code */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Entity Code <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("entityCode")}
          placeholder="Enter entity code"
          disabled={isLoading}
        />
        {errors.entityCode && (
          <p className="text-sm text-red-500 mt-1">
            {errors.entityCode.message}
          </p>
        )}
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-medium mb-1">Display Order</label>
        <Input
          type="number"
          {...register("displayOrder", { valueAsNumber: true })}
          placeholder="Enter display order"
          disabled={isLoading}
        />
        {errors.displayOrder && (
          <p className="text-sm text-red-500 mt-1">
            {errors.displayOrder.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          {...register("description")}
          placeholder="Enter description (optional)"
          rows={3}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => setValue("isActive", checked)}
          disabled={isLoading}
        />
        <label className="text-sm font-medium">
          {isActive ? "Active" : "Inactive"}
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : entity ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
```

### Step 7: Create List Component (`components/FeatureName/EntityList.tsx`)

```typescript
"use client";

import React, { useState, useMemo } from "react";
import { Entity } from "@/features/student/types/FeatureName/entityTypes";
import { ENTITY_COLUMNS } from "@/features/student/Constants/entity.constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface EntityListProps {
  entities: Entity[];
  isLoading?: boolean;
  onEdit?: (entity: Entity) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export function EntityList({
  entities,
  isLoading = false,
  onEdit,
  onDelete,
  onBulkDelete,
  onSort,
}: EntityListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(entities.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual selection
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Handle sort
  const handleSort = (column: string) => {
    const newSortOrder =
      sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
    onSort?.(column, newSortOrder);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && onBulkDelete) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  // Sorted entities
  const sortedEntities = useMemo(() => {
    return [...entities].sort((a, b) => {
      const aValue = a[sortBy as keyof Entity];
      const bValue = b[sortBy as keyof Entity];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [entities, sortBy, sortOrder]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded">
          <span className="text-sm font-medium">
            {selectedIds.length} item(s) selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedIds.length === entities.length && entities.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            {ENTITY_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                className={
                  column.sortable ? "cursor-pointer hover:bg-gray-50" : ""
                }
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && sortBy === column.key && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntities.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={ENTITY_COLUMNS.length + 1}
                className="text-center py-8"
              >
                No entities found
              </TableCell>
            </TableRow>
          ) : (
            sortedEntities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(entity.id)}
                    onCheckedChange={(checked) =>
                      handleSelect(entity.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{entity.entityCode}</TableCell>
                <TableCell>{entity.entityName}</TableCell>
                <TableCell>{entity.displayOrder}</TableCell>
                <TableCell>
                  <Badge variant={entity.isActive ? "default" : "secondary"}>
                    {entity.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(entity)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete?.(entity.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Step 8: Create Page (`pages/FeatureName/entity.tsx`)

```typescript
"use client";

import React, { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useEntities } from "@/features/student/hooks/FeatureName/useEntities";
import { EntityForm } from "@/features/student/components/FeatureName/EntityForm";
import { EntityList } from "@/features/student/components/FeatureName/EntityList";
import { Entity } from "@/features/student/types/FeatureName/entityTypes";
import { EntityFormData } from "@/features/student/Validations/entitySchema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Upload, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EntityPage() {
  const { organizationId, branchId, isReady } = useOrganization();
  const {
    entities,
    loading,
    createEntity,
    updateEntity,
    deleteEntity,
    bulkDeleteEntities,
    importEntities,
    exportEntities,
    activeEntitiesCount,
    inactiveEntitiesCount,
  } = useEntities({ pageSize: 10 });

  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle create/update
  const handleSubmit = async (data: EntityFormData) => {
    setIsSubmitting(true);
    try {
      if (editingEntity) {
        await updateEntity(editingEntity.id, {
          ...data,
          organizationId,
          branchId,
        });
        toast({ title: "Success", description: "Entity updated successfully" });
      } else {
        await createEntity({
          ...data,
          organizationId,
          branchId,
        } as any);
        toast({ title: "Success", description: "Entity created successfully" });
      }
      setShowForm(false);
      setEditingEntity(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save entity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this entity?")) {
      try {
        await deleteEntity(id);
        toast({ title: "Success", description: "Entity deleted successfully" });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete entity",
          variant: "destructive",
        });
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${ids.length} entities?`)) {
      try {
        await bulkDeleteEntities(ids);
        toast({
          title: "Success",
          description: "Entities deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete entities",
          variant: "destructive",
        });
      }
    }
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importEntities(file);
      if (result) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${result.success} entities. ${result.errors.length} errors.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import entities",
        variant: "destructive",
      });
    }
    event.target.value = "";
  };

  if (!isReady) {
    return <div className="p-6">Loading organization context...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Entity Management</h1>
        <div className="flex items-center justify-between">
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>Active: {activeEntitiesCount}</span>
            <span>Inactive: {inactiveEntitiesCount}</span>
            <span>Total: {entities.length}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingEntity(null);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entity
            </Button>
            <label htmlFor="import-file">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </span>
              </Button>
            </label>
            <input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="outline" onClick={exportEntities}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <EntityList
        entities={entities}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
      />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? "Edit Entity" : "Create Entity"}
            </DialogTitle>
          </DialogHeader>
          <EntityForm
            entity={editingEntity}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingEntity(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### Step 9: Export Hook (`hooks/FeatureName/index.ts`)

```typescript
export { useEntities } from "./useEntities";
export type { UseEntitiesReturn, UseEntitiesOptions } from "./useEntities";
```

## Quick Reference

### Common Utilities Available

- `csvImportHelper.ts` - CSV import/export
- `useGenericCRUD.ts` - Generic CRUD operations
- `useCancellableRequest.ts` - Request cancellation
- `commonHelpers.ts` - Common utility functions
- `useGlobalErrorHandler` - Error handling
- `useOrganization` - Organization context

---

**Remember**: Follow these patterns for consistency, maintainability, and best practices across the student feature module.
