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

// Session expiration callback type
type SessionExpiredCallback = () => void;

class ApiService {
  private baseUrl: string;
  private sessionExpiredCallback: SessionExpiredCallback | null = null;

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
        role: 'YOUTH' // Force YOUTH role for mobile app
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

  // Job-related endpoints

  /**
   * Get all job offers with optional filters
   */
  async getJobOffers(
    token: string,
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      location?: string[];
      contractType?: string[];
      workModality?: string[];
      experienceLevel?: string[];
      salaryMin?: number;
      salaryMax?: number;
      exclude?: string;
    }
  ): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const endpoint = `/joboffer${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.authenticatedRequest<any[]>(endpoint, token);
  }

  /**
   * Get job detail by ID
   */
  async getJobDetail(token: string, jobId: string): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>(`/joboffer/${jobId}`, token);
  }

  /**
   * Get user's job applications
   */
  async getMyApplications(token: string): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>('/jobapplication', token);
  }

  /**
   * Create job application
   */
  async createApplication(
    token: string,
    application: {
      jobOfferId: string;
      cvUrl?: string;
      coverLetterUrl?: string;
      status: 'PENDING';
      message?: string;
      questionAnswers?: Array<{
        questionId: string;
        question: string;
        answer: string;
      }>;
    }
  ): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>('/jobapplication', token, {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  /**
   * Withdraw job application
   */
  async withdrawApplication(token: string, applicationId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/my-applications?applicationId=${applicationId}`, token, {
      method: 'DELETE',
    });
  }

  /**
   * Check if user has applied to a specific job
   */
  async checkApplicationStatus(token: string, jobId: string): Promise<ApiResponse<{
    hasApplied: boolean;
    application?: {
      id: string;
      status: string;
      appliedAt: string;
    };
  }>> {
    return this.authenticatedRequest<{
      hasApplied: boolean;
      application?: {
        id: string;
        status: string;
        appliedAt: string;
      };
    }>(`/check-application/${jobId}`, token);
  }

  /**
   * Get chat messages for job application
   */
  async getJobMessages(token: string, applicationId: string): Promise<ApiResponse<any[]>> {
    return this.authenticatedRequest<any[]>(`/jobmessage/${applicationId}`, token);
  }

  /**
   * Send message in job application chat
   */
  async sendJobMessage(
    token: string,
    applicationId: string,
    message: {
      content: string;
      messageType: 'TEXT' | 'FILE';
    }
  ): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>(`/jobmessage/${applicationId}`, token, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  /**
   * Get custom questions for a job
   */
  async getJobQuestions(token: string, jobOfferId: string): Promise<ApiResponse<any[]>> {
    return this.authenticatedRequest<any[]>(`/jobquestion?jobOfferId=${jobOfferId}`, token);
  }

  /**
   * Check CV status for current user
   */
  async getCVStatus(token: string): Promise<ApiResponse<{
    hasCV: boolean;
    hasCoverLetter: boolean;
    cvUrl?: string;
    coverLetterUrl?: string;
    cvData?: any;
  }>> {
    return this.authenticatedRequest<{
      hasCV: boolean;
      hasCoverLetter: boolean;
      cvUrl?: string;
      coverLetterUrl?: string;
      cvData?: any;
    }>('/profile/cv-status', token);
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletion(token: string): Promise<ApiResponse<{ completionPercentage: number; missingFields: string[] }>> {
    return this.authenticatedRequest<{ completionPercentage: number; missingFields: string[] }>('/profile/completion', token);
  }

  /**
   * Upload document (CV or cover letter)
   */
  async uploadDocument(token: string, formData: FormData): Promise<ApiResponse<{ url: string; type: string }>> {
    return this.authenticatedRequest<{ url: string; type: string }>('/profile/upload-document', token, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  /**
   * Delete document (CV or cover letter)
   */
  async deleteDocument(token: string, type: 'cv' | 'coverLetter'): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/profile/documents/${type}`, token, {
      method: 'DELETE',
    });
  }

  /**
   * Get user's bookmarked jobs
   */
  async getBookmarkedJobs(token: string): Promise<ApiResponse<string[]>> {
    return this.authenticatedRequest<string[]>('/profile/bookmarks', token);
  }

  /**
   * Bookmark a job
   */
  async bookmarkJob(token: string, jobId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>('/profile/bookmarks', token, {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  /**
   * Remove bookmark from a job
   */
  async removeBookmark(token: string, jobId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/profile/bookmarks/${jobId}`, token, {
      method: 'DELETE',
    });
  }

  // CV Management endpoints

  /**
   * Get CV data for current user
   */
  async getCVData(token: string): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>('/cv', token);
  }

  /**
   * Update CV data
   */
  async updateCVData(token: string, cvData: Partial<any>): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>('/cv', token, {
      method: 'PUT',
      body: JSON.stringify(cvData),
    });
  }

  /**
   * Get cover letter data
   */
  async getCoverLetterData(token: string): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>('/cv/cover-letter', token);
  }

  /**
   * Save cover letter data
   */
  async saveCoverLetterData(
    token: string,
    coverLetterData: {
      content: string;
      template?: string;
      recipient?: any;
      subject?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>('/cv/cover-letter', token, {
      method: 'POST',
      body: JSON.stringify(coverLetterData),
    });
  }

  /**
   * Generate CV for specific job application
   */
  async generateCVForApplication(token: string, jobOfferId: string): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>(`/cv/generate/${jobOfferId}`, token, {
      method: 'POST',
    });
  }

  /**
   * Upload profile image for CV
   */
  async uploadProfileImage(token: string, imageFile: File | FormData): Promise<ApiResponse<{ avatarUrl: string; profile?: any }>> {
    const formData = new FormData();
    
    if (imageFile instanceof FormData) {
      // If it's already FormData, use it directly
      return this.authenticatedRequest<{ avatarUrl: string; profile?: any }>('/files/upload/profile-image', token, {
        method: 'POST',
        body: imageFile,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });
    } else {
      // If it's a File, create FormData
      formData.append('image', imageFile);
      return this.authenticatedRequest<{ avatarUrl: string; profile?: any }>('/files/upload/profile-image', token, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });
    }
  }

  /**
   * Update profile avatar URL (PUT /api/profile/avatar)
   * Used after image upload to update the profile with new avatar URL
   */
  async updateProfileAvatar(token: string, avatarUrl: string | null): Promise<ApiResponse<any>> {
    return this.authenticatedRequest<any>('/profile/avatar', token, {
      method: 'PUT',
      body: JSON.stringify({ avatarUrl }),
    });
  }
}

export const apiService = new ApiService();