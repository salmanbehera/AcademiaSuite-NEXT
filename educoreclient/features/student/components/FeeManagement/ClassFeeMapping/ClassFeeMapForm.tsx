import React, { useState, useEffect } from "react";
import { useAcademicYears } from '@/features/Administration/hooks/useAcademicYears';
import { useClasses } from '@/features/student/hooks/master/useClasses';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/RadixUI/label';
import { Loader } from '@/app/components/ui/Loader';
import { useFeehead } from '@/features/student/hooks/FeeManagement/useFeehead';
import { Checkbox } from '@/app/components/RadixUI/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { useClassFeeMapping } from '@/features/student/hooks/FeeManagement/useclassfeemapping';

interface ClassFeeMapFormProps {
  onSubmit: (data: {
    academicYearId: string;
    classId: string;
    feeHeadIds: string[];
    isEditing?: boolean;
    id?: string | null;
  }) => void;
  defaultValues?: {
    academicYearId: string;
    classId: string;
    feeHeadIds: string[];
  };
  onCancel?: () => void;
}


export const ClassFeeMapForm: React.FC<ClassFeeMapFormProps> = ({ onSubmit, defaultValues, onCancel }) => {
  // Track if we are editing an existing mapping
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { academicYears, loading: loadingAcademicYears } = useAcademicYears();
  const { classes, loading: loadingClasses } = useClasses();
  const { feeheads, loading: loadingFeeheads } = useFeehead();
  const { fetchFeeHeads } = useClassFeeMapping();

  // Find the current year (first match)
  const currentYear = academicYears.find(year => year.isCurrentYear === true);
  const [formData, setFormData] = useState(() => ({
    academicYearId: defaultValues?.academicYearId || currentYear?.id || '',
    classId: defaultValues?.classId || '',
    feeHeadIds: defaultValues?.feeHeadIds || [],
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mappedFeeHeads, setMappedFeeHeads] = useState<Array<{ feeHeadId: string; feeHeadName: string; checked: boolean }> | null>(null);
  const [loadingMappedFeeHeads, setLoadingMappedFeeHeads] = useState(false);

  // Fetch mapped fee heads when academic year or class changes
  useEffect(() => {
    const fetchMappedFeeHeads = async () => {
      if (formData.academicYearId && formData.classId) {
        setLoadingMappedFeeHeads(true);
        try {
          // Use org/branch from first feehead if available, else empty string
          const response = await fetchFeeHeads({
            organizationId: feeheads[0]?.organizationId || '',
            branchId: feeheads[0]?.branchId || '',
            AcademicYearId: formData.academicYearId,
            ClassId: formData.classId,
          });
          setMappedFeeHeads(response);
          setFormData((prev) => ({
            ...prev,
            feeHeadIds: response.filter(fh => fh.checked).map(fh => fh.feeHeadId),
          }));
          // Check if any fee head is mapped (i.e., mapping exists in db)
          if (response.some(fh => fh.checked)) {
            setIsEditing(true);
            // If you have mapping id, set it here: setEditingId(...)
          } else {
            setIsEditing(false);
            setEditingId(null);
          }
        } catch (e) {
          setMappedFeeHeads([]);
          setFormData((prev) => ({ ...prev, feeHeadIds: [] }));
          setIsEditing(false);
          setEditingId(null);
        } finally {
          setLoadingMappedFeeHeads(false);
        }
      } else {
        setMappedFeeHeads(null);
        setFormData((prev) => ({ ...prev, feeHeadIds: [] }));
        setIsEditing(false);
        setEditingId(null);
      }
    };
    fetchMappedFeeHeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.academicYearId, formData.classId]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (feeHeadId: string) => {
    setFormData((prev) => {
      const feeHeadIds = prev.feeHeadIds.includes(feeHeadId)
        ? prev.feeHeadIds.filter((id) => id !== feeHeadId)
        : [...prev.feeHeadIds, feeHeadId];
      return { ...prev, feeHeadIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        // If editing, pass an extra flag or id if needed
        await onSubmit({ ...formData, isEditing: true, id: editingId });
      } else {
        await onSubmit({ ...formData, isEditing: false });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const academicYearOptions = academicYears
    .filter(year => year.isCurrentYear === true && String(year.status).toLowerCase() === 'active')
    .map(year => ({ value: year.id, label: year.yearCode }));
  const classOptions = classes.map(cls => ({ value: cls.id, label: cls.className }));

  // Use mappedFeeHeads if available, else fallback to all feeheads
  const feeHeadOptions = mappedFeeHeads
    ? mappedFeeHeads.map(fh => ({
        value: fh.feeHeadId,
        label: fh.feeHeadName,
      }))
    : feeheads.map(feeHead => ({
        value: feeHead.id,
        label: `${feeHead.FeeHeadCode} - ${feeHead.FeeHeadName} (${feeHead.FeeFrequency})`,
      }));

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-slate-700">Academic Year</Label>
          {loadingAcademicYears ? (
            <Loader variant="dots" size="sm" text="Loading Academic Years..." />
          ) : (
            <Select value={formData.academicYearId} onValueChange={value => handleChange('academicYearId', value)} disabled>
              <SelectTrigger>
                <span>{academicYearOptions.find(opt => opt.value === formData.academicYearId)?.label || 'Select Academic Year'}</span>
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-slate-700">Class</Label>
          {loadingClasses ? (
            <Loader variant="dots" size="sm" text="Loading Classes..." />
          ) : (
            <Select value={formData.classId} onValueChange={value => handleChange('classId', value)}>
              <SelectTrigger>
                <span>{classOptions.find(opt => opt.value === formData.classId)?.label || 'Select Class'}</span>
              </SelectTrigger>
              <SelectContent>
                {classOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-slate-700">Fee Heads</Label>
          {loadingFeeheads || loadingMappedFeeHeads ? (
            <Loader variant="dots" size="sm" text="Loading Fee Heads..." />
          ) : (
            feeHeadOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 py-2">
                <Checkbox
                  id={`feeHead-${option.value}`}
                  checked={formData.feeHeadIds.includes(option.value)}
                  onCheckedChange={() => handleCheckboxChange(option.value)}
                  className="h-5 w-5 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor={`feeHead-${option.value}`} className="text-sm font-medium text-slate-900">
                  {option.label}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
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
          Submit
        </Button>
      </div>
    </form>
  );
};
