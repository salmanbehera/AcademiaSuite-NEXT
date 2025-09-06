
'use client';

import { useState, useRef, useEffect } from 'react';

// --- Types ---
import type { StudentCategory, StudentCategoryCreateRequest as StudentCategoryFormData } from '@/features/student/types/master/studentCategoryTypes';
import { Edit, Trash2, RefreshCw, AlertCircle, Tag, CheckCircle2, Plus, MoreVertical, HelpCircle } from 'lucide-react';
import { Upload, Download } from 'lucide-react';
import { StudentCategoryService } from '@/features/student/services/master/studentCategoryService';
import { validateCreateStudentCategory, validateUpdateStudentCategory, StudentCategoryValidationError } from '@/lib/validation/Academic/studentCategorySchema';
// Validation helpers
import { StudentCategorySchema } from '@/lib/validation/Academic/studentCategorySchema';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { MasterBulkActions, MasterImportDialog, MasterHelpDialog } from '@/features/student/shared';
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

export default function StudentCategoryPage() {
  // --- Import handler (matches class page pattern) ---
  const handleImport = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: number; errors: any[] } | null> => {
    try {
      const result = await StudentCategoryService.importStudentCategories(file, 'csv');
      if (result) {
        toast.showSuccess('Import Successful', `${result.success || 0} categories imported successfully.${result.errors && result.errors.length > 0 ? ` ${result.errors.length} records failed.` : ''}`);
        refresh();
      }
      return result;
    } catch (error) {
      toast.showError('Import Failed', 'Failed to import student categories. Please try again.');
      return null;
    }
  };
  const { organizationId, branchId, isReady } = useOrganization();

  // --- State & Hooks ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StudentCategory | null>(null);
  const [formData, setFormData] = useState<StudentCategoryFormData>({
    organizationId: organizationId || '',
    branchId: branchId || '',
    categoryName: '',
    categoryShortName: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; onConfirm: (() => Promise<void>) | null; title: string; message: string; loading: boolean }>({ isOpen: false, onConfirm: null, title: '', message: '', loading: false });
  const moreActionsRef = useRef(null);
  const toast = useToast();

  // --- Data ---
  const [studentCategories, setStudentCategories] = useState<StudentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const refresh = () => fetchCategories();


  // --- API Logic ---
  const fetchCategories = async () => {
    // eslint-disable-next-line no-console
    console.log('fetchCategories called', { isReady, organizationId, branchId });
    // TEMP: Bypass isReady for debugging
    if (!organizationId || !branchId) return;
    setLoading(true);
    setError('');
    try {
      const res = await StudentCategoryService.getStudentCategories({
        pageIndex,
        pageSize,
        organizationId,
        branchId,
      });
      const categories: StudentCategory[] = Array.isArray(res?.studentcategorydto?.data)
        ? res.studentcategorydto.data.map((cat: any) => ({
            ...cat,
            createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
            updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : undefined,
          }))
        : [];
      setStudentCategories(categories);
      setTotalCount(categories.length);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, [pageIndex, pageSize]);


  const createStudentCategory = async (formData: StudentCategoryFormData) => {
    if (!isReady || !organizationId || !branchId) return;
    setLoading(true);
    setError('');
    try {
      // Validate form data
      const validated = validateCreateStudentCategory({
        organizationId,
        branchId,
        categoryName: formData.categoryName,
        categoryShortName: formData.categoryShortName,
        isActive: formData.isActive,
      });
      if (!validated.success) {
        throw new StudentCategoryValidationError(validated.error);
      }
      await StudentCategoryService.createStudentCategory(validated.data);
      fetchCategories();
    } catch (err: any) {
      if (err instanceof StudentCategoryValidationError) {
        setError(Object.values(err.getFieldErrors()).join(', '));
      } else {
        setError(err?.message || 'Failed to create category');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const updateStudentCategory = async (id: string, formData: StudentCategoryFormData) => {
    if (!isReady || !organizationId || !branchId) return false;
    setLoading(true);
    setError('');
    try {
      // Validate form data
      const validated = validateUpdateStudentCategory({
        id,
        organizationId,
        branchId,
        categoryName: formData.categoryName,
        categoryShortName: formData.categoryShortName,
        isActive: formData.isActive,
      });
      if (!validated.success) {
        throw new StudentCategoryValidationError(validated.error);
      }
      await StudentCategoryService.updateStudentCategory(id, validated.data);
      fetchCategories();
      return true;
    } catch (err: any) {
      if (err instanceof StudentCategoryValidationError) {
        setError(Object.values(err.getFieldErrors()).join(', '));
      } else {
        setError(err?.message || 'Failed to update category');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };


  const deleteStudentCategory = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      // Find the category in the current list
      const categoryToDelete = studentCategories.find(cat => cat.id === id);
      if (!categoryToDelete) throw new Error('Category not found');
      const { createdAt, updatedAt, ...rest } = categoryToDelete;
      const fullUpdateData = {
        ...rest,
        organizationId,
        branchId,
        isActive: false,
      };
      await StudentCategoryService.updateStudentCategory(id, fullUpdateData);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- Computed values for pagination (match class page) ---
  const pageSizeOptions = [5, 10, 25, 50, 100];
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = pageIndex < totalPages - 1;
  const hasPrevPage = pageIndex > 0;
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);
  // --- Pagination navigation functions (match class/section page) ---
  const goToFirstPage = () => setPageIndex(0);
  const goToLastPage = () => setPageIndex(totalPages > 0 ? totalPages - 1 : 0);
  const nextPage = () => setPageIndex((prev) => prev + 1);
  const prevPage = () => setPageIndex((prev) => Math.max(prev - 1, 0));


  // --- Import/Export logic (CSV, matching class page) ---
  const generateCSV = (data: StudentCategory[]) => {
    // Match class/section page: consistent header, quoted values, handle commas in values
    const headers = ['Category Name', 'Category Code', 'Status'];
    const csvRows = [headers.join(',')];
    data.forEach(cat => {
      const row = [
        `"${(cat.categoryName ?? '').replace(/"/g, '""')}"`,
        `"${(cat.categoryShortName ?? '').replace(/"/g, '""')}"`,
        cat.isActive ? 'Active' : 'Inactive'
      ];
      csvRows.push(row.join(','));
    });
    return csvRows.join('\r\n');
  };

  const exportCategories = async () => {
    try {
      const exportData = filteredCategories;
      const csvContent = generateCSV(exportData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `student_categories_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.showSuccess('Export Complete', `${exportData.length} categories exported successfully.`);
      }
    } catch (error) {
      toast.showError('Export Failed', 'Failed to export student categories.');
    }
  };

  // const importCategories = async (file: File, onProgress?: (progress: number) => void) => {
  //   try {
  //     const reader = new FileReader();
  //     reader.onload = async (e) => {
  //       const text = e.target?.result as string;
  //       const lines = text.split(/\r?\n/);
  //       if (lines.length < 2) {
  //         toast.showError('Import Failed', 'CSV file is empty or missing header.');
  //         return;
  //       }
  //       let success = 0, errors: string[] = [];
  //       for (let i = 1; i < lines.length; i++) { // skip header
  //         const line = lines[i].trim();
  //         if (!line) continue;
  //         const match = line.match(/"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*(Active|Inactive)/);
  //         if (!match) {
  //           errors.push(line);
  //           continue;
  //         }
  //         const [, categoryName, categoryShortName, status] = match;
  //         try {
  //           await createStudentCategory({
  //             organizationId,
  //             branchId,
  //             categoryName,
  //             categoryShortName,
  //             isActive: status === 'Active',
  //           });
  //           success++;
  //         } catch (err) {
  //           errors.push(line);
  //         }
  //         if (onProgress) onProgress(success / (lines.length - 1) * 100);
  //       }
  //       toast.showSuccess('Import Successful', `${success} categories imported successfully.${errors.length > 0 ? ` ${errors.length} records failed.` : ''}`);
  //       if (errors.length > 0) console.error('Import errors:', errors);
  //       await refresh();
  //     };
  //     reader.readAsText(file);
  //   } catch (error) {
  //     toast.showError('Import Failed', 'Failed to import student categories.');
  //   }
  // };

  // --- Bulk logic ---
  const bulkDeleteCategories = async (ids: string[]) => {
    for (const id of ids) {
      await deleteStudentCategory(id);
    }
    await refresh();
  };


  // --- Bulk Selection ---
  const {
    selectedItems,
    isSelected,
    toggleItem,
    clearSelection,
    isAllSelected,
    toggleSelectAll,
  } = useBulkSelection(studentCategories.map((c: any) => c.id));

  // --- Derived Data ---
  const filteredCategories = studentCategories.filter((cat: any) =>
    cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.categoryShortName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // ...existing code...

  // --- Form Logic ---
  const resetForm = () => setFormData({
    organizationId: organizationId || '',
    branchId: branchId || '',
    categoryName: '',
    categoryShortName: '',
    isActive: true,
  });
  const resetFormErrors = () => setFormErrors({});
  const handleInputChange = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));
  const handleEdit = (category: StudentCategory) => {
    setEditingCategory(category);
    setFormData({
      organizationId: organizationId || '',
      branchId: branchId || '',
      categoryName: category.categoryName,
      categoryShortName: category.categoryShortName,
      isActive: category.isActive,
    });
    resetFormErrors();
    setShowAddForm(true);
  };
  const handleDelete = (category: StudentCategory) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          // Fix date type mismatch for API
          const categoryToDelete = studentCategories.find(cat => cat.id === category.id);
          if (!categoryToDelete) throw new Error('Category not found');
          const fullUpdateData = {
            ...categoryToDelete,
            organizationId,
            branchId,
            isActive: false,
            createdAt: categoryToDelete.createdAt ? categoryToDelete.createdAt.toISOString() : undefined,
            updatedAt: categoryToDelete.updatedAt ? categoryToDelete.updatedAt.toISOString() : undefined,
          };
          await StudentCategoryService.updateStudentCategory(category.id, fullUpdateData);
          toast.showSuccess('Success', 'Category deleted');
          refresh();
        } catch (err: any) {
          toast.showError('Error', err?.response?.data?.message || 'Delete failed');
        } finally {
          setConfirmDialog({ isOpen: false, onConfirm: null, title: '', message: '', loading: false });
        }
      },
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.categoryName}"?`,
      loading: false,
    });
  };
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFormErrors();
    // Validate form
    const result = StudentCategorySchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse({
      ...formData,
      organizationId,
      branchId,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[String(issue.path[0])] = issue.message;
      });
      setFormErrors(errors);
      toast.showWarning('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createStudentCategory(formData);
      toast.showSuccess('Success', 'Category created');
      setShowAddForm(false);
      resetForm();
      refresh();
    } catch (err: any) {
      toast.showError('Error', err?.response?.data?.message || 'Create failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFormErrors();
    // Validate form
    const result = StudentCategorySchema.partial().extend({
      id: StudentCategorySchema.shape.id,
      organizationId: StudentCategorySchema.shape.organizationId,
      branchId: StudentCategorySchema.shape.branchId,
    }).safeParse({
      ...formData,
      id: editingCategory?.id,
      organizationId,
      branchId,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[String(issue.path[0])] = issue.message;
      });
      setFormErrors(errors);
      toast.showWarning('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCategory && editingCategory.id) {
        const success = await updateStudentCategory(editingCategory.id, formData);
        if (success) {
          toast.showSuccess('Success', 'Category updated');
          setShowAddForm(false);
          setEditingCategory(null);
          resetForm();
          refresh();
        } else {
          toast.showError('Error', error || 'Update failed');
        }
      }
    } catch (err: any) {
      toast.showError('Error', err?.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportCategories();
      // No extra toast here; exportCategories already shows the correct message
    } catch (err: any) {
      toast.showError('Error', err?.response?.data?.message || 'Export failed');
    }
  };



  // --- Effects ---

  useEffect(() => {
    if (!showMoreActions) return;
    function handleClickOutside(e: MouseEvent) {
      if (moreActionsRef.current && (moreActionsRef.current as HTMLElement).contains(e.target as Node)) {
        // inside
      } else {
        setShowMoreActions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreActions]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-slate-200/60 p-2.5">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Student Category Management</h1>
            <p className="mt-0.5 text-xs text-slate-600">Configure and manage student categories for your institution</p>
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
              onClick={() => { resetForm(); setEditingCategory(null); setShowAddForm(true); }}
            >
              Add Category
            </Button>
          </div>
        </div>

        {/* Organization Configuration Panel */}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard
            title="Total"
            value={studentCategories.length}
            subtitle="Categories"
            icon={Tag}
            iconColor="text-slate-700"
            iconBgColor="bg-slate-100"
            valueColor="text-slate-900"
          />
          <StatsCard
            title="Active"
            value={studentCategories.filter((c: any) => c.isActive).length}
            subtitle="Running"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            valueColor="text-emerald-700"
          />
          <StatsCard
            title="Inactive"
            value={studentCategories.filter((c: any) => !c.isActive).length}
            subtitle="Inactive"
            icon={AlertCircle}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            valueColor="text-orange-700"
          />
        </div>

        {/* Compact Header & Actions (match class page) */}
        <div className="px-4 py-3 border-b border-slate-200/60">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title, Count, Bulk Update Indicator */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-slate-900">Student Categories</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {filteredCategories.length}
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
                placeholder="Search categories by name or code..."
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
                      <Edit className="h-3.5 w-3.5 mr-2" />
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
                      Import Categories
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        handleExport();
                      }}
                      className="flex items-center w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Export Categories
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

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <MasterBulkActions
            selectedCount={selectedItems.size}
            onBulkDelete={async () => {
              await bulkDeleteCategories(Array.from(selectedItems));
              clearSelection();
            }}
            onClearSelection={clearSelection}
            loading={loading}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600 mx-auto"></div>
            <p className="mt-3 text-xs text-slate-600">Loading categories...</p>
          </div>
        )}

        {/* Categories Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/60">
                <thead className="bg-slate-50/50">
                  <tr>
                    {bulkUpdateMode && (
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
                      </th>
                    )}
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Category Details</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200/60">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={bulkUpdateMode ? 5 : 4} className="px-4 py-6 text-center text-slate-500 text-xs">
                        {searchTerm ? 'No categories found matching your search.' : 'No categories available. Create your first category!'}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className={`hover:bg-slate-50/50 transition-colors duration-150 ${bulkUpdateMode && isSelected(category.id) ? 'bg-blue-50' : ''}`}>
                        {bulkUpdateMode && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Checkbox checked={isSelected(category.id)} onChange={() => toggleItem(category.id)} />
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white font-semibold text-xs">{category.categoryShortName}</span>
                            </div>
                            <div className="ml-3">
                              <div className="text-xs font-medium text-slate-900">{category.categoryName}</div>
                              <div className="text-xs text-slate-500">Code: {category.categoryShortName}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge isActive={category.isActive} size="sm" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleEdit(category)}
                              className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Edit Category"
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Delete Category"
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
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">Show:</span>
                    <select
                      value={pageSize}
                      onChange={e => setPageSize(Number(e.target.value))}
                      className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 shadow-sm"
                    >
                      {pageSizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <span className="text-sm text-slate-600">per page</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Showing {startItem} to {endItem} of {totalCount} categories
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" onClick={goToFirstPage} disabled={!hasPrevPage} className="px-2" title="First page">⏮</Button>
                    <Button variant="outline" size="sm" onClick={prevPage} disabled={!hasPrevPage} title="Previous page">⏪ Prev</Button>
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
                    <Button variant="outline" size="sm" onClick={nextPage} disabled={!hasNextPage} title="Next page">Next ⏩</Button>
                    <Button variant="outline" size="sm" onClick={goToLastPage} disabled={!hasNextPage} className="px-2" title="Last page">⏭</Button>
                  </div>
                </div>
                <div className="md:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {startItem}-{endItem} of {totalCount}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">Show:</span>
                      <select
                        value={pageSize}
                        onChange={e => setPageSize(Number(e.target.value))}
                        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 shadow-sm"
                      >
                        {pageSizeOptions.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Button variant="outline" size="sm" onClick={goToFirstPage} disabled={!hasPrevPage} className="px-2">⏮</Button>
                      <Button variant="outline" size="sm" onClick={prevPage} disabled={!hasPrevPage}>⏪</Button>
                    </div>
                    <div className="text-sm text-slate-600">
                      Page {pageIndex + 1} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="outline" size="sm" onClick={nextPage} disabled={!hasNextPage}>⏩</Button>
                      <Button variant="outline" size="sm" onClick={goToLastPage} disabled={!hasNextPage} className="px-2">⏭</Button>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block text-center text-xs text-slate-500 mt-2">
                  Page {pageIndex + 1} of {totalPages}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddForm}
          onClose={() => { setShowAddForm(false); setEditingCategory(null); resetForm(); }}
          title={editingCategory ? 'Edit Student Category' : 'Create Student Category'}
          size="md"
        >
          <form onSubmit={editingCategory ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Category Name"
                required
                value={formData.categoryName}
                onChange={e => handleInputChange('categoryName', e.target.value)}
                error={formErrors.categoryName}
                placeholder="Enter category name"
              />
              <Input
                label="Short Name"
                required
                value={formData.categoryShortName}
                onChange={e => handleInputChange('categoryShortName', e.target.value)}
                error={formErrors.categoryShortName}
                placeholder="Enter short name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Status</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="status" checked={formData.isActive === true} onChange={() => handleInputChange('isActive', true)} className="h-3.5 w-3.5 text-slate-600 focus:ring-slate-500 border-slate-300" />
                  <span className="ml-1.5 text-xs text-slate-700">Active</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="status" checked={formData.isActive === false} onChange={() => handleInputChange('isActive', false)} className="h-3.5 w-3.5 text-red-600 focus:ring-red-500 border-slate-300" />
                  <span className="ml-1.5 text-xs text-slate-700">Inactive</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60">
              <Button type="button" variant="secondary" size="sm" onClick={() => { setShowAddForm(false); setEditingCategory(null); resetForm(); resetFormErrors(); }}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isSubmitting} loading={isSubmitting}>{editingCategory ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>

        {/* Confirmation Dialog */}
        <ConfirmationDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmDialog.onConfirm ?? (() => {})} title={confirmDialog.title} message={confirmDialog.message} type="danger" confirmText="Delete" cancelText="Cancel" loading={confirmDialog.loading} />
        {/* Import Dialog (matches class page, with sample CSV) */}
        <MasterImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImport}
        />
        {/* Help Dialog */}
        <MasterHelpDialog isOpen={showHelpDialog} onClose={() => setShowHelpDialog(false)} />
      </div>
    </div>
  );

  }