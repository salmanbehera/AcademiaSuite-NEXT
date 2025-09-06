import { BaseEntity } from './baseEntity';

// Class Management Types
export interface Class extends BaseEntity {
  organizationId: string;
  branchId: string;
  className: string;
  classShortName: string;
  maxStrength: number;
  currentStrength?: number;
  displayOrder: number;
  isActive: boolean;
}

export interface ClassDto {
  id?: string;
  organizationId: string;
  branchId: string;
  className: string;
  classShortName: string;
  displayOrder: number;
  maxStrength: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassRequest {
  classdto: ClassDto;
}

export interface GetClassesRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
}

export interface GetClassesResponse {
  classdto: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Class[];
  };
}
export interface Class extends BaseEntity {
  organizationId: string;
  branchId: string;
  className: string;
  classShortName: string;
  displayOrder: number;
  maxStrength: number;
  reservationSeats: number;
  isActive: boolean;
}

export interface ClassDto {
  organizationId: string;
  branchId: string;
  className: string;
  classShortName: string;
  displayOrder: number;
  maxStrength: number;
  reservationSeats: number;
  isActive: boolean;
}

export interface CreateClassRequest {
  classdto: ClassDto;
}

export interface GetClassesRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
}

export interface GetClassesResponse {
  classdto: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Class[];
  };
}
