// Student Category Types for Student Master Feature


export interface BaseStudentCategory {
  organizationId: string;
  branchId: string;
  categoryName: string;
  categoryShortName: string;
  isActive: boolean;
}

export interface StudentCategory extends BaseStudentCategory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type StudentCategoryCreateRequest = BaseStudentCategory;

export interface StudentCategoryUpdateRequest extends Partial<BaseStudentCategory> {
  id: string;
}

export interface StudentCategorySearchParams {
  search?: string;
  organizationId?: string;
  branchId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentCategoryStats {
  totalCategories: number;
  activeCategories: number;
  byBranch: Array<{
    branchId: string;
    count: number;
  }>;
}
