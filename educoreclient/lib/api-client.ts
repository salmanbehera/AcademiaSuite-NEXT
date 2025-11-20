// HTTP Client for external .NET Core API

import { API_CONFIG, AUTH_CONFIG } from "@/config/app.config";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
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
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, any>;
  cache?: RequestCache;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
  }

  // Set access token for authenticated requests
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Build URL with query parameters
  buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const finalUrl = url.toString();

    // Dev-only logging to help debug incorrect base URL / endpoint issues
    try {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.debug(`[apiClient] Built URL -> ${finalUrl}`);
      }
    } catch (e) {
      // ignore logging errors
    }

    return finalUrl;
  }

  // Build request headers
  private buildHeaders(
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...customHeaders,
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Log error only in development, and suppress benign 404s
      if (process.env.NODE_ENV === "development") {
        const is404 = response.status === 404;
        const detail = (
          typeof data === "string"
            ? data
            : data?.detail || data?.message || data?.error || ""
        ).toLowerCase();
        const isBenign404 =
          is404 &&
          (detail.includes("no students found") ||
            detail.includes("no data found") ||
            detail.includes("no records found") ||
            detail === "");

        if (!isBenign404) {
          console.error(
            `❌ [API Error] ${response.status} ${response.url}`,
            data
          );
        } else {
          console.info(
            `📭 [Empty Result] ${response.url}`,
            detail || "No data"
          );
        }
      }

      throw new Error(
        data.message || data.error || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  }

  // Generic request method
  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig & { body?: any } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers: customHeaders,
      params,
      body,
      cache = "no-cache",
      timeout = this.timeout,
    } = config;

    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(customHeaders);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        cache,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw error;
      }

      throw new Error("Unknown error occurred");
    }
  }

  // GET request
  async get<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  // POST request
  async post<T = any>(
    endpoint: string,
    body?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "POST", body });
  }

  // PUT request
  async put<T = any>(
    endpoint: string,
    body?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "PUT", body });
  }

  // PATCH request
  async patch<T = any>(
    endpoint: string,
    body?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "PATCH", body });
  }

  // DELETE request
  async delete<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  // Authentication methods
  async authenticate(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.post<{ token: string; user: any }>(
      API_CONFIG.endpoints.auth + "/login",
      credentials
    );

    if (response.success && response.data?.token) {
      this.setAccessToken(response.data.token);
    }

    return response;
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>(
      API_CONFIG.endpoints.auth + "/refresh"
    );

    if (response.success && response.data?.token) {
      this.setAccessToken(response.data.token);
    }

    return response;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.post(API_CONFIG.endpoints.auth + "/logout");
    } finally {
      this.setAccessToken(null);
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export default instance
export default apiClient;
