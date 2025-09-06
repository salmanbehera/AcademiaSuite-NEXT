// Authentication service for external .NET Core API

import { apiClient, ApiResponse } from '@/lib/api-client';
import { AUTH_CONFIG } from '@/config/app.config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data?.token) {
      this.setTokens(response.data.token, response.data.refreshToken);
      this.setUser(response.data.user);
    }
    
    return response;
  }

  // Register new user
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data?.token) {
      this.setTokens(response.data.token, response.data.refreshToken);
      this.setUser(response.data.user);
    }
    
    return response;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      this.clearUser();
    }
  }

  // Refresh access token
  async refreshToken(): Promise<ApiResponse<{ token: string; expiresAt: string }>> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ token: string; expiresAt: string }>('/auth/refresh', {
      refreshToken
    });

    if (response.success && response.data?.token) {
      this.setAccessToken(response.data.token);
    }

    return response;
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    return apiClient.get<AuthUser>('/auth/me');
  }

  // Update user profile
  async updateProfile(userData: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    const response = await apiClient.put<AuthUser>('/auth/profile', userData);
    
    if (response.success && response.data) {
      this.setUser(response.data);
    }
    
    return response;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', {
      token,
      newPassword
    });
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    apiClient.setAccessToken(accessToken);
  }

  setAccessToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    apiClient.setAccessToken(accessToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    apiClient.setAccessToken(null);
  }

  // User management
  setUser(user: AuthUser): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): AuthUser | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  clearUser(): void {
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  // Initialize auth state from stored tokens
  initializeAuth(): void {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired()) {
      apiClient.setAccessToken(token);
    } else {
      this.clearTokens();
      this.clearUser();
    }
  }

  // Check user permissions
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Check user role
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role || false;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export default instance
export default authService;
