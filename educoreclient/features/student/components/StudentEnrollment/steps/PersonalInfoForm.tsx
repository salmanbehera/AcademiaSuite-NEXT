import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/app/components/RadixUI/input";
import { Button } from "@/app/components/ui/Button";
import { Label } from "@/app/components/RadixUI/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/app/components/RadixUI/select";
import { useAcademicYears } from "@/features/Administration/hooks/useAcademicYears";
import { useStudentCategories } from "@/features/student/hooks/master/useStudentCategories";
import { Gender, GenderLabels } from "@/features/student/enum/gender.enum";
import {
  BloodGroup,
  BloodGroupLabels,
} from "@/features/student/enum/bloodgroup.enum";

export default function PersonalInfoForm() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  // Academic Year options
  const { academicYears, loading: loadingYears } = useAcademicYears();
  const currentActiveYear = academicYears.find(
    (y: any) => y.status === "Active" && y.isCurrentYear
  );

  // Student Category options
  const { studentCategories, loading: loadingCategories } =
    useStudentCategories();

  // Watch form values
  const admissionDate = watch("admissionDate");
  const academicYearId = watch("academicYearId");
  const studentCategory = watch("studentCategory");

  React.useEffect(() => {
    if (!admissionDate) {
      const today = new Date().toISOString().slice(0, 10);
      setValue("admissionDate", today);
    }
  }, [admissionDate, setValue]);

  React.useEffect(() => {
    if (!academicYearId && currentActiveYear) {
      setValue("academicYearId", currentActiveYear.id);
    }
  }, [academicYearId, currentActiveYear, setValue]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Personal Information
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter student's basic and contact details
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Academic Year */}
          <div>
            <Label
              htmlFor="academicYearId"
              className="text-xs font-medium text-slate-700"
            >
              Academic Year <span className="text-red-500">*</span>
            </Label>
            <Select
              value={academicYearId || ""}
              onValueChange={(val) => setValue("academicYearId", val)}
              disabled={loadingYears}
            >
              <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
                <span>
                  {currentActiveYear?.yearCode || "No Active Academic Year"}
                </span>
              </SelectTrigger>
              <SelectContent className="text-sm">
                {currentActiveYear && (
                  <SelectItem
                    key={currentActiveYear.id}
                    value={currentActiveYear.id}
                  >
                    {currentActiveYear.yearCode}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Admission Number */}
          <div>
            <Label
              htmlFor="admissionNumber"
              className="text-xs font-medium text-slate-700"
            >
              Admission Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admissionNumber"
              {...register("admissionNumber")}
              className="mt-1.5 h-9 text-sm"
            />
            {errors.admissionNumber && (
              <p className="text-red-600 text-xs mt-1">
                {String(errors.admissionNumber.message)}
              </p>
            )}
          </div>

          {/* Admission Date */}
          <div>
            <Label
              htmlFor="admissionDate"
              className="text-xs font-medium text-slate-700"
            >
              Admission Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admissionDate"
              type="date"
              {...register("admissionDate")}
              className="mt-1.5 h-9 text-sm"
            />
            {errors.admissionDate && (
              <p className="text-red-600 text-xs mt-1">
                {String(errors.admissionDate.message)}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <Label
              htmlFor="name"
              className="text-xs font-medium text-slate-700"
            >
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">
                {String(errors.name.message)}
              </p>
            )}
          </div>

          {/* Roll Number */}
          <div>
            <Label
              htmlFor="rollNumber"
              className="text-xs font-medium text-slate-700"
            >
              Roll Number
            </Label>
            <Input
              id="rollNumber"
              {...register("rollNumber")}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter roll number"
            />
            {errors.rollNumber && (
              <p className="text-red-600 text-xs mt-1">
                {String(errors.rollNumber.message)}
              </p>
            )}
          </div>

          {/* Student Category */}
          <div>
            <Label
              htmlFor="studentCategory"
              className="text-xs font-medium text-slate-700"
            >
              Student Category
            </Label>
            <Select
              value={studentCategory || ""}
              onValueChange={(val) => setValue("studentCategory", val)}
              disabled={loadingCategories}
            >
              <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
                <span>
                  {studentCategories.find((c: any) => c.id === studentCategory)
                    ?.categoryName || "Select Category"}
                </span>
              </SelectTrigger>
              <SelectContent className="text-sm">
                {studentCategories.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date of Birth */}
          <div>
            <Label
              htmlFor="dateOfBirth"
              className="text-xs font-medium text-slate-700"
            >
              Date of Birth
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth")}
              className="mt-1.5 h-9 text-sm"
            />
          </div>

          {/* Gender */}
          <div>
            <Label
              htmlFor="gender"
              className="text-xs font-medium text-slate-700"
            >
              Gender
            </Label>
            <Select
              value={watch("gender")?.toString() || ""}
              onValueChange={(val) => setValue("gender", Number(val))}
            >
              <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
                <span>
                  {GenderLabels[watch("gender") as Gender] || "Select Gender"}
                </span>
              </SelectTrigger>
              <SelectContent className="text-sm">
                {Object.values(Gender).map((g) => (
                  <SelectItem key={g} value={g.toString()}>
                    {GenderLabels[g as Gender]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Blood Group */}
          <div>
            <Label
              htmlFor="bloodGroup"
              className="text-xs font-medium text-slate-700"
            >
              Blood Group
            </Label>
            <Select
              value={watch("bloodGroup")?.toString() || ""}
              onValueChange={(val) => setValue("bloodGroup", Number(val))}
            >
              <SelectTrigger className="mt-1.5 w-full h-9 border-slate-300 text-sm">
                <span>
                  {BloodGroupLabels[watch("bloodGroup") as BloodGroup] ||
                    "Select Blood Group"}
                </span>
              </SelectTrigger>
              <SelectContent className="text-sm">
                {Object.values(BloodGroup)
                  .filter((bg) => typeof bg === "number")
                  .map((bg) => (
                    <SelectItem key={bg} value={bg.toString()}>
                      {BloodGroupLabels[bg as BloodGroup]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile */}
          <div>
            <Label
              htmlFor="mobile"
              className="text-xs font-medium text-slate-700"
            >
              Mobile Number
            </Label>
            <Input
              id="mobile"
              {...register("mobile")}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter mobile number"
            />
          </div>

          {/* Email */}
          <div>
            <Label
              htmlFor="email"
              className="text-xs font-medium text-slate-700"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter email address"
            />
          </div>

          {/* Enquiry Number */}
          <div>
            <Label
              htmlFor="enquiryNumber"
              className="text-xs font-medium text-slate-700"
            >
              Enquiry Number
            </Label>
            <Input
              id="enquiryNumber"
              {...register("enquiryNumber")}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter enquiry number"
            />
          </div>

          {/* Medium */}
          <div>
            <Label
              htmlFor="medium"
              className="text-xs font-medium text-slate-700"
            >
              Medium
            </Label>
            <Input
              id="medium"
              {...register("medium")}
              placeholder="e.g. English"
              className="mt-1.5 h-9 text-sm"
            />
          </div>

          {/* Stream */}
          <div>
            <Label
              htmlFor="stream"
              className="text-xs font-medium text-slate-700"
            >
              Stream
            </Label>
            <Input
              id="stream"
              {...register("stream")}
              placeholder="e.g. Science"
              className="mt-1.5 h-9 text-sm"
            />
          </div>

          {/* Transfer Certificate No */}
          <div>
            <Label
              htmlFor="transferCertificateNo"
              className="text-xs font-medium text-slate-700"
            >
              Transfer Certificate No
            </Label>
            <Input
              id="transferCertificateNo"
              {...register("transferCertificateNo")}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter TC number"
            />
          </div>

          {/* Student Barcode */}
          <div>
            <Label
              htmlFor="studentBarcode"
              className="text-xs font-medium text-slate-700"
            >
              Student Barcode
            </Label>
            <Input
              id="studentBarcode"
              {...register("studentBarcode")}
              className="mt-1.5 h-9 text-sm"
              placeholder="Enter barcode"
            />
          </div>
        </div>

        {/* Photo & Signature Upload Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Documents & Photos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Photo Upload */}
            <div>
              <Label
                htmlFor="studentPhoto"
                className="text-xs font-medium text-slate-700"
              >
                Student Photo
              </Label>
              <div className="mt-1.5 flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    id="studentPhoto"
                    name="studentPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setValue("studentPhoto", file);
                          setValue("studentPhotoPreview", ev.target?.result);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setValue("studentPhoto", null);
                        setValue("studentPhotoPreview", null);
                      }
                    }}
                    className="h-9 text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    JPG, PNG up to 2MB
                  </p>
                </div>
                {watch("studentPhotoPreview") && (
                  <img
                    src={watch("studentPhotoPreview")}
                    alt="Student Photo"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                  />
                )}
              </div>
            </div>

            {/* Student Signature Upload */}
            <div>
              <Label
                htmlFor="studentSignature"
                className="text-xs font-medium text-slate-700"
              >
                Student Signature
              </Label>
              <div className="mt-1.5 flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    id="studentSignature"
                    name="studentSignature"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setValue("studentSignature", file);
                          setValue(
                            "studentSignaturePreview",
                            ev.target?.result
                          );
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setValue("studentSignature", null);
                        setValue("studentSignaturePreview", null);
                      }
                    }}
                    className="h-9 text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    JPG, PNG up to 1MB
                  </p>
                </div>
                {watch("studentSignaturePreview") && (
                  <img
                    src={watch("studentSignaturePreview")}
                    alt="Student Signature"
                    className="w-32 h-16 object-contain rounded border-2 border-slate-200 bg-white shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
