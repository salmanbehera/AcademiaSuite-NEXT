import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  required?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    icon: Icon,
    iconPosition = 'left',
    required = false,
    helperText,
    ...props 
  }, ref) => {
    const baseStyles = 'w-full px-2.5 py-2 text-xs border rounded-md transition-colors duration-150 bg-white';
    const normalStyles = 'border-slate-300 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-500';
    const errorStyles = 'border-red-300 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-slate-900 placeholder-slate-500';
    
    const inputId = props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Icon className="h-3.5 w-3.5 text-slate-400" />
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              baseStyles,
              error ? errorStyles : normalStyles,
              Icon && iconPosition === 'left' ? 'pl-8' : '',
              Icon && iconPosition === 'right' ? 'pr-8' : '',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {Icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <Icon className="h-3.5 w-3.5 text-slate-400" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-red-600 flex items-center">
            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
