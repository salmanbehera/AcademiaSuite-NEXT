"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentCategoryService } from "@/features/student/services/master";
import {
  StudentCategory,
  StudentCategoryDto,
  GetStudentCategoriesResponse,
} from "@/types/api-types";
import { useOrgData } from "@/contexts/OrganizationContext";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";

// Query keys for cache management
export const studentCategoryQueryKeys = {
  all: ["studentCategories"] as const,
  lists: () => [...studentCategoryQueryKeys.all, "list"] as const,
  list: (
    orgId: string,
    branchId: string,
    pageIndex: number,
    pageSize: number
  ) =>
    [
      ...studentCategoryQueryKeys.lists(),
      { orgId, branchId, pageIndex, pageSize },
    ] as const,
  details: () => [...studentCategoryQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...studentCategoryQueryKeys.details(), id] as const,
};

interface UseStudentCategoriesQueryOptions {
  pageIndex?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useStudentCategoriesQuery(
  options: UseStudentCategoriesQueryOptions = {}
) {
  const { organizationId, branchId, isDataReady } = useOrgData();
  const { handleApiError } = useGlobalErrorHandler();
  const queryClient = useQueryClient();

  const { pageIndex = 0, pageSize = 10, enabled = true } = options;

  // Fetch student categories with React Query
  const categoriesQuery = useQuery<GetStudentCategoriesResponse, Error>({
    queryKey: studentCategoryQueryKeys.list(
      organizationId,
      branchId,
      pageIndex,
      pageSize
    ),
    queryFn: () =>
      StudentCategoryService.getStudentCategories({
        pageIndex,
        pageSize,
        organizationId,
        branchId,
      }),
    enabled: enabled && isDataReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Create student category mutation with optimistic updates
  const createCategoryMutation = useMutation<
    StudentCategory,
    Error,
    Omit<
      StudentCategoryDto,
      "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
    >,
    { previousCategories: unknown }
  >({
    mutationFn: (
      categoryData: Omit<
        StudentCategoryDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >
    ) => {
      const fullCategoryData = {
        ...categoryData,
        organizationId,
        branchId,
      } as StudentCategoryDto;
      return StudentCategoryService.createStudentCategory(fullCategoryData);
    },
    onMutate: async (
      newCategory: Omit<
        StudentCategoryDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >
    ) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(
        studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        )
      );

      // Optimistically update cache
      queryClient.setQueryData(
        studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
        (old: GetStudentCategoriesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            studentcategorydto: {
              ...old.studentcategorydto,
              data: [
                {
                  ...newCategory,
                  id: `temp-${Date.now()}`, // Temporary ID
                  organizationId,
                  branchId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as StudentCategory,
                ...old.studentcategorydto.data,
              ],
              count: old.studentcategorydto.count + 1,
            },
          };
        }
      );

      return { previousCategories };
    },
    onError: (
      error: Error,
      newCategory: Omit<
        StudentCategoryDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >,
      context: { previousCategories: unknown } | undefined
    ) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(
          studentCategoryQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
          context.previousCategories
        );
      }
      handleApiError(error, "create student category");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });
    },
  });

  // Update student category mutation
  const updateCategoryMutation = useMutation<
    StudentCategory,
    Error,
    { id: string; categoryData: Partial<StudentCategoryDto> },
    { previousCategories: unknown }
  >({
    mutationFn: ({
      id,
      categoryData,
    }: {
      id: string;
      categoryData: Partial<StudentCategoryDto>;
    }) => {
      const fullUpdateData = {
        ...categoryData,
        id,
        organizationId,
        branchId,
      };
      return StudentCategoryService.updateStudentCategory(id, fullUpdateData);
    },
    onMutate: async ({
      id,
      categoryData,
    }: {
      id: string;
      categoryData: Partial<StudentCategoryDto>;
    }) => {
      await queryClient.cancelQueries({
        queryKey: studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });

      const previousCategories = queryClient.getQueryData(
        studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        )
      );

      // Optimistically update
      queryClient.setQueryData(
        studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
        (old: GetStudentCategoriesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            studentcategorydto: {
              ...old.studentcategorydto,
              data: old.studentcategorydto.data.map(
                (category: StudentCategory) =>
                  category.id === id
                    ? {
                        ...category,
                        ...categoryData,
                        updatedAt: new Date().toISOString(),
                      }
                    : category
              ),
            },
          };
        }
      );

      return { previousCategories };
    },
    onError: (
      error: Error,
      variables: { id: string; categoryData: Partial<StudentCategoryDto> },
      context: { previousCategories: unknown } | undefined
    ) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(
          studentCategoryQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
          context.previousCategories
        );
      }
      handleApiError(error, "update student category");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });
    },
  });

  // Delete student category mutation
  const deleteCategoryMutation = useMutation<
    void,
    Error,
    string,
    { previousCategories: unknown }
  >({
    mutationFn: async (id: string) => {
      await StudentCategoryService.deleteStudentCategory({
        id,
        organizationId,
        branchId,
      } as any);
      return undefined;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });

      const previousCategories = queryClient.getQueryData(
        studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        )
      );

      // Optimistically remove
      queryClient.setQueryData(
        studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
        (old: GetStudentCategoriesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            studentcategorydto: {
              ...old.studentcategorydto,
              data: old.studentcategorydto.data.filter(
                (category: StudentCategory) => category.id !== id
              ),
              count: old.studentcategorydto.count - 1,
            },
          };
        }
      );

      return { previousCategories };
    },
    onError: (
      error: Error,
      id: string,
      context: { previousCategories: unknown } | undefined
    ) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(
          studentCategoryQueryKeys.list(
            organizationId,
            branchId,
            pageIndex,
            pageSize
          ),
          context.previousCategories
        );
      }
      handleApiError(error, "delete student category");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });
    },
  });

  return {
    // Data
    studentCategories: categoriesQuery.data?.studentcategorydto?.data ?? [],
    totalCount: categoriesQuery.data?.studentcategorydto?.count ?? 0,
    // Loading states
    isLoading: categoriesQuery.isLoading,
    isFetching: categoriesQuery.isFetching,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    // Mutations
    createStudentCategory: createCategoryMutation.mutateAsync,
    updateStudentCategory: (
      id: string,
      categoryData: Partial<StudentCategoryDto>
    ) => updateCategoryMutation.mutateAsync({ id, categoryData }),
    deleteStudentCategory: deleteCategoryMutation.mutateAsync,
    // Mutation states
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    // Utilities
    refetch: categoriesQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({
        queryKey: studentCategoryQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      }),
  };
}
