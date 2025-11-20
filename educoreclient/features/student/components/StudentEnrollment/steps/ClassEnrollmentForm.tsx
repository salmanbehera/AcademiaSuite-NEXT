import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/app/components/ui/Button";
import { Label } from "@/app/components/RadixUI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/app/components/RadixUI/select";

interface Props {
  academicYears: string[];
  classes: { id: string; name: string }[];
  sections: { id: string; name: string }[];
}

const ClassEnrollmentForm: React.FC<Props> = ({
  academicYears,
  classes,
  sections,
}) => {
  const { register, getValues, setValue, watch } = useFormContext();
  const data = watch("classEnrollment") || [];

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
                <Select
                  value={watch(`classEnrollment.${idx}.academicYear`) || ""}
                  onValueChange={(val) =>
                    setValue(`classEnrollment.${idx}.academicYear`, val)
                  }
                >
                  <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
                    <span>
                      {watch(`classEnrollment.${idx}.academicYear`) ||
                        "Select Academic Year"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="text-sm">
                    {academicYears.map((year: any) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class */}
              <div>
                <Label
                  htmlFor={`classEnrollment.${idx}.classId`}
                  className="text-xs font-medium text-slate-700"
                >
                  Class <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch(`classEnrollment.${idx}.classId`) || ""}
                  onValueChange={(val) =>
                    setValue(`classEnrollment.${idx}.classId`, val)
                  }
                >
                  <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
                    <span>
                      {classes.find(
                        (c: any) =>
                          c.id === watch(`classEnrollment.${idx}.classId`)
                      )?.name || "Select Class"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="text-sm">
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section */}
              <div>
                <Label
                  htmlFor={`classEnrollment.${idx}.sectionId`}
                  className="text-xs font-medium text-slate-700"
                >
                  Section <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch(`classEnrollment.${idx}.sectionId`) || ""}
                  onValueChange={(val) =>
                    setValue(`classEnrollment.${idx}.sectionId`, val)
                  }
                >
                  <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
                    <span>
                      {sections.find(
                        (s: any) =>
                          s.id === watch(`classEnrollment.${idx}.sectionId`)
                      )?.name || "Select Section"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="text-sm">
                    {sections.map((sec: any) => (
                      <SelectItem key={sec.id} value={sec.id}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassEnrollmentForm;
