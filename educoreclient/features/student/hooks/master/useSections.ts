"use client";

import { useState, useEffect, useCallback } from "react";
import { Section, SectionDto } from "@/types/api-types";
import { SectionService } from "@/features/student/services/master";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";
import { API_CONFIG } from "@/lib/config";

export interface UseSectionsOptions {
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseSectionsReturn {
  sections: Section[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageIndex: number;
  pageSize: number;

  // Pagination computed values
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startItem: number;
  endItem: number;
  pageSizeOptions: number[];

  // Actions
  fetchSections: () => Promise<void>;
  createSection: (
    sectionData: Omit<
      SectionDto,
      "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
    >
  ) => Promise<Section | null>;
  updateSection: (
    id: string,
    sectionData: Partial<SectionDto>
  ) => Promise<Section | null>;
  deleteSection: (id: string) => Promise<boolean>;
  bulkDeleteSections: (ids: string[]) => Promise<boolean>;
  toggleSectionStatus: (id: string, isActive: boolean) => Promise<boolean>;
  importSections: (
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<{ success: number; errors: any[] } | null>;

  // Pagination
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;

  // Refresh
  refresh: () => Promise<void>;
}

export function useSections(
  options: UseSectionsOptions = {}
): UseSectionsReturn {
  const { organizationId, branchId, isReady } = useOrganization();
  const { handleApiError } = useGlobalErrorHandler();

  const {
    pageSize = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    autoFetch = true,
  } = options;

  // Helper function to inject org data
  const withOrgData = useCallback(
    <T extends Record<string, any>>(data: T) => ({
      ...data,
      organizationId,
      branchId,
    }),
    [organizationId, branchId]
  );

  // State
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(
    API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX
  );
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize);

  // Fetch sections
  const fetchSections = useCallback(async () => {
    if (!isReady || !organizationId || !branchId) {
      setError("Organization context not ready");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SectionService.getSections({
        pageIndex,
        pageSize: currentPageSize,
        organizationId,
        branchId,
      });

      setSections(response.sectiondto.data as unknown as Section[]);
      setTotalCount(response.sectiondto.count);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const errorMessage = handleApiError(err, "fetch sections");
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [
    isReady,
    organizationId,
    branchId,
    pageIndex,
    currentPageSize,
    handleApiError,
  ]);

  // Create section
  const createSection = useCallback(
    async (
      sectionData: Omit<
        SectionDto,
        "organizationId" | "branchId" | "id" | "createdAt" | "updatedAt"
      >
    ): Promise<Section | null> => {
      // Wait for organization context to be ready
      if (!isReady) {
        setError("Organization context is loading...");
        return null;
      }

      if (!organizationId || !branchId) {
        setError("Organization and Branch information required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Use withOrgData to ensure organizationId and branchId are included
        const fullSectionData = withOrgData(sectionData) as SectionDto;
        const newSection = await SectionService.createSection(fullSectionData);

        // Refresh the entire list to ensure consistency
        await fetchSections();

        return newSection as unknown as Section;
      } catch (err) {
        const errorMessage = handleApiError(err, "create section");
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isReady, organizationId, branchId, withOrgData, handleApiError]
  );

  // Update section using PUT method with simplified service
  const updateSection = useCallback(
    async (
      id: string,
      sectionData: Partial<SectionDto>
    ): Promise<Section | null> => {
      // Wait for organization context to be ready
      if (!isReady) {
        setError("Organization context is loading...");
        return null;
      }

      if (!organizationId || !branchId) {
        setError("Organization and Branch information required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Find the existing section to get complete data
        const existingSection = sections.find((sec) => sec.id === id);
        if (!existingSection) {
          setError("Section not found in current list");
          return null;
        }

        // Merge existing data with updates and add organization context
        const fullUpdateData = withOrgData({
          ...existingSection,
          ...sectionData,
        });

        // Use the simplified updateSection service method
        const updatedSection = await SectionService.updateSection(
          id,
          fullUpdateData
        );

        // Refresh the entire list to ensure consistency
        await fetchSections();

        return updatedSection as unknown as Section;
      } catch (err) {
        const errorMessage = handleApiError(err, "update section");
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isReady, organizationId, branchId, sections, withOrgData, handleApiError]
  );

  // Delete section (soft delete - set isActive to false)
  const deleteSection = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Use updateSection with isActive: false for soft delete
        const result = await updateSection(id, { isActive: false });

        if (result) {
          // Refresh the entire list to ensure consistency
          await fetchSections();
          return true;
        }

        return false;
      } catch (err) {
        const errorMessage = handleApiError(err, "delete section");
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [updateSection, handleApiError]
  );

  // Toggle section status
  const toggleSectionStatus = useCallback(
    async (id: string, isActive: boolean): Promise<boolean> => {
      const result = await updateSection(id, { isActive });
      return result !== null;
    },
    [updateSection]
  );

  // Bulk delete sections
  const bulkDeleteSections = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (ids.length === 0) return true;

      setLoading(true);
      setError(null);

      try {
        // Process deletions sequentially without calling updateSection hook to avoid loading state conflicts
        for (const id of ids) {
          try {
            // Find the section in our current list to get complete data
            const sectionToDelete = sections.find((sec) => sec.id === id);
            if (!sectionToDelete) {
              console.error(`Section ${id} not found in current list`);
              continue;
            }

            // Merge existing data with isActive: false and ensure organization context
            const fullUpdateData = withOrgData({
              ...sectionToDelete,
              isActive: false, // Soft delete
            });

            // Call service directly to avoid multiple loading states and race conditions
            await SectionService.updateSection(id, fullUpdateData);
          } catch (error) {
            console.error(`Failed to delete section ${id}:`, error);
            // Continue with other deletions even if one fails
          }
        }

        // Refresh the entire list to ensure consistency after all deletions
        await fetchSections();

        return true;
      } catch (err) {
        const errorMessage = handleApiError(err, "bulk delete sections");
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sections, withOrgData, handleApiError]
  );

  // Import sections from file
  const importSections = useCallback(
    async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<{ success: number; errors: any[] } | null> => {
      if (!isReady || !organizationId || !branchId) {
        setError("Organization context not ready");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const { parseCSVFile, csvTransformers } = await import(
          "@/features/student/utils/csvImportHelper"
        );

        const result = await parseCSVFile<SectionDto>(
          file,
          {
            headerMap: {
              "Section Name": "sectionName",
              "Section Code": "sectionShortName",
              "Display Order": "displayOrder",
              "Max Strength": "maxStrength",
              Status: "isActive",
            },
            requiredFields: ["sectionName", "sectionShortName"],
            transformers: {
              displayOrder: csvTransformers.toNumber,
              maxStrength: csvTransformers.toNumber,
              isActive: csvTransformers.toBoolean,
            },
          },
          onProgress
        );

        const importErrors = [...result.errors];
        for (let i = 0; i < result.data.length; i++) {
          try {
            await SectionService.createSection(withOrgData(result.data[i]));
          } catch (error: any) {
            importErrors.push({
              row: i + 2,
              message: error.message || "Failed to create section",
            });
          }
        }

        await fetchSections();
        return {
          success:
            result.data.length - (importErrors.length - result.errors.length),
          errors: importErrors,
        };
      } catch (err) {
        handleApiError(err, "Failed to import sections");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      isReady,
      organizationId,
      branchId,
      withOrgData,
      fetchSections,
      handleApiError,
    ]
  );

  // Pagination helpers
  const setPageSizeHandler = useCallback((size: number) => {
    setCurrentPageSize(size);
    setPageIndex(0); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    const maxPage = Math.ceil(totalCount / currentPageSize) - 1;
    if (pageIndex < maxPage) {
      setPageIndex((prev) => prev + 1);
    }
  }, [pageIndex, totalCount, currentPageSize]);

  const prevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  }, [pageIndex]);

  // Refresh (alias for fetchSections)
  const refresh = useCallback(() => fetchSections(), [fetchSections]);

  // Computed pagination values
  const totalPages = Math.ceil(totalCount / currentPageSize);
  const hasNextPage = pageIndex < totalPages - 1;
  const hasPrevPage = pageIndex > 0;
  const startItem = totalCount === 0 ? 0 : pageIndex * currentPageSize + 1;
  const endItem = Math.min((pageIndex + 1) * currentPageSize, totalCount);
  const pageSizeOptions = [5, 10, 25, 50, 100];

  // Additional pagination functions
  const goToFirstPage = useCallback(() => setPageIndex(0), [setPageIndex]);
  const goToLastPage = useCallback(
    () => setPageIndex(totalPages - 1),
    [setPageIndex, totalPages]
  );

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && isReady && organizationId && branchId) {
      fetchSections();
    }
  }, [autoFetch, isReady, fetchSections, organizationId, branchId]);

  return {
    sections,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize: currentPageSize,

    // Pagination computed values
    totalPages,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    pageSizeOptions,

    // Actions
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    bulkDeleteSections,
    toggleSectionStatus,
    importSections,

    // Pagination
    setPageIndex,
    setPageSize: setPageSizeHandler,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,

    // Refresh
    refresh,
  };
}
