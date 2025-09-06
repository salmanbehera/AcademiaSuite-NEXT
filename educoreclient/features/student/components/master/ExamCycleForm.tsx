import React, { useState, useEffect } from "react";
import { SemisterService } from '@/features/student/services/master/semisterService';
import { Semister } from '@/features/student/types/master/semisterTypes';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/app/components/ui/ToastProvider';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { EXAM_CYCLE_DEFAULTS } from "../../Constants/examcycle.constants";

type ExamCycleFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...EXAM_CYCLE_DEFAULTS,
      ...defaultValues,
      startDate: defaultValues.startDate ? defaultValues.startDate.substring(0, 10) : '',
      endDate: defaultValues.endDate ? defaultValues.endDate.substring(0, 10) : '',
    };
  } else {
    return { ...EXAM_CYCLE_DEFAULTS };
  }
}

export const ExamCycleForm: React.FC<ExamCycleFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { organizationId, branchId } = useOrganization();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState<any>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semisters, setSemisters] = useState<Semister[]>([]);
  const [loadingSemisters, setLoadingSemisters] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  useEffect(() => {
    async function fetchSemisters() {
      setLoadingSemisters(true);
      try {
        const result = await SemisterService.getSemisters({ organizationId, branchId, pageSize: 100 });
        setSemisters(result.data || []);
      } catch (err) {
        setSemisters([]);
      } finally {
        setLoadingSemisters(false);
      }
    }
    if (organizationId && branchId) fetchSemisters();
  }, [organizationId, branchId]);

  const resetForm = () => {
    setFormData({ ...EXAM_CYCLE_DEFAULTS });
    setFormErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.examCycleName || !formData.examCycleName.trim()) {
      errors.examCycleName = 'Exam Cycle Name is required.';
    }
    if (!formData.examCycleCode || !formData.examCycleCode.trim()) {
      errors.examCycleCode = 'Exam Cycle Code is required.';
    }
    if (!formData.semesterId || !/^[0-9a-fA-F-]{36}$/.test(formData.semesterId)) {
      errors.semesterId = 'Semester is required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const apiData = {
        ...formData,
        organizationId,
        branchId,
      };
      if (!defaultValues || !defaultValues.id) {
        delete apiData.id;
      }
      await onSubmit(apiData);
      showSuccess(
        defaultValues && defaultValues.id ? 'Exam Cycle Updated' : 'Exam Cycle Created',
        defaultValues && defaultValues.id ? 'Exam Cycle updated successfully.' : 'Exam Cycle created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit exam cycle form.');
      console.error('Failed to submit exam cycle form.', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="semesterId" className="text-xs font-medium text-slate-700">Semester *</Label>
          <select
            id="semesterId"
            name="semesterId"
            value={formData.semesterId || ''}
            onChange={handleChange}
            className="mt-1 text-sm text-slate-900 w-full border border-slate-300 rounded px-2 py-1"
            disabled={loadingSemisters}
          >
            <option value="">Select Semester</option>
            {semisters.map((s) => (
              <option key={s.id} value={s.id}>{s.semesterName} ({s.semesterCode})</option>
            ))}
          </select>
          {formErrors.semesterId && <div className="text-xs text-red-600 mt-1">{formErrors.semesterId}</div>}
        </div>
        <div>
          <Label htmlFor="examCycleName" className="text-xs font-medium text-slate-700">Exam Cycle Name *</Label>
          <Input
            id="examCycleName"
            name="examCycleName"
            value={formData.examCycleName}
            onChange={handleChange}
            error={formErrors.examCycleName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="examCycleCode" className="text-xs font-medium text-slate-700">Exam Cycle Code *</Label>
          <Input
            id="examCycleCode"
            name="examCycleCode"
            value={formData.examCycleCode}
            onChange={handleChange}
            error={formErrors.examCycleCode}
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

export default ExamCycleForm;
