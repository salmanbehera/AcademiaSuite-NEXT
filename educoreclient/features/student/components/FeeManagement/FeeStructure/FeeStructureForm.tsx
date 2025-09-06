
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { formatDateForInput } from '@/lib/utils';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from "@/app/components/ui/Button";
import { Input } from '@/app/components/RadixUI/input';
import { Label } from '@/app/components/RadixUI/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { useToast } from '@/app/components/ui/ToastProvider';
import { FEE_FREQUENCY_OPTIONS, FEESTRUCTURE_DEFAULTS } from "@/features/student/Constants/FeeManagement/feestructure.constants";
import { validateFeeStructure } from '@/features/student/Validations/FeeManagement/feestructureschema';
import { FeeStructureDto, FeeStructureDetail } from "@/features/student/types/FeeManagement/feestructureType";
import { useFeegroup } from '@/features/student/hooks/FeeManagement/useFeegroup';
import { useClasses } from '@/features/student/hooks/master/useClasses';
import { useSemister } from '@/features/student/hooks/master/useSemister';
import { useFeehead } from '@/features/student/hooks/FeeManagement/useFeehead';
import { useFeestructure } from '@/features/student/hooks/FeeManagement/useFeestructure';
import { ClassFeeMapping } from '@/features/student/types/FeeManagement/classfeemappingtype';
import { FeeHead } from '@/features/student/types/FeeManagement/feeheadType';
import { useAcademicYears } from '@/features/Administration/hooks/useAcademicYears';

type FeeStructureFormProps = {
  onSubmit: (data: FeeStructureDto) => void | Promise<void>;
  defaultValues?: Partial<FeeStructureDto>;
  onCancel?: () => void;
};

function getInitialFormData(defaultValues?: Partial<FeeStructureDto>) {
  if (defaultValues && defaultValues.id) {
    return {
      ...FEESTRUCTURE_DEFAULTS,
      ...defaultValues,
      academicYearId: defaultValues.academicYearId || '',
      classId: defaultValues.classId || '',
    };
  } else {
    return { ...FEESTRUCTURE_DEFAULTS, academicYearId: '', classId: '' };
  }
}

