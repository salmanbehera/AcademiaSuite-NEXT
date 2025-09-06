"use client";
import { useState } from 'react';
import { useOrganization } from '@/features/Administration/hooks/useOrganization';
import OrganizationList from '@/features/Administration/components/organization/OrganizationList';
import OrganizationForm from '@/features/Administration/components/organization/OrganizationForm';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';
import { useToast } from '@/app/components/ui/ToastProvider';

export default function OrganizationPage() {
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
    organizations,
    filteredOrganizations,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
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
    bulkDeleteOrganizations,
  } = useOrganization();

  // Add/Edit
  const handleSave = async (data: any) => {
    try {
      let result;
      if (editing && editingRecord) {
        result = await updateOrganization(editingRecord.id, data);
      } else {
        result = await createOrganization(data);
      }
      setShowForm(false);
      setEditing(null);
      setEditingRecord(undefined);
      refresh();
      return result;
    } catch (err) {
      showError('Creation Failed', 'Failed to save organization');
      throw err;
    }
  };

  // Edit
  const handleEdit = (org: any) => {
    setEditing(org.id);
    setEditingRecord(org);
    setShowForm(true);
  };

  // Delete
  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Organization',
      message: 'Are you sure you want to delete this organization? This action cannot be undone.',
      onConfirm: () => confirmDelete(id),
      loading: false,
    });
  };

  const confirmDelete = async (id: string) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteOrganization(id);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
  refresh();
  showSuccess('Success', 'Organization deleted successfully');
    } catch (err) {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
      console.error('Failed to delete organization', err);
      showError('Error', 'Failed to delete organization.');
    }
  };

  
  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto p-4 space-y-3">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-4">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Organization Management</h1>
          <p className="mt-0.5 text-xs text-slate-600">
            Configure and manage organization information and settings
          </p>
          <div className="flex justify-end mb-4">
            <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditing(null); setEditingRecord(undefined); }}>
              Add Organization
            </Button>
          </div>
          <div className="mt-6 text-center text-slate-500">
            {loading ? <p>Loading...</p> : <OrganizationList organizations={filteredOrganizations} onEdit={handleEdit} onDelete={handleDelete} />}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Organization' : 'Add Organization'}>
          <OrganizationForm
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
