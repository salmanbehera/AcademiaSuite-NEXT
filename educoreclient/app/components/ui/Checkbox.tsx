'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  size = 'md',
  className,
  description,
}) => {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className={cn(
              'rounded border-slate-300 shadow-sm transition-colors duration-200',
              'text-slate-600 focus:ring-slate-500 focus:ring-offset-1',
              sizeClasses[size],
              disabled && 'cursor-not-allowed opacity-50',
              error && 'border-red-300 text-red-600 focus:ring-red-500'
            )}
          />
        </div>
        
        {(label || description) && (
          <div className="ml-2">
            {label && (
              <label
                className={cn(
                  'font-medium text-slate-700 cursor-pointer',
                  textSizeClasses[size],
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-slate-500 mt-0.5',
                size === 'sm' ? 'text-xs' : 'text-xs'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 ml-5">{error}</p>
      )}
    </div>
  );
};
