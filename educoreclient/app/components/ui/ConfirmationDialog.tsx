import React from 'react';
import { AlertTriangle, Info, Trash2, CheckCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  const typeConfig = {
    danger: {
      icon: Trash2,
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100',
      confirmVariant: 'destructive' as const,
      confirmText: 'Delete'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBgColor: 'bg-amber-100',
      confirmVariant: 'primary' as const,
      confirmText: 'Confirm'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      confirmVariant: 'primary' as const,
      confirmText: 'Continue'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      iconBgColor: 'bg-emerald-100',
      confirmVariant: 'primary' as const,
      confirmText: 'Proceed'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${config.iconBgColor} mb-4`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-600 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-center space-x-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText || config.confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { ConfirmationDialog };
