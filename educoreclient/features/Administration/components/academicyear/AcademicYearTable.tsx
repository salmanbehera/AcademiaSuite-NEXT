'use client';
import React, { useState, useRef } from 'react';
import { Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Loader } from '@/app/components/ui/Loader';
import { AcademicYear } from '@/features/Administration/types/academicYearTypes';

// Helper to map status text to badge classes
function getStatusBadgeClasses(status: string): string {
  const key = status.toLowerCase();
  if (key === 'active') {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  }
  if (['close', 'closed'].includes(key)) {
    return 'bg-red-100 text-red-800 border border-red-200';
  }
  if (['plan', 'planned'].includes(key)) {
    return 'bg-amber-100 text-amber-800 border border-amber-200';
  }
  // default
  return 'bg-blue-100 text-blue-800 border border-blue-200';
}

type AcademicYearTableProps = {
  years: AcademicYear[];
  loading?: boolean;
  onEdit: (year: AcademicYear) => void;
  onDelete: (id: string) => void;
  sortBy?: keyof AcademicYear;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (column: keyof AcademicYear) => void;
  bulkUpdateMode?: boolean;
  isSelected?: (id: string) => boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  toggleItem?: (id: string) => void;
  toggleSelectAll?: () => void;
};

export function AcademicYearTable({ years, loading, onEdit, onDelete, sortBy, sortOrder, onSortChange, bulkUpdateMode, isSelected, isAllSelected, isIndeterminate, toggleItem, toggleSelectAll }: AcademicYearTableProps) {
  const selectAllRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = !!isIndeterminate;
    }
  }, [isIndeterminate]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200/60">
        <thead className="bg-slate-50/50">
          <tr>
            {/* Bulk selection checkbox */}
            {bulkUpdateMode && (
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={selectAllRef}
                  onChange={toggleSelectAll}
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                  title="Select All"
                />
              </th>
            )}
            {/* Sortable Year Code */}
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button
                type="button"
                className="inline-flex items-center space-x-1"
                onClick={() => onSortChange?.('yearCode')}
              >
                <span>Year Code</span>
                {sortBy === 'yearCode' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            {/* Sortable Start Date */}
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button
                type="button"
                className="inline-flex items-center space-x-1"
                onClick={() => onSortChange?.('startDate')}
              >
                <span>Start</span>
                {sortBy === 'startDate' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            {/* Sortable End Date */}
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button
                type="button"
                className="inline-flex items-center space-x-1"
                onClick={() => onSortChange?.('endDate')}
              >
                <span>End</span>
                {sortBy === 'endDate' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Current</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Admission Open</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Active</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200/60">
          {loading ? (
            <tr>
              <td colSpan={bulkUpdateMode ? 9 : 8}>
                <div className="flex justify-center py-8">
                  <Loader variant="dots" size="lg" text="Loading" />
                </div>
              </td>
            </tr>
          ) : years.length === 0 ? (
            <tr>
              <td colSpan={bulkUpdateMode ? 9 : 8} className="px-4 py-6 text-center text-slate-500 text-xs">
                No academic years found.
              </td>
            </tr>
          ) : (
            years.map((year) => (
              <tr key={year.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                {/* Bulk selection checkbox */}
                {bulkUpdateMode && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected?.(year.id)}
                      onChange={() => toggleItem?.(year.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                      title="Select Academic Year"
                    />
                  </td>
                )}
                {/* Year Code cell styled like class short name */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-xs">{year.yearCode}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-xs font-medium text-slate-900">{year.yearCode}</div>
                    </div>
                  </div>
                </td>
                {/* Start Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{year.startDate?.slice(0, 10)}</div>
                </td>
                {/* End Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{year.endDate?.slice(0, 10)}</div>
                </td>
                {/* Current Year */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${year.isCurrentYear ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {year.isCurrentYear ? 'Yes' : 'No'}
                  </span>
                </td>
                {/* Admission Open */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${year.isAdmissionOpen ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {year.isAdmissionOpen ? 'Yes' : 'No'}
                  </span>
                </td>
                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(year.status)}`}>
                    {year.status}
                  </span>
                </td>
                {/* Active */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${year.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {year.isActive ? 'Yes' : 'No'}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onEdit(year)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit Academic Year"
                    >
                      <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                    </button>
                    <button
                      onClick={() => onDelete(year.id)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete Academic Year"
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
