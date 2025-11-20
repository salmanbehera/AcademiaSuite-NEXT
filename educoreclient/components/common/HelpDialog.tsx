"use client";

import React from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Upload,
  Download,
  Search,
  CheckSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentType?: "class" | "section" | "studentcategory" | "academicYear";
}

const HelpDialog: React.FC<HelpDialogProps> = ({
  isOpen,
  onClose,
  contentType = "class",
}) => {
  const isSection = contentType === "section";
  const isStudentCategory = contentType === "studentcategory";
  const isAcademicYear = contentType === "academicYear";

  // Entity names for each type
  const entityName = isAcademicYear
    ? "Academic Year"
    : isStudentCategory
    ? "Student Category"
    : isSection
    ? "Section"
    : "Class";
  const entityNameLower = isAcademicYear
    ? "academic year"
    : isStudentCategory
    ? "student category"
    : isSection
    ? "section"
    : "class";
  const entityNamePlural = isAcademicYear
    ? "academic years"
    : isStudentCategory
    ? "student categories"
    : isSection
    ? "sections"
    : "classes";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${entityName} Management Help & User Guide`}
      size="xl"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Quick Start */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
            Quick Start Guide
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="text-blue-900 mb-2">
              Welcome to {entityName} Management! This system helps you create,
              manage, and organize academic {entityNamePlural} for your
              institution.
            </p>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>
                View all {entityNamePlural} in a professional table format
              </li>
              <li>
                Create new {entityNamePlural} with detailed{" "}
                {isSection ? "capacity" : "capacity"} settings
              </li>
              <li>Edit existing {entityNamePlural} and manage their status</li>
              <li>Import/Export {entityNameLower} data for bulk operations</li>
              <li>Search and filter {entityNamePlural} efficiently</li>
            </ul>
          </div>
        </section>

        {/* Basic Operations */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Plus className="h-4 w-4 mr-2 text-green-600" />
            Basic Operations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3">
              <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                <Plus className="h-3.5 w-3.5 mr-1 text-green-600" />
                Create New {entityName}
              </h4>
              <p className="text-xs text-slate-600 mb-2">
                Click &quot;Create New&quot; button to add a new{" "}
                {entityNameLower}:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-2">
                <li>
                  <strong>{entityName} Name:</strong> Full name (e.g., &quot;
                  {isStudentCategory
                    ? "General Category"
                    : isSection
                    ? "Section A"
                    : "Class 10"}
                  &quot;)
                </li>
                <li>
                  <strong>{entityName} Code:</strong> Short identifier (e.g.,
                  &quot;
                  {isStudentCategory ? "GEN" : isSection ? "SEC-A" : "C10"}
                  &quot;)
                </li>
                <li>
                  <strong>Display Order:</strong> Sorting sequence number
                </li>
                <li>
                  <strong>Max Strength:</strong> Maximum student capacity
                </li>
                {!isSection && !isStudentCategory && (
                  <li>
                    <strong>Reserved Seats:</strong> Seats reserved for special
                    categories
                  </li>
                )}
                <li>
                  <strong>Status:</strong> Active or Inactive
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-3">
              <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                <Edit3 className="h-3.5 w-3.5 mr-1 text-blue-600" />
                Edit {entityName}
              </h4>
              <p className="text-xs text-slate-600 mb-2">
                Click the edit icon (pencil) in any row to:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-2">
                <li>Modify {entityNameLower} details</li>
                <li>Update capacity settings</li>
                <li>Change display order</li>
                <li>All fields are editable</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Search className="h-4 w-4 mr-2 text-purple-600" />
            Search & Filter
          </h3>
          <div className="border border-slate-200 rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">
                  Search Features:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-2">
                  <li>Search by {entityNameLower} name or code</li>
                  <li>Real-time filtering as you type</li>
                  <li>Case-insensitive search</li>
                  <li>Results update instantly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">
                  Status Management:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-2">
                  <li>Click status badge to toggle Active/Inactive</li>
                  <li>Green badge = Active {entityNameLower}</li>
                  <li>Red badge = Inactive {entityNameLower}</li>
                  <li>Changes are saved immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Bulk Operations */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <CheckSquare className="h-4 w-4 mr-2 text-indigo-600" />
            Bulk Operations
          </h3>
          <div className="border border-slate-200 rounded-lg p-3">
            <h4 className="font-medium text-slate-800 mb-2">
              How to use Bulk Update:
            </h4>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside ml-2">
              <li>
                Click &quot;More Actions&quot; → &quot;Bulk Update&quot; to
                enable selection mode
              </li>
              <li>Checkboxes will appear in the first column</li>
              <li>
                Select individual {entityNamePlural} or use &quot;Select
                All&quot; checkbox
              </li>
              <li>Bulk Actions panel appears with delete option</li>
              <li>
                Click &quot;Exit Bulk Update&quot; to return to normal mode
              </li>
            </ol>
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
              <p className="text-xs text-amber-800 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                <strong>Note:</strong> Bulk delete performs soft delete (sets
                isActive = false)
              </p>
            </div>
          </div>
        </section>

        {/* Import/Export */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-orange-600" />
            Import & Export Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3">
              <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                <Upload className="h-3.5 w-3.5 mr-1 text-blue-600" />
                Import {entityNamePlural}
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-2">
                <li>
                  Click &quot;More Actions&quot; → &quot;Import{" "}
                  {entityNamePlural}&quot;
                </li>
                <li>Upload CSV, XLSX, or XLS files</li>
                <li>Download sample template for correct format</li>
                <li>Drag & drop or click to browse files</li>
                <li>View progress and error reports</li>
              </ul>
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-800">
                  <strong>Required columns:</strong> {entityName} Name,{" "}
                  {entityName} Code, Display Order, Max Strength
                  {!isSection && !isStudentCategory ? ", Reserved Seats" : ""},
                  Status
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3">
              <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                <Download className="h-3.5 w-3.5 mr-1 text-green-600" />
                Export {entityNamePlural}
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside ml-2">
                <li>
                  Click &quot;More Actions&quot; → &quot;Export{" "}
                  {entityNamePlural}&quot;
                </li>
                <li>Downloads CSV file with all visible {entityNamePlural}</li>
                <li>Includes filtered results if search is active</li>
                <li>File named with current date</li>
                <li>Opens in Excel, Google Sheets, etc.</li>
              </ul>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Use search to filter before export for
                  specific data sets
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Info className="h-4 w-4 mr-2 text-cyan-600" />
            Status Indicators & Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-slate-200 rounded p-2 text-center">
              <div className="text-slate-700 font-medium text-xs">Total</div>
              <div className="text-slate-600 text-xs">
                All {entityNamePlural} in system
              </div>
            </div>
            <div className="border border-emerald-200 rounded p-2 text-center bg-emerald-50">
              <div className="text-emerald-700 font-medium text-xs">Active</div>
              <div className="text-emerald-600 text-xs">
                Currently active {entityNamePlural}
              </div>
            </div>
            <div className="border border-blue-200 rounded p-2 text-center bg-blue-50">
              <div className="text-blue-700 font-medium text-xs">Capacity</div>
              <div className="text-blue-600 text-xs">
                Total student capacity
              </div>
            </div>
            {!isSection && !isStudentCategory && (
              <div className="border border-amber-200 rounded p-2 text-center bg-amber-50">
                <div className="text-amber-700 font-medium text-xs">
                  Reserved
                </div>
                <div className="text-amber-600 text-xs">
                  Reserved seat count
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
            Troubleshooting
          </h3>
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-lg p-3">
              <h4 className="font-medium text-slate-800 mb-2">
                Common Issues:
              </h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    Q: Import fails with validation errors
                  </p>
                  <p className="text-xs text-slate-600 ml-2">
                    A: Download the sample template and ensure your CSV matches
                    the exact format. Check for missing required fields.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    Q: {entityNamePlural} not showing after creation
                  </p>
                  <p className="text-xs text-slate-600 ml-2">
                    A: Click the &quot;Refresh&quot; button or check if you have
                    search filters applied.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    Q: Cannot delete {entityNameLower}
                  </p>
                  <p className="text-xs text-slate-600 ml-2">
                    A: System performs soft delete (isActive = false).{" "}
                    {entityNamePlural} remain in database but become inactive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Tips & Best Practices
          </h3>
          <div className="border border-slate-200 rounded-lg p-3">
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>
                <strong>{entityName} Codes:</strong> Use consistent naming (
                {isStudentCategory
                  ? "GEN, OBC, SC, ST..."
                  : isSection
                  ? "SEC-A, SEC-B, SEC-C..."
                  : "C1, C2, C3..."}
                ) for easy sorting
              </li>
              <li>
                <strong>Display Order:</strong> Use incremental numbers (1, 2,
                3...) for proper sequencing
              </li>
              <li>
                <strong>Capacity Planning:</strong> Set Max Strength based on{" "}
                {isStudentCategory
                  ? "category limits"
                  : isSection
                  ? "section"
                  : "classroom"}{" "}
                capacity
              </li>
              {!isSection && !isStudentCategory && (
                <li>
                  <strong>Reserved Seats:</strong> Account for special
                  categories (SC/ST/OBC quotas)
                </li>
              )}
              <li>
                <strong>Regular Backups:</strong> Export {entityNameLower} data
                periodically for backup
              </li>
              <li>
                <strong>Bulk Operations:</strong> Use import for initial setup,
                export for reports
              </li>
              <li>
                <strong>Search Efficiency:</strong> Use {entityNameLower} codes
                for faster search results
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-500">
            {entityName} Management System v1.0 | AcademiaSuite
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white text-xs rounded-md hover:bg-slate-700 transition-colors"
          >
            Close Help
          </button>
        </div>
      </div>
    </Modal>
  );
};

export { HelpDialog };
