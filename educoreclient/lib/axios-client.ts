// HTTP Client for external .NET Core API using Axios
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '@/config/app.config';

export interface ApiResponse<T = any> {
  success: boolean;
  result?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

class AxiosApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for JWT
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig & { body?: any } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers, params, body, timeout } = config;
    const axiosConfig: AxiosRequestConfig = {
      url: endpoint,
      method,
      headers,
      params,
      timeout,
      data: body,
    };
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.request<ApiResponse<T>>(axiosConfig);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  }

  async get<T = any>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Authentication methods
  async authenticate(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.post<{ token: string; user: any }>(
      API_CONFIG.endpoints.auth + '/login',
      credentials
    );
    if (response.success && response.result?.token) {
      this.setAccessToken(response.result.token);
    }
    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>(
      API_CONFIG.endpoints.auth + '/refresh'
    );
    if (response.success && response.result?.token) {
      this.setAccessToken(response.result.token);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_CONFIG.endpoints.auth + '/logout');
    } finally {
      this.setAccessToken(null);
    }
  }
}

export const axiosClient = new AxiosApiClient();
export default axiosClient;
