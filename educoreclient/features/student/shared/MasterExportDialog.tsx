'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface MasterExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  totalCount: number;
  filteredCount?: number;
}

/**
 * Smart Export Dialog that automatically detects the current page context
 * and shows appropriate export configuration for the master data management page
 */
const MasterExportDialog: React.FC<MasterExportDialogProps> = ({ 
  isOpen, 
  onClose, 
  onExport,
  totalCount,
  filteredCount
}) => {
  const pathname = usePathname();
  
  if (!isOpen) return null;
  
  // Auto-detect entity type
  const getEntityInfo = () => {
    if (pathname?.includes('/class')) {
      return {
        entityName: 'Classes',
        entityNameLower: 'classes'
      };
    } else if (pathname?.includes('/section')) {
      return {
        entityName: 'Sections',
        entityNameLower: 'sections'
      };
    } else if (pathname?.includes('/studentcategory')) {
      return {
        entityName: 'Student Categories',
        entityNameLower: 'student categories'
      };
    }
    
    return {
      entityName: 'Data',
      entityNameLower: 'data'
    };
  };

  const { entityName, entityNameLower } = getEntityInfo();
  const exportCount = filteredCount !== undefined ? filteredCount : totalCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Export {entityName}
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Export {exportCount} {entityNameLower} to a CSV file that can be opened in Excel, Google Sheets, or other spreadsheet applications.
          </p>
          
          {filteredCount !== undefined && filteredCount < totalCount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> You have search filters applied. Only the {filteredCount} filtered {entityNameLower} will be exported.
              </p>
            </div>
          )}
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              <strong>Export includes:</strong> All visible columns with current sort order
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export { MasterExportDialog };
