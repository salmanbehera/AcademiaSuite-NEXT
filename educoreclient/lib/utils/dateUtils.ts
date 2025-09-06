// Shared date normalization utilities for import/export and DTO mapping
// Converts Excel serial date to YYYY-MM-DD string
export function excelDateToString(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

// Converts various date formats to ISO YYYY-MM-DD string
export function toIsoDate(date: string | number): string {
  if (typeof date === 'number') {
    return excelDateToString(date);
  }
  if (typeof date === 'string') {
    // ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // DD/MM/YYYY or D/M/YYYY
    const match = date.match(/^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/);
    if (match) {
      // Pad day/month to 2 digits
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      return `${match[3]}-${month}-${day}`;
    }
  }
  return '';
}
