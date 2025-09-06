import { useState, useEffect, useCallback } from 'react';
import { Student, StudentFormData, PaginationParams } from '@/types/api-types';
import { studentService } from '@/features/student/services/studentService';

/**
 * Custom hook for managing students data
 * Similar to useClasses but for students
 */
export function useStudents(initialParams?: PaginationParams) {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);

  // Fetch students
  const fetchStudents = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentService.getStudents({
        page: pageIndex + 1, // API uses 1-based pagination
        limit: pageSize,
        ...params,
      });
      
      setStudents(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch students';
      setError(errorMessage);
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  // Create student
  const createStudent = useCallback(async (studentData: StudentFormData): Promise<boolean> => {
    try {
      setLoading(true);
      await studentService.createStudent(studentData);
      await fetchStudents(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create student';
      setError(errorMessage);
      console.error('Error creating student:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  // Update student
  const updateStudent = useCallback(async (id: string, studentData: Partial<StudentFormData>): Promise<boolean> => {
    try {
      setLoading(true);
      await studentService.updateStudent(id, studentData);
      await fetchStudents(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update student';
      setError(errorMessage);
      console.error('Error updating student:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  // Delete student
  const deleteStudent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await studentService.deleteStudent(id);
      await fetchStudents(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete student';
      setError(errorMessage);
      console.error('Error deleting student:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  // Toggle student status
  const toggleStudentStatus = useCallback(async (id: string, status: boolean): Promise<boolean> => {
    try {
      await studentService.toggleStudentStatus(id, status);
      await fetchStudents(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update student status';
      setError(errorMessage);
      console.error('Error toggling student status:', err);
      return false;
    }
  }, [fetchStudents]);

  // Get student by ID
  const getStudentById = useCallback(async (id: string): Promise<Student | null> => {
    try {
      return await studentService.getStudentById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch student';
      setError(errorMessage);
      console.error('Error fetching student by ID:', err);
      return null;
    }
  }, []);

  // Generate admission number
  const generateAdmissionNumber = useCallback(async (academicYear: string): Promise<string | null> => {
    try {
      return await studentService.generateAdmissionNumber(academicYear);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate admission number';
      setError(errorMessage);
      console.error('Error generating admission number:', err);
      return null;
    }
  }, []);

  // Pagination controls
  const nextPage = useCallback(() => {
    if ((pageIndex + 1) * pageSize < totalCount) {
      setPageIndex(prev => prev + 1);
    }
  }, [pageIndex, pageSize, totalCount]);

  const prevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex(prev => prev - 1);
    }
  }, [pageIndex]);

  const goToPage = useCallback((page: number) => {
    const maxPage = Math.ceil(totalCount / pageSize) - 1;
    if (page >= 0 && page <= maxPage) {
      setPageIndex(page);
    }
  }, [totalCount, pageSize]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchStudents(initialParams);
  }, [fetchStudents, initialParams]);

  // Search students
  const searchStudents = useCallback((searchTerm: string) => {
    setPageIndex(0); // Reset to first page when searching
    fetchStudents({ search: searchTerm });
  }, [fetchStudents]);

  // Filter by class
  const filterByClass = useCallback((classId: string) => {
    setPageIndex(0); // Reset to first page when filtering
    fetchStudents({ classId });
  }, [fetchStudents]);

  // Filter by status
  const filterByStatus = useCallback((status: string) => {
    setPageIndex(0); // Reset to first page when filtering
    fetchStudents({ status });
  }, [fetchStudents]);

  // Initial load
  useEffect(() => {
    fetchStudents(initialParams);
  }, [fetchStudents, initialParams]);

  // Refetch when page changes
  useEffect(() => {
    fetchStudents(initialParams);
  }, [pageIndex, fetchStudents, initialParams]);

  return {
    // Data
    students,
    loading,
    error,
    totalCount,
    pageIndex,
    pageSize,
    
    // Actions
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    getStudentById,
    generateAdmissionNumber,
    
    // Pagination
    nextPage,
    prevPage,
    goToPage,
    
    // Utilities
    refresh,
    searchStudents,
    filterByClass,
    filterByStatus,
  };
}
