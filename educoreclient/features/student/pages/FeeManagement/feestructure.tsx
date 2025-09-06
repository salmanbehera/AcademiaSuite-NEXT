"use client";
import { useState } from 'react';
import { useFeestructure } from '@/features/student/hooks/FeeManagement/useFeestructure';
import { FeeStructureService } from '@/features/student/services/FeeManagement/feestructureService';
import FeeStructureForm from '@/features/student/components/FeeManagement/FeeStructure/FeeStructureForm';
import { Modal } from '@/app/components/ui/Modal';
import FeeStructureList from '@/features/student/components/FeeManagement/FeeStructure/FeeStructureList';
import { useToast } from '@/app/components/ui/ToastProvider';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { Button } from '@/app/components/ui/Button';
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

export default function FeeStructurePage() {
	const { showError, showSuccess } = useToast();
	const { handleApiError } = useGlobalErrorHandler();
	const [showFormPage, setShowFormPage] = useState(false);
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
		feestructures,
		filteredFeestructures,
		loading,
		error,
		totalCount,
		pageIndex,
		pageSize,
		totalPages,
		startItem,
		endItem,
		searchFeestructures,
		sortBy,
		sortOrder,
		setSortBy,
		setSortOrder,
		setPageIndex,
		setPageSize,
		refresh,
		createFeestructure,
		updateFeestructure,
		deleteFeestructure,
		bulkDeleteFeestructures,
	} = useFeestructure();
	const {
		selectedItems,
		selectedCount,
		isSelected,
		isAllSelected,
		isIndeterminate,
		toggleItem,
		toggleSelectAll,
		clearSelection,
	} = useBulkSelection(filteredFeestructures);

	const handleSave = async (data: any) => {
		try {
			if (editing && editingRecord) {
				await updateFeestructure(editingRecord.id, data);
			} else {
				await createFeestructure(data);
			}
			setShowFormPage(false);
			setEditing(null);
			setEditingRecord(undefined);
		} catch (err) {
			handleApiError(err, editing ? 'update fee structure' : 'create fee structure');
			showError('Error', `Failed to save fee structure. ${(err instanceof Error ? err.message : '')}`);
		}
	};
	const handleEdit = async (structure: any) => {
		try {
			const data = await FeeStructureService.getFeeStructureById(structure.id);
			setEditing(structure.id);
			setEditingRecord(data);
			setShowFormPage(true);
		} catch (err) {
			showError('Error', 'Failed to fetch fee structure for editing.');
		}
	};
	const handleDelete = (id: string) => {
		setConfirmDialog({
			isOpen: true,
			title: 'Delete Fee Structure',
			message: 'Are you sure you want to delete this fee structure? This action cannot be undone.',
			onConfirm: () => confirmDelete(id),
			loading: false,
		});
	};
	const confirmDelete = async (id: string) => {
		setConfirmDialog((prev) => ({ ...prev, loading: true }));
		try {
			await deleteFeestructure(id);
			setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
			showSuccess('Delete', 'Fee structure deleted successfully.');
		} catch (err) {
			setConfirmDialog((prev) => ({ ...prev, loading: false }));
			showError('Error', 'Failed to delete fee structure.');
		}
	};
	const handleBulkUpdateToggle = () => {
		setBulkUpdateMode((prev) => !prev);
		if (!bulkUpdateMode) clearSelection();
	};
	const handleBulkDelete = async () => {
		try {
			await bulkDeleteFeestructures(Array.from(selectedItems));
			setShowBulkDeleteDialog(false);
			clearSelection();
			showSuccess('Bulk Delete', `${selectedCount} fee structure${selectedCount > 1 ? 's' : ''} deleted successfully.`);
		} catch (error) {
			setShowBulkDeleteDialog(false);
			showError('Bulk Delete Failed', 'Failed to delete selected fee structures. Please try again.');
		}
	};
	const handleSearchChange = (term: string) => {
		setSearchTerm(term);
		if (term.length >= MIN_SEARCH_LENGTH || term === '') {
			searchFeestructures(term);
		}
	};
	const handleExport = async (format: 'csv' | 'excel') => {
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

	// If showFormPage, render the form in a modal popup
	if (showFormPage) {
		return (
			<>
				<Modal isOpen={showFormPage} onClose={() => {
					setShowFormPage(false);
					setEditing(null);
					setEditingRecord(undefined);
				}} title={editing ? 'Edit Fee Structure' : 'Add Fee Structure'} size="xl">
					<FeeStructureForm
						onSubmit={handleSave}
						defaultValues={editing ? editingRecord : undefined}
						onCancel={() => {
							setShowFormPage(false);
							setEditing(null);
							setEditingRecord(undefined);
						}}
					/>
				</Modal>
			</>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
			<div className="max-w-7xl mx-auto p-4 space-y-4">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
					<div>
						<h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
							Fee Structure Management
							<OrgBranchHeader className="ml-2" />
						</h1>
						<p className="mt-0.5 text-xs text-slate-600">Configure and manage fee structures for your institution</p>
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
								setShowFormPage(true);
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
					<StatsCard title="Total" value={totalCount} subtitle="Structures" icon={Plus} iconColor="text-slate-700" iconBgColor="bg-slate-100" valueColor="text-slate-900" />
					<StatsCard title="Active" value={feestructures.filter((s: any) => s.isActive).length} subtitle="Active" icon={RefreshCw} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" valueColor="text-emerald-700" />
				</div>

				{/* Search + More Actions */}
				<div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5 flex items-center gap-4">
					<div className="flex-1">
						<SearchBox value={searchTerm} placeholder="Search by fee group..." onChange={handleSearchChange} className="w-full" />
					</div>
					<MoreActionsButton
						items={[{
							label: bulkUpdateMode ? 'Exit Bulk Update' : 'Bulk Update',
							icon: <Edit3 className="h-3.5 w-3.5" />,
							onClick: handleBulkUpdateToggle,
						}, {
							label: 'Import Structures',
							icon: <Upload className="h-3.5 w-3.5" />,
							onClick: () => setShowImportDialog(true),
						}, {
							label: 'Export Structures',
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
						title="Delete Selected Structures"
						message={`Are you sure you want to delete ${selectedCount} selected structure${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
						type="danger"
						confirmText="Delete"
						cancelText="Cancel"
					/>
					   <FeeStructureList
						   feestructures={filteredFeestructures}
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

				{/* Import Dialog */}
				<ImportDialog
					isOpen={showImportDialog}
					onClose={() => setShowImportDialog(false)}
					onImport={async (file) => {
						// TODO: implement actual import logic
						return { success: 0, errors: [] };
					}}
					title="Import Structures"
					description="Upload a CSV or Excel file to import fee structures in bulk. Download the sample template for correct format."
					sampleData={[{
						feeGroupId: '5D58DFB4-293A-4398-B11D-CA27CFC64262',
						classId: 'ADC9A294-D8A1-482D-96BE-2FB51E497A47',
						semesterId: '682B0D3D-95A4-4951-9C62-07FA9626C667',
						academicYearId: '381EC6C6-0B22-4E1C-B2C1-FB918D857079',
						startDate: '2024-06-01',
						endDate: '2025-05-30',
						isActive: true,
						details: [],
					}]}
					acceptedFormats={['.csv', '.xlsx', '.xls']}
				/>

				{/* Export Dialog */}
				<ExportDialog
					isOpen={showExportDialog}
					onClose={() => setShowExportDialog(false)}
					onExport={handleExport}
					title="Export Structures"
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
