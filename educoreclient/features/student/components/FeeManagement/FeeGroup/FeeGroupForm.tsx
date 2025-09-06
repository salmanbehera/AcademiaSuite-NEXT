import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { useToast } from '@/app/components/ui/ToastProvider';
import { FEEGROUP_DEFAULTS } from '../../../Constants/FeeManagement/feegroup.constants';

// Props type
interface FeeGroupFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
}

// function getInitialFormData(defaultValues?: any) {
//   if (defaultValues && (defaultValues.Id || defaultValues.id)) {
//     return {
//       ...FEEGROUP_DEFAULTS,
//       ...defaultValues,
//       Id: defaultValues.Id || defaultValues.id,
//       OrganizationId: defaultValues.OrganizationId || defaultValues.organizationId,
//       BranchId: defaultValues.BranchId || defaultValues.branchId,
//       FeeGroupCode: defaultValues.FeeGroupCode || defaultValues.feeGroupCode,
//       FeeGroupName: defaultValues.FeeGroupName || defaultValues.feeGroupName,
//       Description: defaultValues.Description || defaultValues.description,
//       LateFeePolicyId: defaultValues.LateFeePolicyId || defaultValues.lateFeePolicyId,
//       DiscountPolicyId: defaultValues.DiscountPolicyId || defaultValues.discountPolicyId,
//       IsActive: typeof defaultValues.IsActive === 'boolean' ? defaultValues.IsActive : true,
//     };
//   } else {
//     return { ...FEEGROUP_DEFAULTS };
//   }
// }

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...FEEGROUP_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...FEEGROUP_DEFAULTS };
  }
}

export const FeeGroupForm: React.FC<FeeGroupFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<any>(() => getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultValues && (defaultValues.Id || defaultValues.id)) {
      setFormData(getInitialFormData(defaultValues));
    } else if (!defaultValues) {
      setFormData({ ...FEEGROUP_DEFAULTS });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.Id, defaultValues?.id]);

  const resetForm = () => {
    setFormData({ ...FEEGROUP_DEFAULTS });
    setFormErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (target as HTMLInputElement).checked;
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    const errors: Record<string, string> = {};
    if (!formData.FeeGroupName || !formData.FeeGroupName.trim()) {
      errors.FeeGroupName = 'Fee Group Name is required.';
    }
    if (!formData.FeeGroupCode || !formData.FeeGroupCode.trim()) {
      errors.FeeGroupCode = 'Fee Group Code is required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      let apiData = {
        ...formData,
        OrganizationId: organizationId,
        BranchId: branchId,
        IsActive: true,
      };
      // Convert empty string to null for these fields
      if (apiData.LateFeePolicyId === '') apiData.LateFeePolicyId = null;
      if (apiData.DiscountPolicyId === '') apiData.DiscountPolicyId = null;
      if (!defaultValues || !(defaultValues.Id || defaultValues.id)) {
        // Remove Id for create
        const { Id, id, ...rest } = apiData;
        apiData = rest;
      }
      await onSubmit(apiData);
      
      resetForm();
    } catch (err) {
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="FeeGroupName" className="text-xs font-medium text-slate-700">Fee Group Name *</Label>
          <Input
            id="FeeGroupName"
            name="FeeGroupName"
            value={formData.FeeGroupName}
            onChange={handleChange}
            error={formErrors.FeeGroupName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="FeeGroupCode" className="text-xs font-medium text-slate-700">Fee Group Code *</Label>
          <Input
            id="FeeGroupCode"
            name="FeeGroupCode"
            value={formData.FeeGroupCode}
            onChange={handleChange}
            error={formErrors.FeeGroupCode}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="Description" className="text-xs font-medium text-slate-700">Description</Label>
          <Input
            id="Description"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            error={formErrors.Description}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="LateFeePolicyId" className="text-xs font-medium text-slate-700">Late Fee Policy ID</Label>
          <Input
            id="LateFeePolicyId"
            name="LateFeePolicyId"
            value={formData.LateFeePolicyId == null ? '' : formData.LateFeePolicyId}
            onChange={handleChange}
            error={formErrors.LateFeePolicyId}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="DiscountPolicyId" className="text-xs font-medium text-slate-700">Discount Policy ID</Label>
          <Input
            id="DiscountPolicyId"
            name="DiscountPolicyId"
            value={formData.DiscountPolicyId == null ? '' : formData.DiscountPolicyId}
            onChange={handleChange}
            error={formErrors.DiscountPolicyId}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            resetForm();
            if (typeof onCancel === 'function') onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {(defaultValues && (defaultValues.Id || defaultValues.id)) ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
