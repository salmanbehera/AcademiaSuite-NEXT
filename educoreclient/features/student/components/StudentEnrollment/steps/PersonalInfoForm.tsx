import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/app/components/RadixUI/input';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/RadixUI/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/app/components/RadixUI/select';
import { useAcademicYears } from '@/features/Administration/hooks/useAcademicYears';
import { useStudentCategories } from '@/features/student/hooks/master/useStudentCategories';
import { Gender, GenderLabels } from '@/features/student/enum/gender.enum';
import { BloodGroup, BloodGroupLabels } from '@/features/student/enum/bloodgroup.enum';

export default function PersonalInfoForm() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  // Academic Year options
  const { academicYears, loading: loadingYears } = useAcademicYears();
  const currentActiveYear = academicYears.find((y: any) => y.status === 'Active' && y.isCurrentYear);

  // Student Category options
  const { studentCategories, loading: loadingCategories } = useStudentCategories();

  // Watch form values
  const admissionDate = watch('admissionDate');
  const academicYearId = watch('academicYearId');
  const studentCategory = watch('studentCategory');

  React.useEffect(() => {
    if (!admissionDate) {
      const today = new Date().toISOString().slice(0, 10);
      setValue('admissionDate', today);
    }
  }, [admissionDate, setValue]);

  React.useEffect(() => {
    if (!academicYearId && currentActiveYear) {
      setValue('academicYearId', currentActiveYear.id);
    }
  }, [academicYearId, currentActiveYear, setValue]);

  return (
    <form className="p-8 bg-white rounded-2xl shadow-xl space-y-8 w-full border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Enrollment - Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Year */}
        <div>
          <Label htmlFor="academicYearId" className="text-xs">Academic Year</Label>
          <Select
            value={academicYearId || ''}
            onValueChange={(val) => setValue('academicYearId', val)}
            disabled={loadingYears}
          >
            <SelectTrigger className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white">
              <span>{currentActiveYear?.yearCode || 'No Active Academic Year'}</span>
            </SelectTrigger>
            <SelectContent className="text-sm">
              {currentActiveYear && (
                <SelectItem key={currentActiveYear.id} value={currentActiveYear.id}>{currentActiveYear.yearCode}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        {/* Admission Number */}
        <div>
          <Label htmlFor="admissionNumber">Admission Number</Label>
          <Input id="admissionNumber" {...register('admissionNumber')} className="mt-1 text-sm text-slate-900" />
          {errors.admissionNumber && <span className="text-red-500 text-xs">{String(errors.admissionNumber.message)}</span>}
        </div>
        {/* Admission Date */}
        <div>
          <Label htmlFor="admissionDate">Admission Date</Label>
          <Input
            id="admissionDate"
            type="date"
            {...register('admissionDate')}
            className="mt-1 text-sm text-slate-900"
          />
          {errors.admissionDate && <span className="text-red-500 text-xs">{String(errors.admissionDate.message)}</span>}
        </div>
        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} className="mt-1 text-sm text-slate-900" />
          {errors.name && <span className="text-red-500 text-xs">{String(errors.name.message)}</span>}
        </div>
        {/* Roll Number */}
        <div>
          <Label htmlFor="rollNumber">Roll Number</Label>
          <Input id="rollNumber" {...register('rollNumber')} className="mt-1 text-sm text-slate-900" />
          {errors.rollNumber && <span className="text-red-500 text-xs">{String(errors.rollNumber.message)}</span>}
        </div>
        {/* Student Category */}
        <div>
          <Label htmlFor="studentCategory">Student Category</Label>
          <Select
            value={studentCategory || ''}
            onValueChange={(val) => setValue('studentCategory', val)}
            disabled={loadingCategories}
          >
            <SelectTrigger className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white">
              <span>{studentCategories.find((c: any) => c.id === studentCategory)?.categoryName || 'Select Category'}</span>
            </SelectTrigger>
            <SelectContent className="text-sm">
              {studentCategories.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.categoryName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Enquiry Number */}
        <div>
          <Label htmlFor="enquiryNumber">Enquiry Number</Label>
          <Input id="enquiryNumber" {...register('enquiryNumber')} className="mt-1 text-sm text-slate-900" />
        </div>
        {/* Medium */}
        <div>
          <Label htmlFor="medium">Medium</Label>
          <Input id="medium" {...register('medium')} placeholder="e.g. English" className="mt-1 text-sm text-slate-900" />
        </div>
        {/* Stream */}
        <div>
          <Label htmlFor="stream">Stream</Label>
          <Input id="stream" {...register('stream')} placeholder="e.g. Science" className="mt-1 text-sm text-slate-900" />
        </div>
        {/* Date of Birth */}
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className="mt-1 text-sm text-slate-900"
          />
        </div>
        {/* Gender */}
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={watch('gender')?.toString() || ''}
            onValueChange={val => setValue('gender', Number(val))}
          >
            <SelectTrigger className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white">
              <span>{GenderLabels[watch('gender') as Gender] || 'Select Gender'}</span>
            </SelectTrigger>
            <SelectContent className="text-sm">
              {Object.values(Gender).map((g) => (
                <SelectItem key={g} value={g.toString()}>{GenderLabels[g as Gender]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Mobile */}
        <div>
          <Label htmlFor="mobile">Mobile</Label>
          <Input id="mobile" {...register('mobile')} className="mt-1 text-sm text-slate-900" />
        </div>
        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register('email')} className="mt-1 text-sm text-slate-900" />
        </div>
        {/* Blood Group */}
        <div>
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Select
            value={watch('bloodGroup')?.toString() || ''}
            onValueChange={val => setValue('bloodGroup', Number(val))}
          >
            <SelectTrigger className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white">
              <span>{BloodGroupLabels[watch('bloodGroup') as BloodGroup] || 'Select Blood Group'}</span>
            </SelectTrigger>
            <SelectContent className="text-sm">
              {Object.values(BloodGroup)
                .filter((bg) => typeof bg === 'number')
                .map((bg) => (
                  <SelectItem key={bg} value={bg.toString()}>{BloodGroupLabels[bg as BloodGroup]}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {/* Transfer Certificate No */}
        <div>
          <Label htmlFor="transferCertificateNo">Transfer Certificate No</Label>
          <Input id="transferCertificateNo" {...register('transferCertificateNo')} className="mt-1 text-sm text-slate-900" />
        </div>
        {/* Student Photo Upload */}
        <div className="flex flex-col items-center justify-center">
          <Label htmlFor="studentPhoto">Student Photo</Label>
          <Input id="studentPhoto" name="studentPhoto" type="file" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                setValue('studentPhoto', file);
                setValue('studentPhotoPreview', ev.target?.result);
              };
              reader.readAsDataURL(file);
            } else {
              setValue('studentPhoto', null);
              setValue('studentPhotoPreview', null);
            }
          }} className="mt-1 text-sm text-slate-900" />
          {watch('studentPhotoPreview') && (
            <img src={watch('studentPhotoPreview')} alt="Student Photo Preview" className="mt-2 w-24 h-24 object-cover rounded-full border-2 border-blue-400 shadow" />
          )}
        </div>
        {/* Student Signature Upload */}
        <div className="flex flex-col items-center justify-center">
          <Label htmlFor="studentSignature">Student Signature</Label>
          <Input id="studentSignature" name="studentSignature" type="file" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                setValue('studentSignature', file);
                setValue('studentSignaturePreview', ev.target?.result);
              };
              reader.readAsDataURL(file);
            } else {
              setValue('studentSignature', null);
              setValue('studentSignaturePreview', null);
            }
          }} className="mt-1 text-sm text-slate-900" />
          {watch('studentSignaturePreview') && (
            <img src={watch('studentSignaturePreview')} alt="Student Signature Preview" className="mt-2 w-36 h-12 object-contain rounded border bg-white shadow" />
          )}
        </div>
        {/* Student Barcode */}
        <div>
          <Label htmlFor="studentBarcode">Student Barcode</Label>
          <Input id="studentBarcode" {...register('studentBarcode')} className="mt-1 text-sm text-slate-900" />
        </div>
      </div>
  {/* <div className="flex justify-end space-x-2 pt-6 border-t border-slate-200/60">
        <Button type="button" variant="secondary" size="sm" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} loading={isSubmitting}>
          Save & Next
        </Button>
      </div> */}
    </form>
  );
}
