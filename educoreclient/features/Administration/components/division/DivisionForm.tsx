import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { useToast } from '@/app/components/ui/ToastProvider';
 import { DIVISION_FORM_DEFAULTS } from "../../Constants/division.constants";
type DivisionFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...DIVISION_FORM_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...DIVISION_FORM_DEFAULTS };
  }
}

export const DivisionForm: React.FC<DivisionFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<any>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...DIVISION_FORM_DEFAULTS });
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
    if (!formData.divisionName || !formData.divisionName.trim()) {
      errors.divisionName = 'Division Name is required.';
    }
    if (!formData.divisionCode || !formData.divisionCode.trim()) {
      errors.divisionCode = 'Division Code is required.';
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
        defaultValues && defaultValues.id ? 'Division Updated' : 'Division Created',
        defaultValues && defaultValues.id ? 'Division updated successfully.' : 'Division created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit division form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="divisionName" className="text-xs font-medium text-slate-700">Division Name *</Label>
          <Input
            id="divisionName"
            name="divisionName"
            value={formData.divisionName}
            onChange={handleChange}
            error={formErrors.divisionName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="divisionCode" className="text-xs font-medium text-slate-700">Division Code *</Label>
          <Input
            id="divisionCode"
            name="divisionCode"
            value={formData.divisionCode}
            onChange={handleChange}
            error={formErrors.divisionCode}
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

export default DivisionForm;
