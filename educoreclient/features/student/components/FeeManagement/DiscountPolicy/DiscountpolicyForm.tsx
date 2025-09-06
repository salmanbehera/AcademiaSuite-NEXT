"use client";
import React, { useState, useEffect } from "react";
import { useFeehead } from '@/features/student/hooks/FeeManagement/useFeehead';
import { Textarea } from '@/app/components/RadixUI/textarea';
import { format, parseISO } from 'date-fns';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { useToast } from '@/app/components/ui/ToastProvider';
import { DISCOUNT_POLICY_DEFAULTS, DISCOUNT_TYPE_OPTIONS, APPLIES_TO_OPTIONS } from "@/features/student/Constants/FeeManagement/discountpolicy.constants";
import { DiscountPolicyDto } from "@/features/student/types/FeeManagement/discountpolicyType";

type DiscountpolicyFormProps = {
  onSubmit: (data: DiscountPolicyDto) => void | Promise<void>;
  defaultValues?: Partial<DiscountPolicyDto>;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: Partial<DiscountPolicyDto>) {
  if (defaultValues && defaultValues.id) {
    return {
      ...DISCOUNT_POLICY_DEFAULTS,
      ...defaultValues,
    };
  } else {
    return { ...DISCOUNT_POLICY_DEFAULTS };
  }
}

