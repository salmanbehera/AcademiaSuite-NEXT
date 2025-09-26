import React, { useState } from 'react';

const FILTER_OPTIONS = [
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'empty', label: 'Is Empty' },
  { value: 'notEmpty', label: 'Is Not Empty' },
];

export interface ColumnFilterPopoverProps {
  column: string;
  filter: { type: string; value: string };
  onApply: (type: string, value: string) => void;
  onClear: () => void;
}

const ColumnFilterPopover: React.FC<ColumnFilterPopoverProps> = ({ column, filter, onApply, onClear }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(filter.type || 'contains');
  const [value, setValue] = useState(filter.value || '');

  const handleApply = () => {
    onApply(type, value);
    setOpen(false);
  };
  const handleClear = () => {
    setType('contains');
    setValue('');
    onClear();
    setOpen(false);
  };

  return (
    <span className="relative ml-1">
      <button
        type="button"
        className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-blue-100"
        title={`Filter ${column}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" />
        </svg>
      </button>
      {open && (
  <div className="absolute z-[9999] mt-2 right-0 w-56 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1 text-blue-700">Filter Type</label>
            <select
              className="w-full border border-slate-300 rounded px-2 py-0.5 text-xs focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              {FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="text-xs py-1">{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1 text-blue-700">Value</label>
            <input
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
              value={value}
              onChange={e => setValue(e.target.value)}
              disabled={type === 'empty' || type === 'notEmpty'}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              onClick={handleApply}
              disabled={type !== 'empty' && type !== 'notEmpty' && !value}
            >
              Filter
            </button>
            <button
              className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </span>
  );
};

export default ColumnFilterPopover;
