import React, { useRef, useEffect } from "react";
import { Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { ExamCycle } from "../../types/master/examcycleType";
import { Loader } from '@/app/components/ui/Loader';

function getStatusBadgeClasses(status: string): string {
  const key = status?.toLowerCase?.() || '';
  if (key === 'active') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (['completed'].includes(key)) return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (['planned'].includes(key)) return 'bg-amber-100 text-amber-800 border border-amber-200';
  if (['archived'].includes(key)) return 'bg-red-100 text-red-800 border border-red-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
}

interface ExamCycleListProps {
  examCycles: ExamCycle[];
  loading?: boolean;
  onEdit: (examCycle: ExamCycle) => void;
  onDelete: (id: string) => void;
  sortBy?: keyof ExamCycle;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (column: keyof ExamCycle) => void;
  bulkUpdateMode?: boolean;
  isSelected?: (id: string) => boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  toggleItem?: (id: string) => void;
  toggleSelectAll?: () => void;
  semisterMap?: Record<string, string>; // semesterId -> semesterName
}

const ExamCycleList: React.FC<ExamCycleListProps> = ({ examCycles, loading, onEdit, onDelete, sortBy, sortOrder, onSortChange, bulkUpdateMode, isSelected, isAllSelected, isIndeterminate, toggleItem, toggleSelectAll, semisterMap }) => {
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
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('examCycleName')}>
                <span>Exam Cycle Name</span>
                {sortBy === 'examCycleName' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600  tracking-wider">
              Semester Name
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('examCycleCode')}>
                <span>Exam Cycle Code</span>
                {sortBy === 'examCycleCode' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('startDate')}>
                <span>Start</span>
                {sortBy === 'startDate' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('endDate')}>
                <span>End</span>
                {sortBy === 'endDate' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            {/* Status column removed */}
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
          ) : !examCycles || examCycles.length === 0 ? (
            <tr>
              <td colSpan={bulkUpdateMode ? 9 : 8} className="px-4 py-6 text-center text-slate-500 text-xs">
                No exam cycles found.
              </td>
            </tr>
          ) : (
            examCycles.map((examCycle: ExamCycle) => (
              <tr key={examCycle.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                {bulkUpdateMode && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected?.(examCycle.id)}
                      onChange={() => toggleItem?.(examCycle.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                      title="Select Exam Cycle"
                    />
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-xs">{examCycle.examCycleName}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-xs font-medium text-slate-900">{examCycle.examCycleName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">
                    {(() => {
                      const key = String(examCycle.semesterId).trim();
                      if (typeof window !== 'undefined') {
                        console.log('[ExamCycleList] semesterId:', key, 'semisterMap keys:', Object.keys(semisterMap || {}));
                      }
                      return semisterMap?.[key] || (
                        <span className="text-slate-400 italic">Unknown ({examCycle.semesterId})</span>
                      );
                    })()}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{examCycle.examCycleCode}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{examCycle.startDate?.slice(0, 10)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{examCycle.endDate?.slice(0, 10)}</div>
                </td>
                {/* Status column removed */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${examCycle.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {examCycle.isActive ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onEdit(examCycle)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit Exam Cycle"
                    >
                      <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                    </button>
                    <button
                      onClick={() => onDelete(examCycle.id)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete Exam Cycle"
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
};

export default ExamCycleList;
