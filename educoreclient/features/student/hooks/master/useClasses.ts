'use client';

import { useState, useEffect, useCallback } from 'react';
import { Class, ClassDto } from '@/features/student/types/master/classTypes';
import { PAGE_SIZE_OPTIONS } from '@/lib/constants/pagination.constants';
import { ClassService } from '@/features/student/services/master';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { API_CONFIG } from '@/lib/config';

export interface UseClassesOptions {
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseClassesReturn {
  classes: Class[];
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
  fetchClasses: () => Promise<void>;
  createClass: (classData: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<Class | null>;
  updateClass: (id: string, classData: Partial<ClassDto>) => Promise<Class | null>;
  deleteClass: (id: string) => Promise<boolean>;
  bulkDeleteClasses: (ids: string[]) => Promise<boolean>;
  toggleClassStatus: (id: string, isActive: boolean) => Promise<boolean>;
  importClasses: (file: File, onProgress?: (progress: number) => void) => Promise<{ success: number; errors: any[] } | null>;
  
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

export function useClasses(options: UseClassesOptions = {}): UseClassesReturn {
  const { organizationId, branchId, isReady } = useOrganization();
  const { handleApiError } = useGlobalErrorHandler();
  const { 
    pageSize = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    autoFetch = true 
  } = options;

  // Page size options for dropdown
  const pageSizeOptions = PAGE_SIZE_OPTIONS;

  // Helper function to inject org data
  const withOrgData = useCallback(<T extends Record<string, any>>(data: T) => ({
    ...data,
    organizationId,
    branchId,
  }), [organizationId, branchId]);

  // State
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX);
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    // Wait for organization context to be ready
    if (!isReady) {
      setError('Organization context is loading...');
      return;
    }

    if (!organizationId || !branchId) {
      setError('Organization and Branch information required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ClassService.getClasses({
        pageIndex,
        pageSize: currentPageSize,
        organizationId,
        branchId,
      });

      setClasses(response.classdto.data);
      setTotalCount(response.classdto.count);
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetch classes');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, pageIndex, currentPageSize, handleApiError]);

  // Create class
  const createClass = useCallback(async (
    classData: Omit<ClassDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Class | null> => {
    // Wait for organization context to be ready
    if (!isReady) {
      setError('Organization context is loading...');
      return null;
    }

    if (!organizationId || !branchId) {
      setError('Organization and Branch information required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Use withOrgData to automatically inject organizationId and branchId
      const fullClassData = withOrgData({
        ...classData,
      }) as ClassDto;

      const newClass = await ClassService.createClass(fullClassData);
      
      // Refresh the entire list to ensure data consistency
      await fetchClasses();
      
      return newClass;
    } catch (err) {
      const errorMessage = handleApiError(err, 'create class');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, withOrgData, handleApiError, fetchClasses]);

  // Update class using PUT method with simplified service
  const updateClass = useCallback(async (
    id: string, 
    classData: Partial<ClassDto>
  ): Promise<Class | null> => {
    // Wait for organization context to be ready
    if (!isReady) {
      setError('Organization context is loading...');
      return null;
    }

    if (!organizationId || !branchId) {
      setError('Organization and Branch information required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the existing class to get complete data
      const existingClass = classes.find(cls => cls.id === id);
      if (!existingClass) {
        setError('Class not found in current list');
        return null;
      }

      // Merge existing data with updates and add organization context
      const fullUpdateData = withOrgData({
        ...existingClass,
        ...classData,
      });

      // Use the simplified updateClass service method
      const updatedClass = await ClassService.updateClass(id, fullUpdateData);
      
      // Ensure the updated class has all required properties and handle potential API response structure issues
      // IMPORTANT: Updated values should take precedence over existing values
      const mergedClass = {
        ...existingClass,        // Start with existing data as base
        ...(updatedClass || {}), // Apply API response updates
        ...classData,           // Apply the original update data to ensure values are preserved
        id: id,                 // Ensure ID is preserved
        organizationId,         // Ensure organization context is preserved
        branchId,              // Ensure branch context is preserved
      };
      
      // Refresh the entire list to ensure data consistency
      await fetchClasses();
      
      return updatedClass;
    } catch (err) {
      const errorMessage = handleApiError(err, 'update class');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, classes, withOrgData, handleApiError, fetchClasses]);

  // Delete class (soft delete - set isActive to false)
  const deleteClass = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Use updateClass with isActive: false for soft delete
      const result = await updateClass(id, { isActive: false });
      
      if (result) {
        // updateClass already calls fetchClasses(), so list is refreshed
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = handleApiError(err, 'delete class');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateClass, handleApiError]);

  // Bulk delete classes
  const bulkDeleteClasses = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return true;
    
    setLoading(true);
    setError(null);

    try {
      // Process deletions sequentially without calling updateClass hook to avoid loading state conflicts
      for (const id of ids) {
        try {
          // Find the class in our current list to get complete data
          const classToDelete = classes.find(cls => cls.id === id);
          if (!classToDelete) {
            console.error(`Class ${id} not found in current list`);
            continue;
          }

          // Merge existing data with isActive: false and ensure organization context
          const fullUpdateData = withOrgData({
            ...classToDelete,
            isActive: false, // Soft delete
          });
          
          // Call service directly to avoid multiple loading states and race conditions
          await ClassService.updateClass(id, fullUpdateData);
        } catch (error) {
          console.error(`Failed to delete class ${id}:`, error);
          // Continue with other deletions even if one fails
        }
      }
      
      // Refresh the entire list to ensure data consistency
      await fetchClasses();
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, 'bulk delete classes');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [classes, withOrgData, handleApiError, fetchClasses]);

  // Toggle class status
  const toggleClassStatus = useCallback(async (
    id: string, 
    isActive: boolean
  ): Promise<boolean> => {
    const result = await updateClass(id, { isActive });
    return result !== null;
  }, [updateClass]);

  // Import classes from file
  const importClasses = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: number; errors: any[] } | null> => {
    // Wait for organization context to be ready
    if (!isReady) {
      setError('Organization context is loading...');
      return null;
    }

    if (!organizationId || !branchId) {
      setError('Organization and Branch information required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Parse CSV file on client side
      const result = await new Promise<{ success: number; errors: any[] }>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string;
            const lines = text.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            // Expected headers mapping
            const headerMap: Record<string, string> = {
              'Class Name': 'className',
              'Class Code': 'classShortName', 
              'Display Order': 'displayOrder',
              'Max Strength': 'maxStrength',
              'Reserved Seats': 'reservationSeats',
              'Status': 'isActive'
            };

            const errors: any[] = [];
            const successes: any[] = [];
            
            // Process each row
            for (let i = 1; i < lines.length; i++) {
              try {
                if (onProgress) {
                  onProgress((i / (lines.length - 1)) * 100);
                }

                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                
                if (values.length !== headers.length) {
                  errors.push({
                    row: i + 1,
                    message: `Row has ${values.length} columns, expected ${headers.length}`
                  });
                  continue;
                }

                // Map CSV data to ClassDto format with organization context
                const classData: any = {
                  organizationId,
                  branchId
                };
                
                headers.forEach((header, index) => {
                  const mappedField = headerMap[header];
                  if (mappedField) {
                    let value: any = values[index];
                    
                    // Convert data types
                    if (mappedField === 'displayOrder' || mappedField === 'maxStrength' || mappedField === 'reservationSeats') {
                      value = parseInt(value) || 0;
                    } else if (mappedField === 'isActive') {
                      value = value && value.toLowerCase() === 'active';
                    }
                    
                    classData[mappedField] = value;
                  }
                });

                // Validate required fields
                if (!classData.className || !classData.classShortName) {
                  errors.push({
                    row: i + 1,
                    message: 'Class Name and Class Code are required'
                  });
                  continue;
                }

                // Create the class using existing createClass method
                try {
                  await ClassService.createClass(classData);
                  successes.push(classData);
                } catch (apiError: any) {
                  errors.push({
                    row: i + 1,
                    message: `Failed to create class: ${apiError.message || apiError}`
                  });
                }
                
              } catch (rowError: any) {
                errors.push({
                  row: i + 1,
                  message: `Error processing row: ${rowError.message || rowError}`
                });
              }
            }

            resolve({
              success: successes.length,
              errors: errors
            });
            
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      // Refresh the classes list after successful import
      await fetchClasses();
      
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to import classes');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, handleApiError, fetchClasses]);

  // Pagination helpers
  const setPageSizeHandler = useCallback((size: number) => {
    setCurrentPageSize(size);
    setPageIndex(0); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    const maxPage = Math.ceil(totalCount / currentPageSize) - 1;
    if (pageIndex < maxPage) {
      setPageIndex(prev => prev + 1);
    }
  }, [pageIndex, totalCount, currentPageSize]);

  const prevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex(prev => prev - 1);
    }
  }, [pageIndex]);

  const goToFirstPage = useCallback(() => {
    setPageIndex(0);
  }, []);

  const goToLastPage = useCallback(() => {
    const maxPage = Math.ceil(totalCount / currentPageSize) - 1;
    if (maxPage >= 0) {
      setPageIndex(maxPage);
    }
  }, [totalCount, currentPageSize]);

  // Computed pagination values
  const totalPages = Math.ceil(totalCount / currentPageSize);
  const hasNextPage = pageIndex < totalPages - 1;
  const hasPrevPage = pageIndex > 0;
  const startItem = totalCount > 0 ? pageIndex * currentPageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * currentPageSize, totalCount);

  // Refresh (alias for fetchClasses)
  const refresh = useCallback(() => fetchClasses(), [fetchClasses]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && isReady && organizationId && branchId) {
      fetchClasses();
    }
  }, [autoFetch, isReady, fetchClasses, organizationId, branchId]);

  return {
    classes,
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
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    bulkDeleteClasses,
    toggleClassStatus,
    importClasses,
    
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
