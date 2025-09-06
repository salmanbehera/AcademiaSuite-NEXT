import { BaseEntity } from './baseEntity';
export interface Section extends BaseEntity {
  organizationId: string;
  branchId: string;
  sectionName: string;
  sectionShortName: string;
  maxStrength: number;
  currentStrength?: number;
  displayOrder: number;
  isActive: boolean;
}
// Section Types (consolidated)
export interface SectionDto {
  id?: string;
  organizationId: string;
  branchId: string;
  sectionName: string;
  sectionShortName: string;
  displayOrder: number;
  maxStrength: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionRequest {
  sectiondto: SectionDto;
}

export interface GetSectionsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
}

export interface GetSectionsResponse {
  sectiondto: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Section[];
  };
}
// // Section Management Types
// export interface Section extends BaseEntity {
//   organizationId: string;
//   branchId: string;
//   sectionName: string;
//   sectionShortName: string;
//   maxStrength: number;
//   currentStrength?: number;
//   displayOrder: number;
//   isActive: boolean;
// }

// // Section Types (consolidated)
// export interface SectionDto {
//   id?: string;
//   organizationId: string;
//   branchId: string;
//   sectionName: string;
//   sectionShortName: string;
//   displayOrder: number;
//   maxStrength: number;
//   isActive: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface CreateSectionRequest {
//   sectiondto: SectionDto;
// }

// export interface GetSectionsRequest {
//   pageIndex?: number;
//   pageSize?: number;
//   organizationId?: string;
//   branchId?: string;
// }

// export interface GetSectionsResponse {
//   sectiondto: {
//     pageIndex: number;
//     pageSize: number;
//     count: number;
//     data: Section[];
//   };
// }
