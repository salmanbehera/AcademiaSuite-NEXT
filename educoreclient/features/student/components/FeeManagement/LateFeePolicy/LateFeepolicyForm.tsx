 
import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { useToast } from '@/app/components/ui/ToastProvider';
import { LATEFEEPOLICY_DEFAULTS, PENALTY_TYPE_OPTIONS } from "@/features/student/Constants/FeeManagement/latefeepolicy.constants";
import { LateFeePolicyDto } from "@/features/student/types/FeeManagement/latefeepolicyType";


type LateFeepolicyFormProps = {
  onSubmit: (data: LateFeePolicyDto) => void | Promise<void>;
  defaultValues?: Partial<LateFeePolicyDto>;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: Partial<LateFeePolicyDto>) {
  if (defaultValues && defaultValues.id) {
    return {
      ...LATEFEEPOLICY_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...LATEFEEPOLICY_DEFAULTS };
  }
}

const LateFeepolicyForm: React.FC<LateFeepolicyFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<LateFeePolicyDto>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...LATEFEEPOLICY_DEFAULTS });
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
    if (!formData.policyName || !formData.policyName.trim()) {
      errors.policyName = 'Policy Name is required.';
    }
    if (!formData.penaltyType) {
      errors.penaltyType = 'Penalty Type is required.';
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
      await onSubmit(apiData);
      showSuccess(
        defaultValues && defaultValues.id ? 'Late Fee Policy Updated' : 'Late Fee Policy Created',
        defaultValues && defaultValues.id ? 'Late fee policy updated successfully.' : 'Late fee policy created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit late fee policy form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2">{defaultValues && defaultValues.id ? 'Edit Late Fee Policy' : 'Create Late Fee Policy'}</h2>
      <div className="space-y-6">
        <div>
          <Label htmlFor="policyName" className="text-xs font-semibold text-slate-700">Policy Name <span className="text-red-500">*</span></Label>
          <Input
            id="policyName"
            name="policyName"
            value={formData.policyName}
            onChange={handleChange}
            error={formErrors.policyName}
            className="mt-1 text-sm text-slate-900"
            placeholder="e.g. Standard Late Fee Policy"
            autoFocus
          />
          {formErrors.policyName && <p className="text-xs text-red-500 mt-1">{formErrors.policyName}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="gracePeriodDays" className="text-xs font-semibold text-slate-700">Grace Period (Days)</Label>
            <Input
              id="gracePeriodDays"
              name="gracePeriodDays"
              type="number"
              min={0}
              value={formData.gracePeriodDays}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
              placeholder="e.g. 5"
            />
            <p className="text-xs text-slate-500 mt-1">Number of days after due date before penalty applies.</p>
          </div>
          <div>
            <Label htmlFor="penaltyType" className="text-xs font-semibold text-slate-700">Penalty Type <span className="text-red-500">*</span></Label>
            <Select value={formData.penaltyType} onValueChange={value => setFormData({ ...formData, penaltyType: value })}>
              <SelectTrigger error={formErrors.penaltyType}>
                <span>{formData.penaltyType || 'Select penalty type'}</span>
              </SelectTrigger>
              <SelectContent>
                {PENALTY_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.penaltyType && <p className="text-xs text-red-500 mt-1">{formErrors.penaltyType}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="penaltyValue" className="text-xs font-semibold text-slate-700">Penalty Value</Label>
            <Input
              id="penaltyValue"
              name="penaltyValue"
              type="number"
              min={0}
              step="any"
              value={formData.penaltyValue}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
              placeholder="e.g. 50"
            />
            <p className="text-xs text-slate-500 mt-1">Amount or percentage to be charged as penalty.</p>
          </div>
          <div>
            <Label htmlFor="maxPenalty" className="text-xs font-semibold text-slate-700">Max Penalty</Label>
            <Input
              id="maxPenalty"
              name="maxPenalty"
              type="number"
              min={0}
              step="any"
              value={formData.maxPenalty}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
              placeholder="e.g. 500"
            />
            <p className="text-xs text-slate-500 mt-1">Maximum penalty that can be charged.</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-8 mt-6 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          size="md"
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
          size="md"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {(defaultValues && defaultValues.id) ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default LateFeepolicyForm;
