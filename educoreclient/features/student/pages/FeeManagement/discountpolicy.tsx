
"use client";
import { useState } from 'react';
import { useDiscountPolicy } from '@/features/student/hooks/FeeManagement/useDiscountPolicy';
import DiscountpolicyForm from '@/features/student/components/FeeManagement/DiscountPolicy/DiscountpolicyForm';
import DiscountpolicyList from '@/features/student/components/FeeManagement/DiscountPolicy/DiscountpolicyList';
import { useToast } from '@/app/components/ui/ToastProvider';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';
import { BulkActions } from '@/components/common/BulkActions';
import { ErrorAlert } from '@/app/components/ui/ErrorAlert';
import { PaginationControls } from '@/app/components/ui/PaginationControls';
import OrgBranchHeader from '@/components/OrgBranchHeader';
import { StatsCard } from '@/app/components/ui/StatsCard';
import { SearchBox } from '@/app/components/ui/SearchBox';
import { Plus, RefreshCw, Edit3, Upload, Download, HelpCircle } from 'lucide-react';
import { ImportDialog } from '@/components/common/ImportDialog';
import { ExportDialog } from '@/components/common/ExportDialog';
import { HelpDialog } from '@/components/common/HelpDialog';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { MoreActionsButton } from '@/app/components/ui/MoreActionsButton';


export default function DiscountPolicyPage() {
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
	const [searchTerm, setSearchTerm] = useState('');
	const MIN_SEARCH_LENGTH = 2;
	const {
		discountpolicies,
		filteredDiscountpolicies,
		searchQuery,
		loading,
		error,
		totalCount,
		pageIndex,
		pageSize,
		totalPages,
		startItem,
		endItem,
		searchDiscountpolicies,
		sortBy,
		sortOrder,
		setSortBy,
		setSortOrder,
		setPageIndex,
		setPageSize,
		refresh,
		createDiscountpolicy,
		updateDiscountpolicy,
		deleteDiscountpolicy,
		bulkDeleteDiscountpolicies,
	} = useDiscountPolicy();
	const {
		selectedItems,
		selectedCount,
		isSelected,
		isAllSelected,
		isIndeterminate,
		toggleItem,
		toggleSelectAll,
		clearSelection,
	} = useBulkSelection(filteredDiscountpolicies);

	const handleSave = async (data: any) => {
		try {
			if (editing && editingRecord) {
				await updateDiscountpolicy(editingRecord.id, data);
			} else {
				await createDiscountpolicy(data);
			}
			setShowForm(false);
			setEditing(null);
			setEditingRecord(undefined);
		} catch (err) {
			handleApiError(err, editing ? 'update discount policy' : 'create discount policy');
			showError('Error', `Failed to save discount policy. ${(err instanceof Error ? err.message : '')}`);
		}
	};
	const handleEdit = (policy: any) => {
		setEditing(policy.id);
		setEditingRecord(policy);
		setShowForm(true);
	};
	const handleDelete = (id: string) => {
		setConfirmDialog({
			isOpen: true,
			title: 'Delete Discount Policy',
			message: 'Are you sure you want to delete this discount policy? This action cannot be undone.',
			onConfirm: () => confirmDelete(id),
			loading: false,
		});
	};
	const confirmDelete = async (id: string) => {
		setConfirmDialog((prev) => ({ ...prev, loading: true }));
		try {
			await deleteDiscountpolicy(id);
			setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
			showSuccess('Delete', 'Discount policy deleted successfully.');
		} catch (err) {
			setConfirmDialog((prev) => ({ ...prev, loading: false }));
			showError('Error', 'Failed to delete discount policy.');
		}
	};
	const handleBulkUpdateToggle = () => {
		setBulkUpdateMode((prev) => !prev);
		if (!bulkUpdateMode) clearSelection();
	};
	const handleBulkDelete = async () => {
		try {
			await bulkDeleteDiscountpolicies(Array.from(selectedItems));
			setShowBulkDeleteDialog(false);
			clearSelection();
			showSuccess('Bulk Delete', `${selectedCount} discount polic${selectedCount > 1 ? 'ies' : 'y'} deleted successfully.`);
		} catch (error) {
			setShowBulkDeleteDialog(false);
			showError('Bulk Delete Failed', 'Failed to delete selected discount policies. Please try again.');
		}
	};
	const handleSearchChange = (term: string) => {
		setSearchTerm(term);
		if (term.length >= MIN_SEARCH_LENGTH || term === '') {
			searchDiscountpolicies(term);
		}
	};
	const handleExport = async (format: 'csv' | 'excel') => {
		// TODO: implement export logic
		setShowExportDialog(false);
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
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
					<div>
						<h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
							Discount Policy Management
							<OrgBranchHeader className="ml-2" />
						</h1>
						<p className="mt-0.5 text-xs text-slate-600">Configure and manage discount policies for your institution</p>
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

				{/* Error Message */}
				<ErrorAlert message={error ?? ""} onReload={refresh} />

				{/* Stats Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
					<StatsCard title="Total" value={totalCount} subtitle="Policies" icon={Plus} iconColor="text-slate-700" iconBgColor="bg-slate-100" valueColor="text-slate-900" />
					<StatsCard title="Active" value={discountpolicies.filter((s: any) => s.isActive).length} subtitle="Active" icon={RefreshCw} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" valueColor="text-emerald-700" />
				</div>

				{/* Search + More Actions */}
				<div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5 flex items-center gap-4">
					<div className="flex-1">
						<SearchBox value={searchTerm} placeholder="Search by policy name..." onChange={handleSearchChange} className="w-full" />
					</div>
					<MoreActionsButton
						items={[{
							label: bulkUpdateMode ? 'Exit Bulk Update' : 'Bulk Update',
							icon: <Edit3 className="h-3.5 w-3.5" />,
							onClick: handleBulkUpdateToggle,
						}, {
							label: 'Import Policies',
							icon: <Upload className="h-3.5 w-3.5" />,
							onClick: () => setShowImportDialog(true),
						}, {
							label: 'Export Policies',
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

				{/* Table & Bulk Actions */}
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
						title="Delete Selected Policies"
						message={`Are you sure you want to delete ${selectedCount} selected policy${selectedCount > 1 ? 'ies' : 'y'}? This action cannot be undone.`}
						type="danger"
						confirmText="Delete"
						cancelText="Cancel"
					/>
					<DiscountpolicyList
						discountpolicies={filteredDiscountpolicies}
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
					title={editing ? "Edit Discount Policy" : "Create New Discount Policy"}
					size="md"
				>
					<DiscountpolicyForm
						onSubmit={handleSave}
						defaultValues={editing ? editingRecord : undefined}
						onCancel={() => {
							setShowForm(false);
							setEditing(null);
							setEditingRecord(undefined);
						}}
					/>
				</Modal>

				{/* Import Dialog */}
				<ImportDialog
					isOpen={showImportDialog}
					onClose={() => setShowImportDialog(false)}
					onImport={async (file) => {
						// TODO: implement actual import logic
						return { success: 0, errors: [] };
					}}
					title="Import Policies"
					description="Upload a CSV or Excel file to import discount policies in bulk. Download the sample template for correct format."
					sampleData={[{
						policyName: 'Early Payment Discount',
						discountType: 1,
						discountValue: 10.0,
						appliesTo: 'SpecificHeads',
						appliesToDetails: '{"HeadIds":[101,102]}',
						eligibilityCriteria: '{"criteria":"Sibling","minSiblings":1,"maxSiblings":3}',
						maxLimit: 100.0,
						effectiveFrom: '2024-06-01T00:00:00Z',
						effectiveTo: '2024-12-31T23:59:59Z',
						isActive: true,
					}]}
					acceptedFormats={['.csv', '.xlsx', '.xls']}
				/>

				{/* Export Dialog */}
				<ExportDialog
					isOpen={showExportDialog}
					onClose={() => setShowExportDialog(false)}
					onExport={handleExport}
					title="Export Policies"
					defaultFormat="csv"
				/>

				{/* Help Dialog */}
				<HelpDialog
					isOpen={showHelpDialog}
					onClose={() => setShowHelpDialog(false)}
					contentType="class"
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