const DiscountpolicyForm: React.FC<DiscountpolicyFormProps> = ({ onSubmit, defaultValues, onCancel }) => {

  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<DiscountPolicyDto>(getInitialFormData(defaultValues));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { feeheads, loading: feeheadsLoading } = useFeehead();
  const [selectedHeadIds, setSelectedHeadIds] = useState<string[]>(() => {
    if (defaultValues?.appliesTo === 'SpecificHeads' && defaultValues.appliesToDetails) {
      try {
        const parsed = JSON.parse(defaultValues.appliesToDetails);
        return Array.isArray(parsed.HeadIds) ? parsed.HeadIds.map(String) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [eligibilityJson, setEligibilityJson] = useState(() => {
    if (defaultValues?.eligibilityCriteria) {
      try {
        return JSON.stringify(JSON.parse(defaultValues.eligibilityCriteria), null, 2);
      } catch {
        return defaultValues.eligibilityCriteria;
      }
    }
    return '{\n  "criteria": "Sibling",\n  "minSiblings": 1,\n  "maxSiblings": 3\n}';
  });

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...DISCOUNT_POLICY_DEFAULTS });
    setFormErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (target as HTMLInputElement).checked;
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const handleHeadSelect = (id: string) => {
    setSelectedHeadIds(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    const errors: Record<string, string> = {};
    if (!formData.policyName || !formData.policyName.trim()) {
      errors.policyName = 'Policy Name is required.';
    }
    if (!formData.discountType) {
      errors.discountType = 'Discount Type is required.';
    }
    if (formData.appliesTo === 'SpecificHeads' && selectedHeadIds.length === 0) {
      errors.appliesToDetails = 'Select at least one fee head.';
    }
    // Validate eligibilityCriteria JSON
    try {
      if (eligibilityJson && eligibilityJson.trim()) {
        JSON.parse(eligibilityJson);
      }
    } catch {
      errors.eligibilityCriteria = 'Eligibility Criteria must be valid JSON.';
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
  appliesToDetails: formData.appliesTo === 'SpecificHeads' ? JSON.stringify({ HeadIds: selectedHeadIds }) : '',
        eligibilityCriteria: eligibilityJson,
      };
      await onSubmit(apiData);
      showSuccess(
        defaultValues && defaultValues.id ? 'Discount Policy Updated' : 'Discount Policy Created',
        defaultValues && defaultValues.id ? 'Discount policy updated successfully.' : 'Discount policy created successfully.'
      );
      resetForm();
    } catch (err) {
      showError('Error', 'Failed to submit discount policy form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dropdown state for fee heads
  const [showHeadsDropdown, setShowHeadsDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showHeadsDropdown) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.feehead-dropdown-root')) setShowHeadsDropdown(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showHeadsDropdown]);

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="policyName" className="text-xs font-medium text-slate-700">Policy Name *</Label>
          <Input
            id="policyName"
            name="policyName"
            value={formData.policyName}
            onChange={handleChange}
            error={formErrors.policyName}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountType" className="text-xs font-medium text-slate-700">Discount Type *</Label>
            <Select value={String(formData.discountType)} onValueChange={value => setFormData({ ...formData, discountType: Number(value) })}>
              <SelectTrigger error={formErrors.discountType}>
                <span>{DISCOUNT_TYPE_OPTIONS.find(opt => opt.value === formData.discountType)?.label || 'Select discount type'}</span>
              </SelectTrigger>
              <SelectContent>
                {DISCOUNT_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discountValue" className="text-xs font-medium text-slate-700">Discount Value</Label>
            <Input
              id="discountValue"
              name="discountValue"
              type="number"
              min={0}
              step="any"
              value={formData.discountValue}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="appliesTo" className="text-xs font-medium text-slate-700">Applies To</Label>
            <Select value={formData.appliesTo} onValueChange={value => {
              setFormData({ ...formData, appliesTo: value });
              if (value !== 'SpecificHeads') setSelectedHeadIds([]);
            }}>
              <SelectTrigger>
                <span>{formData.appliesTo || 'Select applies to'}</span>
              </SelectTrigger>
              <SelectContent>
                {APPLIES_TO_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.appliesTo === 'SpecificHeads' && (
              <div className="mt-2 feehead-dropdown-root">
                <Label className="text-xs font-medium text-slate-700 mb-1">Select Fee Heads</Label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full text-left border rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
                    onClick={() => setShowHeadsDropdown(v => !v)}
                  >
                    {selectedHeadIds.length === 0
                      ? <span className="text-slate-400">Select fee heads...</span>
                      : <span className="flex flex-wrap gap-1">
                          {feeheads.filter(fh => selectedHeadIds.includes(String(fh.id))).map(fh => (
                            <span key={fh.id} className="bg-slate-100 text-slate-700 rounded px-2 py-0.5 text-xs">{fh.FeeHeadName}</span>
                          ))}
                        </span>
                    }
                  </button>
                  {showHeadsDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                      {feeheadsLoading ? (
                        <div className="text-xs text-slate-500 px-3 py-2">Loading fee heads...</div>
                      ) : feeheads.length === 0 ? (
                        <div className="text-xs text-slate-500 px-3 py-2">No fee heads found.</div>
                      ) : (
                        feeheads.map(fh => (
                          <label key={fh.id} className="flex items-center gap-2 px-3 py-1 text-xs cursor-pointer hover:bg-slate-100 text-slate-700">
                            <input
                              type="checkbox"
                              checked={selectedHeadIds.includes(String(fh.id))}
                              onChange={() => handleHeadSelect(String(fh.id))}
                              className="accent-indigo-600"
                            />
                            {fh.FeeHeadName}
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formErrors.appliesToDetails && <div className="text-xs text-red-500 mt-1">{formErrors.appliesToDetails}</div>}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="maxLimit" className="text-xs font-medium text-slate-700">Max Limit</Label>
            <Input
              id="maxLimit"
              name="maxLimit"
              type="number"
              min={0}
              step="any"
              value={formData.maxLimit}
              onChange={handleChange}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
        </div>

        {/* Eligibility Criteria JSON */}
        <div>
          <Label htmlFor="eligibilityCriteria" className="text-xs font-medium text-slate-700">Eligibility Criteria (JSON)</Label>
          <Textarea
            id="eligibilityCriteria"
            name="eligibilityCriteria"
            value={eligibilityJson}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEligibilityJson(e.target.value)}
            rows={4}
            className="mt-1 text-xs font-mono text-slate-700 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {formErrors.eligibilityCriteria && <div className="text-xs text-red-500 mt-1">{formErrors.eligibilityCriteria}</div>}
        </div>

        {/* Effective From / To */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="effectiveFrom" className="text-xs font-medium text-slate-700">Effective From</Label>
            <Input
              id="effectiveFrom"
              name="effectiveFrom"
              type="date"
              value={formData.effectiveFrom ? formData.effectiveFrom.slice(0, 10) : ''}
              onChange={e => setFormData({ ...formData, effectiveFrom: e.target.value ? new Date(e.target.value).toISOString() : '' })}
              className="mt-1 text-sm text-slate-900"
            />
          </div>
          <div>
            <Label htmlFor="effectiveTo" className="text-xs font-medium text-slate-700">Effective To</Label>
            <Input
              id="effectiveTo"
              name="effectiveTo"
              type="date"
              value={formData.effectiveTo ? formData.effectiveTo.slice(0, 10) : ''}
              onChange={e => setFormData({ ...formData, effectiveTo: e.target.value ? new Date(e.target.value).toISOString() : '' })}
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

export default DiscountpolicyForm;