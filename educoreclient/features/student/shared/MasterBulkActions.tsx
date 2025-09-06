'use client';

import React from 'react';
import { BulkActions } from '@/components/common/BulkActions';

interface MasterBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Smart Bulk Actions component that automatically detects the current page context
 * and shows appropriate bulk operations for the master data management page
 */
const MasterBulkActions: React.FC<MasterBulkActionsProps> = ({ 
  selectedCount,
  onBulkDelete,
  onClearSelection,
  loading = false,
  disabled = false
}) => {
  return (
    <BulkActions
      selectedCount={selectedCount}
      onBulkDelete={onBulkDelete}
      onClearSelection={onClearSelection}
      loading={loading}
      disabled={disabled}
    />
  );
};

export { MasterBulkActions };
