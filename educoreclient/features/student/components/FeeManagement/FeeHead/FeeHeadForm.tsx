import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { Checkbox } from '@/app/components/RadixUI/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { useToast } from '@/app/components/ui/ToastProvider';
import { FEEHEAD_DEFAULTS, FEE_FREQUENCY_OPTIONS } from '../../../Constants/FeeManagement/feehead.constants';


type FeeHeadFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...FEEHEAD_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...FEEHEAD_DEFAULTS };
  }
}

export const FeeHeadForm: React.FC<FeeHeadFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<any>(() => getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only update formData from defaultValues if the id changes (i.e., a new record is being edited)
  useEffect(() => {
    if (defaultValues && defaultValues.id) {
      setFormData(getInitialFormData(defaultValues));
    } else if (!defaultValues) {
      setFormData({ ...FEEHEAD_DEFAULTS });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id]);

  const resetForm = () => {
    setFormData({ ...FEEHEAD_DEFAULTS });
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
    if (!formData.FeeHeadName || !formData.FeeHeadName.trim()) {
      errors.FeeHeadName = 'Fee Head Name is required.';
    }
    if (!formData.FeeHeadCode || !formData.FeeHeadCode.trim()) {
      errors.FeeHeadCode = 'Fee Head Code is required.';
    }
    if (!formData.FeeFrequency) {
      errors.FeeFrequency = 'Fee Frequency is required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      // Remove id if creating (no defaultValues.id)
      let apiData = {
        ...formData,
        organizationId,
        branchId,
        IsActive: true, // Always send IsActive true
      };
      if (!defaultValues || !defaultValues.id) {
        const { id, ...rest } = apiData;
        apiData = rest;
      }
  // Always add organizationId and branchId
  apiData.organizationId = organizationId;
  apiData.branchId = branchId;
  await onSubmit(apiData);
      showSuccess(
        defaultValues && defaultValues.id ? 'Fee Head Updated' : 'Fee Head Created',
        defaultValues && defaultValues.id ? 'Fee Head updated successfully.' : 'Fee Head created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit fee head form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="FeeHeadName" className="text-xs font-medium text-slate-700">Fee Head Name *</Label>
          <Input
            id="FeeHeadName"
            name="FeeHeadName"
            value={formData.FeeHeadName}
            onChange={handleChange}
            error={formErrors.FeeHeadName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="FeeHeadCode" className="text-xs font-medium text-slate-700">Fee Head Code *</Label>
          <Input
            id="FeeHeadCode"
            name="FeeHeadCode"
            value={formData.FeeHeadCode}
            onChange={handleChange}
            error={formErrors.FeeHeadCode}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="FeeFrequency" className="text-xs font-medium text-slate-700">Fee Frequency *</Label>
          <Select value={formData.FeeFrequency} onValueChange={value => setFormData({ ...formData, FeeFrequency: value })}>
            <SelectTrigger error={formErrors.FeeFrequency}>
              <span>{formData.FeeFrequency || 'Select frequency'}</span>
            </SelectTrigger>
            <SelectContent>
              {FEE_FREQUENCY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="DefaultGLCode" className="text-xs font-medium text-slate-700">Default GL Code</Label>
          <Input
            id="DefaultGLCode"
            name="DefaultGLCode"
            value={formData.DefaultGLCode ?? ''}
            onChange={handleChange}
            error={formErrors.DefaultGLCode}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div className="flex items-center">
          <Checkbox
            id="IsRefundable"
            name="IsRefundable"
            checked={Boolean(formData.IsRefundable)}
            error={formErrors.IsRefundable}
            onCheckedChange={checked => setFormData({ ...formData, IsRefundable: Boolean(checked) })}
          >
            <Label htmlFor="IsRefundable" className="text-xs font-medium text-slate-700">Is Refundable?</Label>
          </Checkbox>
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

export default FeeHeadForm;
