"use client";
import React, { useEffect, useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { OrganizationService } from '@/features/Administration/services/organizationService';
import { BranchService } from '@/features/Administration/services/branchService';
import { Building2, MapPin } from 'lucide-react';

interface OrgBranchHeaderProps {
  className?: string;
  showIcons?: boolean;
}

export const OrgBranchHeader: React.FC<OrgBranchHeaderProps> = ({ className = '', showIcons = true }) => {
  const { organizationId, branchId } = useOrganization();
  const [organizationName, setOrganizationName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (organizationId) {
      OrganizationService.getOrganizationById(organizationId)
        .then((org) => {
          if (isMounted) setOrganizationName(org.organizationName);
        })
        .catch(() => {
          if (isMounted) setOrganizationName('');
        });
    }
    if (branchId) {
      BranchService.getBranchById(branchId)
        .then((branch) => {
          if (isMounted) setBranchName(branch.branchName);
        })
        .catch(() => {
          if (isMounted) setBranchName('');
        });
    }
    return () => { isMounted = false; };
  }, [organizationId, branchId]);

  return (
    <span className={`flex gap-2 items-center ${className}`}>
      {organizationName && (
        <span className="inline-flex items-center text-xs font-medium bg-slate-100 text-slate-700 rounded px-2 py-0.5">
          {showIcons && <Building2 className="w-4 h-4 mr-1 text-blue-500" />} {organizationName}
        </span>
      )}
      {branchName && (
        <span className="inline-flex items-center text-xs font-medium bg-slate-100 text-slate-700 rounded px-2 py-0.5">
          {showIcons && <MapPin className="w-4 h-4 mr-1 text-emerald-500" />} {branchName}
        </span>
      )}
    </span>
  );
};

export default OrgBranchHeader;
