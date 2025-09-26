import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function TransportDetailsForm() {
  const { register } = useFormContext();

  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-lg shadow border border-slate-200 py-4 px-4 mb-6" style={{ boxShadow: '0 2px 8px 0 rgba(16,30,54,.08)' }}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Transport Mode</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('transportMode')}
            placeholder="Enter transport mode"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Route Number</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('routeNumber')}
            placeholder="Enter route number"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Pickup Point</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('pickupPoint')}
            placeholder="Enter pickup point"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Drop Point</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('dropPoint')}
            placeholder="Enter drop point"
          />
        </div>
      </div>
    </div>
  );
}
