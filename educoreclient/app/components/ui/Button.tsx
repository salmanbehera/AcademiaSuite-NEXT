import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    icon: Icon, 
    iconPosition = 'left',
    loading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 focus:ring-slate-500 shadow-sm',
      secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500',
      outline: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
      destructive: 'bg-red-600 text-white border border-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm'
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-sm'
    };

    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-3.5 w-3.5',
      lg: 'h-4 w-4'
    };

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className={cn(
            'animate-spin rounded-full border-b-2 border-current mr-1.5',
            iconSizes[size]
          )} />
        )}
        
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className={cn(iconSizes[size], 'mr-1.5')} />
        )}
        
        <span>{children}</span>
        
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className={cn(iconSizes[size], 'ml-1.5')} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
