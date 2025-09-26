import React from 'react';
import { useFormContext } from 'react-hook-form';

const bloodGroups = [
  { value: 1, label: 'A+' },
  { value: 2, label: 'A-' },
  { value: 3, label: 'B+' },
  { value: 4, label: 'B-' },
  { value: 5, label: 'O+' },
  { value: 6, label: 'O-' },
  { value: 7, label: 'AB+' },
  { value: 8, label: 'AB-' },
];

export default function HealthRecordForm() {
  const { register, setValue, watch } = useFormContext();

  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-lg shadow border border-slate-200 py-4 px-4 mb-6" style={{ boxShadow: '0 2px 8px 0 rgba(16,30,54,.08)' }}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            value={watch('bloodGroup') || ''}
            onChange={(e) => setValue('bloodGroup', Number(e.target.value))}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map(bg => (
              <option key={bg.value} value={bg.value}>{bg.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Height (cm)</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('height')}
            placeholder="Enter height in cm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Weight (kg)</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('weight')}
            placeholder="Enter weight in kg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Allergies</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('allergies')}
            placeholder="Enter allergies (if any)"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Medical Conditions</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('medicalConditions')}
            placeholder="Enter medical conditions (if any)"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Contact</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('emergencyContact')}
            placeholder="Enter emergency contact number"
          />
        </div>
      </div>
    </div>
  );
}
