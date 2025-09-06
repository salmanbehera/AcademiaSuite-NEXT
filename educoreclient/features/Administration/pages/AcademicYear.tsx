// Converts Excel serial date to YYYY-MM-DD string

"use client";
import { useState } from 'react';
import type { AcademicYear } from '@/features/Administration/types/academicYearTypes';
import { AcademicYearForm } from '@/features/Administration/components/academicyear/AcademicYearForm';
import { useToast } from '@/app/components/ui/ToastProvider';
import { AcademicYearTable } from '@/features/Administration/components/academicyear/AcademicYearTable';
import { useAcademicYears } from '@/features/Administration/hooks/useAcademicYears';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';
import { BulkActions } from '@/components/common/BulkActions';
import { ImportDialog } from '@/components/common/ImportDialog';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { HelpDialog } from '@/components/common/HelpDialog';
import { ExportDialog } from '@/components/common/ExportDialog';
import { AcademicYearService } from '@/features/Administration/services/academicYearService';
import { API_CONFIG } from '@/lib/config';
import { StatsCard } from '@/app/components/ui/StatsCard';
import { SearchBox } from '@/app/components/ui/SearchBox';
import { MoreActionsButton } from '@/app/components/ui/MoreActionsButton';
import { Edit3, Upload, Download, HelpCircle, Trash2, RefreshCw, Plus } from 'lucide-react';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { OrganizationConfig } from '@/app/components/ui/OrganizationConfig';
import { ErrorAlert } from '@/app/components/ui/ErrorAlert';
import { PaginationControls } from '@/app/components/ui/PaginationControls';
import { toIsoDate, excelDateToString } from '@/lib/utils/dateUtils';
// UI components assumed to exist, replace with your own if needed
// ...existing code...

