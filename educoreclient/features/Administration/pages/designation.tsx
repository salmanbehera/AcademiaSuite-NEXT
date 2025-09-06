"use client";
import { useState } from 'react';
import { useDesignation } from '@/features/Administration/hooks/useDesignation';
import DesignationForm from '@/features/Administration/components/Designation/DesignationForm';
import DesignationList from '@/features/Administration/components/Designation/DesignationList';
import { useToast } from '@/app/components/ui/ToastProvider';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';
import { BulkActions } from '@/components/common/BulkActions';
import { ImportDialog } from '@/components/common/ImportDialog';
import { ExportDialog } from '@/components/common/ExportDialog';
import { ErrorAlert } from '@/app/components/ui/ErrorAlert';
import { PaginationControls } from '@/app/components/ui/PaginationControls';
import { MoreActionsButton } from '@/app/components/ui/MoreActionsButton';
import { HelpDialog } from '@/components/common/HelpDialog';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import OrgBranchHeader from '@/components/OrgBranchHeader';
import { StatsCard } from '@/app/components/ui/StatsCard';
import { SearchBox } from '@/app/components/ui/SearchBox';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Plus, RefreshCw, Edit3, Upload, Download, HelpCircle } from 'lucide-react';

export default function DesignationPage() {
  const { showError, showSuccess } = useToast();
  const { handleApiError } = useGlobalErrorHandler();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | string>(null);
  const [editingRecord, setEditingRecord] = useState<any>(undefined);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false,
  });
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: any[] } | null>(null);
  const [importUploading, setImportUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const MIN_SEARCH_LENGTH = 2;
  const {
    designations,
    filteredDesignations,
    searchQuery,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchDesignations,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize,
    refresh,
    createDesignation,
    updateDesignation,
    deleteDesignation,
    bulkDeleteDesignations,
  } = useDesignation();

  const {
    selectedItems,
    selectedCount,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection(filteredDesignations);

  const handleSave = async (data: any) => {
    try {
      if (editing && editingRecord) {
        await updateDesignation(editingRecord.id, data);
      } else {
        await createDesignation(data);
      }
      setShowForm(false);
      setEditing(null);
      setEditingRecord(undefined);
    } catch (err) {
      handleApiError(err, editing ? 'update designation' : 'create designation');
      showError('Error', `Failed to save designation. ${(err instanceof Error ? err.message : '')}`);
    }
  };

  const handleEdit = (designation: any) => {
    setEditing(designation.id);
    setEditingRecord(designation);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Designation",
      message: "Are you sure you want to delete this designation? This action cannot be undone.",
      onConfirm: () => confirmDelete(id),
      loading: false,
    });
  };

  const confirmDelete = async (id: string) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteDesignation(id);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
      showSuccess('Delete', 'Designation deleted successfully.');
    } catch (err) {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
      showError('Error', 'Failed to delete designation.');
    }
  };

  const handleBulkUpdateToggle = () => {
    setBulkUpdateMode((prev) => !prev);
    if (!bulkUpdateMode) clearSelection();
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteDesignations(Array.from(selectedItems));
      setShowBulkDeleteDialog(false);
      clearSelection();
      showSuccess('Bulk Delete', `${selectedCount} designation${selectedCount > 1 ? 's' : ''} deleted successfully.`);
    } catch (error) {
      setShowBulkDeleteDialog(false);
      showError('Bulk Delete Failed', 'Failed to delete selected designations. Please try again.');
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.length >= MIN_SEARCH_LENGTH || term === '') {
      searchDesignations(term);
    }
  };

  const handleImport = async (file: File) => {
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
      parsedData = parsedData.map(row => ({
        organizationId: row.OrganizationId,
        branchId: row.BranchId,
        designationName: row.DesignationName,
        designationCode: row.DesignationCode,
        description: row.Description,
        isActive: row.IsActive ?? true,
      }));
      await import('@/features/Administration/services/designationService').then(m => m.DesignationService.importDesignations(parsedData));
      setImportResult({ success: parsedData.length, errors });
      refresh();
    } catch (err) {
      setImportResult({ success: 0, errors: [err] });
    } finally {
      setImportUploading(false);
    }
    return importResult;
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    const blob = await import('@/features/Administration/services/designationService').then(m => m.DesignationService.exportDesignations(format));
    setShowExportDialog(false);
    return blob;
  };

  const handleSortChange = (column: any) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Designation Management
              <OrgBranchHeader className="ml-2" />
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">Configure and manage designations for your institution</p>
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

        <ErrorAlert message={error ?? ""} onReload={refresh} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Total" value={totalCount} subtitle="Designations" icon={Plus} iconColor="text-slate-700" iconBgColor="bg-slate-100" valueColor="text-slate-900" />
          <StatsCard title="Active" value={designations.filter((d: any) => d.isActive).length} subtitle="Active" icon={RefreshCw} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" valueColor="text-emerald-700" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5 flex items-center gap-4">
          <div className="flex-1">
            <SearchBox value={searchTerm} placeholder="Search by designation code..." onChange={handleSearchChange} className="w-full" />
          </div>
          <MoreActionsButton
            items={[{
              label: bulkUpdateMode ? 'Exit Bulk Update' : 'Bulk Update',
              icon: <Edit3 className="h-3.5 w-3.5" />,
              onClick: handleBulkUpdateToggle,
            }, {
              label: 'Import Designations',
              icon: <Upload className="h-3.5 w-3.5" />,
              onClick: () => setShowImportDialog(true),
            }, {
              label: 'Export Designations',
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

        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-x-auto">
          {bulkUpdateMode && (
            <BulkActions
              selectedCount={selectedCount}
              onBulkDelete={() => setShowBulkDeleteDialog(true)}
              onClearSelection={clearSelection}
              loading={loading}
              disabled={selectedCount === 0}
            />
          )}
          <ConfirmationDialog
            isOpen={showBulkDeleteDialog}
            onClose={() => setShowBulkDeleteDialog(false)}
            onConfirm={handleBulkDelete}
            title="Delete Selected Designations"
            message={`Are you sure you want to delete ${selectedCount} selected designation${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
            type="danger"
            confirmText="Delete"
            cancelText="Cancel"
          />
          <DesignationList
            designations={filteredDesignations}
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

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            setEditingRecord(undefined);
          }}
          title={editing ? "Edit Designation" : "Create New Designation"}
          size="md"
        >
          <DesignationForm
            onSubmit={handleSave}
            defaultValues={editing ? editingRecord : undefined}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
              setEditingRecord(undefined);
            }}
          />
        </Modal>

        <ImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImport}
          title="Import Designations"
          description="Upload a CSV or Excel file to import designations in bulk. Download the sample template for correct format."
          sampleData={[{
            designationCode: 'SL-01',
            designationName: 'Senior Lecturers',
            description: 'Teaches advanced courses',
            isActive: true,
          }]}
          acceptedFormats={['.csv', '.xlsx', '.xls']}
        />

        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          onExport={handleExport}
          title="Export Designations"
          defaultFormat="csv"
        />

        <HelpDialog
          isOpen={showHelpDialog}
          onClose={() => setShowHelpDialog(false)}
          contentType="class"
        />

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
