import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import ColumnFilterPopover from '@/components/common/ColumnFilterPopover';
import { Edit, Trash2, MoreVertical, LogOut, Repeat, Upload, Download, HelpCircle, ListChecks } from 'lucide-react';
import { useStudentEnrollment } from '@/features/student/hooks/StudentEnrollment/useStudentEnrollment';
import { StudentEnrollmentDTO } from '@/features/student/types/StudentEnrollment/studentenrollment.types';
import { Loader } from '@/app/components/ui/Loader';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/app/components/RadixUI/table';
import { PaginationControls } from '@/app/components/ui/PaginationControls';
import { BulkActions } from '@/components/common/BulkActions';

// Utility hook to handle click outside for any menu
function useClickOutsideMenu(menuRef: React.RefObject<HTMLElement | null>, buttonRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        menuRef.current.classList.add('hidden');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuRef, buttonRef]);
}

// Row action menu as a component with click outside support
function RowActionMenu({ onEdit, onDelete, onLeave, onTransfer }: any) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  useClickOutsideMenu(menuRef, buttonRef);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 focus:outline-none"
        onClick={(e) => {
          const menu = menuRef.current;
          if (menu) {
            const rect = e.currentTarget.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.left = `${rect.right - 160}px`;
            menu.style.top = `${rect.top}px`;
            menu.classList.toggle('hidden');
          }
        }}
        title="Actions"
        aria-label="Row Actions"
      >
        <MoreVertical className="w-5 h-5 text-slate-500" />
      </button>
      <div
        ref={menuRef}
        className="hidden z-50 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-100 transition-transform transform scale-95"
        tabIndex={-1}
        style={{ position: 'fixed' }}
      >
        <button
          onClick={onEdit}
          className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 gap-2"
        >
          <Edit className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
        <button
          onClick={onLeave}
          className="flex items-center w-full px-3 py-2 text-xs text-yellow-700 hover:bg-yellow-50 gap-2"
        >
          <LogOut className="w-4 h-4" /> Leave
        </button>
        <button
          onClick={onTransfer}
          className="flex items-center w-full px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 gap-2"
        >
          <Repeat className="w-4 h-4" /> Transfer
        </button>
      </div>
    </div>
  );
}

// Header action menu as a component with click outside support
function HeaderActionMenu({ onBulkUpdate }: { onBulkUpdate: () => void }) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  useClickOutsideMenu(menuRef, buttonRef);
  return (
    <div className="flex items-center justify-end">
      <span className="mr-1">Actions</span>
      <div className="relative inline-block text-left">
        <button
          ref={buttonRef}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 focus:outline-none border border-slate-200"
          onClick={e => {
            const menu = menuRef.current;
            if (menu) {
              const rect = e.currentTarget.getBoundingClientRect();
              const menuHeight = 200;
              const safeTop = rect.bottom + 8;
              menu.style.position = 'fixed';
              menu.style.left = `${rect.right - 176}px`;
              menu.style.top = `${safeTop}px`;
              menu.classList.toggle('hidden');
            }
          }}
          title="More Actions"
        >
          <MoreVertical className="w-5 h-5 text-slate-600" />
        </button>
        <div
          ref={menuRef}
          className="hidden z-50 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-100"
          tabIndex={-1}
          style={{ position: 'fixed' }}
        >
          <button className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 gap-2" onClick={() => { onBulkUpdate(); menuRef.current?.classList.add('hidden'); }}>
            <ListChecks className="w-5 h-5" /> Bulk Update
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 gap-2">
            <Upload className="w-5 h-5" /> Import
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 gap-2">
            <Download className="w-5 h-5" /> Export
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 gap-2">
            <HelpCircle className="w-5 h-5" /> Help
          </button>
        </div>
      </div>
    </div>
  );
  }



