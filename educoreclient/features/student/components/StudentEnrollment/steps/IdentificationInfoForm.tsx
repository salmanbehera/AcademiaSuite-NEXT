import React from 'react';
import { useFormContext } from 'react-hook-form';

const CASTE_OPTIONS = [
  'General',
  'OBC',
  'SC',
  'ST',
  'Other',
];
const RELIGION_OPTIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Buddhist',
  'Jain',
  'Other',
];
const NATIONALITY_OPTIONS = [
  'Indian',
  'Other',
];
const MOTHER_TONGUE_OPTIONS = [
  'Hindi',
  'English',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Urdu',
  'Gujarati',
  'Malayalam',
  'Kannada',
  'Odia',
  'Punjabi',
  'Assamese',
  'Maithili',
  'Other',
];

export default function IdentificationInfoForm() {
  const { register } = useFormContext();

  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-lg shadow border border-slate-200 py-4 px-4 mb-6" style={{ boxShadow: '0 2px 8px 0 rgba(16,30,54,.08)' }}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Aadhar Number</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('aadharNumber')}
            placeholder="Enter Aadhar Number"
            maxLength={12}
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">PAN Number</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('panNumber')}
            placeholder="Enter PAN Number"
            maxLength={10}
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Passport Number</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('passportNumber')}
            placeholder="Enter Passport Number"
            maxLength={9}
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Caste</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('caste')}
          >
            <option value="">Select Caste</option>
            {CASTE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Religion</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('religion')}
          >
            <option value="">Select Religion</option>
            {RELIGION_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Nationality</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('nationality')}
          >
            <option value="">Select Nationality</option>
            {NATIONALITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Mother Tongue</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('motherTongue')}
          >
            <option value="">Select Mother Tongue</option>
            {MOTHER_TONGUE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
