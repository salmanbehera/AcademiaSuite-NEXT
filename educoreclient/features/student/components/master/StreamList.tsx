import React, { useRef } from "react";
import { Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Stream } from "../../types/master/streamType";
import { Loader } from '@/app/components/ui/Loader';

function getStatusBadgeClasses(isActive: boolean): string {
  return isActive
    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    : 'bg-red-100 text-red-800 border border-red-200';
}

interface StreamListProps {
  streams: Stream[];
  loading?: boolean;
  onEdit: (stream: Stream) => void;
  onDelete: (id: string) => void;
  sortBy?: keyof Stream;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (column: keyof Stream) => void;
  bulkUpdateMode?: boolean;
  isSelected?: (id: string) => boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  toggleItem?: (id: string) => void;
  toggleSelectAll?: () => void;
}

const StreamList: React.FC<StreamListProps> = ({ streams, loading, onEdit, onDelete, sortBy, sortOrder, onSortChange, bulkUpdateMode, isSelected, isAllSelected, isIndeterminate, toggleItem, toggleSelectAll }) => {
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
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('streamName')}>
                <span>Stream Name</span>
                {sortBy === 'streamName' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('streamShortName')}>
                <span>Stream Short Name</span>
                {sortBy === 'streamShortName' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('displayOrder')}>
                <span>Order</span>
                {sortBy === 'displayOrder' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('maxStrength')}>
                <span>Max Strength</span>
                {sortBy === 'maxStrength' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('reservationSeats')}>
                <span>Reservation Seats</span>
                {sortBy === 'reservationSeats' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
              <button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('isActive')}>
                <span>Active</span>
                {sortBy === 'isActive' ? (
                  sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-50" />
                )}
              </button>
            </th>
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
          ) : !streams || streams.length === 0 ? (
            <tr>
              <td colSpan={bulkUpdateMode ? 9 : 8} className="px-4 py-6 text-center text-slate-500 text-xs">
                No streams found.
              </td>
            </tr>
          ) : (
            streams.map((stream: Stream) => (
              <tr key={stream.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                {bulkUpdateMode && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected?.(stream.id)}
                      onChange={() => toggleItem?.(stream.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                      title="Select Stream"
                    />
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-xs">{stream.streamName}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-xs font-medium text-slate-900">{stream.streamName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{stream.streamShortName}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{stream.displayOrder}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{stream.maxStrength}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-medium text-slate-900">{stream.reservationSeats}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(stream.isActive)}`}>
                    {stream.isActive ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onEdit(stream)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit Stream"
                    >
                      <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                    </button>
                    <button
                      onClick={() => onDelete(stream.id)}
                      className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete Stream"
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

export default StreamList;
