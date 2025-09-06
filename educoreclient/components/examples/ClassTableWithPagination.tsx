// Example of how to use the enhanced pagination in your UI components

import React from 'react';
import { useClasses } from '@/features/student/hooks/master/useClasses';

export function ClassTableWithPagination() {
  const {
    classes,
    loading,
    error,
    
    // Pagination state
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    pageSizeOptions,
    
    // Pagination actions
    setPageIndex,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
  } = useClasses();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Classes Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Class Name</th>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Max Strength</th>
              <th className="px-4 py-2 text-left">Reserved</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem.id} className="border-b">
                <td className="px-4 py-2">{classItem.className}</td>
                <td className="px-4 py-2">{classItem.classShortName}</td>
                <td className="px-4 py-2">{classItem.maxStrength || 0}</td>
                <td className="px-4 py-2">{classItem.reservationSeats || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-700">
          {totalCount > 0 ? (
            <>
              Showing {startItem} to {endItem} of {totalCount} results
            </>
          ) : (
            'No results found'
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-1">
          {/* First Page */}
          <button
            onClick={goToFirstPage}
            disabled={!hasPrevPage}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ⏮
          </button>

          {/* Previous Page */}
          <button
            onClick={prevPage}
            disabled={!hasPrevPage}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ⏪
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(0, Math.min(pageIndex - 2, totalPages - 5));
              const pageNumber = startPage + i;
              
              if (pageNumber >= totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPageIndex(pageNumber)}
                  className={`px-3 py-1 border rounded ${
                    pageIndex === pageNumber
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber + 1}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ⏩
          </button>

          {/* Last Page */}
          <button
            onClick={goToLastPage}
            disabled={!hasNextPage}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ⏭
          </button>
        </div>
      </div>

      {/* Page Info */}
      <div className="text-center text-sm text-gray-500">
        Page {pageIndex + 1} of {totalPages}
      </div>
    </div>
  );
}

export default ClassTableWithPagination;
