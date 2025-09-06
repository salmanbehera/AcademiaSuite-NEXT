import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';
import { API_CONFIG } from '@/lib/config';

// Enhanced API Response interface
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

// API Configuration interface
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

// Upload progress callback
export type UploadProgressCallback = (progress: number) => void;

// Retry configuration
export interface RetryConfig {
  attempts: number;
  delay: number;
  shouldRetry?: (error: AxiosError) => boolean;
}

// HTTP Status Code Constants
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access. Redirecting to login...',
  FORBIDDEN: 'Access forbidden. Insufficient permissions.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation errors occurred.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  REQUEST_ERROR: 'Request error occurred.',
  GENERIC_ERROR: 'An unexpected error occurred.',
} as const;

// Default Configuration
const DEFAULT_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
} as const;

// Request Headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

/**
 * Enterprise Logger for API requests and responses
 */
class ApiLogger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  logRequest(config: InternalAxiosRequestConfig): void {
    if (!this.isDevelopment) return;

    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params,
    });
  }

  logResponse(response: AxiosResponse): void {
    if (!this.isDevelopment) return;

    console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
  }

  logError(error: AxiosError): void {
    if (!this.isDevelopment) return;

    console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
  }

  warn(message: string): void {
    console.warn(message);
  }

  error(message: string, data?: any): void {
    console.error(message, data);
  }
}

/**
 * Enterprise Error Handler for API responses
 */
class ApiErrorHandler {
  constructor(
    private logger: ApiLogger,
    private clearTokenCallback: () => void
  ) {}

  handleUnauthorized(): void {
    this.clearTokenCallback();
    this.logger.warn(ERROR_MESSAGES.UNAUTHORIZED);
    
    if (typeof window !== 'undefined') {
      // Client-side redirect
      // window.location.href = '/login';
    }
  }

  handleForbidden(): void {
    this.logger.error(ERROR_MESSAGES.FORBIDDEN);
    this.showErrorToUser(ERROR_MESSAGES.FORBIDDEN);
  }

  handleNotFound(): void {
    this.logger.error(ERROR_MESSAGES.NOT_FOUND);
    this.showErrorToUser(ERROR_MESSAGES.NOT_FOUND);
  }

  handleValidationErrors(data: any): void {
    this.logger.error(ERROR_MESSAGES.VALIDATION_ERROR, data);
    
    if (data?.errors) {
      this.showValidationErrors(data.errors);
    } else {
      this.showErrorToUser(ERROR_MESSAGES.VALIDATION_ERROR);
    }
  }

  handleServerError(): void {
    this.logger.error(ERROR_MESSAGES.SERVER_ERROR);
    this.showErrorToUser(ERROR_MESSAGES.SERVER_ERROR);
  }

  handleGenericError(response: AxiosResponse): void {
    const message = `HTTP Error ${response.status}: ${response.statusText}`;
    this.logger.error(message);
    this.showErrorToUser(message);
  }

  handleNetworkError(): void {
    this.logger.error(ERROR_MESSAGES.NETWORK_ERROR);
    this.showErrorToUser(ERROR_MESSAGES.NETWORK_ERROR);
  }

  handleRequestError(message: string): void {
    this.logger.error(ERROR_MESSAGES.REQUEST_ERROR, { message });
    this.showErrorToUser(ERROR_MESSAGES.REQUEST_ERROR);
  }

  private showErrorToUser(message: string): void {
    console.error('User Error:', message);
  }

  private showValidationErrors(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        this.showErrorToUser(`${field}: ${message}`);
      });
    });
  }

  shouldRetryError(status?: number): boolean {
    if (!status) return true; // Network errors
    return status >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
}

/**
 * Retry utility for failed API requests
 */
class ApiRetryService {
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (config.shouldRetry && !config.shouldRetry(error as AxiosError)) {
          throw error;
        }

        if (attempt === config.attempts) {
          break;
        }

        await this.delay(config.delay * attempt);
      }
    }

    throw lastError!;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static defaultShouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      return true;
    }
    return error.response.status >= 500;
  }
}

/**
 * Enterprise-grade API Client using Axios with proper separation of concerns
 * 
 * Features:
 * - Request/Response interceptors
 * - Automatic token management
 * - Error handling with retry logic
 * - Request/Response logging
 * - Timeout configuration
 * - File upload with progress tracking
 * - Proper TypeScript typing
 */
class EnterpriseApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private logger: ApiLogger;
  private errorHandler: ApiErrorHandler;
  private config: ApiConfig;

  constructor(customConfig?: Partial<ApiConfig>) {
    // Merge default config with custom config
    this.config = {
      // Ensure no trailing slash so endpoints concatenate correctly
      baseURL: API_CONFIG.BASE_URL.replace(/\/+$/, ''),
      timeout: DEFAULT_CONFIG.TIMEOUT,
      retryAttempts: DEFAULT_CONFIG.RETRY_ATTEMPTS,
      retryDelay: DEFAULT_CONFIG.RETRY_DELAY,
      enableLogging: DEFAULT_CONFIG.ENABLE_LOGGING,
      ...customConfig,
    };

    // Initialize services
    this.logger = new ApiLogger();
    this.errorHandler = new ApiErrorHandler(
      this.logger,
      () => this.clearAccessToken()
    );

    // Create axios instance
    this.axiosInstance = this.createAxiosInstance();

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Create axios instance with configuration
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: { ...DEFAULT_HEADERS },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptors
    this.axiosInstance.interceptors.request.use(
      this.requestInterceptor.bind(this),
      this.requestErrorInterceptor.bind(this)
    );

    // Response interceptors
    this.axiosInstance.interceptors.response.use(
      this.responseInterceptor.bind(this),
      this.responseErrorInterceptor.bind(this)
    );
  }

  /**
   * Request interceptor for authentication and logging
   */
  private requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add authentication token
    if (this.accessToken) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    // Log request if enabled
    if (this.config.enableLogging) {
      this.logger.logRequest(config);
    }

    return config;
  }

  /**
   * Request error interceptor
   */
  private requestErrorInterceptor(error: AxiosError): Promise<AxiosError> {
    this.logger.logError(error);
    return Promise.reject(error);
  }

  /**
   * Response interceptor for logging
   */
  private responseInterceptor(response: AxiosResponse): AxiosResponse {
    if (this.config.enableLogging) {
      this.logger.logResponse(response);
    }
    return response;
  }

  /**
   * Response error interceptor with enterprise error handling
   */
  private async responseErrorInterceptor(error: AxiosError): Promise<AxiosError> {
    const { response, request, message } = error;

    // Log error
    this.logger.logError(error);

    // Handle specific error cases
    if (response) {
      switch (response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          this.errorHandler.handleUnauthorized();
          break;
        case HTTP_STATUS.FORBIDDEN:
          this.errorHandler.handleForbidden();
          break;
        case HTTP_STATUS.NOT_FOUND:
          this.errorHandler.handleNotFound();
          break;
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          this.errorHandler.handleValidationErrors(response.data);
          break;
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          this.errorHandler.handleServerError();
          break;
        default:
          this.errorHandler.handleGenericError(response);
      }
    } else if (request) {
      this.errorHandler.handleNetworkError();
    } else {
      this.errorHandler.handleRequestError(message);
    }

    return Promise.reject(error);
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      attempts: this.config.retryAttempts || DEFAULT_CONFIG.RETRY_ATTEMPTS,
      delay: this.config.retryDelay || DEFAULT_CONFIG.RETRY_DELAY,
      shouldRetry: ApiRetryService.defaultShouldRetry,
    };

    const response = await ApiRetryService.executeWithRetry(
      requestFn,
      retryConfig
    );

    return response.data;
  }

  // ==================== Token Management ====================

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  // ==================== HTTP Methods ====================

  /**
   * GET request with enterprise features
   */
  async get<T>(
    endpoint: string, 
    params?: Record<string, any>, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.get<T>(endpoint, {
        params,
        ...config,
      })
    );
  }

  /**
   * POST request with enterprise features
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.post<T>(endpoint, data, config)
    );
  }

  /**
   * PUT request with enterprise features
   */
  async put<T>(
    endpoint: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.put<T>(endpoint, data, config)
    );
  }

  /**
   * PATCH request with enterprise features
   */
  async patch<T>(
    endpoint: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.patch<T>(endpoint, data, config)
    );
  }

  /**
   * DELETE request with enterprise features
   */
  async delete<T>(
    endpoint: string, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.delete<T>(endpoint, config)
    );
  }

  // ==================== File Operations ====================

  /**
   * Upload single file with progress tracking
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: UploadProgressCallback,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadFormData<T>(endpoint, formData, onProgress, config);
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadFiles<T>(
    endpoint: string,
    files: File[],
    onProgress?: UploadProgressCallback,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return this.uploadFormData<T>(endpoint, formData, onProgress, config);
  }

  /**
   * Upload form data with progress tracking
   */
  async uploadFormData<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: UploadProgressCallback,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      ...config,
    });

    return response.data;
  }

  // ==================== Utility Methods ====================

  /**
   * Create abort controller for request cancellation
   */
  createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * Create cancel token (deprecated in favor of AbortController)
   * @deprecated Use createAbortController() instead
   */
  createCancelToken(): AbortController {
    return this.createAbortController();
  }

  /**
   * Get axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate axios instance with new config
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

// Create and export singleton instance
export const apiClient = new EnterpriseApiClient({ timeout: API_CONFIG.TIMEOUT });

// Export the class for custom instances if needed
export default EnterpriseApiClient;