const StudentEnrollmentList: React.FC = () => {
  const router = useRouter();
  const [bulkMode, setBulkMode] = useState(false);
  const {
    enrollments,
    loading,
    error,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    startItem,
    endItem,
    setPageIndex,
    setPageSize,
    refresh,
  } = useStudentEnrollment();

  // ...existing code...

  const [sortBy, setSortBy] = useState<string>('Name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: { type: string; value: string } }>({});

  const handleColumnFilterApply = (col: string, type: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [col]: { type, value } }));
  };
  const handleColumnFilterClear = (col: string) => {
    setColumnFilters(prev => {
      const copy = { ...prev };
      delete copy[col];
      return copy;
    });
  };

  const filterFns: { [key: string]: (cell: string, filterValue: string) => boolean } = {
    contains: (cell, val) => cell.includes(val),
    startsWith: (cell, val) => cell.startsWith(val),
    endsWith: (cell, val) => cell.endsWith(val),
    equals: (cell, val) => cell === val,
    notEquals: (cell, val) => cell !== val,
    empty: (cell) => cell === '',
    notEmpty: (cell) => cell !== '',
  };
  const filtered = useMemo(() => {
    let arr = enrollments;
    Object.entries(columnFilters).forEach(([col, { type, value }]) => {
      arr = arr.filter((row: any) => {
        let cell = row[col];
        if (cell === null || cell === undefined) cell = '';
        if (cell instanceof Date) cell = cell.toLocaleDateString();
        cell = cell.toString().toLowerCase();
        const filterVal = value.toLowerCase();
        if (type === 'empty' || type === 'notEmpty') {
          return filterFns[type](cell, '');
        }
        return filterFns[type](cell, filterVal);
      });
    });
    return arr;
  }, [enrollments, columnFilters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const aVal = ((a as any)[sortBy] || '').toString().toLowerCase();
      const bVal = ((b as any)[sortBy] || '').toString().toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortOrder]);

  // --- CORRECT USAGE: useBulkSelection as a hook ---
  const sortedRows = useMemo(() => sorted.map((row: any) => ({ id: row.Id ?? row.RollNumber ?? '', ...row })), [sorted]);
  const {
    selectedItems,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection(sortedRows);


  const handleBulkUpdate = () => {
    setBulkMode(true);
    clearSelection();
  };

  // When clearing selection, also exit bulk mode so checkboxes disappear
  const handleClearSelection = () => {
    clearSelection();
    setBulkMode(false);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const handleEdit = (row: StudentEnrollmentDTO) => {
    // Implement edit logic or pass as prop
  };
  const handleDelete = (id: string) => {
    // Implement delete logic or pass as prop
  };

  const total = enrollments.length;
  const active = enrollments.filter((s: any) => s.StudentStatus === 'Active').length;
  const boys = enrollments.filter((s: any) => (s.Gender || '').toLowerCase() === 'male').length;
  const girls = enrollments.filter((s: any) => (s.Gender || '').toLowerCase() === 'female').length;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const newAdmissionsThisMonth = enrollments.filter((s: any) => {
    if (!s.AdmissionDate) return false;
    const d = new Date(s.AdmissionDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const newAdmissionsThisYear = enrollments.filter((s: any) => {
    if (!s.AdmissionDate) return false;
    const d = new Date(s.AdmissionDate);
    return d.getFullYear() === thisYear;
  }).length;

  return (
    <>
  {/* Removed duplicate Add Student button as per user request */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6 w-full">
        <div className="bg-white rounded shadow flex flex-col items-center justify-center border border-slate-100 h-16">
          <span className="text-xs text-slate-500 mb-0.5">Total</span>
          <span className="text-xl font-bold text-slate-800">{total}</span>
        </div>
        <div className="bg-emerald-50 rounded shadow flex flex-col items-center justify-center border border-emerald-100 h-16">
          <span className="text-xs text-emerald-700 mb-0.5">Active</span>
          <span className="text-xl font-bold text-emerald-700">{active}</span>
        </div>
        <div className="bg-blue-50 rounded shadow flex flex-col items-center justify-center border border-blue-100 h-16">
          <span className="text-xs text-blue-700 mb-0.5">Boys</span>
          <span className="text-xl font-bold text-blue-700">{boys}</span>
        </div>
        <div className="bg-pink-50 rounded shadow flex flex-col items-center justify-center border border-pink-100 h-16">
          <span className="text-xs text-pink-700 mb-0.5">Girls</span>
          <span className="text-xl font-bold text-pink-700">{girls}</span>
        </div>
        <div className="bg-yellow-50 rounded shadow flex flex-col items-center justify-center border border-yellow-100 h-16">
          <span className="text-xs text-yellow-700 mb-0.5">New (Month)</span>
          <span className="text-xl font-bold text-yellow-700">{newAdmissionsThisMonth}</span>
        </div>
        <div className="bg-indigo-50 rounded shadow flex flex-col items-center justify-center border border-indigo-100 h-16">
          <span className="text-xs text-indigo-700 mb-0.5">New (Year)</span>
          <span className="text-xl font-bold text-indigo-700">{newAdmissionsThisYear}</span>
        </div>
      </div>
      {bulkMode && (
        <BulkActions
          selectedCount={selectedItems.size}
          onBulkDelete={() => {/* TODO: implement bulk delete dialog */}}
          onClearSelection={handleClearSelection}
          loading={loading}
          disabled={selectedItems.size === 0}
        />
      )}
      <Table className="w-full border-collapse border border-slate-200">
        <TableHeader>
          <TableRow className="bg-slate-100">
            {/* Checkbox column (leftmost) */}
            <TableHead className="text-slate-800 w-8">
              {bulkMode && (
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={toggleSelectAll}
                  className="accent-blue-600"
                  title="Select all"
                />
              )}
            </TableHead>
            {/* Photo column */}
            <TableHead className="text-slate-800">Photo</TableHead>
            {/* Name */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('Name')}>
              <div className="flex items-center gap-1">
                <span>Name</span>
                {sortBy === 'Name' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="Name"
                  filter={columnFilters['Name'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('Name', type, value)}
                  onClear={() => handleColumnFilterClear('Name')}
                /></span>
              </div>
            </TableHead>
            {/* Roll No. */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('RollNumber')}>
              <div className="flex items-center gap-1">
                <span>Roll No.</span>
                {sortBy === 'RollNumber' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="RollNumber"
                  filter={columnFilters['RollNumber'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('RollNumber', type, value)}
                  onClear={() => handleColumnFilterClear('RollNumber')}
                /></span>
              </div>
            </TableHead>
            {/* Gender */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('Gender')}>
              <div className="flex items-center gap-1">
                <span>Gender</span>
                {sortBy === 'Gender' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="Gender"
                  filter={columnFilters['Gender'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('Gender', type, value)}
                  onClear={() => handleColumnFilterClear('Gender')}
                /></span>
              </div>
            </TableHead>
            {/* Removed Email column */}
            {/* Mobile */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('Mobile')}>
              <div className="flex items-center gap-1">
                <span>Mobile</span>
                {sortBy === 'Mobile' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="Mobile"
                  filter={columnFilters['Mobile'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('Mobile', type, value)}
                  onClear={() => handleColumnFilterClear('Mobile')}
                /></span>
              </div>
            </TableHead>
            {/* Admission No. */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('AdmissionNumber')}>
              <div className="flex items-center gap-1">
                <span>Admission No.</span>
                {sortBy === 'AdmissionNumber' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="AdmissionNumber"
                  filter={columnFilters['AdmissionNumber'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('AdmissionNumber', type, value)}
                  onClear={() => handleColumnFilterClear('AdmissionNumber')}
                /></span>
              </div>
            </TableHead>
            {/* Admission Date */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('AdmissionDate')}>
              <div className="flex items-center gap-1">
                <span>Admission Date</span>
                {sortBy === 'AdmissionDate' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="AdmissionDate"
                  filter={columnFilters['AdmissionDate'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('AdmissionDate', type, value)}
                  onClear={() => handleColumnFilterClear('AdmissionDate')}
                /></span>
              </div>
            </TableHead>
            {/* Stream */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('Stream')}>
              <div className="flex items-center gap-1">
                <span>Stream</span>
                {sortBy === 'Stream' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="Stream"
                  filter={columnFilters['Stream'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('Stream', type, value)}
                  onClear={() => handleColumnFilterClear('Stream')}
                /></span>
              </div>
            </TableHead>
            {/* Medium */}
            <TableHead className="text-slate-800 cursor-pointer select-none" onClick={() => handleSort('Medium')}>
              <div className="flex items-center gap-1">
                <span>Medium</span>
                {sortBy === 'Medium' && (
                  <span className="ml-0.5 text-xs align-middle">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
                <span className="ml-1"><ColumnFilterPopover
                  column="Medium"
                  filter={columnFilters['Medium'] || { type: 'contains', value: '' }}
                  onApply={(type, value) => handleColumnFilterApply('Medium', type, value)}
                  onClear={() => handleColumnFilterClear('Medium')}
                /></span>
              </div>
            </TableHead>
            <TableHead className="text-slate-800">
              <HeaderActionMenu onBulkUpdate={handleBulkUpdate} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={14}>
                <div className="flex justify-center py-8">
                  <Loader variant="dots" size="lg" text="Loading" />
                </div>
              </TableCell>
            </TableRow>
          ) : enrollments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={14} className="px-4 py-6 text-center text-slate-500 text-xs">
                No student enrollments found.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((row: any, index: number) => (
              <TableRow key={row.Id ?? row.RollNumber ?? index} className="bg-white hover:bg-slate-50">
                {/* Checkbox cell (leftmost) */}
                <TableCell>
                  {bulkMode && (
                    <input
                      type="checkbox"
                      checked={isSelected(row.Id ?? row.RollNumber ?? '')}
                      onChange={() => toggleItem(row.Id ?? row.RollNumber ?? '')}
                      className="accent-blue-600"
                      title="Select row"
                    />
                  )}
                </TableCell>
                {/* Photo cell */}
                <TableCell>
                  {row.StudentPhotoUrl ? (
                    <img src={row.StudentPhotoUrl} alt={row.Name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <span className="text-xs text-slate-400">No Photo</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.Name}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.RollNumber}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.Gender}</TableCell>
                {/* Removed Email cell */}
                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.Mobile}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.AdmissionNumber}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.AdmissionDate ? new Date(row.AdmissionDate).toLocaleDateString() : ''}</TableCell>

                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.Stream}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium text-slate-800">{row.Medium}</TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium">
                  <RowActionMenu
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDelete(row.Id)}
                    onLeave={() => alert('Leave action')}
                    onTransfer={() => alert('Transfer action')}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={14} className="px-4 py-2 text-xs text-slate-800 bg-white">
              {totalCount > 0 && (
                <PaginationControls
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  startItem={startItem}
                  endItem={endItem}
                  onPageChange={setPageIndex}
                  onPageSizeChange={setPageSize}
                />
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
        {error && <div className="text-red-500 mt-2 text-xs">{error}</div>}
      </Table>
    </>
  );
};

export default StudentEnrollmentList;
