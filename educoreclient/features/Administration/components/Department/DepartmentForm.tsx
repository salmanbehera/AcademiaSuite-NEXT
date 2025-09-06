import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { useToast } from '@/app/components/ui/ToastProvider';
import { DEPARTMENT_FORM_DEFAULTS } from "../../Constants/department.constants";
import { useDivision } from "../../hooks/useDivision";
import { Select } from '@/app/components/ui/Select';
import axios from "axios";
import { AxiosError } from "axios";

type DepartmentFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...DEPARTMENT_FORM_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...DEPARTMENT_FORM_DEFAULTS };
  }
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<any>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { divisions } = useDivision();

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...DEPARTMENT_FORM_DEFAULTS });
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

    if (!formData.divisionId || !divisions.some(division => division.id === formData.divisionId)) {
      errors.divisionId = 'Please select a valid division.';
    }
    if (!formData.departmentName || !formData.departmentName.trim()) {
      errors.departmentName = 'Department Name is required.';
    }
    if (!formData.departmentCode || !formData.departmentCode.trim()) {
      errors.departmentCode = 'Department Code is required.';
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

      console.log('API Payload:', apiData); // Debugging log for API payload

     

      const response = await onSubmit(apiData);

      console.log("✅ [API Response] PUT /departments", response);
    } catch (error) {
      const err = error as AxiosError;
      console.error("❌ [API Error] PUT /departments", err);
      if (err.response) {
        console.error("Response Data:", err.response.data);
        console.error("Response Status:", err.response.status);
        console.error("Response Headers:", err.response.headers);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const divisionOptions = divisions.map(division => ({ value: division.id, label: division.divisionName }));

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="divisionId" className="text-xs font-medium text-slate-700">Division</Label>
          <Select
            value={formData.divisionId ?? ''}
            options={divisionOptions}
            onChange={value => setFormData({ ...formData, divisionId: value })}
            error={formErrors.divisionId}
            className="text-slate-900"
            placeholder="Select a division"
          />
        </div>
        <div>
          <Label htmlFor="departmentName" className="text-xs font-medium text-slate-700">Department Name *</Label>
          <Input
            id="departmentName"
            name="departmentName"
            value={formData.departmentName}
            onChange={handleChange}
            error={formErrors.departmentName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="departmentCode" className="text-xs font-medium text-slate-700">Department Code *</Label>
          <Input
            id="departmentCode"
            name="departmentCode"
            value={formData.departmentCode}
            onChange={handleChange}
            error={formErrors.departmentCode}
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

export default DepartmentForm;
