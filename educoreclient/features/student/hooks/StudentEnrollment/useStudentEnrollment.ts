import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { StudentEnrollmentPayload, StudentEnrollmentDTO } from '@/features/student/types/StudentEnrollment/studentenrollment.types';
import { StudentEnrollmentService } from '@/features/student/services/StudentEnrollment/studentenrollmentService';
import { API_CONFIG } from '@/lib/config';

export function useStudentEnrollment() {
  const { organizationId, branchId, isReady } = useOrganization();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
  const queryClient = useQueryClient();

  // Query for fetching student enrollments
  const queryKey = ['studentenrollments', organizationId, branchId, pageIndex, pageSize] as const;
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery<any, Error>({
    queryKey,
    queryFn: async () => {
      return await StudentEnrollmentService.getStudentEnrollments({
        organizationId,
        branchId,
        pageIndex,
        pageSize,
      });
    },
    enabled: isReady,
    staleTime: 30000,
  });

  // Mutations for create, update, delete
  const createMutation = useMutation<any, unknown, StudentEnrollmentPayload>({
    mutationFn: (payload) => StudentEnrollmentService.createStudentEnrollment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation<any, unknown, StudentEnrollmentPayload>({
    mutationFn: (payload) => StudentEnrollmentService.updateStudentEnrollment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation<any, unknown, string>({
    mutationFn: (studentId) => StudentEnrollmentService.deleteStudentEnrollment(studentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // Single fetch by ID
  const getEnrollmentById = async (studentId: string) => {
    return await StudentEnrollmentService.getStudentEnrollmentById(studentId);
  };

  const enrollments: StudentEnrollmentDTO[] = data?.students?.Data ?? [];
  const totalCount: number = data?.students?.Count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  useEffect(() => setPageIndex(0), [organizationId, branchId]);

  return {
    enrollments,
    loading: isLoading || isFetching,
    error: fetchError?.message ?? null,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    startItem,
    endItem,
    setPageIndex,
    setPageSize: (size: number) => { setPageSize(size); setPageIndex(0); },
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    createEnrollment: (payload: StudentEnrollmentPayload) => createMutation.mutateAsync(payload),
    updateEnrollment: (payload: StudentEnrollmentPayload) => updateMutation.mutateAsync(payload),
    deleteEnrollment: (studentId: string) => deleteMutation.mutateAsync(studentId),
    getEnrollmentById,
  };
}
