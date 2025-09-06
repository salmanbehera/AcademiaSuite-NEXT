"use client";
import { useState } from 'react';
import { useClassFeeMapping } from '@/features/student/hooks/FeeManagement/useclassfeemapping';
import { ClassFeeMapForm } from '@/features/student/components/FeeManagement/ClassFeeMapping/ClassFeeMapForm';
import ClassFeeMapList from '@/features/student/components/FeeManagement/ClassFeeMapping/ClassFeeMapList';
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
import { ClassFeeMapping } from '@/features/student/types/FeeManagement/classfeemappingtype';

export default function ClassFeeMappingPage() {
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
    classFeeMappings: data,
    searchQuery,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    searchClassFeeMappings,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    setPageIndex,
    setPageSize,
    refresh,
    createClassFeeMapping,
    updateClassFeeMapping,
    deleteClassFeeMapping,
    bulkDeleteClassFeeMappings,
  } = useClassFeeMapping();
  const {
    selectedItems,
    selectedCount,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection(data);

  const mappedData = data?.map((item) => ({
    ...item,
    academicYear: item.academicYearId || 'N/A',
    className: item.classId || 'N/A',
    feeHeadNames: item.feeHeadIds?.map((id) => `FeeHead-${id}`) || [],
  })) || []; // Added fallback to ensure mappedData is always an array

  const transformedData = data?.map((item) => ({
    ...item,
    academicYear: item.academicYear || 'N/A',
    className: item.className || 'N/A',
    feeHeadNames: item.feeHeadNames || [],
  }));

  const handleSave = async (formData: any) => {
    try {
      // Find if a mapping exists for the selected academicYearId and classId
      const mapping = Array.isArray(data)
        ? data.find((m: any) => m.academicYearId === formData.academicYearId && m.classId === formData.classId)
        : undefined;
      // Remove id if not updating
      const cleanData = { ...formData };
      if (!mapping || !mapping.id) {
        delete cleanData.id;
      }
      if (mapping && mapping.id) {
        // Update existing mapping
        await updateClassFeeMapping(mapping.id, cleanData);
        showSuccess('Success', 'Class Fee Mapping updated successfully.');
      } else {
        // Create new mapping
        await createClassFeeMapping(cleanData);
        showSuccess('Success', 'Class Fee Mapping created successfully.');
      }
      setShowForm(false);
      setEditing(null);
      setEditingRecord(undefined);
    } catch (err) {
      handleApiError(err, 'save class fee mapping');
    }
  };

  const handleEdit = (classFeeMapping: any) => {
    setEditing(classFeeMapping.id);
    // Find the latest record from data, fallback to classFeeMapping
    const latest = data.find((f: any) => f.id === classFeeMapping.id) || classFeeMapping;
    // Always use the ID fields for academicYearId, classId, and feeHeadIds
    setEditingRecord({
      ...latest,
      academicYearId: latest.academicYearId || '',
      classId: latest.classId || '',
      feeHeadIds: Array.isArray(latest.feeHeadIds) ? latest.feeHeadIds : [],
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Class Fee Mapping',
      message: 'Are you sure you want to delete this class fee mapping? This action cannot be undone.',
      onConfirm: () => confirmDelete(id),
      loading: false,
    });
  };

  const confirmDelete = async (id: string) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteClassFeeMapping(id);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
      showSuccess('Delete', 'Class Fee Mapping deleted successfully.');
    } catch (err) {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
      showError('Error', 'Failed to delete class fee mapping.');
    }
  };

  const handleBulkUpdateToggle = () => {
    setBulkUpdateMode((prev) => !prev);
    if (!bulkUpdateMode) clearSelection();
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteClassFeeMappings(Array.from(selectedItems));
      setShowBulkDeleteDialog(false);
      clearSelection();
      showSuccess('Bulk Delete', `${selectedCount} class fee mapping${selectedCount > 1 ? 's' : ''} deleted successfully.`);
    } catch (error) {
      setShowBulkDeleteDialog(false);
      showError('Bulk Delete Failed', 'Failed to delete selected class fee mappings. Please try again.');
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.length >= MIN_SEARCH_LENGTH || term === '') {
      searchClassFeeMappings(term);
    }
  };

  const handleImport = async (file: File, onProgress?: (progress: number) => void) => {
    console.warn('Import functionality is not implemented.');
    return { success: 0, errors: [] };
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    console.warn('Export functionality is not implemented.');
    return new Blob();
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
              Class Fee Mapping Management
              <OrgBranchHeader className="ml-2" />
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">Configure and manage class fee mappings for your institution</p>
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
          <StatsCard title="Total" value={totalCount} subtitle="Class Fee Mappings" icon={Plus} iconColor="text-slate-700" iconBgColor="bg-slate-100" valueColor="text-slate-900" />
          <StatsCard title="Active" value={(data || []).filter((s: any) => s.IsActive).length} subtitle="Active" icon={RefreshCw} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" valueColor="text-emerald-700" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5 flex items-center gap-4">
          <div className="flex-1">
            <SearchBox value={searchTerm} placeholder="Search by class fee mapping..." onChange={handleSearchChange} className="w-full" />
          </div>
          <MoreActionsButton
            items={[{
              label: bulkUpdateMode ? 'Exit Bulk Update' : 'Bulk Update',
              icon: <Edit3 className="h-3.5 w-3.5" />,
              onClick: handleBulkUpdateToggle,
            }, {
              label: 'Import Class Fee Mappings',
              icon: <Upload className="h-3.5 w-3.5" />,
              onClick: () => setShowImportDialog(true),
            }, {
              label: 'Export Class Fee Mappings',
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
            title="Delete Selected Class Fee Mappings"
            message={`Are you sure you want to delete ${selectedCount} selected class fee mapping${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
            type="danger"
            confirmText="Delete"
            cancelText="Cancel"
          />
          <ClassFeeMapList
            classFeeMappings={transformedData as (ClassFeeMapping & {
              academicYear: string;
              className: string;
              feeHeadNames: string[];
            })[]}
            loading={loading}
            onEdit={(item) => handleEdit(item as ClassFeeMapping & {
              academicYear: string;
              className: string;
              feeHeadNames: string[];
            })}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
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
          title={editing ? "Edit Class Fee Mapping" : "Create New Class Fee Mapping"}
          size="md"
        >
          <ClassFeeMapForm
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
          title="Import Class Fee Mappings"
          description="Upload a CSV or Excel file to import class fee mappings in bulk. Download the sample template for correct format."
          sampleData={[{
            AcademicYearId: 'AY2025',
            ClassId: 'C001',
            FeeHeadIds: 'FH001,FH002',
          }]}
          acceptedFormats={['.csv', '.xlsx', '.xls']}
        />

        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          onExport={handleExport}
          title="Export Class Fee Mappings"
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