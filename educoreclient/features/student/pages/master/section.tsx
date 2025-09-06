'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit, Trash2, RefreshCw, AlertCircle, 
  Building2, Users, Target, Activity, CheckCircle2, Plus, X, MoreVertical, Upload, Download, Edit3, HelpCircle
} from 'lucide-react';
import { useSections } from '@/features/student/hooks/master';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { 
  MasterBulkActions, 
  MasterImportDialog, 
  MasterHelpDialog 
} from '@/features/student/shared';
import { SectionDto } from '@/features/student/types/master/sectionTypes';
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
import { validateSectionForm, isFormValid, SectionFormData } from '@/lib/validations';
import { SECTION_FORM_DEFAULTS, MESSAGES } from '@/lib/constants';

export default function SectionPage() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const {
    sections,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    pageSizeOptions,
    createSection,
    updateSection,
    deleteSection,
    bulkDeleteSections,
    toggleSectionStatus,
    importSections,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    refresh,
  } = useSections();

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
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
  const [formData, setFormData] = useState<SectionFormData>(SECTION_FORM_DEFAULTS);

  // Filter sections based on search
  const filteredSections = sections.filter(section =>
    (section.sectionName && section.sectionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (section.sectionShortName && section.sectionShortName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Bulk selection functionality (after filteredSections)
  const {
    selectedItems,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleItem,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection(filteredSections);

  // Form validation using utility function
  const validateForm = (): boolean => {
    const errors = validateSectionForm(formData);
    setFormErrors(errors);
    return isFormValid(errors);
  };

  // Export functionality
  const handleExport = async () => {
    try {
      const csvContent = generateCSV(filteredSections);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sections_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      showSuccess('Export Complete', 'Sections data has been exported successfully.');
    } catch (error) {
      showError('Export Failed', 'Failed to export sections data.');
    }
  };

  // Generate CSV content
  const generateCSV = (data: any[]) => {
    const headers = ['Section Name', 'Section Code', 'Display Order', 'Max Strength', 'Status'];
    const csvRows = [headers.join(',')];
    
    data.forEach(section => {
      const row = [
        `"${section.sectionName}"`,
        `"${section.sectionShortName}"`,
        section.displayOrder,
        section.maxStrength,
        section.isActive ? 'Active' : 'Inactive'
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  // Import functionality
  const handleImport = async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const result = await importSections(file, onProgress);
      
      if (result) {
        const { success, errors } = result;
        
        if (success > 0) {
          showSuccess(
            'Import Successful', 
            `${success} section${success > 1 ? 's' : ''} imported successfully.`
          );
        }
        
        if (errors.length > 0) {
          const errorMsg = `${errors.length} row${errors.length > 1 ? 's' : ''} had errors. Check console for details.`;
          console.error('Import errors:', errors);
          showWarning('Import Completed with Errors', errorMsg);
        }
        
        setShowImportDialog(false);
        return result;
      }
      return null;
    } catch (error) {
      showError('Import Failed', 'Failed to import sections data.');
      return null;
    }
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
      if (editingSection) {
        const success = await updateSection(editingSection, formData);
        if (success) {
          showSuccess('Section Updated', 'Section has been updated successfully.');
          setShowAddForm(false);
          setEditingSection(null);
          resetForm();
        } else {
          showError('Update Failed', 'Failed to update the section. Please try again.');
        }
      } else {
        const success = await createSection(formData);
        if (success) {
          showSuccess('Section Created', 'New section has been created successfully.');
          setShowAddForm(false);
          resetForm();
        } else {
          showError('Creation Failed', 'Failed to create the section. Please try again.');
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
    setFormData(SECTION_FORM_DEFAULTS);
    setFormErrors({});
  };

  // Handle edit
  const handleEdit = (sectionItem: any) => {
    setFormData({
      sectionName: sectionItem.sectionName,
      sectionShortName: sectionItem.sectionShortName,
      displayOrder: sectionItem.displayOrder,
      maxStrength: sectionItem.maxStrength,
      isActive: sectionItem.isActive,
    });
    setEditingSection(sectionItem.id);
    setFormErrors({});
    setShowAddForm(true);
  };

  // Handle delete with confirmation dialog
  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section? This action cannot be undone.',
      onConfirm: () => confirmDelete(id),
      loading: false
    });
  };

  // Confirm delete action
  const confirmDelete = async (id: string) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      const success = await deleteSection(id);
      if (success) {
        showSuccess('Section Deleted', 'Section has been deleted successfully.');
        setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
      } else {
        showError('Delete Failed', 'Failed to delete the section. Please try again.');
        setConfirmDialog(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      showError('Delete Failed', 'An unexpected error occurred. Please try again.');
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setShowBulkDeleteDialog(false);
    
    try {
      const success = await bulkDeleteSections(Array.from(selectedItems));
      if (success) {
        showSuccess('Sections Deleted', `${selectedCount} section${selectedCount > 1 ? 's' : ''} deleted successfully.`);
        clearSelection();
        setBulkUpdateMode(false);
      } else {
        showError('Delete Failed', 'Failed to delete the selected sections. Please try again.');
      }
    } catch (error) {
      showError('Delete Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const success = await toggleSectionStatus(id, !currentStatus);
      if (success) {
        const statusText = !currentStatus ? 'activated' : 'deactivated';
        showSuccess('Status Updated', `Section has been ${statusText} successfully.`);
      } else {
        showError('Status Update Failed', 'Failed to update section status. Please try again.');
      }
    } catch (error) {
      showError('Status Update Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Compact Professional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Section Management</h1>
            <p className="mt-0.5 text-xs text-slate-600">
              Configure and manage academic sections for your institution
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                refresh();
                showSuccess('Data Refreshed', 'Section data has been refreshed successfully.');
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
                setEditingSection(null);
                setShowAddForm(true);
              }}
              disabled={loading}
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
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                Reload Page
              </Button>
            </div>
          </div>
        )}

        {/* Compact Professional Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard
            title="Total"
            value={totalCount}
            subtitle="Sections"
            icon={Building2}
            iconColor="text-slate-700"
            iconBgColor="bg-slate-100"
            valueColor="text-slate-900"
          />
          
          <StatsCard
            title="Active"
            value={sections.filter(s => s.isActive).length}
            subtitle="Running"
            icon={Activity}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            valueColor="text-emerald-700"
          />
          
          <StatsCard
            title="Capacity"
            value={sections.reduce((sum, section) => sum + section.maxStrength, 0)}
            subtitle="Students"
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            valueColor="text-blue-700"
          />
          
          <StatsCard
            title="Inactive"
            value={sections.filter(s => !s.isActive).length}
            subtitle="Sections"
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
          />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60">
          {/* Enhanced Header with Professional Three-Column Layout */}
          <div className="p-4 border-b border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-bold text-slate-900">Sections</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {filteredSections.length}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 max-w-md mx-4">
                <SearchBox
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search sections by name or code..."
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
                        Import Sections
                      </button>
                      <button
                        onClick={() => {
                          setShowMoreActions(false);
                          handleExport();
                        }}
                        className="flex items-center w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                      >
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Export Sections
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
                    Section Details
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Configuration
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
                {loading ? (
                  <tr>
                    <td colSpan={bulkUpdateMode ? 5 : 4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                        <span className="text-sm text-slate-500">Loading sections...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSections.length === 0 ? (
                  <tr>
                    <td colSpan={bulkUpdateMode ? 5 : 4} className="px-4 py-6 text-center text-slate-500 text-xs">
                      {searchTerm ? 'No sections found matching your search.' : 'No sections available. Create your first section!'}
                    </td>
                  </tr>
                ) : (
                  filteredSections.map((section) => (
                    <tr key={section.id} className={`hover:bg-slate-50/50 transition-colors duration-150 ${bulkUpdateMode && isSelected(section.id) ? 'bg-blue-50' : ''}`}>
                      {bulkUpdateMode && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Checkbox
                            checked={isSelected(section.id)}
                            onChange={() => toggleItem(section.id)}
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-xs">{section.sectionShortName}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-xs font-medium text-slate-900">{section.sectionName}</div>
                            <div className="text-xs text-slate-500">Code: {section.sectionShortName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-900">{section.maxStrength}</div>
                        <div className="text-xs text-slate-500">{section.displayOrder} order</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge
                          isActive={section.isActive}
                          onClick={() => handleStatusToggle(section.id, section.isActive)}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleEdit(section)}
                            className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit Section"
                            disabled={loading}
                          >
                            <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                          </button>
                          <button
                            onClick={() => handleDelete(section.id)}
                            className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete Section"
                            disabled={loading}
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

          {/* Enhanced Professional Pagination */}
          {totalCount > 0 && (
            <div className="px-4 py-3 border-t border-slate-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Results info */}
                <div className="text-xs text-slate-600">
                  Showing {startItem} to {endItem} of {totalCount} sections
                </div>
                
                {/* Page size dropdown and navigation */}
                <div className="flex items-center gap-4">
                  
                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {pageSizeOptions.map((size) => (
                        <option key={size} value={size} className="text-slate-700">
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Navigation buttons */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={!hasPrevPage || loading}
                      className="px-2 py-1 text-xs"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={!hasPrevPage || loading}
                      className="px-2 py-1 text-xs"
                    >
                      Previous
                    </Button>
                    
                    {/* Page indicator */}
                    <span className="px-3 py-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded">
                      {pageIndex + 1} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNextPage || loading}
                      className="px-2 py-1 text-xs"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={!hasNextPage || loading}
                      className="px-2 py-1 text-xs"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Section Form Modal */}
        <Modal
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditingSection(null);
            resetForm();
          }}
          title={editingSection ? 'Edit Section' : 'Create New Section'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section Name *
                </label>
                <Input
                  type="text"
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="Enter section name"
                  error={formErrors.sectionName}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section Code *
                </label>
                <Input
                  type="text"
                  value={formData.sectionShortName}
                  onChange={(e) => setFormData({ ...formData, sectionShortName: e.target.value })}
                  placeholder="Enter section code"
                  error={formErrors.sectionShortName}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Order *
                </label>
                <Input
                  type="number"
                  value={formData.displayOrder.toString()}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  placeholder="Enter display order"
                  error={formErrors.displayOrder}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max Strength *
                </label>
                <Input
                  type="number"
                  value={formData.maxStrength.toString()}
                  onChange={(e) => setFormData({ ...formData, maxStrength: parseInt(e.target.value) || 0 })}
                  placeholder="Enter maximum students"
                  error={formErrors.maxStrength}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
                Section is active
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingSection(null);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {editingSection ? 'Update Section' : 'Create Section'}
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
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          loading={confirmDialog.loading}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showBulkDeleteDialog}
          onClose={() => setShowBulkDeleteDialog(false)}
          onConfirm={handleBulkDelete}
          title="Delete Selected Sections"
          message={`Are you sure you want to delete ${selectedCount} selected section${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
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
