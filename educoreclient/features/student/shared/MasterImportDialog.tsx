'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ImportDialog } from '@/components/common/ImportDialog';

interface MasterImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, onProgress?: (progress: number) => void) => Promise<{ success: number; errors: any[] } | null>;
}

/**
 * Smart Import Dialog that automatically detects the current page context
 * and shows appropriate import configuration for the master data management page
 */
const MasterImportDialog: React.FC<MasterImportDialogProps> = ({ 
  isOpen, 
  onClose, 
  onImport 
}) => {
  const pathname = usePathname();
  
  // Auto-detect entity type and generate appropriate sample data
  const getImportConfig = () => {
    if (pathname?.includes('/class')) {
      return {
        title: 'Import Classes',
        description: 'Upload a CSV or Excel file to import class data. Make sure your file follows the correct format.',
        sampleData: [
          ['Class Name', 'Class Code', 'Display Order', 'Max Strength', 'Reserved Seats', 'Status'],
          ['Class 1', 'C1', '1', '30', '5', 'Active'],
          ['Class 2', 'C2', '2', '35', '7', 'Active'],
          ['Class 3', 'C3', '3', '32', '6', 'Inactive']
        ]
      };
    } else if (pathname?.includes('/section')) {
      return {
        title: 'Import Sections',
        description: 'Upload a CSV or Excel file to import section data. Make sure your file follows the correct format.',
        sampleData: [
          ['Section Name', 'Section Code', 'Display Order', 'Max Strength', 'Status'],
          ['Section A', 'SEC-A', '1', '25', 'Active'],
          ['Section B', 'SEC-B', '2', '30', 'Active'],
          ['Section C', 'SEC-C', '3', '28', 'Inactive']
        ]
      };
    } else if (
      pathname?.includes('/studentcategory') ||
      pathname?.includes('/student-category') ||
      pathname?.includes('/student/master/student-category')
    ) {
      return {
        title: 'Import Student Categories',
        description: 'Upload a CSV or Excel file to import student category data. Make sure your file follows the correct format. Use the exact property names as shown in the sample.',
        sampleData: [
          { categoryName: 'General', categoryShortName: 'GEN', displayOrder: 1, isActive: true },
          { categoryName: 'OBC', categoryShortName: 'OBC', displayOrder: 2, isActive: true },
          { categoryName: 'SC', categoryShortName: 'SC', displayOrder: 3, isActive: true },
          { categoryName: 'ST', categoryShortName: 'ST', displayOrder: 4, isActive: false }
        ]
      };
    }
    
    // Default fallback
    return {
      title: 'Import Data',
      description: 'Upload a CSV or Excel file to import data. Make sure your file follows the correct format.',
      sampleData: [
        ['Name', 'Code', 'Display Order', 'Max Strength', 'Status'],
        ['Item 1', 'ITM1', '1', '30', 'Active']
      ]
    };
  };

  const config = getImportConfig();

  return (
    <ImportDialog
      isOpen={isOpen}
      onClose={onClose}
      onImport={onImport}
      title={config.title}
      description={config.description}
      sampleData={config.sampleData}
      acceptedFormats={['.csv', '.xlsx', '.xls']}
    />
  );
};

export { MasterImportDialog };
