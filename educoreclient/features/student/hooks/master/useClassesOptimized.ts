/**
 * Optimized Classes Hook using Generic CRUD
 * Reduced from 500+ lines to ~100 lines with better type safety and features
 */

"use client";

import { useCallback, useMemo } from "react";
import { ClassService } from "@/features/student/services/master";
import { Class, ClassDto } from "@/features/student/types/master/classTypes";
import {
  createGenericCRUDHook,
  GenericCRUDService,
} from "../shared/useGenericCRUD";
import {
  parseCSVFile,
  csvTransformers,
  CSVImportOptions,
} from "@/features/student/utils/csvImportHelper";
import { useOrgData } from "@/contexts/OrganizationContext";

// Adapter to make ClassService compatible with GenericCRUDService
const classServiceAdapter: GenericCRUDService<Class, ClassDto> = {
  getAll: async (params) => {
    const response = await ClassService.getClasses(params);
    return { classdto: response.classdto };
  },
  getById: (id) => ClassService.getClassById(id),
  create: (data) => ClassService.createClass(data),
  update: (id, data) => ClassService.updateClass(id, data),
  delete: (id, completeData) => ClassService.deleteClass(id, completeData),
};

// Create the base hook using generic CRUD
const useClassesCRUD = createGenericCRUDHook<Class, ClassDto>(
  classServiceAdapter,
  "classes",
  "classdto"
);

// CSV import configuration
const classCSVOptions: CSVImportOptions<ClassDto> = {
  headerMap: {
    "Class Name": "className",
    "Class Code": "classShortName",
    "Display Order": "displayOrder",
    "Max Strength": "maxStrength",
    "Reserved Seats": "reservationSeats",
    Status: "isActive",
  },
  requiredFields: ["className", "classShortName"],
  transformers: {
    displayOrder: csvTransformers.toNumber,
    maxStrength: csvTransformers.toNumber,
    reservationSeats: csvTransformers.toNumber,
    isActive: csvTransformers.toBoolean,
  },
  validateRow: (data, rowIndex) => {
    if (!data.className || !data.classShortName) {
      return "Class Name and Class Code are required";
    }
    return null;
  },
};

export interface UseClassesOptimizedOptions {
  pageIndex?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useClassesOptimized(options: UseClassesOptimizedOptions = {}) {
  const { organizationId, branchId } = useOrgData();
  const crudHook = useClassesCRUD(options);

  // Import classes from CSV with progress tracking
  const importClasses = useCallback(
    async (file: File, onProgress?: (progress: number) => void) => {
      try {
        // Parse CSV file
        const parseResult = await parseCSVFile<ClassDto>(
          file,
          classCSVOptions,
          onProgress
        );

        if (parseResult.data.length === 0) {
          return {
            success: 0,
            errors:
              parseResult.errors.length > 0
                ? parseResult.errors
                : [{ row: 0, message: "No valid data found in CSV file" }],
          };
        }

        // Import parsed data
        const importErrors: Array<{ row: number; message: string }> = [
          ...parseResult.errors,
        ];
        let successCount = 0;

        for (let i = 0; i < parseResult.data.length; i++) {
          try {
            await crudHook.create({
              ...parseResult.data[i],
              organizationId,
              branchId,
            } as any);
            successCount++;
          } catch (error: any) {
            importErrors.push({
              row: i + 2, // +2 because of header row and 0-based index
              message: error.message || "Failed to create class",
            });
          }
        }

        return {
          success: successCount,
          errors: importErrors,
        };
      } catch (error: any) {
        return {
          success: 0,
          errors: [
            { row: 0, message: error.message || "Failed to import classes" },
          ],
        };
      }
    },
    [crudHook, organizationId, branchId]
  );

  // Export classes to CSV
  const exportClasses = useCallback(async () => {
    try {
      return await ClassService.exportClasses("csv");
    } catch (error) {
      console.error("Failed to export classes:", error);
      return null;
    }
  }, []);

  // Bulk operations with better error handling
  const bulkDeleteClasses = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return true;

      try {
        const itemsToDelete = ids
          .map((id) => {
            const item = crudHook.items.find((c) => c.id === id);
            return item ? { id, data: item as unknown as ClassDto } : null;
          })
          .filter(
            (item): item is { id: string; data: ClassDto } => item !== null
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
  const toggleClassStatus = useCallback(
    async (id: string, isActive: boolean) => {
      const classItem = crudHook.items.find((c) => c.id === id);
      if (!classItem) return false;

      try {
        await crudHook.toggleStatus(
          id,
          isActive,
          classItem as unknown as ClassDto
        );
        return true;
      } catch (error) {
        return false;
      }
    },
    [crudHook]
  );

  // Computed values with memoization
  const activeClassesCount = useMemo(
    () => crudHook.items.filter((c) => c.isActive).length,
    [crudHook.items]
  );

  const inactiveClassesCount = useMemo(
    () => crudHook.items.filter((c) => !c.isActive).length,
    [crudHook.items]
  );

  return {
    // Base CRUD operations
    ...crudHook,

    // Renamed for compatibility
    classes: crudHook.items,
    loading: crudHook.isLoading,
    fetchClasses: crudHook.refetch,
    createClass: crudHook.create,
    updateClass: crudHook.update,
    deleteClass: (id: string) => {
      const item = crudHook.items.find((c) => c.id === id);
      return item
        ? crudHook.remove(id, item as unknown as ClassDto)
        : Promise.reject("Item not found");
    },

    // Extended operations
    importClasses,
    exportClasses,
    bulkDeleteClasses,
    toggleClassStatus,

    // Computed values
    activeClassesCount,
    inactiveClassesCount,

    // Utilities
    refresh: crudHook.refetch,
  };
}

export type UseClassesOptimizedReturn = ReturnType<typeof useClassesOptimized>;
