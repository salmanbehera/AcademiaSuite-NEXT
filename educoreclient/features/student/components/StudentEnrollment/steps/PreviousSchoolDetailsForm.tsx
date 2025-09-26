import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function PreviousSchoolDetailsForm() {
  const { register } = useFormContext();

  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-lg shadow border border-slate-200 py-4 px-4 mb-6" style={{ boxShadow: '0 2px 8px 0 rgba(16,30,54,.08)' }}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">School Name</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('schoolName')}
            placeholder="Enter previous school name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">School Board</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('schoolBoard')}
            placeholder="Enter school board (e.g. CBSE, ICSE)"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Percentage</label>
          <input
            type="number"
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('percentage')}
            placeholder="Enter percentage"
            min="0"
            max="100"
          />
        </div>
      </div>
    </div>
  );
}
