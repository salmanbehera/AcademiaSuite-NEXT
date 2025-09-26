import React from 'react';

export interface AcademicHistory {
  institutionName: string;
  courseName: string;
  startDate: string;
  endDate: string;
  gradeOrPercentage: string;
}

interface AcademicHistoriesFormProps {
  data: AcademicHistory[];
  onChange: (histories: AcademicHistory[]) => void;
}

export default function AcademicHistoriesForm({ data, onChange }: AcademicHistoriesFormProps) {
  const handleField = (idx: number, field: keyof AcademicHistory, value: string) => {
    const updated = data.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    onChange(updated);
  };
  const handleAdd = () => {
    onChange([
      ...data,
      { institutionName: '', courseName: '', startDate: '', endDate: '', gradeOrPercentage: '' },
    ]);
  };
  const handleRemove = (idx: number) => {
    onChange(data.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Academic Histories</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-slate-200 rounded-xl">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Institution Name</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Course Name</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Start Date</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">End Date</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Grade/Percentage</th>
              <th className="px-3 py-2 text-center font-semibold text-xs text-slate-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-600 py-4">No academic histories added.</td></tr>
            )}
            {data.map((item, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1.5 text-slate-800">
                  <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.institutionName} onChange={e => handleField(idx, 'institutionName', e.target.value)} placeholder="Institution Name" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.courseName} onChange={e => handleField(idx, 'courseName', e.target.value)} placeholder="Course Name" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <input type="date" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.startDate ? item.startDate.slice(0,10) : ''} onChange={e => handleField(idx, 'startDate', e.target.value)} placeholder="Start Date" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <input type="date" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.endDate ? item.endDate.slice(0,10) : ''} onChange={e => handleField(idx, 'endDate', e.target.value)} placeholder="End Date" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <input className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 bg-white" value={item.gradeOrPercentage} onChange={e => handleField(idx, 'gradeOrPercentage', e.target.value)} placeholder="Grade/Percentage" />
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
          + Add Academic History
        </button>
      </div>
    </div>
  );
}
