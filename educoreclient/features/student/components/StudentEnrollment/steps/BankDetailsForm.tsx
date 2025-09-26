import React from 'react';
import { useFormContext } from 'react-hook-form';

const accountTypes = [
  'Savings',
  'Current',
  'Salary',
  'NRE',
  'NRO',
  'Other',
];

export default function BankDetailsForm() {
  const { register, setValue, watch } = useFormContext();

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Bank Details</h2>
      <div className="w-full">
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Bank Name</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('bankName')}
            placeholder="Bank Name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Branch</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('bankBranch')}
            placeholder="Branch"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Account Holder Name</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('accountHolderName')}
            placeholder="Account Holder Name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Account Number</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('bankAccountNumber')}
            placeholder="Account Number"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">IFSC Code</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('bankIFSCCode')}
            placeholder="IFSC Code"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Account Type</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            value={watch('accountType') || ''}
            onChange={(e) => setValue('accountType', e.target.value)}
          >
            <option value="">Select Account Type</option>
            {accountTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
