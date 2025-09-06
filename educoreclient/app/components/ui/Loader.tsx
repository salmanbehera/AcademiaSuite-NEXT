'use client';

import React from 'react';
import { cn } from '@/lib/utils/commonUtils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  /** Optional label to display next to the loader */
  text?: string;
}

const Spinner: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div
    className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-gray-600', size, className)}
  />
);

const Dots: React.FC<{ size: string; className?: string }> = ({ size, className }) => {
  const dotSize = size.includes('sm') ? 'w-1 h-1' : size.includes('lg') ? 'w-3 h-3' : 'w-2 h-2';
  
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn('bg-gray-600 rounded-full animate-pulse', dotSize)}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
};

const Pulse: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div
    className={cn('bg-gray-300 rounded animate-pulse', size, className)}
  />
);

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const sizeClass = sizeClasses[size];

  const variants = {
    spinner: <Spinner size={sizeClass} className={className} />,
    dots: <Dots size={sizeClass} className={className} />,
    pulse: <Pulse size={sizeClass} className={className} />,
  };

  const loaderElement = variants[variant];
  return (
    <div className="inline-flex items-center space-x-2">
      {text && <span className="text-sm text-gray-600">{text}</span>}
      {loaderElement}
    </div>
  );
};
