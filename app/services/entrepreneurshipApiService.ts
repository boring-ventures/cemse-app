import {
  Entrepreneurship,
  EditFormData,
  ContactUser,
  ContactRequest,
  ContactStats,
  Conversation,
  Message,
  MessagingStats,
  Institution,
  DirectoryProfile,
  Post,
  Resource,
  ResourceFilter,
} from '@/app/types/entrepreneurship';
import { ApiResponse } from '@/app/types/auth';

/**
 * Entrepreneurship API Service
 * Handles all HTTP requests for entrepreneurship functionality
 */
class EntrepreneurshipApiService {
  private baseUrl: string;

  constructor() {
    const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
    this.baseUrl = environment === 'production' 
      ? process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://back-end-production-17b6.up.railway.app/api'
      : process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api';
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
      console.log(`Making Entrepreneurship API request to: ${url}`);
      
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
        const error = {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          code: data.code || 'API_ERROR'
        };

        console.error(`Entrepreneurship API Error (${response.status}):`, error);
        
        return {
          success: false,
          error,
        };
      }

      console.log('Entrepreneurship API request successful');
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('Entrepreneurship API request failed:', error);
      
      const apiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        code: 'NETWORK_ERROR'
      };

      return {
        success: false,
        error: apiError,
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

  // Entrepreneurship CRUD Operations

  /**
   * Get all entrepreneurships (public)
   */
  async getPublicEntrepreneurships(): Promise<ApiResponse<Entrepreneurship[]>> {
    return this.request<Entrepreneurship[]>('/entrepreneurship/public');
  }

  /**
   * Get all entrepreneurships for authenticated user
   */
  async getEntrepreneurships(token: string): Promise<ApiResponse<Entrepreneurship[]>> {
    return this.authenticatedRequest<Entrepreneurship[]>('/entrepreneurship', token);
  }

  /**
   * Get entrepreneurship by ID
   */
  async getEntrepreneurship(token: string, id: string): Promise<ApiResponse<Entrepreneurship>> {
    return this.authenticatedRequest<Entrepreneurship>(`/entrepreneurship/${id}`, token);
  }

  /**
   * Create new entrepreneurship
   */
  async createEntrepreneurship(
    token: string,
    data: Omit<EditFormData, 'id'>
  ): Promise<ApiResponse<Entrepreneurship>> {
    return this.authenticatedRequest<Entrepreneurship>('/entrepreneurship', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update entrepreneurship
   */
  async updateEntrepreneurship(
    token: string,
    id: string,
    data: Partial<EditFormData>
  ): Promise<ApiResponse<Entrepreneurship>> {
    return this.authenticatedRequest<Entrepreneurship>(`/entrepreneurship/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete entrepreneurship
   */
  async deleteEntrepreneurship(token: string, id: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/entrepreneurship/${id}`, token, {
      method: 'DELETE',
    });
  }

  /**
   * Get user's own entrepreneurships
   */
  async getMyEntrepreneurships(token: string): Promise<ApiResponse<Entrepreneurship[]>> {
    return this.authenticatedRequest<Entrepreneurship[]>('/entrepreneurship/my', token);
  }

  // Contact/Networking Operations

  /**
   * Search for users to connect with
   */
  async searchContacts(
    token: string,
    query?: string,
    filters?: {
      department?: string;
      municipality?: string;
      skills?: string[];
    }
  ): Promise<ApiResponse<ContactUser[]>> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.municipality) params.append('municipality', filters.municipality);
    if (filters?.skills) {
      filters.skills.forEach(skill => params.append('skills', skill));
    }

    const endpoint = `/contacts/search${params.toString() ? `?${params.toString()}` : ''}`;
    return this.authenticatedRequest<ContactUser[]>(endpoint, token);
  }

  /**
   * Send connection request
   */
  async sendContactRequest(
    token: string,
    data: {
      receiverId: string;
      message?: string;
    }
  ): Promise<ApiResponse<ContactRequest>> {
    return this.authenticatedRequest<ContactRequest>('/contacts/request', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get received connection requests
   */
  async getReceivedRequests(token: string): Promise<ApiResponse<ContactRequest[]>> {
    return this.authenticatedRequest<ContactRequest[]>('/contacts/requests/received', token);
  }

  /**
   * Accept connection request
   */
  async acceptContactRequest(token: string, requestId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/contacts/requests/${requestId}/accept`, token, {
      method: 'PUT',
    });
  }

  /**
   * Reject connection request
   */
  async rejectContactRequest(token: string, requestId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/contacts/requests/${requestId}/reject`, token, {
      method: 'PUT',
    });
  }

  /**
   * Get user's contacts
   */
  async getMyContacts(token: string): Promise<ApiResponse<ContactUser[]>> {
    return this.authenticatedRequest<ContactUser[]>('/contacts', token);
  }

  /**
   * Get contact statistics
   */
  async getContactStats(token: string): Promise<ApiResponse<ContactStats>> {
    return this.authenticatedRequest<ContactStats>('/contacts/stats', token);
  }

  // Messaging Operations

  /**
   * Get all conversations
   */
  async getConversations(token: string): Promise<ApiResponse<Conversation[]>> {
    return this.authenticatedRequest<Conversation[]>('/messages/conversations', token);
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(
    token: string,
    contactId: string,
    options?: {
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<Message[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const endpoint = `/messages/conversation/${contactId}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.authenticatedRequest<Message[]>(endpoint, token);
  }

  /**
   * Send a message
   */
  async sendMessage(
    token: string,
    data: {
      receiverId: string;
      content: string;
      messageType?: string;
    }
  ): Promise<ApiResponse<Message>> {
    return this.authenticatedRequest<Message>('/messages/send', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(token: string, messageId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/messages/${messageId}/read`, token, {
      method: 'PUT',
    });
  }

  /**
   * Get messaging statistics
   */
  async getMessagingStats(token: string): Promise<ApiResponse<MessagingStats>> {
    return this.authenticatedRequest<MessagingStats>('/messages/stats', token);
  }

  // Directory Operations

  /**
   * Get public institutions
   */
  async getPublicInstitutions(): Promise<ApiResponse<Institution[]>> {
    return this.request<Institution[]>('/municipality/public');
  }

  /**
   * Get institution profile by ID
   */
  async getInstitutionProfile(
    token: string,
    institutionId: string
  ): Promise<ApiResponse<DirectoryProfile>> {
    return this.authenticatedRequest<DirectoryProfile>(`/directory/institution/${institutionId}`, token);
  }

  /**
   * Get institution posts
   */
  async getInstitutionPosts(
    token: string,
    institutionId: string,
    options?: {
      page?: number;
      limit?: number;
      category?: string;
    }
  ): Promise<ApiResponse<Post[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.category) params.append('category', options.category);

    const endpoint = `/directory/institution/${institutionId}/posts${params.toString() ? `?${params.toString()}` : ''}`;
    return this.authenticatedRequest<Post[]>(endpoint, token);
  }

  /**
   * Get specific post by ID
   */
  async getPost(token: string, postId: string): Promise<ApiResponse<Post>> {
    return this.authenticatedRequest<Post>(`/directory/posts/${postId}`, token);
  }

  // Resources Operations

  /**
   * Get resources with filters
   */
  async getResources(
    token: string,
    filters?: Partial<ResourceFilter>,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<ApiResponse<Resource[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/resources${params.toString() ? `?${params.toString()}` : ''}`;
    return this.authenticatedRequest<Resource[]>(endpoint, token);
  }

  /**
   * Get resource by ID
   */
  async getResource(token: string, resourceId: string): Promise<ApiResponse<Resource>> {
    return this.authenticatedRequest<Resource>(`/resources/${resourceId}`, token);
  }

  /**
   * Download resource
   */
  async downloadResource(token: string, resourceId: string): Promise<ApiResponse<{
    downloadUrl: string;
    filename: string;
  }>> {
    return this.authenticatedRequest<{
      downloadUrl: string;
      filename: string;
    }>(`/resources/${resourceId}/download`, token, {
      method: 'POST',
    });
  }

  /**
   * Rate a resource
   */
  async rateResource(
    token: string,
    resourceId: string,
    rating: number
  ): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/resources/${resourceId}/rate`, token, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  /**
   * Get user's favorite resources
   */
  async getFavoriteResources(token: string): Promise<ApiResponse<Resource[]>> {
    return this.authenticatedRequest<Resource[]>('/resources/favorites', token);
  }

  /**
   * Add resource to favorites
   */
  async addToFavorites(token: string, resourceId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/resources/${resourceId}/favorite`, token, {
      method: 'POST',
    });
  }

  /**
   * Remove resource from favorites
   */
  async removeFromFavorites(token: string, resourceId: string): Promise<ApiResponse<void>> {
    return this.authenticatedRequest<void>(`/resources/${resourceId}/favorite`, token, {
      method: 'DELETE',
    });
  }

  // File Upload Operations

  /**
   * Upload entrepreneurship logo
   */
  async uploadLogo(
    token: string,
    entrepreneurshipId: string,
    imageFile: File | FormData
  ): Promise<ApiResponse<{ logoUrl: string }>> {
    const formData = new FormData();
    
    if (imageFile instanceof FormData) {
      return this.authenticatedRequest<{ logoUrl: string }>(
        `/entrepreneurship/${entrepreneurshipId}/logo`, 
        token, 
        {
          method: 'POST',
          body: imageFile,
          headers: {
            // Don't set Content-Type for FormData
          },
        }
      );
    } else {
      formData.append('logo', imageFile);
      return this.authenticatedRequest<{ logoUrl: string }>(
        `/entrepreneurship/${entrepreneurshipId}/logo`, 
        token, 
        {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type for FormData
          },
        }
      );
    }
  }

  /**
   * Upload entrepreneurship images
   */
  async uploadImages(
    token: string,
    entrepreneurshipId: string,
    imageFiles: File[] | FormData
  ): Promise<ApiResponse<{ imageUrls: string[] }>> {
    const formData = new FormData();
    
    if (imageFiles instanceof FormData) {
      return this.authenticatedRequest<{ imageUrls: string[] }>(
        `/entrepreneurship/${entrepreneurshipId}/images`, 
        token, 
        {
          method: 'POST',
          body: imageFiles,
          headers: {
            // Don't set Content-Type for FormData
          },
        }
      );
    } else {
      imageFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });
      return this.authenticatedRequest<{ imageUrls: string[] }>(
        `/entrepreneurship/${entrepreneurshipId}/images`, 
        token, 
        {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type for FormData
          },
        }
      );
    }
  }
}

export const entrepreneurshipApiService = new EntrepreneurshipApiService();