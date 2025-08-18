import { 
  ApiResponse, 
  LoginCredentials, 
  LoginResponse,
  RegisterData,
  RegisterResponse,
  RefreshTokenResponse,
  User,
  ProfileUpdateData,
  PasswordChangeData,
  AuthError
} from '@/app/types/auth';

/**
 * API Service for custom backend communication
 * Handles all HTTP requests with proper error handling and typing
 */

class ApiService {
  private baseUrl: string;

  constructor() {
    const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
    this.baseUrl = environment === 'production' 
      ? process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://back-end-production-17b6.up.railway.app/api'
      : process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api';
    
    console.log(`API Service initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Generic HTTP request handler with proper error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        const error: AuthError = {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          code: data.code || 'API_ERROR'
        };

        console.error(`API Error (${response.status}):`, error);
        
        return {
          success: false,
          error,
        };
      }

      console.log('API request successful');
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      const authError: AuthError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        code: 'NETWORK_ERROR'
      };

      return {
        success: false,
        error: authError,
      };
    }
  }

  /**
   * Authenticated request helper
   */
  private async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Authentication endpoints
  
  /**
   * Login user with username and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        role: 'JOVENES' // Force JOVENES role for mobile app
      }),
    });
  }

  /**
   * Get current user information
   */
  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    return this.authenticatedRequest<User>('/auth/me', token);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>('/auth/logout', token, {
      method: 'POST',
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    token: string,
    profileData: ProfileUpdateData
  ): Promise<ApiResponse<User>> {
    return this.authenticatedRequest<User>('/auth/profile', token, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Change user password
   */
  async changePassword(
    token: string,
    passwordData: PasswordChangeData
  ): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>('/auth/password', token, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  /**
   * Upload user avatar
   * @param token JWT token
   * @param imageFile Image file to upload
   * @returns Promise with upload result
   */
  async uploadAvatar(token: string, imageFile: File | FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    
    if (imageFile instanceof FormData) {
      // If it's already FormData, use it directly
      return this.authenticatedRequest<{ avatarUrl: string }>('/auth/avatar', token, {
        method: 'POST',
        body: imageFile,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });
    } else {
      // If it's a File, create FormData
      formData.append('avatar', imageFile);
      return this.authenticatedRequest<{ avatarUrl: string }>('/auth/avatar', token, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    resetToken: string, 
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: resetToken,
        password: newPassword,
      }),
    });
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<boolean> {
    const response = await this.getCurrentUser(token);
    return response.success && !!response.data;
  }
}

export const apiService = new ApiService();