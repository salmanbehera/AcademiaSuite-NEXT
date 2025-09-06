import { BaseEntity } from './baseEntity';

export interface Stream extends BaseEntity {
  organizationId: string;
  branchId: string;
  // streamCode removed
  streamName: string;
  streamShortName: string;
  displayOrder: number;
  maxStrength: number;
  reservationSeats: number;
  isActive: boolean;
}

export interface StreamDto {
  id?: string;
  organizationId: string;
  branchId: string;
  // streamCode removed
  streamName: string;
  streamShortName: string;
  displayOrder: number;
  maxStrength: number;
  reservationSeats: number;
  isActive?: boolean;
}

export interface CreateStreamRequest {
  stream: StreamDto;
}

export interface GetStreamsRequest {
  pageIndex?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  search?: string;
  sortBy?: keyof Stream;
  sortOrder?: 'asc' | 'desc';
}

export interface GetStreamsResponse {
  result: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Stream[];
  };
}

export interface CreateStreamResponse {
  id: string;
}
