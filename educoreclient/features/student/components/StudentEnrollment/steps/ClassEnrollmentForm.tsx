import React, { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/app/components/ui/Button";
import { Label } from "@/app/components/RadixUI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/app/components/RadixUI/select";
import { useAcademicYears } from "@/features/Administration/hooks/useAcademicYears";
import { useClasses } from "@/features/student/hooks/master/useClasses";
import { useSections } from "@/features/student/hooks/master/useSections";

interface Props {
  academicYears?: any[];
  classes?: any[];
  sections?: any[];
}

const ClassEnrollmentForm: React.FC<Props> = ({
  academicYears: propAcademicYears,
  classes: propClasses,
  sections: propSections,
}) => {
  const { register, getValues, setValue, watch, control } = useFormContext();
  const data = watch("classEnrollment") || [];

  // Prefer props passed down but fallback to hooks (same as FeeStructureForm)
  const { academicYears: hookAcademicYears } = useAcademicYears();
  const { classes: hookClasses } = useClasses({ autoFetch: true });
  const { sections: hookSections } = useSections({ autoFetch: true });

  const academicYears =
    propAcademicYears && propAcademicYears.length
      ? propAcademicYears
      : hookAcademicYears || [];
  const classes =
    propClasses && propClasses.length ? propClasses : hookClasses || [];
  const sections =
    propSections && propSections.length ? propSections : hookSections || [];

  // Helper renderers to bind Selects to react-hook-form fields
  const getYearValue = (y: any) => (y && (y.id ?? y.value ?? y)) ?? y;
  const getYearLabel = (y: any) =>
    y?.yearCode ?? y?.year ?? y?.name ?? String(y);

  const renderAcademicYear = (field: any) => (
    <Select
      value={field.value || ""}
      onValueChange={(val) => field.onChange(val)}
    >
      <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
        <span>
          {academicYears.find((y: any) => getYearValue(y) === field.value)
            ?.yearCode ??
            academicYears.find((y: any) => getYearValue(y) === field.value)
              ?.year ??
            (field.value ? field.value : "Select Academic Year")}
        </span>
      </SelectTrigger>
      <SelectContent className="text-sm">
        {academicYears.map((year: any) => (
          <SelectItem key={getYearValue(year)} value={getYearValue(year)}>
            {getYearLabel(year)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const getClassValue = (c: any) => (c && (c.id ?? c.value ?? c)) ?? c;
  const getClassLabel = (c: any) =>
    c?.className ?? c?.name ?? c?.label ?? String(c);

  const renderClass = (field: any) => (
    <Select
      value={field.value || ""}
      onValueChange={(val) => field.onChange(val)}
    >
      <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
        <span>
          {classes.find((c: any) => getClassValue(c) === field.value)
            ?.className ??
            classes.find((c: any) => getClassValue(c) === field.value)?.name ??
            (field.value ? field.value : "Select Class")}
        </span>
      </SelectTrigger>
      <SelectContent className="text-sm">
        {classes.map((cls: any) => (
          <SelectItem key={getClassValue(cls)} value={getClassValue(cls)}>
            {getClassLabel(cls)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const getSectionValue = (s: any) => (s && (s.id ?? s.value ?? s)) ?? s;
  const getSectionLabel = (s: any) =>
    s?.sectionName ?? s?.name ?? s?.label ?? String(s);

  const renderSection = (field: any) => (
    <Select
      value={field.value || ""}
      onValueChange={(val) => field.onChange(val)}
    >
      <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
        <span>
          {sections.find((s: any) => getSectionValue(s) === field.value)
            ?.sectionName ??
            sections.find((s: any) => getSectionValue(s) === field.value)
              ?.name ??
            (field.value ? field.value : "Select Section")}
        </span>
      </SelectTrigger>
      <SelectContent className="text-sm">
        {sections.map((sec: any) => (
          <SelectItem key={getSectionValue(sec)} value={getSectionValue(sec)}>
            {getSectionLabel(sec)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Initialize with at least one empty enrollment if none exists
  useEffect(() => {
    if (!data || data.length === 0) {
      setValue("classEnrollment", [
        { academicYear: "", classId: "", sectionId: "" },
      ]);
    }
  }, []);

  const handleAdd = () => {
    setValue("classEnrollment", [
      ...data,
      { academicYear: "", classId: "", sectionId: "" },
    ]);
  };

  const handleRemove = (idx: number) => {
    const updated = data.filter((_: any, i: number) => i !== idx);
    setValue(
      "classEnrollment",
      updated.length > 0
        ? updated
        : [{ academicYear: "", classId: "", sectionId: "" }]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Class Enrollment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign student to class and section
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          + Add Enrollment
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {data.map((enrollment: any, idx: number) => (
          <div
            key={idx}
            className="bg-slate-50 rounded-lg border border-slate-200 p-5 relative"
          >
            {data.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-medium"
              >
                ✕ Remove
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
              {/* Academic Year */}
              <div>
                <Label
                  htmlFor={`classEnrollment.${idx}.academicYear`}
                  className="text-xs font-medium text-slate-700"
                >
                  Academic Year <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name={`classEnrollment.${idx}.academicYear`}
                  render={({ field }) => renderAcademicYear(field)}
                />
              </div>

              {/* Class */}
              <div>
                <Label
                  htmlFor={`classEnrollment.${idx}.classId`}
                  className="text-xs font-medium text-slate-700"
                >
                  Class <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name={`classEnrollment.${idx}.classId`}
                  render={({ field }) => renderClass(field)}
                />
              </div>

              {/* Section */}
              <div>
                <Label
                  htmlFor={`classEnrollment.${idx}.sectionId`}
                  className="text-xs font-medium text-slate-700"
                >
                  Section <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name={`classEnrollment.${idx}.sectionId`}
                  render={({ field }) => renderSection(field)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassEnrollmentForm;
