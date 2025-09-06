import { OrganizationType } from '../enum/OrganizationTypeenum';
import { BaseEntity } from './baseEntity';

export interface Organization extends BaseEntity {
  organizationCode: string;
  organizationName: string;
  organizationType: OrganizationType;
  affiliationBoard: string;
  logoUrl: string;
  establishedYear: number;
  registrationNumber: string;
  panTinTaxId: string;
  address1: string;
  address2?: string;
  city: string;
  cityId?: string;
  state: string;
  stateId?: string;
  country: string;
  countryId?: string;
  postalCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  websiteUrl?: string;
  headOfOrganization: string;
  academicYearStart: string;
  academicYearEnd: string;
  timezone: string;
  currency: string;
  locale: string;
  isActive: boolean;
}

export interface OrganizationDto {
  id?: string;
  organizationCode: string;
  organizationName: string;
  organizationType: OrganizationType;
  affiliationBoard: string;
  logoUrl: string;
  establishedYear: number;
  registrationNumber: string;
  panTinTaxId: string;
  address1: string;
  address2?: string;
  city: string;
  cityId?: string;
  state: string;
  stateId?: string;
  country: string;
  countryId?: string;
  postalCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  websiteUrl?: string;
  headOfOrganization: string;
  academicYearStart: string;
  academicYearEnd: string;
  timezone: string;
  currency: string;
  locale: string;
  isActive: boolean;
}

export interface CreateOrganizationRequest {
  organization: OrganizationDto;
}

export interface GetOrganizationsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  /** Optional search term for filtering organizations */
  search?: string;
  /** Field to sort by */
  sortBy?: keyof Organization;
  /** Sort order: ascending or descending */
  sortOrder?: 'asc' | 'desc';
}

export interface GetOrganizationsResponse {
  result: {
    count: number;
    data: OrganizationDto[];
    pageIndex: number;
    pageSize: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface OrganizationFormData {
  organizationCode: string;
  organizationName: string;
  organizationType: OrganizationType;
  affiliationBoard: string;
  logoUrl: string;
  establishedYear: number;
  registrationNumber: string;
  panTinTaxId: string;
  address1: string;
  address2?: string;
  city: string;
  cityId?: string;
  state: string;
  stateId?: string;
  country: string;
  countryId?: string;
  postalCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  alternateContactNumber?: string;
  email: string;
  websiteUrl?: string;
  headOfOrganization: string;
  academicYearStart: string;
  academicYearEnd: string;
  timezone: string;
  currency: string;
  locale: string;
  isActive?: boolean;
}
