'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  size = 'md',
  showIcon = true,
  className,
}) => {
  const Icon = iconMap[variant];

  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const iconColorClasses = {
    info: 'text-blue-600',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'rounded-md border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-start">
        {showIcon && (
          <Icon
            className={cn(
              'flex-shrink-0 mt-0.5 mr-2',
              iconColorClasses[variant],
              iconSizeClasses[size]
            )}
          />
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};
