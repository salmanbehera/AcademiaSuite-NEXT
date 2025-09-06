import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { useToast } from '@/app/components/ui/ToastProvider';
import { DESIGNATION_FORM_DEFAULTS } from "../../Constants/designation.constants";
type DesignationFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...DESIGNATION_FORM_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...DESIGNATION_FORM_DEFAULTS };
  }
}

export const DesignationForm: React.FC<DesignationFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<any>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...DESIGNATION_FORM_DEFAULTS });
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
    const errors: Record<string, string> = {};
    if (!formData.designationName || !formData.designationName.trim()) {
      errors.designationName = 'Designation Name is required.';
    }
    if (!formData.designationCode || !formData.designationCode.trim()) {
      errors.designationCode = 'Designation Code is required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const apiData = {
        ...formData,
        organizationId,
        branchId,
        isActive: true,
      };
      if (!defaultValues || !defaultValues.id) {
        delete apiData.id;
      }
      await onSubmit(apiData);
      showSuccess(
        defaultValues && defaultValues.id ? 'Designation Updated' : 'Designation Created',
        defaultValues && defaultValues.id ? 'Designation updated successfully.' : 'Designation created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit designation form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="designationName" className="text-xs font-medium text-slate-700">Designation Name *</Label>
          <Input
            id="designationName"
            name="designationName"
            value={formData.designationName}
            onChange={handleChange}
            error={formErrors.designationName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="designationCode" className="text-xs font-medium text-slate-700">Designation Code *</Label>
          <Input
            id="designationCode"
            name="designationCode"
            value={formData.designationCode}
            onChange={handleChange}
            error={formErrors.designationCode}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-xs font-medium text-slate-700">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
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
          {(defaultValues && defaultValues.id) ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default DesignationForm;
