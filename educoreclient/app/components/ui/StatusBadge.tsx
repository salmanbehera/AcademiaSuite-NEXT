import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  isActive: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  onClick,
  disabled = false,
  size = 'sm',
  className
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4'
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors duration-150';
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:shadow-sm' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const activeClasses = isActive
    ? 'bg-slate-900 text-white hover:bg-slate-800'
    : 'bg-red-100 text-red-800 hover:bg-red-200';

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        sizeClasses[size],
        activeClasses,
        interactiveClasses,
        disabledClasses,
        className
      )}
    >
      {isActive ? (
        <>
          <CheckCircle2 className={cn(iconSizes[size], 'mr-1')} />
          Active
        </>
      ) : (
        <>
          <XCircle className={cn(iconSizes[size], 'mr-1')} />
          Inactive
        </>
      )}
    </button>
  );
};

export { StatusBadge };
