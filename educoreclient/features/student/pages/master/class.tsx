'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit, Trash2, RefreshCw, AlertCircle, 
  Building2, Users, Target, Activity, CheckCircle2, Plus, X, MoreVertical, Upload, Download, Edit3, HelpCircle
} from 'lucide-react';
import { useClasses } from '@/features/student/hooks/master';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { 
  MasterBulkActions, 
  MasterImportDialog, 
  MasterHelpDialog 
} from '@/features/student/shared';
import { ClassDto } from '@/features/student/types/master/classTypes';
import { Button } from '@/app/components/ui/Button';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { StatsCard } from '@/app/components/ui/StatsCard';
import { SearchBox } from '@/app/components/ui/SearchBox';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { useToast } from '@/app/components/ui/ToastProvider';
import { OrganizationConfig } from '@/app/components/ui/OrganizationConfig';
import { validateClassForm, isFormValid, ClassFormData } from '@/lib/validations';
import { CLASS_FORM_DEFAULTS, MESSAGES } from '@/lib/constants';

export default function ClassPage() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const {
    classes,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize,
    
    // Pagination computed values
    totalPages,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    pageSizeOptions,
    
    // Actions
    createClass,
    updateClass,
    deleteClass,
    bulkDeleteClasses,
    toggleClassStatus,
    importClasses,
    
    // Pagination actions
    setPageIndex,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    refresh,
  } = useClasses();

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Close more actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    loading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false
  });
  
  // Form state using constants
  const [formData, setFormData] = useState<ClassFormData>(CLASS_FORM_DEFAULTS);

  // Filter classes based on search
  const filteredClasses = classes.filter(cls =>
    (cls.className && cls.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.classShortName && cls.classShortName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Bulk selection functionality (after filteredClasses)
  const {
    selectedItems,
    selectedCount,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection(filteredClasses);

  // Form validation using utility function
  const validateForm = (): boolean => {
    const errors = validateClassForm(formData);
    setFormErrors(errors);
    return isFormValid(errors);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure numeric fields are properly typed
      const submissionData = {
        ...formData,
        displayOrder: Number(formData.displayOrder) || 1,
        maxStrength: Number(formData.maxStrength) || 0,
        reservationSeats: Number(formData.reservationSeats) || 0,
      };
      
      if (editingClass) {
        const success = await updateClass(editingClass, submissionData);
        if (success) {
          showSuccess('Class Updated', 'Class has been updated successfully.');
          setShowAddForm(false);
          setEditingClass(null);
          resetForm();
        } else {
          showError('Update Failed', 'Failed to update the class. Please try again.');
        }
      } else {
        const success = await createClass(submissionData);
        if (success) {
          showSuccess('Class Created', 'New class has been created successfully.');
          setShowAddForm(false);
          resetForm();
        } else {
          showError('Creation Failed', 'Failed to create the class. Please try again.');
        }
      }
    } catch (error) {
      showError('Operation Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form using constants
  const resetForm = () => {
    setFormData(CLASS_FORM_DEFAULTS);
    setFormErrors({});
  };

  // Handle edit
  const handleEdit = (classItem: any) => {
    setFormData({
      className: classItem.className || '',
      classShortName: classItem.classShortName || '',
      displayOrder: Number(classItem.displayOrder) || 1,
      maxStrength: Number(classItem.maxStrength) || 40,
      reservationSeats: Number(classItem.reservationSeats) || 0,
      isActive: classItem.isActive !== undefined ? classItem.isActive : true,
    });
    setEditingClass(classItem.id);
    setFormErrors({});
    setShowAddForm(true);
  };

  // Handle delete with confirmation dialog
  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Class',
      message: 'Are you sure you want to delete this class? This action cannot be undone.',
      onConfirm: () => confirmDelete(id),
      loading: false
    });
  };

  // Confirm delete action
  const confirmDelete = async (id: string) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      const success = await deleteClass(id);
      if (success) {
        showSuccess('Class Deleted', 'Class has been deleted successfully.');
        setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
      } else {
        showError('Delete Failed', 'Failed to delete the class. Please try again.');
        setConfirmDialog(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      showError('Delete Failed', 'An unexpected error occurred while deleting the class.');
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const success = await bulkDeleteClasses(Array.from(selectedItems));
    if (success) {
      showSuccess('Bulk Delete Successful', `${selectedCount} classes have been deleted successfully.`);
      clearSelection();
      setShowBulkDeleteDialog(false);
    } else {
      showError('Bulk Delete Failed', 'Failed to delete selected classes. Please try again.');
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const success = await toggleClassStatus(id, !currentStatus);
      if (success) {
        const statusText = currentStatus ? 'deactivated' : 'activated';
        showSuccess('Status Updated', `Class has been ${statusText} successfully.`);
      } else {
        showError('Status Update Failed', 'Failed to update class status. Please try again.');
      }
    } catch (error) {
      showError('Update Failed', 'An unexpected error occurred while updating the status.');
    }
  };

  // Handle export functionality
  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = filteredClasses.map((classItem, index) => ({
        'S.No': index + 1,
        'Class Name': classItem.className,
        'Class Code': classItem.classShortName,
        'Display Order': classItem.displayOrder,
        'Max Strength': classItem.maxStrength,
        'Reserved Seats': classItem.reservationSeats,
        'Available Seats': classItem.maxStrength - classItem.reservationSeats,
        'Status': classItem.isActive ? 'Active' : 'Inactive',
        'Created Date': new Date().toLocaleDateString(), // You can use actual created date if available
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `classes_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Export Successful', `${exportData.length} classes exported successfully.`);
    } catch (error) {
      showError('Export Failed', 'Failed to export classes. Please try again.');
    }
  };

  // Handle import functionality
  const handleImport = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: number; errors: any[] } | null> => {
    try {
      const result = await importClasses(file, onProgress);
      if (result) {
        showSuccess('Import Successful', `${result.success} classes imported successfully.${result.errors.length > 0 ? ` ${result.errors.length} records failed.` : ''}`);
      }
      return result;
    } catch (error) {
      showError('Import Failed', 'Failed to import classes. Please try again.');
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Compact Professional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Class Management</h1>
            <p className="mt-0.5 text-xs text-slate-600">
              Configure and manage academic classes for your institution
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                refresh();
                showSuccess('Data Refreshed', 'Class data has been refreshed successfully.');
              }}
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
                resetForm();
                setEditingClass(null);
                setShowAddForm(true);
              }}
            >
              Create New
            </Button>
          </div>
        </div>

        {/* Organization Configuration Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-slate-900">Organization Configuration</h3>
              <p className="text-xs text-slate-600 mt-0.5">Current organization and branch settings (will be from JWT in production)</p>
            </div>
            <OrganizationConfig />
          </div>
        </div>

        {/* Professional Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200/60 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xs font-medium text-red-900">Error occurred</h3>
                <p className="mt-0.5 text-xs text-red-700">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.reload();
                  showInfo('Reloading Page', 'The page is being reloaded...');
                }}
                className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
              >
                Reload
              </Button>
            </div>
          </div>
        )}

        {/* Compact Professional Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard
            title="Total"
            value={totalCount}
            subtitle="Classes"
            icon={Building2}
            iconColor="text-slate-700"
            iconBgColor="bg-slate-100"
            valueColor="text-slate-900"
          />
          
          <StatsCard
            title="Active"
            value={classes.filter(c => c.isActive).length}
            subtitle="Running"
            icon={Activity}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            valueColor="text-emerald-700"
          />
          
          <StatsCard
            title="Capacity"
            value={classes.reduce((sum, cls) => sum + (cls.maxStrength || 0), 0)}
            subtitle="Students"
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            valueColor="text-blue-700"
          />
          
          <StatsCard
            title="Reserved"
            value={classes.reduce((sum, cls) => sum + (cls.reservationSeats || 0), 0)}
            subtitle="Seats"
            icon={Target}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
            valueColor="text-amber-700"
          />
        </div>

        {/* Bulk Actions - Only show when in bulk update mode and items are selected */}
        {bulkUpdateMode && selectedCount > 0 && (
          <MasterBulkActions
            selectedCount={selectedCount}
            onBulkDelete={() => setShowBulkDeleteDialog(true)}
            onClearSelection={clearSelection}
            loading={loading}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600 mx-auto"></div>
            <p className="mt-3 text-xs text-slate-600">Loading classes...</p>
          </div>
        )}

        {/* Professional Classes Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200/60">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Title and Mode Indicator */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-bold text-slate-900">Classes</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {filteredClasses.length}
                    </span>
                  </div>
                  {bulkUpdateMode && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm">
                      Bulk Update Mode
                    </span>
                  )}
                </div>

                {/* Center: Search Panel */}
                <div className="flex-1 max-w-md mx-4">
                  <SearchBox
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search classes by name or code..."
                    className="w-full"
                  />
                </div>
                
                {/* Right: More Actions Dropdown */}
                <div className="relative" ref={moreActionsRef}>
                  <button
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-150"
                  >
                    <MoreVertical className="h-3.5 w-3.5 mr-1" />
                    More Actions
                  </button>
                  
                  {showMoreActions && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setBulkUpdateMode(!bulkUpdateMode);
                            setShowMoreActions(false);
                            if (!bulkUpdateMode) {
                              clearSelection();
                            }
                          }}
                          className="flex items-center w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-2" />
                          {bulkUpdateMode ? 'Exit Bulk Update' : 'Bulk Update'}
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreActions(false);
                            setShowImportDialog(true);
                          }}
                          className="flex items-center w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                        >
                          <Upload className="h-3.5 w-3.5 mr-2" />
                          Import Classes
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreActions(false);
                            handleExport();
                          }}
                          className="flex items-center w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                        >
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Export Classes
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                          onClick={() => {
                            setShowMoreActions(false);
                            setShowHelpDialog(true);
                          }}
                          className="flex items-center w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                        >
                          <HelpCircle className="h-3.5 w-3.5 mr-2" />
                          Help & User Guide
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/60">
                <thead className="bg-slate-50/50">
                  <tr>
                    {bulkUpdateMode && (
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        <Checkbox
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                        />
                      </th>
                    )}
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Class Details
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200/60">
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={bulkUpdateMode ? 6 : 5} className="px-4 py-6 text-center text-slate-500 text-xs">
                        {searchTerm ? 'No classes found matching your search.' : 'No classes available. Create your first class!'}
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((classItem) => (
                      <tr key={classItem.id} className={`hover:bg-slate-50/50 transition-colors duration-150 ${bulkUpdateMode && isSelected(classItem.id) ? 'bg-blue-50' : ''}`}>
                        {bulkUpdateMode && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Checkbox
                              checked={isSelected(classItem.id)}
                              onChange={() => toggleItem(classItem.id)}
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white font-semibold text-xs">{classItem.classShortName}</span>
                            </div>
                            <div className="ml-3">
                              <div className="text-xs font-medium text-slate-900">{classItem.className}</div>
                              <div className="text-xs text-slate-500">Code: {classItem.classShortName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs font-medium text-slate-900">{classItem.maxStrength || 0}</div>
                          <div className="text-xs text-slate-500">{classItem.reservationSeats || 0} reserved</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-slate-900">{classItem.displayOrder || 0}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge
                            isActive={classItem.isActive}
                            onClick={() => handleStatusToggle(classItem.id, classItem.isActive)}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleEdit(classItem)}
                              className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Edit Class"
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                            </button>
                            <button
                              onClick={() => handleDelete(classItem.id)}
                              className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Delete Class"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500 group-hover:text-red-700 transition-colors duration-200" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Enhanced Pagination */}
            {totalCount > 0 && (
              <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-200/60">
                {/* Desktop View */}
                <div className="hidden md:flex items-center justify-between">
                  {/* Page Size Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 shadow-sm"
                    >
                      {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-slate-600">per page</span>
                  </div>

                  {/* Results Info */}
                  <div className="text-sm text-slate-600">
                    Showing {startItem} to {endItem} of {totalCount} classes
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center space-x-1">
                    {/* First Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={!hasPrevPage}
                      className="px-2"
                      title="First page"
                    >
                      ⏮
                    </Button>

                    {/* Previous Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={!hasPrevPage}
                      title="Previous page"
                    >
                      ⏪ Prev
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1 mx-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const startPage = Math.max(0, Math.min(pageIndex - 2, totalPages - 5));
                        const pageNumber = startPage + i;
                        
                        if (pageNumber >= totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={pageIndex === pageNumber ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setPageIndex(pageNumber)}
                            className="px-3 min-w-[2.5rem]"
                          >
                            {pageNumber + 1}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Next Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      title="Next page"
                    >
                      Next ⏩
                    </Button>

                    {/* Last Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={!hasNextPage}
                      className="px-2"
                      title="Last page"
                    >
                      ⏭
                    </Button>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                  {/* Results Info & Page Size */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {startItem}-{endItem} of {totalCount}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 shadow-sm"
                      >
                        {pageSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={!hasPrevPage}
                        className="px-2"
                      >
                        ⏮
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevPage}
                        disabled={!hasPrevPage}
                      >
                        ⏪
                      </Button>
                    </div>

                    <div className="text-sm text-slate-600">
                      Page {pageIndex + 1} of {totalPages}
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={!hasNextPage}
                      >
                        ⏩
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={!hasNextPage}
                        className="px-2"
                      >
                        ⏭
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Page Info (Desktop) */}
                <div className="hidden md:block text-center text-xs text-slate-500 mt-2">
                  Page {pageIndex + 1} of {totalPages}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Professional Add/Edit Form Modal */}
        <Modal
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditingClass(null);
            resetForm();
          }}
          title={editingClass ? 'Edit Class' : 'Create New Class'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">{/* Rest of form content here */}
                {/* Class Name and Short Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Class Name"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    error={formErrors.className}
                    placeholder="e.g., Class 10"
                  />
                  
                  <Input
                    label="Short Name"
                    required
                    value={formData.classShortName}
                    onChange={(e) => setFormData({ ...formData, classShortName: e.target.value })}
                    error={formErrors.classShortName}
                    placeholder="e.g., C10"
                  />
                </div>

                {/* Capacity and Order Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    type="number"
                    label="Display Order"
                    required
                    min={1}
                    value={formData.displayOrder.toString()}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    error={formErrors.displayOrder}
                  />
                  
                  <Input
                    type="number"
                    label="Max Strength"
                    required
                    min={1}
                    value={formData.maxStrength.toString()}
                    onChange={(e) => setFormData({ ...formData, maxStrength: parseInt(e.target.value) || 40 })}
                    error={formErrors.maxStrength}
                  />
                  
                  <Input
                    type="number"
                    label="Reserved Seats"
                    required
                    min={0}
                    value={formData.reservationSeats.toString()}
                    onChange={(e) => setFormData({ ...formData, reservationSeats: parseInt(e.target.value) || 0 })}
                    error={formErrors.reservationSeats}
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Status</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.isActive === true}
                        onChange={() => setFormData({ ...formData, isActive: true })}
                        className="h-3.5 w-3.5 text-slate-600 focus:ring-slate-500 border-slate-300"
                      />
                      <span className="ml-1.5 text-xs text-slate-700">Active</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.isActive === false}
                        onChange={() => setFormData({ ...formData, isActive: false })}
                        className="h-3.5 w-3.5 text-red-600 focus:ring-red-500 border-slate-300"
                      />
                      <span className="ml-1.5 text-xs text-slate-700">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingClass(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    {editingClass ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
        </Modal>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type="danger"
          confirmText="Delete"
          cancelText="Cancel"
          loading={confirmDialog.loading}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showBulkDeleteDialog}
          onClose={() => setShowBulkDeleteDialog(false)}
          onConfirm={handleBulkDelete}
          title="Confirm Bulk Delete"
          message={`Are you sure you want to delete ${selectedCount} selected class${selectedCount > 1 ? 'es' : ''}? This action cannot be undone.`}
          confirmText="Delete All"
          cancelText="Cancel"
          type="danger"
        />

        {/* Import Dialog */}
        <MasterImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImport}
        />

        {/* Help Dialog */}
        <MasterHelpDialog
          isOpen={showHelpDialog}
          onClose={() => setShowHelpDialog(false)}
        />
      </div>
    </div>
  );
}
