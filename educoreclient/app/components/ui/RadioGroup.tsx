'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  size = 'md',
  orientation = 'vertical',
  className,
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
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      
      <div className={cn(
        'space-y-2',
        orientation === 'horizontal' && 'flex space-x-4 space-y-0'
      )}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || option.disabled}
                className={cn(
                  'border-slate-300 shadow-sm transition-colors duration-200',
                  'text-slate-600 focus:ring-slate-500 focus:ring-offset-1',
                  sizeClasses[size],
                  (disabled || option.disabled) && 'cursor-not-allowed opacity-50',
                  error && 'border-red-300 text-red-600 focus:ring-red-500'
                )}
              />
            </div>
            
            <div className="ml-2">
              <label
                className={cn(
                  'font-medium text-slate-700 cursor-pointer',
                  textSizeClasses[size],
                  (disabled || option.disabled) && 'cursor-not-allowed opacity-50'
                )}
              >
                {option.label}
              </label>
              {option.description && (
                <p className={cn(
                  'text-slate-500 mt-0.5',
                  size === 'sm' ? 'text-xs' : 'text-xs'
                )}>
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};
