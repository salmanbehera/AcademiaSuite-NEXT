'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  className,
}) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    secondary: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 inline-flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none"
          style={{ width: '14px', height: '14px' }}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
};
