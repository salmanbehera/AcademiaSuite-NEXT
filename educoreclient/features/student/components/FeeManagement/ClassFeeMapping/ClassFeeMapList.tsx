import React, { useRef } from "react";
import { Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { ClassFeeMapping } from '@/features/student/types/FeeManagement/classfeemappingtype';
import { Loader } from '@/app/components/ui/Loader';
import { Button } from '@/app/components/ui/Button';

function getActiveBadgeClasses(isActive: boolean): string {
  return isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200';
}

interface ClassFeeMapListProps {
  classFeeMappings: (ClassFeeMapping & {
    academicYear: string;
    className: string;
    feeHeadNames: string[];
  })[];
  loading?: boolean;
  onEdit: (classFeeMapping: ClassFeeMapping & {
    academicYear: string;
    className: string;
    feeHeadNames: string[];
  }) => void;
  onDelete: (id: string) => void;
  sortBy?: keyof ClassFeeMapping;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (column: keyof ClassFeeMapping) => void;
  bulkUpdateMode?: boolean;
  isSelected?: (id: string) => boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  toggleItem?: (id: string) => void;
  toggleSelectAll?: () => void;
}

const ClassFeeMapList: React.FC<ClassFeeMapListProps> = ({ classFeeMappings, loading, onEdit, onDelete, sortBy, sortOrder, onSortChange, bulkUpdateMode, isSelected, isAllSelected, isIndeterminate, toggleItem, toggleSelectAll }) => {
  const selectAllRef = useRef<HTMLInputElement>(null);
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
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('academicYearId')}>
                <span>Academic Year</span>
                {sortBy === 'academicYearId' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('classId')}>
                <span>Class</span>
                {sortBy === 'classId' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              Fee Heads
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200/60">
          {loading ? (
            <tr>
              <td colSpan={bulkUpdateMode ? 5 : 4}>
                <div className="flex justify-center py-8">
                  <Loader variant="dots" size="lg" text="Loading" />
                </div>
              </td>
            </tr>
          ) : !classFeeMappings || classFeeMappings.length === 0 ? (
            <tr>
              <td colSpan={bulkUpdateMode ? 5 : 4} className="px-4 py-6 text-center text-slate-500 text-xs">
                No class fee mappings found.
              </td>
            </tr>
          ) : (
            classFeeMappings.map((cfm: ClassFeeMapping, index: number) => (
              <tr key={`${cfm.id}-${index}`} className="hover:bg-slate-50/50 transition-colors duration-150">
                {bulkUpdateMode && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected?.(cfm.id)}
                      onChange={() => toggleItem?.(cfm.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                      title="Select Class Fee Mapping"
                    />
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{cfm.academicYear}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{cfm.className}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{cfm.feeHeadNames?.join(', ') || 'N/A'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onEdit({
                        ...cfm,
                        academicYear: cfm.academicYear || '',
                        className: cfm.className || '',
                        feeHeadNames: cfm.feeHeadNames || [],
                      })}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit Class Fee Mapping"
                    >
                      <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                    </button>
                    {/* <button
                      onClick={() => onDelete(cfm.id)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete Class Fee Mapping"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500 group-hover:text-red-700 transition-colors duration-200" />
                    </button> */}
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

export default ClassFeeMapList;