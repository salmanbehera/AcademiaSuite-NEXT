import React from 'react';
import { useFormContext } from 'react-hook-form';
 
 
interface Props {
  academicYears: string[];
  classes: { id: string; name: string }[];
  sections: { id: string; name: string }[];
}

const ClassEnrollmentForm: React.FC<Props> = ({ academicYears, classes, sections }) => {
  const { register, getValues, setValue } = useFormContext();
  const data = getValues('classEnrollment') || [];

  const handleChange = (field: string, value: string, idx: number) => {
    const updated = data.map((item: any, i: number) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setValue('classEnrollment', updated);
  };

  return (
    <div className="w-full mt-8">
      {data.map((enrollment: any, idx: number) => (
        <div
          key={idx}
          className="bg-white rounded-lg shadow border border-slate-200 py-5 px-4 mb-6"
          style={{ boxShadow: '0 2px 8px 0 rgba(16,30,54,.08)' }}
        >
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">Academic Year</label>
            <input
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
              {...register(`classEnrollment.${idx}.academicYear`)}
              placeholder="Enter Academic Year"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">Class</label>
            <input
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
              {...register(`classEnrollment.${idx}.classId`)}
              placeholder="Enter Class"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Section</label>
            <input
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
              {...register(`classEnrollment.${idx}.sectionId`)}
              placeholder="Enter Section"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassEnrollmentForm;
