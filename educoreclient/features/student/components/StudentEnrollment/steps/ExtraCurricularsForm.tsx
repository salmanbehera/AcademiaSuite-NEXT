import React from 'react';
import { useFormContext } from 'react-hook-form';

export interface ExtraCurricular {
  activityName: string;
  role: string;
  duration: string;
  achievements: string;
}

export default function ExtraCurricularsForm() {
  const { register, getValues, setValue } = useFormContext();
  const data: ExtraCurricular[] = getValues('extraCurriculars') || [];

  const handleField = (idx: number, field: keyof ExtraCurricular, value: string) => {
    const updated = data.map((item: ExtraCurricular, i: number) => i === idx ? { ...item, [field]: value } : item);
    setValue('extraCurriculars', updated);
  };
  const handleAdd = () => {
    setValue('extraCurriculars', [
      ...data,
      { activityName: '', role: '', duration: '', achievements: '' },
    ]);
  };
  const handleRemove = (idx: number) => {
    setValue('extraCurriculars', data.filter((_: ExtraCurricular, i: number) => i !== idx));
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Extra Curricular Activities</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-slate-200 rounded-xl">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Activity Name</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Role</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Duration</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Achievements</th>
              <th className="px-3 py-2 text-center font-semibold text-xs text-slate-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-600 py-4">No activities added.</td></tr>
            )}
            {data.map((item: ExtraCurricular, idx: number) => (
              <tr key={idx}>
                <td className="px-2 py-1.5 text-slate-800">
                  <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.activityName} onChange={e => handleField(idx, 'activityName', e.target.value)} placeholder="Activity Name" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.role} onChange={e => handleField(idx, 'role', e.target.value)} placeholder="Role" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.duration} onChange={e => handleField(idx, 'duration', e.target.value)} placeholder="Duration" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.achievements} onChange={e => handleField(idx, 'achievements', e.target.value)} placeholder="Achievements" />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600" onClick={() => handleRemove(idx)} title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 font-medium text-sm shadow-sm transition hover:bg-slate-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200" onClick={handleAdd}>
          + Add Activity
        </button>
      </div>
    </div>
  );
}
