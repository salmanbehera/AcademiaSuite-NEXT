'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  rows = 3,
  maxLength,
  resize = 'vertical',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-xs font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'block w-full rounded-md border shadow-sm transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          sizeClasses[size],
          resizeClasses[resize],
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500/20',
          disabled
            ? 'bg-slate-50 text-slate-500 cursor-not-allowed'
            : 'bg-white hover:border-slate-400'
        )}
      />

      <div className="flex justify-between items-center">
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {maxLength && (
          <p className="text-xs text-slate-500 ml-auto">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};
