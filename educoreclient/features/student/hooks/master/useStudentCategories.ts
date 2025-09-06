'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentCategory, StudentCategoryDto } from '@/types/api-types';
import { StudentCategoryService } from '@/features/student/services/master';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { API_CONFIG } from '@/lib/config';

export interface UseStudentCategoriesOptions {
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseStudentCategoriesReturn {
  studentCategories: StudentCategory[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  // Actions
  fetchStudentCategories: () => Promise<void>;
  createStudentCategory: (categoryData: Omit<StudentCategoryDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<StudentCategory | null>;
  updateStudentCategory: (id: string, categoryData: Partial<StudentCategoryDto>) => Promise<StudentCategory | null>;
  deleteStudentCategory: (id: string) => Promise<boolean>;
  toggleStudentCategoryStatus: (id: string, isActive: boolean) => Promise<boolean>;
  // Pagination
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  // Refresh
  refresh: () => Promise<void>;
}

export function useStudentCategories(options: UseStudentCategoriesOptions = {}): UseStudentCategoriesReturn {
  const { organizationId, branchId, isReady } = useOrganization();
  const { handleApiError } = useGlobalErrorHandler();
  
  const {
    pageSize = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    autoFetch = true
  } = options;

  // Helper function to inject org data
  const withOrgData = useCallback(<T extends Record<string, any>>(data: T) => ({
    ...data,
    organizationId,
    branchId,
  }), [organizationId, branchId]);

  // State
  const [studentCategories, setStudentCategories] = useState<StudentCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX);
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize);

  // Fetch student categories
  const fetchStudentCategories = useCallback(async () => {
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
      const response = await StudentCategoryService.getStudentCategories({
        pageIndex,
        pageSize: currentPageSize,
        organizationId,
        branchId,
      });
      
      setStudentCategories(response.studentcategorydto.data);
      setTotalCount(response.studentcategorydto.count);
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetch student categories');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, pageIndex, currentPageSize, handleApiError]);

  // Create student category
  const createStudentCategory = useCallback(async (
    categoryData: Omit<StudentCategoryDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StudentCategory | null> => {
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
      // Use withOrgData to ensure organizationId and branchId are included
      const fullCategoryData = withOrgData(categoryData) as StudentCategoryDto;
      const newCategory = await StudentCategoryService.createStudentCategory(fullCategoryData);
      
      // Refresh the list to get latest data
      await fetchStudentCategories();
      
      return newCategory;
    } catch (err) {
      const errorMessage = handleApiError(err, 'create student category');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, withOrgData, fetchStudentCategories, handleApiError]);

  // Update student category using POST method (API doesn't support PUT)
  const updateStudentCategory = useCallback(async (
    id: string,
    categoryData: Partial<StudentCategoryDto>
  ): Promise<StudentCategory | null> => {
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
      // Use withOrgData to ensure organizationId, branchId, and id are included
      const fullUpdateData = withOrgData({
        ...categoryData,
        id, // Include the ID for the API to identify which record to update
      });
      
      // Use POST method for updates (your API doesn't support PUT)
      const updatedCategory = await StudentCategoryService.updateStudentCategory(id, fullUpdateData);
      
      // Refresh the list to get latest data
      await fetchStudentCategories();
      
      return updatedCategory;
    } catch (err) {
      const errorMessage = handleApiError(err, 'update student category');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isReady, organizationId, branchId, withOrgData, fetchStudentCategories, handleApiError]);

  // Delete student category
  const deleteStudentCategory = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await StudentCategoryService.deleteStudentCategory(id);
      // Remove from local state
      setStudentCategories(prev => prev.filter(category => category.id !== id));
      setTotalCount(prev => prev - 1);
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, 'delete student category');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  // Toggle student category status
  const toggleStudentCategoryStatus = useCallback(async (
    id: string,
    isActive: boolean
  ): Promise<boolean> => {
    const result = await updateStudentCategory(id, { isActive });
    return result !== null;
  }, [updateStudentCategory]);

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

  // Refresh (alias for fetchStudentCategories)
  const refresh = useCallback(() => fetchStudentCategories(), [fetchStudentCategories]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && isReady && organizationId && branchId) {
      fetchStudentCategories();
    }
  }, [autoFetch, isReady, fetchStudentCategories, organizationId, branchId]);

  return {
    studentCategories,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize: currentPageSize,
    // Actions
    fetchStudentCategories,
    createStudentCategory,
    updateStudentCategory,
    deleteStudentCategory,
    toggleStudentCategoryStatus,
    // Pagination
    setPageIndex,
    setPageSize: setPageSizeHandler,
    nextPage,
    prevPage,
    // Refresh
    refresh,
  };
}
