"use client";
import { useState } from 'react';
import { useBranch } from '@/features/Administration/hooks/useBranch';
import BranchList from '@/features/Administration/components/branch/BranchList';
import BranchForm from '@/features/Administration/components/branch/BranchForm';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';
import { useToast } from '@/app/components/ui/ToastProvider';

export default function BranchPage() {
  const { showError, showSuccess } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | string>(null);
  const [editingRecord, setEditingRecord] = useState<any | undefined>(undefined);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false,
  });

  const {
    branches,
    filteredBranches,
    loading,
    error,
    createBranch,
    updateBranch,
    deleteBranch,
    refresh,
    searchQuery,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    totalCount,
    totalPages,
    startItem,
    endItem,
    bulkDeleteBranches,
  } = useBranch();

  // Add/Edit
  const handleSave = async (data: any) => {
    try {
      let result;
      if (editing && editingRecord) {
        result = await updateBranch(editingRecord.id, data);
      } else {
        result = await createBranch(data);
      }
      setShowForm(false);
      setEditing(null);
      setEditingRecord(undefined);
      refresh();
      return result;
    } catch (err) {
      showError('Creation Failed', 'Failed to save branch');
      throw err;
    }
  };

  // Edit
  const handleEdit = (branch: any) => {
    setEditing(branch.id);
    setEditingRecord(branch);
    setShowForm(true);
  };

  // Delete
  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Branch',
      message: 'Are you sure you want to delete this branch? This action cannot be undone.',
      onConfirm: () => confirmDelete(id),
      loading: false,
    });
  };

  const confirmDelete = async (id: string) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteBranch(id);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
      refresh();
      showSuccess('Success', 'Branch deleted successfully');
    } catch (err) {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
      console.error('Failed to delete branch', err);
      showError('Error', 'Failed to delete branch.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto p-4 space-y-3">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-4">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Branch Management</h1>
          <p className="mt-0.5 text-xs text-slate-600">
            Configure and manage branch information and settings
          </p>
          <div className="flex justify-end mb-4">
            <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditing(null); setEditingRecord(undefined); }}>
              Add Branch
            </Button>
          </div>
          <div className="mt-6 text-center text-slate-500">
            {loading ? <p>Loading...</p> : <BranchList branches={filteredBranches} onEdit={handleEdit} onDelete={handleDelete} />}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Branch' : 'Add Branch'}>
          <BranchForm
            onSubmit={handleSave}
            defaultValues={editingRecord}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
        {/* Confirmation Dialog for Delete */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
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
