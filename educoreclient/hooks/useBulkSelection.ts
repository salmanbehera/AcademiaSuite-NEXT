'use client';

import { useState, useCallback, useMemo } from 'react';

export interface UseBulkSelectionReturn<T> {
  selectedItems: Set<string>;
  selectedData: T[];
  selectedCount: number;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  
  // Actions
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelectAll: () => void;
}

export function useBulkSelection<T extends { id: string }>(
  items: T[] = [] // Added default value to ensure items is always an array
): UseBulkSelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const selectedData = useMemo(() => 
    items.filter(item => selectedItems.has(item.id)), 
    [items, selectedItems]
  );

  const selectedCount = selectedItems.size;
  const totalCount = items.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  const isSelected = useCallback((id: string) => selectedItems.has(id), [selectedItems]);

  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => new Set([...prev, id]));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    if (selectedItems.has(id)) {
      deselectItem(id);
    } else {
      selectItem(id);
    }
  }, [selectedItems, selectItem, deselectItem]);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, clearSelection]);

  return {
    selectedItems,
    selectedData,
    selectedCount,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    clearSelection,
    toggleSelectAll,
  };
}
