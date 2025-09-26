"use client";
import { useState } from 'react';
import { useStudentEnrollment } from '@/features/student/hooks/StudentEnrollment/useStudentEnrollment';
import StudentEnrollmentList from '@/features/student/components/StudentEnrollment/StudentEnrollmentList';
// import StudentEnrollmentForm from '@/features/student/components/StudentEnrollment/StudentEnrollmentForm';
import { useToast } from '@/app/components/ui/ToastProvider';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { Button } from '@/app/components/ui/Button';
import { ImportDialog } from '@/components/common/ImportDialog';
import { ExportDialog } from '@/components/common/ExportDialog';
import { ErrorAlert } from '@/app/components/ui/ErrorAlert';
import { PaginationControls } from '@/app/components/ui/PaginationControls';
import { HelpDialog } from '@/components/common/HelpDialog';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import OrgBranchHeader from '@/components/OrgBranchHeader';
import { SearchBox } from '@/app/components/ui/SearchBox';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Plus, RefreshCw, Upload, Download, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentEnrollmentPage() {
  const { showError, showSuccess } = useToast();
  const router = useRouter();
  const { handleApiError } = useGlobalErrorHandler();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | string>(null);
  const [editingRecord, setEditingRecord] = useState<any>(undefined);
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
  const [importResult, setImportResult] = useState<{ success: number; errors: any[] } | null>(null);
  const [importUploading, setImportUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const MIN_SEARCH_LENGTH = 2;
  const {
    enrollments,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    setPageIndex,
    setPageSize,
    refresh,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
  } = useStudentEnrollment();

  // Add/Edit
  const handleSave = async (data: any) => {
    try {
      if (editing && editingRecord) {
        await updateEnrollment(data);
      } else {
        await createEnrollment(data);
      }
      setShowForm(false);
      setEditing(null);
      setEditingRecord(undefined);
      refresh();
      showSuccess('Success', 'Student enrollment saved successfully.');
    } catch (err) {
      handleApiError(err, editing ? 'update student enrollment' : 'create student enrollment');
      showError('Error', `Failed to save student enrollment. ${(err instanceof Error ? err.message : '')}`);
    }
  };
  // Edit
  const handleEdit = (enrollment: any) => {
    setEditing(enrollment.id);
    const latest = enrollments.find((f: any) => f.id === enrollment.id) || enrollment;
    setEditingRecord(latest);
    setShowForm(true);
  };
  // Delete
  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Student Enrollment',
      message: 'Are you sure you want to delete this student enrollment? This action cannot be undone.',
      onConfirm: () => confirmDelete(id),
      loading: false,
    });
  };
  const confirmDelete = async (id: string) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteEnrollment(id);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
      showSuccess('Delete', 'Student enrollment deleted successfully.');
      refresh();
    } catch (err) {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
      showError('Error', 'Failed to delete student enrollment.');
    }
  };
  // Search
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    // Implement search in useStudentEnrollment if needed
    // searchEnrollments(term);
  };
  // Import
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
      setImportResult({ success: parsedData.length, errors });
      refresh();
    } catch (err) {
      setImportResult({ success: 0, errors: [err] });
    } finally {
      setImportUploading(false);
    }
    return importResult;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Student Enrollment
              <OrgBranchHeader className="ml-2" />
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">Manage student onboarding and enrollment records</p>
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
              
              onClick={() => router.push('/student/StudentEnrollmentForm')}
            >
              Add Student
            </Button>
          </div>
        </div>
         
        {/* Error Alert */}
        {error && <ErrorAlert message={error} onReload={refresh} />}
        {/* List */}
        <StudentEnrollmentList />
         
      </div>
      {/* Dialogs */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        loading={confirmDialog.loading}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        title="Import Student Enrollments"
        description="Upload a CSV or Excel file to import student enrollments."
      />
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={async () => new Blob()} // TODO: implement export logic
      />
      <HelpDialog isOpen={showHelpDialog} onClose={() => setShowHelpDialog(false)} />
      {/* <Modal open={showForm} onClose={() => setShowForm(false)}>
        <StudentEnrollmentForm
          initialValues={editingRecord}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal> */}
    </div>
  );
}
