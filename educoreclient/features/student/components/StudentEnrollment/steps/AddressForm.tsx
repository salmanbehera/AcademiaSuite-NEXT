import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import countries from '@/data/countries.json';
import states from '@/data/states.json';
import cities from '@/data/cities.json';

export default function AddressForm() {
  const { register, setValue, watch } = useFormContext();

  // Watch form values
  const country = watch('country');
  const state = watch('state');

  // Memoize filtered states and cities
  const filteredStates = useMemo(() => {
    if (!country) return [];
    return (states as any[]).filter((s) => s.countryId === country);
  }, [country]);

  const filteredCities = useMemo(() => {
    if (!state) return [];
    return (cities as any[]).filter((c) => c.stateId === state);
  }, [state]);

  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-lg shadow border border-slate-200 py-4 px-4 mb-6" style={{ boxShadow: '0 2px 8px 0 rgba(16,30,54,.08)' }}>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Address Line 1</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('addressLine1')}
            placeholder="Enter address line 1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Address Line 2</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('addressLine2')}
            placeholder="Enter address line 2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            value={country || ''}
            onChange={(e) => {
              setValue('country', e.target.value);
              setValue('state', '');
              setValue('city', '');
            }}
          >
            <option value="">Select Country</option>
            {(countries as any[]).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            value={state || ''}
            onChange={(e) => {
              setValue('state', e.target.value);
              setValue('city', '');
            }}
            disabled={!country}
          >
            <option value="">Select State</option>
            {filteredStates.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('city')}
            disabled={!state}
          >
            <option value="">Select City</option>
            {filteredCities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Zip Code</label>
          <input
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white"
            {...register('zipCode')}
            placeholder="Enter zip code"
          />
        </div>
      </div>
    </div>
  );
}
