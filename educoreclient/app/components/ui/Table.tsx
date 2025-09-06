'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  responsive?: boolean;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> & {
  Header: React.FC<TableHeaderProps>;
  Body: React.FC<TableBodyProps>;
  Row: React.FC<TableRowProps>;
  Cell: React.FC<TableCellProps>;
  Footer: React.FC<TableFooterProps>;
} = ({ children, className, responsive = true }) => {
  const table = (
    <table className={cn('min-w-full divide-y divide-slate-200/60', className)}>
      {children}
    </table>
  );

  if (responsive) {
    return (
      <div className="overflow-x-auto">
        {table}
      </div>
    );
  }

  return table;
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={cn('bg-slate-50/50', className)}>
    {children}
  </thead>
);

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
  <tbody className={cn('bg-white divide-y divide-slate-200/60', className)}>
    {children}
  </tbody>
);

const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className, 
  clickable = false, 
  onClick 
}) => (
  <tr
    className={cn(
      'transition-colors duration-150',
      clickable && 'cursor-pointer hover:bg-slate-50/50',
      !clickable && 'hover:bg-slate-50/30',
      className
    )}
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className, 
  header = false,
  align = 'left',
  width
}) => {
  const Component = header ? 'th' : 'td';
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Component
      className={cn(
        'px-4 py-3 whitespace-nowrap',
        header 
          ? 'text-xs font-medium text-slate-600 uppercase tracking-wider'
          : 'text-xs text-slate-900',
        alignClasses[align],
        className
      )}
      style={width ? { width } : undefined}
    >
      {children}
    </Component>
  );
};

const TableFooter: React.FC<TableFooterProps> = ({ children, className }) => (
  <tfoot className={cn('bg-slate-50/50 border-t border-slate-200/60', className)}>
    {children}
  </tfoot>
);

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Footer = TableFooter;

export { Table };
