/**
 * Generic CRUD Hook with React Query
 * Reusable hook for standard CRUD operations with pagination, caching, and optimistic updates
 */

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { useOrgData } from "@/contexts/OrganizationContext";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";
import { useCallback } from "react";

// Generic types
export interface BaseEntity {
  id: string;
  organizationId: string;
  branchId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface GenericCRUDService<TEntity extends BaseEntity, TDto> {
  getAll: (params: {
    pageIndex: number;
    pageSize: number;
    organizationId: string;
    branchId: string;
  }) => Promise<{ [key: string]: PaginatedResponse<TEntity> }>;

  getById: (id: string) => Promise<TEntity>;

  create: (data: TDto) => Promise<TEntity>;

  update: (id: string, data: Partial<TDto>) => Promise<TEntity>;

  delete: (id: string, completeData: TDto) => Promise<void>;
}

export interface UseGenericCRUDOptions {
  pageIndex?: number;
  pageSize?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export interface UseGenericCRUDReturn<TEntity extends BaseEntity, TDto> {
  // Data
  items: TEntity[];
  totalCount: number;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;

  // Mutations
  create: (
    data: Omit<
      TDto,
      "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
    >
  ) => Promise<TEntity>;
  update: (id: string, data: Partial<TDto>) => Promise<TEntity>;
  remove: (id: string, completeData: TDto) => Promise<void>;
  toggleStatus: (
    id: string,
    isActive: boolean,
    completeData: TDto
  ) => Promise<TEntity>;
  bulkDelete: (items: Array<{ id: string; data: TDto }>) => Promise<void>;

  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Utilities
  refetch: () => void;
  invalidate: () => void;
}

/**
 * Generic CRUD Hook Factory
 */
export function createGenericCRUDHook<TEntity extends BaseEntity, TDto>(
  service: GenericCRUDService<TEntity, TDto>,
  queryKeyPrefix: string,
  responseKey: string // Key in response object (e.g., 'classdto', 'sectiondto')
) {
  // Query keys factory
  const createQueryKeys = {
    all: [queryKeyPrefix] as const,
    lists: () => [...createQueryKeys.all, "list"] as const,
    list: (
      orgId: string,
      branchId: string,
      pageIndex: number,
      pageSize: number
    ) =>
      [
        ...createQueryKeys.lists(),
        { orgId, branchId, pageIndex, pageSize },
      ] as const,
    details: () => [...createQueryKeys.all, "detail"] as const,
    detail: (id: string) => [...createQueryKeys.details(), id] as const,
  };

  return function useGenericCRUD(
    options: UseGenericCRUDOptions = {}
  ): UseGenericCRUDReturn<TEntity, TDto> {
    const { organizationId, branchId, isDataReady } = useOrgData();
    const { handleApiError } = useGlobalErrorHandler();
    const queryClient = useQueryClient();

    const {
      pageIndex = 0,
      pageSize = 10,
      enabled = true,
      staleTime = 5 * 60 * 1000, // 5 minutes
      gcTime = 10 * 60 * 1000, // 10 minutes
    } = options;

    // Helper to inject org data
    const withOrgData = useCallback(
      <T extends Record<string, any>>(data: T) => ({
        ...data,
        organizationId,
        branchId,
      }),
      [organizationId, branchId]
    );

    // Fetch items with React Query
    const query = useQuery<PaginatedResponse<TEntity>, Error>({
      queryKey: createQueryKeys.list(
        organizationId,
        branchId,
        pageIndex,
        pageSize
      ),
      queryFn: async () => {
        const response = await service.getAll({
          pageIndex,
          pageSize,
          organizationId,
          branchId,
        });
        return response[responseKey] as PaginatedResponse<TEntity>;
      },
      enabled: enabled && isDataReady,
      staleTime,
      gcTime,
    });

    // Create mutation with optimistic updates
    const createMutation = useMutation<
      TEntity,
      Error,
      Omit<
        TDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >,
      { previousData: unknown }
    >({
      mutationFn: async (data) => {
        const fullData = withOrgData(data) as TDto;
        return service.create(fullData);
      },
      onMutate: async (newItem) => {
        await queryClient.cancelQueries({
          queryKey: createQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
        });

        const previousData = queryClient.getQueryData(
          createQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
        );

        // Optimistically update cache
        queryClient.setQueryData(
          createQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          (old: PaginatedResponse<TEntity> | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: [
                {
                  ...newItem,
                  id: `temp-${Date.now()}`,
                  organizationId,
                  branchId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as unknown as TEntity,
                ...old.data,
              ],
              count: old.count + 1,
            };
          }
        );

        return { previousData };
      },
      onError: (error, newItem, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            createQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
            context.previousData
          );
        }
        handleApiError(error, `create ${queryKeyPrefix}`);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: createQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
        });
      },
    });

    // Update mutation
    const updateMutation = useMutation<
      TEntity,
      Error,
      { id: string; data: Partial<TDto> },
      { previousData: unknown }
    >({
      mutationFn: async ({ id, data }) => {
        const fullData = {
          ...data,
          id,
          organizationId,
          branchId,
        };
        return service.update(id, fullData);
      },
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({
          queryKey: createQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
        });

        const previousData = queryClient.getQueryData(
          createQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
        );

        // Optimistically update
        queryClient.setQueryData(
          createQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          (old: PaginatedResponse<TEntity> | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((item) =>
                item.id === id
                  ? { ...item, ...data, updatedAt: new Date().toISOString() }
                  : item
              ),
            };
          }
        );

        return { previousData };
      },
      onError: (error, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            createQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
            context.previousData
          );
        }
        handleApiError(error, `update ${queryKeyPrefix}`);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: createQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
        });
      },
    });

    // Delete mutation
    const deleteMutation = useMutation<
      void,
      Error,
      { id: string; completeData: TDto },
      { previousData: unknown }
    >({
      mutationFn: ({ id, completeData }) => service.delete(id, completeData),
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries({
          queryKey: createQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
        });

        const previousData = queryClient.getQueryData(
          createQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
        );

        // Optimistically remove
        queryClient.setQueryData(
          createQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          (old: PaginatedResponse<TEntity> | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((item) => item.id !== id),
              count: old.count - 1,
            };
          }
        );

        return { previousData };
      },
      onError: (error, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            createQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
            context.previousData
          );
        }
        handleApiError(error, `delete ${queryKeyPrefix}`);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: createQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
        });
      },
    });

    // Toggle status helper
    const toggleStatus = useCallback(
      async (id: string, isActive: boolean, completeData: TDto) => {
        return updateMutation.mutateAsync({
          id,
          data: { ...completeData, isActive } as Partial<TDto>,
        });
      },
      [updateMutation]
    );

    // Bulk delete helper
    const bulkDelete = useCallback(
      async (items: Array<{ id: string; data: TDto }>) => {
        for (const item of items) {
          await deleteMutation.mutateAsync({
            id: item.id,
            completeData: item.data,
          });
        }
      },
      [deleteMutation]
    );

    return {
      // Data
      items: query.data?.data ?? [],
      totalCount: query.data?.count ?? 0,

      // Loading states
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error,

      // Mutations
      create: createMutation.mutateAsync,
      update: (id: string, data: Partial<TDto>) =>
        updateMutation.mutateAsync({ id, data }),
      remove: (id: string, completeData: TDto) =>
        deleteMutation.mutateAsync({ id, completeData }),
      toggleStatus,
      bulkDelete,

      // Mutation states
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,

      // Utilities
      refetch: query.refetch,
      invalidate: () =>
        queryClient.invalidateQueries({ queryKey: createQueryKeys.lists() }),
    };
  };
}
