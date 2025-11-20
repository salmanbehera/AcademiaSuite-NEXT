"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SectionService } from "@/features/student/services/master";
import { Section, SectionDto, GetSectionsResponse } from "@/types/api-types";
import { useOrgData } from "@/contexts/OrganizationContext";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";

// Query keys for cache management
export const sectionQueryKeys = {
  all: ["sections"] as const,
  lists: () => [...sectionQueryKeys.all, "list"] as const,
  list: (
    orgId: string,
    branchId: string,
    pageIndex: number,
    pageSize: number
  ) =>
    [
      ...sectionQueryKeys.lists(),
      { orgId, branchId, pageIndex, pageSize },
    ] as const,
  details: () => [...sectionQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...sectionQueryKeys.details(), id] as const,
};

interface UseSectionsQueryOptions {
  pageIndex?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useSectionsQuery(options: UseSectionsQueryOptions = {}) {
  const { organizationId, branchId, isDataReady } = useOrgData();
  const { handleApiError } = useGlobalErrorHandler();
  const queryClient = useQueryClient();

  const { pageIndex = 0, pageSize = 10, enabled = true } = options;

  // Fetch sections with React Query
  const sectionsQuery = useQuery<GetSectionsResponse, Error>({
    queryKey: sectionQueryKeys.list(
      organizationId,
      branchId,
      pageIndex,
      pageSize
    ),
    queryFn: () =>
      SectionService.getSections({
        pageIndex,
        pageSize,
        organizationId,
        branchId,
      }) as unknown as Promise<GetSectionsResponse>,
    enabled: enabled && isDataReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Create section mutation with optimistic updates
  const createSectionMutation = useMutation<
    any,
    Error,
    Omit<
      SectionDto,
      "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
    >,
    { previousSections: unknown }
  >({
    mutationFn: (
      sectionData: Omit<
        SectionDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >
    ) => {
      const fullSectionData = {
        ...sectionData,
        organizationId,
        branchId,
      } as SectionDto;
      return SectionService.createSection(fullSectionData);
    },
    onMutate: async (
      newSection: Omit<
        SectionDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >
    ) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: sectionQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });

      // Snapshot previous value
      const previousSections = queryClient.getQueryData(
        sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
      );

      // Optimistically update cache
      queryClient.setQueryData(
        sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
        (old: GetSectionsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            sectiondto: {
              ...old.sectiondto,
              data: [
                {
                  ...newSection,
                  id: `temp-${Date.now()}`, // Temporary ID
                  organizationId,
                  branchId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as Section,
                ...old.sectiondto.data,
              ],
              count: old.sectiondto.count + 1,
            },
          };
        }
      );

      return { previousSections };
    },
    onError: (
      error: Error,
      newSection: Omit<
        SectionDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >,
      context: { previousSections: unknown } | undefined
    ) => {
      // Rollback on error
      if (context?.previousSections) {
        queryClient.setQueryData(
          sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          context.previousSections
        );
      }
      handleApiError(error, "create section");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: sectionQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation<
    any,
    Error,
    { id: string; sectionData: Partial<SectionDto> },
    { previousSections: unknown }
  >({
    mutationFn: ({
      id,
      sectionData,
    }: {
      id: string;
      sectionData: Partial<SectionDto>;
    }) => {
      const fullUpdateData = {
        ...sectionData,
        id,
        organizationId,
        branchId,
      };
      return SectionService.updateSection(id, fullUpdateData);
    },
    onMutate: async ({
      id,
      sectionData,
    }: {
      id: string;
      sectionData: Partial<SectionDto>;
    }) => {
      await queryClient.cancelQueries({
        queryKey: sectionQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });

      const previousSections = queryClient.getQueryData(
        sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
      );

      // Optimistically update
      queryClient.setQueryData(
        sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
        (old: GetSectionsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            sectiondto: {
              ...old.sectiondto,
              data: old.sectiondto.data.map((section: Section) =>
                section.id === id
                  ? {
                      ...section,
                      ...sectionData,
                      updatedAt: new Date().toISOString(),
                    }
                  : section
              ),
            },
          };
        }
      );

      return { previousSections };
    },
    onError: (
      error: Error,
      variables: { id: string; sectionData: Partial<SectionDto> },
      context: { previousSections: unknown } | undefined
    ) => {
      if (context?.previousSections) {
        queryClient.setQueryData(
          sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          context.previousSections
        );
      }
      handleApiError(error, "update section");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: sectionQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation<
    void,
    Error,
    string,
    { previousSections: unknown }
  >({
    mutationFn: (id: string) => {
      const cached = queryClient.getQueryData(
        sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
      ) as GetSectionsResponse | undefined;
      const section = cached?.sectiondto?.data.find(
        (s: Section) => s.id === id
      ) as SectionDto | any;
      // Pass complete data expected by the service (cast to any to avoid cross-module typing issues)
      return SectionService.deleteSection(id, section ?? ({} as any));
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: sectionQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      });

      const previousSections = queryClient.getQueryData(
        sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize)
      );

      // Optimistically remove
      queryClient.setQueryData(
        sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
        (old: GetSectionsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            sectiondto: {
              ...old.sectiondto,
              data: old.sectiondto.data.filter(
                (section: Section) => section.id !== id
              ),
              count: old.sectiondto.count - 1,
            },
          };
        }
      );

      return { previousSections };
    },
    onError: (
      error: Error,
      id: string,
      context: { previousSections: unknown } | undefined
    ) => {
      if (context?.previousSections) {
        queryClient.setQueryData(
          sectionQueryKeys.list(organizationId, branchId, pageIndex, pageSize),
          context.previousSections
        );
      }
      handleApiError(error, "delete section");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: sectionQueryKeys.list(
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
    sections: sectionsQuery.data?.sectiondto?.data ?? [],
    totalCount: sectionsQuery.data?.sectiondto?.count ?? 0,
    // Loading states
    isLoading: sectionsQuery.isLoading,
    isFetching: sectionsQuery.isFetching,
    isError: sectionsQuery.isError,
    error: sectionsQuery.error,
    // Mutations
    createSection: createSectionMutation.mutateAsync,
    updateSection: (id: string, sectionData: Partial<SectionDto>) =>
      updateSectionMutation.mutateAsync({ id, sectionData }),
    deleteSection: deleteSectionMutation.mutateAsync,
    // Mutation states
    isCreating: createSectionMutation.isPending,
    isUpdating: updateSectionMutation.isPending,
    isDeleting: deleteSectionMutation.isPending,
    // Utilities
    refetch: sectionsQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({
        queryKey: sectionQueryKeys.list(
          organizationId,
          branchId,
          pageIndex,
          pageSize
        ),
      }),
  };
}
