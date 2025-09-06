import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { Checkbox } from '@/app/components/RadixUI/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { useToast } from '@/app/components/ui/ToastProvider';
import { SEMESTER_DEFAULTS } from "../../Constants/semister.constants";
import { SemisterStatus } from "../../enum/Semisterstatus";


type SemisterFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...SEMESTER_DEFAULTS,
      ...defaultValues,
      startDate: defaultValues.startDate ? defaultValues.startDate.substring(0, 10) : '',
      endDate: defaultValues.endDate ? defaultValues.endDate.substring(0, 10) : '',
    };
  } else {
    return { ...SEMESTER_DEFAULTS };
  }
}


export const SemisterForm: React.FC<SemisterFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<any>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...SEMESTER_DEFAULTS });
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
    if (!formData.semesterName || !formData.semesterName.trim()) {
      errors.semesterName = 'Semester Name is required.';
    }
    if (!formData.semesterCode || !formData.semesterCode.trim()) {
      errors.semesterCode = 'Semester Code is required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const apiData = {
        ...formData,
        organizationId,
        branchId,
        isActive: true, // Always send isActive true
      };
      await onSubmit(apiData);
      // Only show success if no error is thrown
      showSuccess(
        defaultValues && defaultValues.id ? 'Semister Updated' : 'Semister Created',
        defaultValues && defaultValues.id ? 'Semister updated successfully.' : 'Semister created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit semister form.');
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div>
            <Label htmlFor="semesterName" className="text-xs font-medium text-slate-700">Semester Name *</Label>
            <Input
              id="semesterName"
              name="semesterName"
              value={formData.semesterName}
              onChange={handleChange}
              error={formErrors.semesterName}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
          <div>
            <Label htmlFor="semesterCode" className="text-xs font-medium text-slate-700">Semester Code *</Label>
            <Input
              id="semesterCode"
              name="semesterCode"
              value={formData.semesterCode}
              onChange={handleChange}
              error={formErrors.semesterCode}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-xs font-medium text-slate-700">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate ? formData.startDate.substring(0, 10) : ''}
                onChange={handleChange}
                error={formErrors.startDate}
                className="mt-1 text-sm text-slate-900"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs font-medium text-slate-700">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate ? formData.endDate.substring(0, 10) : ''}
                onChange={handleChange}
                error={formErrors.endDate}
                className="mt-1 text-sm text-slate-900"
              />
            </div>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="isCurrentSemester"
              name="isCurrentSemester"
              checked={Boolean(formData.isCurrentSemester)}
              error={formErrors.isCurrentSemester}
              onCheckedChange={checked => setFormData({ ...formData, isCurrentSemester: Boolean(checked) })}
            >
              <Label htmlFor="isCurrentSemester" className="text-xs font-medium text-slate-700">Is Current Semester?</Label>
            </Checkbox>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700">Status *</Label>
            <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
              <SelectTrigger error={formErrors.status}>
                <span>{formData.status || 'Select status'}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.values(SemisterStatus).map(v => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default SemisterForm;
