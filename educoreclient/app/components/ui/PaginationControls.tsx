import React from 'react';
import { Button } from './Button';

interface PaginationControlsProps {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  startItem: number;
  endItem: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  pageIndex,
  pageSize,
  totalPages,
  totalCount,
  startItem,
  endItem,
  pageSizeOptions = [5,10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  return (
    <nav className="bg-white p-2 border border-gray-200 rounded-lg shadow flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-1 lg:space-y-0" aria-label="Pagination">
      {/* Page size selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="pageSizeSelect" className="text-xs font-medium text-gray-600">Per page:</label>
        <div className="relative inline-block">
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="block w-20 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-0.5 pr-8 rounded leading-tight text-xs text-gray-700 appearance-none"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 011.08 1.04l-4.24 4.24a.75.75 0 01-1.08 0l-4.24-4.24a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Showing info */}
  <div className="text-xs text-gray-700">
        Showing <span className="font-semibold text-gray-900">{startItem}</span>
        <span> – </span>
        <span className="font-semibold text-gray-900">{endItem}</span>
        <span> of </span>
        <span className="font-semibold text-gray-900">{totalCount}</span>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={pageIndex === 0}
        >⏮ First</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
        >⏪ Prev</Button>

        {/* Dynamic page numbers with ellipsis */}
        <div className="hidden lg:flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, idx) => {
            const showFirst = idx < 2;
            const showLast = idx >= totalPages - 2;
            const showAround = idx >= pageIndex - 1 && idx <= pageIndex + 1;
            if (!(showFirst || showLast || showAround)) {
              if (idx === 2 && pageIndex > 3) return <span key="start-ellipsis" className="px-1 text-gray-500">…</span>;
              if (idx === totalPages - 3 && pageIndex < totalPages - 4) return <span key="end-ellipsis" className="px-1 text-gray-500">…</span>;
              return null;
            }
            return (
              <Button
                key={idx}
                variant={pageIndex === idx ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(idx)}
              >{idx + 1}</Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages - 1}
        >Next ⏩</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={pageIndex >= totalPages - 1}
        >Last ⏭</Button>
      </div>
    </nav>
  );
}