const FeeStructureForm: React.FC<FeeStructureFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const { organizationId, branchId } = useOrganization();
  const [formData, setFormData] = useState<FeeStructureDto>(() => getInitialFormData(defaultValues));

  // Debug: Log incoming defaultValues and computed formData

  // Sync formData with defaultValues when editing a new record
  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dropdown options
  const { feegroups } = useFeegroup();
  const { classes } = useClasses();
  const { semisters } = useSemister();
  const { academicYears } = useAcademicYears();
  
  // Use new service-based hook
  const { fetchFeeHeadsByClass } = useFeestructure();

  // State for mapped fee heads
  const [mappedFeeHeads, setMappedFeeHeads] = useState<any[]>([]);
  const [loadingMappedFeeHeads, setLoadingMappedFeeHeads] = useState(false);

  // Move useRef to the top level
  const isMounted = useRef(true);

  // Fetch fee head master and class fee mapping dynamically
  const { feeheads, loading: feeHeadsLoading } = useFeehead();

  // Add a state for groupedFeeHeads
  const [groupedFeeHeads, setGroupedFeeHeads] = useState<Record<string, any[]>>({});


  // Remove details state; details will be built from mappedFeeHeads on submit


  // No need to sync details from defaultValues; mappedFeeHeads is the source of truth

  // Ensure isMounted.current is true on mount and false on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Create a stable debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);


  // Fetch mapped fee heads only in create mode
  useEffect(() => {
    if (!formData.classId || !formData.academicYearId || !organizationId || !branchId || !isMounted.current) {
      setMappedFeeHeads([]);
      return;
    }
    // Only fetch from DB if creating new (no defaultValues?.id)
    if (!defaultValues?.id) {
      setLoadingMappedFeeHeads(true);
      const fetchData = async () => {
        try {
          const feeHeadsResponse = await fetchFeeHeadsByClass({
            organizationId,
            branchId,
            ClassId: formData.classId,
            AcademicYearId: formData.academicYearId,
          } as any);
          const feeHeads = feeHeadsResponse ?? [];
          if (isMounted.current) {
            const mapped = feeHeads.map((fh: any) => ({
              feeHeadId: fh.feeHeadId,
              feeHeadName: fh.feeHeadName,
              feeAmount: 0, // Always 0 for new
              feeFrequency: fh.feeFrequency,
            }));
            setMappedFeeHeads(mapped);
          }
        } catch (e) {
          if (isMounted.current) setMappedFeeHeads([]);
        } finally {
          if (isMounted.current) setLoadingMappedFeeHeads(false);
        }
      };
      fetchData();
    } else {
      // In edit mode, use details from defaultValues
      if (defaultValues.details && Array.isArray(defaultValues.details)) {
        setMappedFeeHeads(defaultValues.details.map((d: any) => ({
          feeHeadId: d.feeHeadId,
          feeHeadName: d.feeHeadName,
          feeAmount: d.feeAmount,
          feeFrequency: d.feeFrequency,
        })));
      }
    }
  }, [formData.classId, formData.academicYearId, organizationId, branchId, defaultValues]);

  // Update groupedFeeHeads whenever mappedFeeHeads changes
  useEffect(() => {
    if (!isMounted.current) return;
    if (!formData.classId || !formData.academicYearId || !mappedFeeHeads.length) {
      setGroupedFeeHeads({});
      return;
    }
    // Group by feeFrequency
    const grouped: Record<string, any[]> = {};
    mappedFeeHeads.forEach((mappedHead) => {
      const frequency = mappedHead.feeFrequency || 'Other';
      if (!grouped[frequency]) grouped[frequency] = [];
      grouped[frequency].push({
        id: mappedHead.feeHeadId,
        feeHeadName: mappedHead.feeHeadName,
        feeAmount: mappedHead.feeAmount,
      });
    });
    // Debug: log the grouped fee heads
    setGroupedFeeHeads(grouped);
  }, [mappedFeeHeads, formData.classId, formData.academicYearId]);

  // Header field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // handleAddDetail is not needed anymore

  const handleAmountChange = useCallback((headId: string, value: number) => {
    setMappedFeeHeads(prev => prev.map(mappedHead =>
      mappedHead.feeHeadId === headId ? { ...mappedHead, feeAmount: value } : mappedHead
    ));
  }, []);

  // Validation and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build details from mappedFeeHeads, supporting all frequencies
    const allDetails: FeeStructureDetail[] = mappedFeeHeads
      .filter(d => d.feeHeadId && d.feeAmount > 0)
      .map(d => ({
        feeHeadId: d.feeHeadId,
        feeAmount: d.feeAmount,
        feeFrequency: d.feeFrequency,
      }));

    const apiData: FeeStructureDto = {
      ...formData,
      organizationId,
      branchId,
      isActive: true,
      details: allDetails,
    };

    // Zod validation
    const result = validateFeeStructure(apiData);
    if (!result.success) {
      // Map Zod errors to field errors
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(apiData);
      showSuccess(
        defaultValues && defaultValues.id ? 'Fee Structure Updated' : 'Fee Structure Created',
        defaultValues && defaultValues.id ? 'Fee structure updated successfully.' : 'Fee structure created successfully.'
      );

      if (!defaultValues?.id) {
        setFormData(getInitialFormData());
        setMappedFeeHeads([]);
      }

      setFormErrors({});
    } catch (err) {
      showError('Error', 'Failed to submit fee structure form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render
  // ...existing code...

  return (
    <form onSubmit={handleSubmit} className="px-16 py-8 mt-6 bg-white rounded-lg shadow-md space-y-6 w-full">
      {/* Move Academic Year and Class fields to the top */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="academicYearId" className="text-xs font-medium text-slate-700">Academic Year *</Label>
          <Select
            value={formData.academicYearId}
            onValueChange={(val) => handleSelectChange('academicYearId', val)}
          >
            <SelectTrigger error={formErrors.academicYearId}>
              <span>{academicYears.find((y: { id: string; yearCode: string }) => y.id === formData.academicYearId)?.yearCode || 'Select Academic Year'}</span>
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((y: { id: string; yearCode: string }) => (
                <SelectItem key={y.id} value={y.id}>{y.yearCode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="classId" className="text-xs font-medium text-slate-700">Class *</Label>
          <Select
            value={formData.classId}
            onValueChange={(val) => handleSelectChange('classId', val)}
          >
            <SelectTrigger error={formErrors.classId}>
              <span>{classes.find((c) => c.id === formData.classId)?.className || 'Select Class'}</span>
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.className}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Header Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="semesterId" className="text-xs font-medium text-slate-700">Semester *</Label>
          <Select 
            value={formData.semesterId} 
            onValueChange={val => handleSelectChange('semesterId', val)}
          >
            <SelectTrigger error={formErrors.semesterId}>
              <span>{semisters.find(s => s.id === formData.semesterId)?.semesterName || 'Select Semester'}</span>
            </SelectTrigger>
            <SelectContent>
              {semisters.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.semesterName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="feeGroupId" className="text-xs font-medium text-slate-700">Fee Group *</Label>
          <Select 
            value={formData.feeGroupId} 
            onValueChange={val => handleSelectChange('feeGroupId', val)}
          >
            <SelectTrigger error={formErrors.feeGroupId}>
              <span>{feegroups.find(g => g.id === formData.feeGroupId)?.FeeGroupName || 'Select Fee Group'}</span>
            </SelectTrigger>
            <SelectContent>
              {feegroups.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.FeeGroupName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate" className="text-xs font-medium text-slate-700">Start Date *</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formatDateForInput(formData.startDate)}
            onChange={handleChange}
            error={formErrors.startDate}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-xs font-medium text-slate-700">End Date *</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formatDateForInput(formData.endDate)}
            onChange={handleChange}
            error={formErrors.endDate}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
      </div>

      {/* Frequency Cards - Dynamically grouped fee heads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loadingMappedFeeHeads ? (
          <div className="text-slate-500 text-sm">Loading fee heads...</div>
        ) : !formData.classId || !formData.academicYearId ? (
          <div className="text-slate-500 text-sm">Select Academic Year and Class to view fee heads.</div>
        ) : (
          Object.keys(groupedFeeHeads).length === 0 ? (
            <div className="text-slate-500 text-sm">No fee heads mapped for this class and academic year.</div>
          ) : (
            Object.entries(groupedFeeHeads).map(([frequency, heads]) => (
              <div key={frequency} className="bg-white border border-slate-200 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-700">{frequency} Fee Heads</h3>
                </div>
                <div className="w-full border-t border-slate-200">
                  <div className="grid grid-cols-2 py-2 font-medium text-slate-600">
                    <span>Fee Head</span>
                    <span>Amount</span>
                  </div>
                  {heads.map((h) => (
                    <div key={h.id} className="grid grid-cols-2 py-2 items-center border-t border-slate-200">
                      <span className="text-slate-800 text-sm font-medium">{h.feeHeadName}</span>
                      <Input
                        type="number"
                        min={0}
                        value={h.feeAmount}
                        onChange={(e) => handleAmountChange(h.id, Number(e.target.value))}
                        className="w-28 border border-slate-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Amount"
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 py-2 items-center border-t border-slate-200 font-semibold text-slate-700">
                    <span>Total</span>
                    <span>{heads.reduce((sum, h) => sum + (h.feeAmount || 0), 0)}</span>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (defaultValues?.id) {
              // If editing, reset to original values
              setFormData(getInitialFormData(defaultValues));
            } else {
              // If creating, clear the form
        setFormData(getInitialFormData());
        setMappedFeeHeads([]);
            }
            setFormErrors({});
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

export default FeeStructureForm;