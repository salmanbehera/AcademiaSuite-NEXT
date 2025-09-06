'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { API_CONFIG } from '@/lib/config';

/**
 * Generic Entity Manager Hook
 * Provides common CRUD operations for master data entities
 */
export interface BaseEntity {
  id: string;
  organizationId: string;
  branchId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityManagerOptions {
  pageSize?: number;
  autoFetch?: boolean;
}

export interface EntityManagerReturn<T extends BaseEntity, TDto> {
  entities: T[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  
  // Actions
  fetchEntities: () => Promise<void>;
  createEntity: (entityData: Omit<TDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<T | null>;
  updateEntity: (id: string, entityData: Partial<TDto>) => Promise<T | null>;
  deleteEntity: (id: string) => Promise<boolean>;
  bulkDeleteEntities: (ids: string[]) => Promise<boolean>;
  toggleEntityStatus: (id: string, isActive: boolean) => Promise<boolean>;
  
  // Pagination
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Refresh
  refresh: () => Promise<void>;
}

export interface EntityService<T extends BaseEntity, TDto> {
  getEntities: (params: any) => Promise<{ data: T[]; count: number }>;
  createEntity: (entityData: TDto) => Promise<T>;
  updateEntity: (id: string, entityData: Partial<TDto>) => Promise<T>;
  deleteEntity?: (id: string) => Promise<void>;
}

export function useEntityManager<T extends BaseEntity, TDto>(
  service: EntityService<T, TDto>,
  entityName: string,
  options: EntityManagerOptions = {}
): EntityManagerReturn<T, TDto> {
  const { organizationId, branchId, isReady } = useOrganization();
  const { handleApiError } = useGlobalErrorHandler();
  
  const {
    pageSize = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    autoFetch = true
  } = options;

  // Helper function to inject org data
  const withOrgData = useCallback(<TData extends Record<string, any>>(data: TData) => ({
    ...data,
    organizationId,
    branchId,
  }), [organizationId, branchId]);

  // State
  const [entities, setEntities] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX);
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize);

  // Validate organization context
  const validateContext = useCallback(() => {
    if (!isReady) {
      setError('Organization context is loading...');
      return false;
    }
    
    if (!organizationId || !branchId) {
      setError('Organization and Branch information required');
      return false;
    }
    
    return true;
  }, [isReady, organizationId, branchId]);

