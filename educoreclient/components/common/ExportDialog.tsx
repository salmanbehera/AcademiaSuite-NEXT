import React from 'react';
import { useToast } from '@/app/components/ui/ToastProvider';
import { Download } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'excel') => Promise<Blob>;
  title?: string;
  defaultFormat?: 'csv' | 'xlsx';
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  title = 'Export Data',
  defaultFormat = 'csv',
}) => {
  const [format, setFormat] = React.useState<'csv' | 'xlsx'>(defaultFormat);
  const [downloading, setDownloading] = React.useState(false);
  const { showInfo } = useToast();

  const handleExport = async () => {
    setDownloading(true);
    try {
      const apiFormat = format === 'xlsx' ? 'excel' : 'csv';
      const blob = await onExport(apiFormat);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const ext = format === 'xlsx' ? 'xlsx' : 'csv';
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `${title.replace(/\s+/g, '')}_${dateStr}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      showInfo('Export Failed', 'Failed to export file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  React.useEffect(() => {
    setFormat(defaultFormat);
  }, [defaultFormat, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Download className="h-7 w-7 text-green-600" />
          <span className="text-lg font-bold text-green-700">{title}</span>
        </div>
        {/* Description */}
        <div className="text-sm text-slate-600 mb-2">
          Download all academic years as a CSV or Excel file. Exported data will match your current filters and search results. Use this for backups, reporting, or migration.
        </div>
        {/* Format Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
          <label htmlFor="export-format" className="text-sm font-medium text-blue-900">Choose Format:</label>
          <select
            id="export-format"
            className="border border-blue-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[140px] text-slate-900"
            value={format}
            onChange={e => setFormat(e.target.value as 'csv' | 'xlsx')}
            disabled={downloading}
          >
            <option value="csv">CSV (.csv)</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
        </div>
        {/* Info Tip */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <Download className="h-4 w-4 text-green-600" />
          <span className="text-xs text-green-800">Tip: Use search to filter before export for specific data sets. File will be named with today's date.</span>
        </div>
        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={downloading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
            style={{ alignItems: 'center' }}
            loading={downloading}
            disabled={downloading}
          >
            <Download className="h-4 w-4" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
            <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Download</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};