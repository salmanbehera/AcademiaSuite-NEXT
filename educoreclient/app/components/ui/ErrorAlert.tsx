import { AlertCircle } from 'lucide-react';
import { Button } from './Button'; // Adjust the import path if needed

interface ErrorAlertProps {
  message: string;
  onReload: () => void;
}

export function ErrorAlert({ message, onReload }: ErrorAlertProps) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200/60 rounded-lg p-3">
      <div className="flex items-start">
        <AlertCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-xs font-medium text-red-900">Error occurred</h3>
          <p className="mt-0.5 text-xs text-red-700">{message}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReload}
          className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
        >
          Reload
        </Button>
      </div>
    </div>
  );
}