  // Fetch entities
  const fetchEntities = useCallback(async () => {
    if (!validateContext()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await service.getEntities({
        pageIndex,
        pageSize: currentPageSize,
        organizationId,
        branchId,
      });
      
      // Handle different response structures
      const data = response.data || response;
      const count = response.count ?? data.length;
      
      setEntities(Array.isArray(data) ? data : []);
      setTotalCount(count);
    } catch (err) {
      const errorMessage = handleApiError(err, `fetch ${entityName}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [validateContext, service, pageIndex, currentPageSize, organizationId, branchId, handleApiError, entityName]);

  // Create entity
  const createEntity = useCallback(async (
    entityData: Omit<TDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<T | null> => {
    if (!validateContext()) return null;

    setLoading(true);
    setError(null);
    
    try {
      const fullEntityData = withOrgData(entityData) as TDto;
      const newEntity = await service.createEntity(fullEntityData);
      
      // Add to local state for better performance
      setEntities(prev => [...prev, newEntity]);
      setTotalCount(prev => prev + 1);
      
      return newEntity;
    } catch (err) {
      const errorMessage = handleApiError(err, `create ${entityName}`);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [validateContext, withOrgData, service, handleApiError, entityName]);

  // Update entity with sophisticated merge pattern
  const updateEntity = useCallback(async (
    id: string,
    entityData: Partial<TDto>
  ): Promise<T | null> => {
    if (!validateContext()) return null;

    setLoading(true);
    setError(null);
    
    try {
      // Find the existing entity
      const existingEntity = entities.find(entity => entity.id === id);
      if (!existingEntity) {
        setError(`${entityName} not found in current list`);
        return null;
      }

      // Merge existing data with updates and add organization context
      const fullUpdateData = withOrgData({
        ...existingEntity,
        ...entityData,
      });
      
      // Call service
      const updatedEntity = await service.updateEntity(id, fullUpdateData);
      
      // IMPORTANT: User input takes final precedence
      const mergedEntity = {
        ...existingEntity,        // Start with existing data as base
        ...(updatedEntity || {}), // Apply API response updates
        ...entityData,           // Apply the original update data to ensure values are preserved
        id: id,                  // Ensure ID is preserved
        organizationId,          // Ensure organization context is preserved
        branchId,               // Ensure branch context is preserved
      } as T;
      
      // Update local state
      setEntities(prev => prev.map(entity => 
        entity.id === id ? mergedEntity : entity
      ));
      
      return mergedEntity;
    } catch (err) {
      const errorMessage = handleApiError(err, `update ${entityName}`);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [validateContext, entities, withOrgData, service, organizationId, branchId, handleApiError, entityName]);

  // Delete entity (soft delete)
  const deleteEntity = useCallback(async (id: string): Promise<boolean> => {
    if (service.deleteEntity) {
      // Direct delete service available
      setLoading(true);
      setError(null);

      try {
        await service.deleteEntity(id);
        setEntities(prev => prev.filter(entity => entity.id !== id));
        setTotalCount(prev => prev - 1);
        return true;
      } catch (err) {
        const errorMessage = handleApiError(err, `delete ${entityName}`);
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    } else {
      // Use update with isActive: false for soft delete
  const result = await updateEntity(id, { isActive: false } as unknown as Partial<TDto>);
      
      if (result) {
        // Remove from local state (since it's now inactive)
        setEntities(prev => prev.filter(entity => entity.id !== id));
        setTotalCount(prev => prev - 1);
        return true;
      }
      
      return false;
    }
  }, [service, updateEntity, handleApiError, entityName]);

  // Toggle entity status
  const toggleEntityStatus = useCallback(async (
    id: string,
    isActive: boolean
  ): Promise<boolean> => {
  const result = await updateEntity(id, { isActive } as unknown as Partial<TDto>);
    return result !== null;
  }, [updateEntity]);

  // Bulk delete entities
  const bulkDeleteEntities = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return true;
    
    setLoading(true);
    setError(null);

    try {
      for (const id of ids) {
        try {
          if (service.deleteEntity) {
            await service.deleteEntity(id);
          } else {
            const entityToDelete = entities.find(entity => entity.id === id);
            if (entityToDelete) {
              const fullUpdateData = withOrgData({
                ...entityToDelete,
                isActive: false,
              });
              await service.updateEntity(id, fullUpdateData as unknown as Partial<TDto>);
            }
          }
        } catch (error) {
          console.error(`Failed to delete ${entityName} ${id}:`, error);
        }
      }
      
      // Remove all deleted entities from local state
      setEntities(prev => prev.filter(entity => !ids.includes(entity.id)));
      setTotalCount(prev => prev - ids.length);
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, `bulk delete ${entityName}`);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [entities, withOrgData, service, handleApiError, entityName]);

  // Pagination helpers
  const setPageSizeHandler = useCallback((size: number) => {
    setCurrentPageSize(size);
    setPageIndex(0);
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

  // Refresh (alias for fetchEntities)
  const refresh = useCallback(() => fetchEntities(), [fetchEntities]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && isReady && organizationId && branchId) {
      fetchEntities();
    }
  }, [autoFetch, isReady, fetchEntities, organizationId, branchId]);

  return {
    entities,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize: currentPageSize,
    
    // Actions
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    bulkDeleteEntities,
    toggleEntityStatus,
    
    // Pagination
    setPageIndex,
    setPageSize: setPageSizeHandler,
    nextPage,
    prevPage,
    
    // Refresh
    refresh,
  };
}
