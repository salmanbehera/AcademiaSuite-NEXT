"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ImportDialog } from "@/components/common/ImportDialog";

interface MasterImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<{ success: number; errors: any[] } | null>;
}

/**
 * Smart Import Dialog that automatically detects the current page context
 * and shows appropriate import configuration for the master data management page
 */
const MasterImportDialog: React.FC<MasterImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const pathname = usePathname();

  // Auto-detect entity type and generate appropriate sample data
  const getImportConfig = () => {
    if (pathname?.includes("/class")) {
      return {
        title: "Import Classes",
        description:
          "Upload a CSV or Excel file to import class data. Make sure your file follows the correct format.",
        sampleData: [
          {
            "Class Name": "Class 1",
            "Class Code": "C1",
            "Display Order": 1,
            "Max Strength": 30,
            "Reserved Seats": 5,
            Status: "Active",
          },
          {
            "Class Name": "Class 2",
            "Class Code": "C2",
            "Display Order": 2,
            "Max Strength": 35,
            "Reserved Seats": 7,
            Status: "Active",
          },
          {
            "Class Name": "Class 3",
            "Class Code": "C3",
            "Display Order": 3,
            "Max Strength": 32,
            "Reserved Seats": 6,
            Status: "Inactive",
          },
        ],
      };
    } else if (pathname?.includes("/section")) {
      return {
        title: "Import Sections",
        description:
          "Upload a CSV or Excel file to import section data. Make sure your file follows the correct format.",
        sampleData: [
          {
            "Section Name": "Section A",
            "Section Code": "SEC-A",
            "Display Order": 1,
            "Max Strength": 25,
            Status: "Active",
          },
          {
            "Section Name": "Section B",
            "Section Code": "SEC-B",
            "Display Order": 2,
            "Max Strength": 30,
            Status: "Active",
          },
          {
            "Section Name": "Section C",
            "Section Code": "SEC-C",
            "Display Order": 3,
            "Max Strength": 28,
            Status: "Inactive",
          },
        ],
      };
    } else if (
      pathname?.includes("/studentcategory") ||
      pathname?.includes("/student-category") ||
      pathname?.includes("/student/master/student-category")
    ) {
      return {
        title: "Import Student Categories",
        description:
          "Upload a CSV or Excel file to import student category data. Make sure your file follows the correct format. Use the exact property names as shown in the sample.",
        sampleData: [
          {
            categoryName: "General",
            categoryShortName: "GEN",
            displayOrder: 1,
            isActive: true,
          },
          {
            categoryName: "OBC",
            categoryShortName: "OBC",
            displayOrder: 2,
            isActive: true,
          },
          {
            categoryName: "SC",
            categoryShortName: "SC",
            displayOrder: 3,
            isActive: true,
          },
          {
            categoryName: "ST",
            categoryShortName: "ST",
            displayOrder: 4,
            isActive: false,
          },
        ],
      };
    }

    // Default fallback
    return {
      title: "Import Data",
      description:
        "Upload a CSV or Excel file to import data. Make sure your file follows the correct format.",
      sampleData: [
        {
          Name: "Item 1",
          Code: "ITM1",
          "Display Order": 1,
          "Max Strength": 30,
          Status: "Active",
        },
      ],
    };
  };

  const config = getImportConfig();

  return (
    <ImportDialog
      isOpen={isOpen}
      onClose={onClose}
      onImport={onImport}
      title={config.title}
      description={config.description}
      sampleData={config.sampleData}
      acceptedFormats={[".csv", ".xlsx", ".xls"]}
    />
  );
};

export { MasterImportDialog };
