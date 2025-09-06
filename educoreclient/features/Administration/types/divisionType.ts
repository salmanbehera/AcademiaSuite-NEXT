import { z } from 'zod';
import { DivisionSchema, CreateDivisionSchema, UpdateDivisionSchema } from '../Validations/divisionSchemas';
import { BaseEntity } from './baseEntity';

export type DivisionType = z.infer<typeof DivisionSchema>;
export type CreateDivisionType = z.infer<typeof CreateDivisionSchema>;
export type UpdateDivisionType = z.infer<typeof UpdateDivisionSchema>;

export interface Division extends BaseEntity {
  organizationId: string;
  branchId: string;
  divisionName: string;
  divisionCode: string;
  description?: string;
  divisionHeadId?: string;
  isActive: boolean;
}

export interface DivisionDto {
  id?: string;
  organizationId: string;
  branchId: string;
  divisionName: string;
  divisionCode: string;
  description?: string;
  divisionHeadId?: string;
  isActive: boolean;
}

export interface CreateDivisionRequest {
  division: DivisionDto;
}

export interface GetDivisionsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  /** Optional search term for filtering divisions */
  search?: string;
  /** Field to sort by */
  sortBy?: keyof Division;
  /** Sort order: ascending or descending */
  sortOrder?: 'asc' | 'desc';
}

export interface GetDivisionsResponse {
  result: {
    count: number;
    data: DivisionDto[];
    pageIndex: number;
    pageSize: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface DivisionFormData {
  organizationId: string;
  branchId: string;
  divisionName: string;
  divisionCode: string;
  description?: string;
  divisionHeadId?: string;
  isActive?: boolean;
}
