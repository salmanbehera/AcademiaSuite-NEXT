"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<{ success: number; errors: unknown[] } | null>;
  title: string;
  description: string;
  sampleData?: Record<string, unknown>[];
  acceptedFormats?: string[];
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  title,
  description,
  sampleData = [],
  acceptedFormats = [".csv", ".xlsx", ".xls"],
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: number;
    errors: unknown[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const fileExtension =
      "." + selectedFile.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      alert(`Please select a valid file format: ${acceptedFormats.join(", ")}`);
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const importResult = await onImport(file, (progressValue) => {
        setProgress(progressValue);
      });

      setResult(importResult);
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    if (sampleData.length === 0) return;

    const headers = Object.keys(sampleData[0]);
    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetDialog = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!uploading) {
      resetDialog();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
      <div className="space-y-6">
        {/* Description */}
        <div className="text-sm text-slate-600">{description}</div>

        {/* Sample Download */}
        {sampleData.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Download Sample Template
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSample}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Download a sample CSV file with the correct format and example
              data.
            </p>
          </div>
        )}

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : file
              ? "border-green-400 bg-green-50"
              : "border-slate-300 hover:border-slate-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(",")}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          {file ? (
            <div className="space-y-2">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div className="font-medium text-green-900">{file.name}</div>
              <div className="text-sm text-green-700">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-12 w-12 text-slate-400 mx-auto" />
              <div className="font-medium text-slate-900">
                Drop your file here or click to browse
              </div>
              <div className="text-sm text-slate-600">
                Supports: {acceptedFormats.join(", ")} (Max 10MB)
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing...</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div
            className={`border rounded-lg p-4 ${
              result.errors.length > 0
                ? "border-amber-200 bg-amber-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              {result.errors.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span
                className={`font-medium ${
                  result.errors.length > 0 ? "text-amber-900" : "text-green-900"
                }`}
              >
                Import Completed
              </span>
            </div>
            <div
              className={`text-sm ${
                result.errors.length > 0 ? "text-amber-700" : "text-green-700"
              }`}
            >
              Successfully imported: {result.success} records
              {result.errors.length > 0 && (
                <div className="mt-1">
                  Failed: {result.errors.length} records
                </div>
              )}
            </div>
            {result.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-amber-700 hover:text-amber-800">
                  View Errors ({result.errors.length})
                </summary>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 5).map((error, index) => {
                    const err = error as
                      | { row?: number; message?: string }
                      | any;
                    return (
                      <div key={index} className="text-xs text-amber-600 py-1">
                        Row {err?.row ?? index + 1}:{" "}
                        {String(err?.message ?? err)}
                      </div>
                    );
                  })}
                  {result.errors.length > 5 && (
                    <div className="text-xs text-amber-600 py-1">
                      ... and {result.errors.length - 5} more errors
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={uploading}
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!file || uploading}
              loading={uploading}
            >
              Import Data
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export { ImportDialog };
