import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  valueColor?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-slate-700',
  iconBgColor = 'bg-slate-100',
  valueColor = 'text-slate-900',
  className,
}) => {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-slate-200/60 p-2 hover:shadow-md transition-all duration-300',
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          <p className={cn('text-lg font-semibold mt-0.5', valueColor)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className={cn('p-1.5 rounded-lg', iconBgColor)}>
          <Icon className={cn('h-3.5 w-3.5', iconColor)} />
        </div>
      </div>
    </div>
  );
};

export { StatsCard };
