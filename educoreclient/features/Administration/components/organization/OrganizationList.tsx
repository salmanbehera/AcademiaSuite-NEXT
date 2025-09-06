import React from 'react';
import { OrganizationType } from '@/features/Administration/enum/OrganizationTypeenum';
import { Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Organization } from '@/features/Administration/types/organizationTypes';

type OrganizationListProps = {
  organizations: Organization[];
  loading?: boolean;
  onEdit?: (org: Organization) => void;
  onDelete?: (id: string) => void;
  sortBy?: keyof Organization;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (column: keyof Organization) => void;
};

export default function OrganizationList({ organizations, loading, onEdit, onDelete, sortBy, sortOrder, onSortChange }: OrganizationListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200/60">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('organizationCode')}>
                <span>Code</span>
                {sortBy === 'organizationCode' ? (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} className="opacity-50" />}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('organizationName')}>
                <span>Name</span>
                {sortBy === 'organizationName' ? (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} className="opacity-50" />}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">City</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">State</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Country</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Active</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200/60">
          {loading ? (
            <tr>
              <td colSpan={8}>
                <div className="flex justify-center py-8">Loading...</div>
              </td>
            </tr>
          ) : organizations.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-slate-500 text-xs">No organizations found.</td>
            </tr>
          ) : (
            organizations.map((org) => (
              <tr key={org.organizationCode} className="hover:bg-slate-50/50 transition-colors duration-150">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-xs">{org.organizationCode}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-xs font-medium text-slate-900">{org.organizationCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{org.organizationName}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {OrganizationType[org.organizationType]}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{org.city}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{org.state}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{org.country}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${org.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {org.isActive ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onEdit?.(org)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit Organization"
                    >
                      <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                    </button>
                    <button
                      onClick={() => onDelete?.(org.id)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete Organization"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500 group-hover:text-red-700 transition-colors duration-200" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
