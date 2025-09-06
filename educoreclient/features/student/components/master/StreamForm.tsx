import React, { useState, useEffect } from "react";
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { Checkbox } from '@/app/components/RadixUI/checkbox';
import { useToast } from '@/app/components/ui/ToastProvider';
import { STREAM_DEFAULTS } from "../../Constants/stream.constants";

type StreamFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: any) {
  if (defaultValues && defaultValues.id) {
    return {
      ...STREAM_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...STREAM_DEFAULTS };
  }
}

export const StreamForm: React.FC<StreamFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<any>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...STREAM_DEFAULTS });
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
    if (!formData.streamName || !formData.streamName.trim()) {
      errors.streamName = 'Stream Name is required.';
    }
    if (!formData.streamShortName || !formData.streamShortName.trim()) {
      errors.streamShortName = 'Stream Short Name is required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      // Remove id from payload if creating new
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
        defaultValues && defaultValues.id ? 'Stream Updated' : 'Stream Created',
        defaultValues && defaultValues.id ? 'Stream updated successfully.' : 'Stream created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit stream form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="streamName" className="text-xs font-medium text-slate-700">Stream Name *</Label>
          <Input
            id="streamName"
            name="streamName"
            value={formData.streamName}
            onChange={handleChange}
            error={formErrors.streamName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="streamShortName" className="text-xs font-medium text-slate-700">Stream Short Name *</Label>
          <Input
            id="streamShortName"
            name="streamShortName"
            value={formData.streamShortName}
            onChange={handleChange}
            error={formErrors.streamShortName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="displayOrder" className="text-xs font-medium text-slate-700">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
          <div>
            <Label htmlFor="maxStrength" className="text-xs font-medium text-slate-700">Max Strength</Label>
            <Input
              id="maxStrength"
              type="number"
              name="maxStrength"
              value={formData.maxStrength}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reservationSeats" className="text-xs font-medium text-slate-700">Reservation Seats</Label>
            <Input
              id="reservationSeats"
              type="number"
              name="reservationSeats"
              value={formData.reservationSeats}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
          {/* isActive checkbox removed: isActive is auto-saved in DB */}
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

export default StreamForm;
