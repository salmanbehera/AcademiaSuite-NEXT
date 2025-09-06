'use client';
import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { AcademicYearStatus } from '../../enum/AcademicYearStatus';
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { Checkbox } from '@/app/components/RadixUI/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { Button } from '@/app/components/ui/Button';
import { AcademicYearSchema } from '../../Validations/academicYearSchemas';
import { useToast } from '@/app/components/ui/ToastProvider';
import { AcademicYearFormData } from '../../types/academicYearTypes';
import { ACADEMIC_YEAR_FORM_DEFAULTS } from '../../Constants/academicyearconstant';
type AcademicYearFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

// Function to get initial form data based on edit or empty defaults
function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...ACADEMIC_YEAR_FORM_DEFAULTS,
      ...defaultValues,
      startDate: defaultValues.startDate ? defaultValues.startDate.substring(0, 10) : '',
      endDate: defaultValues.endDate ? defaultValues.endDate.substring(0, 10) : '',
    };
  } else {
    return { ...ACADEMIC_YEAR_FORM_DEFAULTS };
  }
}

export function AcademicYearForm({ onSubmit, defaultValues, onCancel }: AcademicYearFormProps) {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<AcademicYearFormData>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bind defaultValues to formData on edit
  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({
      ...ACADEMIC_YEAR_FORM_DEFAULTS,
      status: AcademicYearStatus.Active,
    });
    setFormErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    let newValue: any = value;
    if (name === 'status') {
      newValue = value as AcademicYearStatus;
    } else if (type === 'checkbox') {
      newValue = (target as HTMLInputElement).checked;
    }
    setFormData({
      ...formData,
      [name]: newValue,
    });
    // No validation here; only on submit
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as AcademicYearStatus }));
    // No validation here; only on submit
  };

  const buildApiData = () => {
    const apiData = {
      ...formData,
      YearCode: formData.yearCode, // Ensure PascalCase for backend
      status: (formData.status as unknown as number),
      organizationId,
      branchId,
    };
    // Only include isActive if it is explicitly set (e.g., for delete)
    if (typeof formData.isActive !== 'undefined') {
      apiData.isActive = formData.isActive;
    }
    
    return apiData;
  };

  const buildValidationObj = () => {
    const validationObj = {
      ...formData,
      status: String(formData.status),
      organizationId,
      branchId,
    };
    // Only include isActive if it is explicitly set
    if (typeof formData.isActive !== 'undefined') {
      validationObj.isActive = formData.isActive;
    }
    return validationObj;
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(buildApiData());
      showSuccess('Academic Year Created', 'New academic year has been created successfully.');
      resetForm();
    } catch (error) {
      // Only show error toast, do not show success
      showError('Creation Failed', 'Failed to create the academic year. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(buildApiData());
      showSuccess('Academic Year Updated', 'Academic year has been updated successfully.');
      resetForm();
    } catch (error) {
      // Only show error toast, do not show success
      showError('Update Failed', 'Failed to update the academic year. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard: yearCode must not be empty
    if (!formData.yearCode || !formData.yearCode.trim()) {
      setFormErrors({ yearCode: 'Academic Year is required.' });
      return;
    }
    const result = AcademicYearSchema.safeParse(buildValidationObj());
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path.length > 0) {
          errors[issue.path[0]?.toString() || 'unknown'] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    if (defaultValues && defaultValues.id) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="yearCode">Academic Year *</Label>
          <Input
            id="yearCode"
            name="yearCode"
            placeholder="e.g., 2025-2026"
            value={formData.yearCode}
            onChange={handleChange}
            error={formErrors.yearCode}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              name="startDate"
              value={formData.startDate ? formData.startDate.substring(0, 10) : ''}
              onChange={handleChange}
              error={formErrors.startDate}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              name="endDate"
              value={formData.endDate ? formData.endDate.substring(0, 10) : ''}
              onChange={handleChange}
              error={formErrors.endDate}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="flex items-center">
          <Checkbox
            id="isCurrentYear"
            name="isCurrentYear"
            checked={Boolean(formData.isCurrentYear)}
            error={formErrors.isCurrentYear}
            onCheckedChange={checked => {
            setFormData({
              ...formData,
              isCurrentYear: Boolean(checked),
              status: formData.status,
            });
              // No validation here; only on submit
            }}
          >
            <Label htmlFor="isCurrentYear">Is Current Year?</Label>
          </Checkbox>
        </div>
        <div className="flex items-center">
          <Checkbox
            id="isAdmissionOpen"
            name="isAdmissionOpen"
            checked={Boolean(formData.isAdmissionOpen)}
            onCheckedChange={checked => {
            setFormData({
              ...formData,
              isAdmissionOpen: Boolean(checked),
              status: formData.status,
            });
              // No validation here; only on submit
            }}
          >
            <Label htmlFor="isAdmissionOpen">Is Admission Open?</Label>
          </Checkbox>
        </div>
      </div>
      <div>
        <Label>Status *</Label>
        <Select value={formData.status} onValueChange={value => {
          setFormData({
            ...formData,
            status: value as AcademicYearStatus,
          });
          // No validation here; only on submit
        }}>
          <SelectTrigger error={formErrors.status}>
            <span>{formData.status || 'Select status'}</span>
          </SelectTrigger>
          <SelectContent>
            {Object.values(AcademicYearStatus).map(v => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
}