export interface Designation {
  id: string; // UUID
  organizationId: string; // UUID
  branchId: string; // UUID
  designationName: string; // String
  designationCode: string; // String
  description: string; // String
  ParentDesignationId?: string; // Optional: UUID for the parent designation
  isActive: boolean; // Boolean
}

export interface DesignationDto {
  id: string;
  organizationId: string;
  branchId: string;
  designationName: string;
  designationCode: string;
  description: string;
  ParentDesignationId?: string;
  isActive: boolean;
}

export interface CreateDesignationRequest {
  designation: DesignationDto;
}

export interface UpdateDesignationRequest {
  id: string;
  organizationId: string;
  branchId: string;
  designationName: string;
  designationCode: string;
  description: string;
  ParentDesignationId?: string;
  isActive: boolean;
}

export interface DesignationResponse {
  id: string;
  organizationId: string;
  branchId: string;
  designationName: string;
  designationCode: string;
  description: string;
  ParentDesignationId?: string;  
  isActive: boolean;
}

export interface DesignationFormData {
  designationName: string;
  designationCode: string;
  description: string;
  ParentDesignationId?: string;  
  isActive: boolean;
}

export interface GetDesignationsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof Designation;
  sortOrder?: 'asc' | 'desc';
}

export interface GetDesignationsResponse {
  result: Designation[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
