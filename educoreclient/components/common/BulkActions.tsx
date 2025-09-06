'use client';

import React from 'react';
import { Button } from '@/app/components/ui/Button';
import { Dropdown, DropdownItem } from '@/app/components/ui/Dropdown';
import { Trash2, MoreHorizontal } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function BulkActions({ 
  selectedCount, 
  onBulkDelete, 
  onClearSelection, 
  loading = false,
  disabled = false 
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  const dropdownItems: DropdownItem[] = [
    {
      id: 'bulk-delete',
      label: `🗑️ Delete Selected (${selectedCount})`,
      onClick: onBulkDelete,
      disabled: loading,
    }
  ];

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{selectedCount}</span>
          </div>
        </div>
        <span className="ml-3 text-sm font-semibold text-blue-800">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>
      </div>
      
      <div className="flex items-center gap-3 ml-auto">
       
        
        {/* Direct Delete Button (More Visible) */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={loading || disabled}
           className="bg-red-600 hover:bg-red-700 flex items-center gap-2 px-4"
        >
          <span className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedCount})
                  </span>
                </Button>


         <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={loading}
          className="border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 shadow-sm"

        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
}