export default function AcademicYearPage() {
  const { showInfo } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | string>(null);
  const [editingRecord, setEditingRecord] = useState<AcademicYear | undefined>(undefined);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    loading: false,
  });
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const {
    academicYears,
    filteredYears,
    searchQuery,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    setPageIndex,
    setPageSize,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    refresh,
    searchAcademicYears,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    bulkDeleteAcademicYears,
  } = useAcademicYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const MIN_SEARCH_LENGTH = 2;
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.length >= MIN_SEARCH_LENGTH || term === '') {
      searchAcademicYears(term);
    }
  };
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const {
    selectedItems,
    selectedCount,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection(filteredYears);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: any[] } | null>(null);
  const [importUploading, setImportUploading] = useState(false);
  const active = academicYears.filter((y: AcademicYear) => y.isActive).length;
  const current = academicYears.filter((y: AcademicYear) => y.isCurrentYear).length;
  const openAdmissions = academicYears.filter((y: AcademicYear) => y.isAdmissionOpen).length;

  // Add/Edit
  const handleSave = async (data: any) => {
    try {
      if (editing && editingRecord) {
        await updateAcademicYear(editingRecord.id, data);
      } else {
        await createAcademicYear(data);
      }
      setShowForm(false);
      setEditing(null);
      setEditingRecord(undefined);
    } catch (err) {
      // showInfo or console.error can be used instead of setError
      console.error("Failed to save academic year", err);
      throw err;
    }
  };

  // Edit
  const handleEdit = (year: AcademicYear) => {
    setEditing(year.id);
    setEditingRecord(year);
    setShowForm(true);
  };

  // Delete
  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Academic Year",
      message: "Are you sure you want to delete this academic year? This action cannot be undone.",
      onConfirm: () => confirmDelete(id),
      loading: false,
    });
  };

  const confirmDelete = async (id: string) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteAcademicYear(id);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (err) {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
      console.error('Failed to delete academic year', err);
      showInfo('Error', 'Failed to delete academic year.');
    }
  };

  // Sorting handler
  const handleSortChange = (column: keyof AcademicYear) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Pagination (from hook)

  // Bulk update mode toggle handler
  const handleBulkUpdateToggle = () => {
  console.log('Bulk Update Toggle Clicked. Previous:', bulkUpdateMode);
  setBulkUpdateMode((prev) => !prev);
  if (!bulkUpdateMode) clearSelection();
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteAcademicYears(Array.from(selectedItems));
      setShowBulkDeleteDialog(false);
      clearSelection();
      showInfo('Bulk Delete', `${selectedCount} academic year${selectedCount > 1 ? 's' : ''} deleted successfully.`);
    } catch (error) {
      setShowBulkDeleteDialog(false);
      showInfo('Bulk Delete Failed', 'Failed to delete selected academic years. Please try again.');
    }
  };
  // ...removed: excelDateToString (now imported from dateUtils)...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Academic Year Management</h1>
            <p className="mt-0.5 text-xs text-slate-600">Configure and manage academic years for your institution</p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={refresh}
              disabled={loading}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              Create New
            </Button>
          </div>
        </div>

        {/* Organization Config */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-slate-900">Organization Configuration</h3>
              <p className="text-xs text-slate-600 mt-0.5">Current organization and branch settings</p>
            </div>
            <OrganizationConfig />
          </div>
        </div>

        {/* Professional Error Message */}
        <ErrorAlert
          message={error ?? ""}
          onReload={() => {
            window.location.reload();
            showInfo('Reloading Page', 'The page is being reloaded...');
          }}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Total" value={totalCount} subtitle="Years" icon={Plus} iconColor="text-slate-700" iconBgColor="bg-slate-100" valueColor="text-slate-900" />
          <StatsCard title="Active" value={active} subtitle="Active" icon={RefreshCw} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" valueColor="text-emerald-700" />
          <StatsCard title="Current" value={current} subtitle="Current" icon={Plus} iconColor="text-blue-600" iconBgColor="bg-blue-50" valueColor="text-blue-700" />
          <StatsCard title="Admissions Open" value={openAdmissions} subtitle="Open" icon={Plus} iconColor="text-amber-600" iconBgColor="bg-amber-50" valueColor="text-amber-700" />
        </div>

        {/* Search + More Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5 flex items-center gap-4">
          <div className="flex-1">
            <SearchBox value={searchTerm} placeholder="Search by year code..." onChange={handleSearchChange} className="w-full" />
          </div>
          <MoreActionsButton
            items={[{
              label: bulkUpdateMode ? 'Exit Bulk Update' : 'Bulk Update',
              icon: <Edit3 className="h-3.5 w-3.5" />,
              onClick: handleBulkUpdateToggle,
            }, {
              label: 'Import Academic Years',
              icon: <Upload className="h-3.5 w-3.5" />,
              onClick: () => setShowImportDialog(true),
            }, {
              label: 'Export Academic Years',
              icon: <Download className="h-3.5 w-3.5" />,
              onClick: () => setShowExportDialog(true),
            }, {
              label: 'Help & User Guide',
              icon: <HelpCircle className="h-3.5 w-3.5" />,
              onClick: () => setShowHelpDialog(true),
            }]}
            buttonLabel="More Actions"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-x-auto">
          {/* Bulk Actions UI (shared component) */}
          {bulkUpdateMode && (
            <BulkActions
              selectedCount={selectedCount}
              onBulkDelete={() => setShowBulkDeleteDialog(true)}
              onClearSelection={clearSelection}
              loading={loading}
              disabled={selectedCount === 0}
            />
          )}
        
        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showBulkDeleteDialog}
          onClose={() => setShowBulkDeleteDialog(false)}
          onConfirm={handleBulkDelete}
          title="Delete Selected Academic Years"
          message={`Are you sure you want to delete ${selectedCount} selected academic year${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          type="danger"
          confirmText="Delete"
          cancelText="Cancel"
        />
          <AcademicYearTable
            years={filteredYears}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            bulkUpdateMode={bulkUpdateMode}
            isSelected={isSelected}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            toggleItem={toggleItem}
            toggleSelectAll={toggleSelectAll}
          />
        </div>
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

        {/* Modal Form */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            setEditingRecord(undefined);
          }}
          title={editing ? "Edit Academic Year" : "Create New Academic Year"}
          size="md"
        >
          <AcademicYearForm
            onSubmit={handleSave}
            defaultValues={editing ? editingRecord : undefined}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
              setEditingRecord(undefined);
            }}
          />
        </Modal>

        {/* Import Dialog (shared component) */}
        <ImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={async (file, onProgress) => {
            setImportUploading(true);
            let parsedData: any[] = [];
            let errors: any[] = [];
            try {
              if (file.name.endsWith('.csv')) {
                const text = await file.text();
                const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                parsedData = result.data;
                errors = result.errors;
              } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
              } else {
                throw new Error('Unsupported file format. Please upload CSV or Excel file.');
              }
             
              // Clean import mapping
              parsedData = parsedData.map(row => {
                const get = (a: any, b: any) => a !== undefined ? a : b !== undefined ? b : '';
                return {
                  YearCode: get(row.YearCode, row.yearCode),
                  StartDate: toIsoDate(get(row.StartDate, row.startDate)),
                  EndDate: toIsoDate(get(row.EndDate, row.endDate)),
                  IsCurrentYear: row.IsCurrentYear ?? row.isCurrentYear ?? false,
                  IsAdmissionOpen: row.IsAdmissionOpen ?? row.isAdmissionOpen ?? false,
                  Status: get(row.Status, row.status),
                  IsActive: row.IsActive ?? row.isActive ?? true
                };
              });
              // Call service method with plain array
              await AcademicYearService.importAcademicYears(parsedData);
              setImportResult({ success: parsedData.length, errors });
            } catch (err) {
              setImportResult({ success: 0, errors: [err] });
            } finally {
              setImportUploading(false);
            }
            return importResult;
          }}
          title="Import Academic Years"
          description="Upload a CSV or Excel file to import academic years in bulk. Download the sample template for correct format."
          sampleData={[{
            yearCode: '2023-2024',
            startDate: '2023-06-01',
            endDate: '2024-03-31',
            isCurrentYear: true,
            isAdmissionOpen: true,
            status: 'Active',
            isActive: true,
          }]}
          acceptedFormats={['.csv', '.xlsx', '.xls']}
        />
        {/* Export Dialog - Shared Component */}
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          onExport={AcademicYearService.exportAcademicYears}
          title="Export Academic Years"
          defaultFormat="csv"
        />
        {/* Help Dialog (shared component) */}
        <HelpDialog
          isOpen={showHelpDialog}
          onClose={() => setShowHelpDialog(false)}
          contentType="academicYear"
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type="danger"
          confirmText="Delete"
          cancelText="Cancel"
          loading={confirmDialog.loading}
        />
      </div>
    </div>
  );
}

