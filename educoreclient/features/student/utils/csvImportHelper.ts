/**
 * CSV Import Utility
 * Reusable helper for parsing and importing CSV files
 */

export interface CSVImportResult<T> {
  success: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  data: T[];
}

export interface CSVImportOptions<T> {
  headerMap: Record<string, keyof T>;
  requiredFields: Array<keyof T>;
  transformers?: Partial<Record<keyof T, (value: string) => any>>;
  validateRow?: (data: Partial<T>, rowIndex: number) => string | null;
}

/**
 * Parse CSV file and convert to typed objects
 */
export async function parseCSVFile<T>(
  file: File,
  options: CSVImportOptions<T>,
  onProgress?: (progress: number) => void
): Promise<CSVImportResult<T>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseCSVText<T>(text, options, onProgress);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Parse CSV text content
 */
export function parseCSVText<T>(
  text: string,
  options: CSVImportOptions<T>,
  onProgress?: (progress: number) => void
): CSVImportResult<T> {
  const { headerMap, requiredFields, transformers, validateRow } = options;
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const errors: Array<{ row: number; message: string }> = [];
  const successData: T[] = [];

  // Process each row
  for (let i = 1; i < lines.length; i++) {
    try {
      if (onProgress) {
        onProgress((i / (lines.length - 1)) * 100);
      }

      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));

      if (values.length !== headers.length) {
        errors.push({
          row: i + 1,
          message: `Row has ${values.length} columns, expected ${headers.length}`,
        });
        continue;
      }

      // Map CSV data to object
      const rowData: Partial<T> = {};

      headers.forEach((header, index) => {
        const mappedField = headerMap[header];
        if (mappedField) {
          let value: any = values[index];

          // Apply transformer if exists
          if (transformers && transformers[mappedField]) {
            value = transformers[mappedField]!(value);
          }

          rowData[mappedField] = value;
        }
      });

      // Validate required fields
      const missingFields = requiredFields.filter((field) => !rowData[field]);
      if (missingFields.length > 0) {
        errors.push({
          row: i + 1,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
        continue;
      }

      // Custom validation
      if (validateRow) {
        const validationError = validateRow(rowData, i + 1);
        if (validationError) {
          errors.push({
            row: i + 1,
            message: validationError,
          });
          continue;
        }
      }

      successData.push(rowData as T);
    } catch (rowError: any) {
      errors.push({
        row: i + 1,
        message: `Error processing row: ${rowError.message || rowError}`,
      });
    }
  }

  return {
    success: successData.length,
    errors,
    data: successData,
  };
}

/**
 * Common transformers for CSV data
 */
export const csvTransformers = {
  toNumber: (value: string): number => parseInt(value) || 0,
  toFloat: (value: string): number => parseFloat(value) || 0,
  toBoolean: (value: string): boolean =>
    Boolean(value && value.toLowerCase() === "active"),
  toDate: (value: string): string => value, // Keep as string for ISO dates
  trim: (value: string): string => value.trim(),
  toLowerCase: (value: string): string => value.toLowerCase(),
  toUpperCase: (value: string): string => value.toUpperCase(),
};

/**
 * Generate CSV template for download
 */
export function generateCSVTemplate(
  headers: string[],
  sampleData?: string[][]
): Blob {
  let csvContent = headers.join(",") + "\n";

  if (sampleData && sampleData.length > 0) {
    csvContent += sampleData.map((row) => row.join(",")).join("\n");
  }

  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

/**
 * Download CSV file
 */
export function downloadCSV(blob: Blob, filename: string): void {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: Array<{ key: keyof T; header: string }>,
  filename: string
): void {
  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col.key];
      // Handle special characters and commas
      if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"'))
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    })
  );

  const blob = generateCSVTemplate(headers, rows);
  downloadCSV(blob, filename);
}
