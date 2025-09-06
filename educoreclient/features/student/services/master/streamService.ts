import { API_CONFIG } from '@/lib/config';
import { apiClient as enterpriseApiClient } from '@/lib/enterprise-api-client';
import {
  Stream,
  StreamDto,
  CreateStreamRequest,
  GetStreamsRequest,
  GetStreamsResponse
} from '@/features/student/types/master/streamType';

export class StreamService {
  private static readonly BASE = API_CONFIG.ENDPOINTS.STREAMS;

  private static wrapStream(data: Partial<StreamDto>) {
    return { stream: data };
  }

  static async getStreams(params?: GetStreamsRequest): Promise<GetStreamsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetStreamsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async getStreamById(id: string): Promise<Stream> {
    const response = await enterpriseApiClient.get<{ result: Stream }>(`${this.BASE}/${id}`);
    return response.result;
  }

  static async createStream(request: CreateStreamRequest): Promise<Stream> {
    const response = await enterpriseApiClient.post<{ result: Stream }>(this.BASE, request);
    return response.result;
  }

  static async updateStream(id: string, data: Partial<StreamDto>): Promise<Stream> {
    const payload = this.wrapStream({ ...data, id });
    const response = await enterpriseApiClient.put<{ result: Stream }>(this.BASE, payload);
    return response.result;
  }

  static async deleteStream(id: string): Promise<void> {
    await enterpriseApiClient.delete<void>(`${this.BASE}/${id}`);
  }

  static async toggleStreamStatus(id: string, completeData: StreamDto, isActive: boolean): Promise<Stream> {
    const payload = this.wrapStream({ ...completeData, id, isActive });
    const response = await enterpriseApiClient.put<{ result: Stream }>(this.BASE, payload);
    return response.result;
  }

  static async bulkCreateStreams(streamsData: StreamDto[]): Promise<Stream[]> {
    const payload = { streams: streamsData.map(data => this.wrapStream(data)) };
    const response = await enterpriseApiClient.post<{ result: Stream[] }>(`${this.BASE}/bulk`, payload);
    return response.result;
  }

  static async bulkDeleteStreams(ids: string[]): Promise<void> {
    const payload = { StreamIds: ids };
    await enterpriseApiClient.post<void>(`${this.BASE}/bulk-delete`, payload);
  }

  static async searchStreams(params: GetStreamsRequest & { search?: string }): Promise<GetStreamsResponse['result']> {
    const normalizedParams = {
      pageIndex: params?.pageIndex ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_INDEX,
      pageSize: params?.pageSize ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
      organizationId: params?.organizationId?.toLowerCase(),
      branchId: params?.branchId?.toLowerCase(),
      ...params,
    };
    const response = await enterpriseApiClient.post<GetStreamsResponse>(`${this.BASE}/organization`, normalizedParams);
    return response.result;
  }

  static async exportStreams(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await enterpriseApiClient.getAxiosInstance().get(
      `${API_CONFIG.BASE_URL}${this.BASE}/export-template`,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  static async importStreams(data: StreamDto[]): Promise<void> {
    await enterpriseApiClient.post<void>(`${this.BASE}/import`, data);
  }
}
