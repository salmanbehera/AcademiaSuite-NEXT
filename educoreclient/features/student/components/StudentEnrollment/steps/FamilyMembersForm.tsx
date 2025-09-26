import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/RadixUI/input';

export interface FamilyMember {
  name: string;
  relationship: string;
  mobile: string;
  occupation: string;
  parentAadhaar: string;
}

const relationshipOptions = ['Father', 'Mother', 'Guardian', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'];

export default function FamilyMembersForm() {
  const { register, getValues, setValue } = useFormContext();
  const data: FamilyMember[] = getValues('familyMembers') || [];

  const handleField = (idx: number, field: keyof FamilyMember, value: string) => {
    const updated = data.map((member: FamilyMember, i: number) => i === idx ? { ...member, [field]: value } : member);
    setValue('familyMembers', updated);
  };
  const handleAddMember = () => {
    setValue('familyMembers', [
      ...data,
      { name: '', relationship: '', mobile: '', occupation: '', parentAadhaar: '' },
    ]);
  };
  const handleRemoveMember = (idx: number) => {
    setValue('familyMembers', data.filter((_: FamilyMember, i: number) => i !== idx));
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Family Members</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-slate-200 rounded-xl">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Name</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Relationship</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Mobile</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Occupation</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-slate-800">Aadhaar</th>
              <th className="px-3 py-2 text-center font-semibold text-xs text-slate-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-600 py-4">No family members added.</td></tr>
            )}
            {data.map((member: FamilyMember, idx: number) => (
              <tr key={idx}>
                <td className="px-2 py-1.5 text-slate-800">
                  <Input className="w-full px-2 py-1.5 text-sm" value={member.name} onChange={e => handleField(idx, 'name', e.target.value)} placeholder="Name" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <select className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white" value={member.relationship} onChange={e => handleField(idx, 'relationship', e.target.value)}>
                    <option value="">Select</option>
                    {relationshipOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <Input className="w-full px-2 py-1.5 text-sm" value={member.mobile} onChange={e => handleField(idx, 'mobile', e.target.value)} placeholder="Mobile" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <Input className="w-full px-2 py-1.5 text-sm" value={member.occupation} onChange={e => handleField(idx, 'occupation', e.target.value)} placeholder="Occupation" />
                </td>
                <td className="px-2 py-1.5 text-slate-800">
                  <Input className="w-full px-2 py-1.5 text-sm" value={member.parentAadhaar} onChange={e => handleField(idx, 'parentAadhaar', e.target.value)} placeholder="Aadhaar" />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600" onClick={() => handleRemoveMember(idx)} title="Delete">
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
        <Button type="button" variant="secondary" size="sm" onClick={handleAddMember}>
          + Add Family Member
        </Button>
      </div>
    </div>
  );
}
