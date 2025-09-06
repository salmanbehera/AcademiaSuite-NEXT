'use client';

import React, { useState } from 'react';
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Modal } from '@/app/components/ui/Modal';

interface OrganizationConfigProps {
  className?: string;
}

export const OrganizationConfig: React.FC<OrganizationConfigProps> = ({ className = '' }) => {
  const { 
    organizationId, 
    branchId, 
    updateOrgConfig,
    isReady 
  } = useOrganization();
  
  const [isOpen, setIsOpen] = useState(false);
  const [tempOrgId, setTempOrgId] = useState(organizationId);
  const [tempBranchId, setTempBranchId] = useState(branchId);
  const [isSaving, setIsSaving] = useState(false);

  // Update temp values when context changes
  React.useEffect(() => {
    setTempOrgId(organizationId);
    setTempBranchId(branchId);
  }, [organizationId, branchId]);

  const handleSave = async () => {
    if (!tempOrgId.trim() || !tempBranchId.trim()) {
      alert('Both Organization ID and Branch ID are required');
      return;
    }

    setIsSaving(true);
    try {
      updateOrgConfig(tempOrgId.trim(), tempBranchId.trim());
      setIsOpen(false);
      
      // Show success message
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: 'Organization configuration updated successfully!'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating organization config:', error);
      alert('Failed to update organization configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTempOrgId(organizationId);
    setTempBranchId(branchId);
  };

  if (!isReady) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading organization...</span>
      </div>
    );
  }

  return (
    <>
      {/* Config Status Display */}
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <div className="text-sm">
            <span className="text-gray-600">Org:</span>
            <span className="font-mono text-xs ml-1 px-2 py-1 bg-blue-50 rounded">
              {organizationId.substring(0, 8)}...
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Branch:</span>
          <span className="font-mono text-xs px-2 py-1 bg-green-50 rounded">
            {branchId.substring(0, 8)}...
          </span>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Settings className="w-3 h-3" />
          Configure
        </Button>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Organization Configuration"
        size="md"
      >
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Temporary Configuration</p>
                <p>These values are currently stored in browser localStorage. In the production version, they will be automatically extracted from your JWT authentication token.</p>
              </div>
            </div>
          </div>

          {/* Current Values */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Organization ID
              </label>
              <div className="font-mono text-xs p-3 bg-gray-50 rounded border break-all">
                {organizationId}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Branch ID
              </label>
              <div className="font-mono text-xs p-3 bg-gray-50 rounded border break-all">
                {branchId}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Organization ID
              </label>
              <Input
                value={tempOrgId}
                onChange={(e) => setTempOrgId(e.target.value)}
                placeholder="Enter organization ID"
                className="font-mono text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Branch ID
              </label>
              <Input
                value={tempBranchId}
                onChange={(e) => setTempBranchId(e.target.value)}
                placeholder="Enter branch ID"
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isSaving}
            >
              Reset
            </Button>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !tempOrgId.trim() || !tempBranchId.trim()}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Future Implementation Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">🚀 Future Implementation:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Automatic extraction from JWT token on login</li>
                <li>Multi-organization support with switching</li>
                <li>Role-based branch access control</li>
                <li>Secure token refresh handling</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
