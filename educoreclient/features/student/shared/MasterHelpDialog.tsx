'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { HelpDialog } from '@/components/common/HelpDialog';

interface MasterHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Smart Help Dialog that automatically detects the current page context
 * and shows appropriate help content for the master data management page
 */
const MasterHelpDialog: React.FC<MasterHelpDialogProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  
  // Auto-detect content type based on current route
  const getContentType = (): 'class' | 'section' | 'studentcategory' => {
    if (pathname?.includes('/class')) return 'class';
    if (pathname?.includes('/section')) return 'section';
    if (pathname?.includes('/studentcategory')) return 'studentcategory';
    
    // Default fallback
    return 'class';
  };

  const contentType = getContentType();

  return (
    <HelpDialog
      isOpen={isOpen}
      onClose={onClose}
      contentType={contentType}
    />
  );
};

export { MasterHelpDialog };
