/**
 * CV Service for API integration
 * Handles all CV-related API calls following existing CEMSE patterns
 */

import { 
  CVFormData, 
  CVApiResponse, 
  CVUploadResponse, 
  ImageUploadResponse 
} from '@/app/types/cv';
import { apiService } from './apiService';

class CVService {
  /**
   * Get user's CV data
   */
  async getUserCV(token: string): Promise<CVFormData | null> {
    try {
      const response = await apiService['authenticatedRequest']<CVApiResponse>(
        '/youth/cv',
        token,
        { method: 'GET' }
      );
      
      if (response.success && response.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get user CV:', error);
      return null;
    }
  }
  
  /**
   * Save/Update user's CV data
   */
  async saveCV(token: string, cvData: CVFormData): Promise<boolean> {
    try {
      const response = await apiService['authenticatedRequest']<CVUploadResponse>(
        '/youth/cv',
        token,
        {
          method: 'PUT',
          body: JSON.stringify({ data: cvData }),
        }
      );
      
      if (response.success) {
        console.log('CV saved successfully');
        return true;
      }
      
      console.error('Failed to save CV:', response.error?.message);
      return false;
    } catch (error) {
      console.error('Failed to save CV:', error);
      return false;
    }
  }
  
  /**
   * Upload profile image for CV
   */
  async uploadProfileImage(
    token: string, 
    imageFile: FormData,
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      // For React Native, we need to handle file upload differently
      const response = await this.uploadImageWithProgress(
        '/youth/cv/profile-image',
        token,
        imageFile,
        onProgress
      );
      
      if (response.success && response.imageUrl) {
        return response.imageUrl;
      }
      
      throw new Error(response.error || 'Upload failed');
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      throw error;
    }
  }
  
  /**
   * Upload image with progress tracking
   * Custom implementation for React Native file uploads
   */
  private async uploadImageWithProgress(
    endpoint: string,
    token: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = event.loaded / event.total;
          onProgress(progress);
        }
      });
      
      // Handle completion
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              imageUrl: response.imageUrl || response.url,
            });
          } else {
            resolve({
              success: false,
              error: response.message || `HTTP ${xhr.status}`,
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: 'Invalid response format',
          });
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Network error occurred',
        });
      });
      
      // Configure request
      const baseUrl = process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' 
        ? process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://back-end-production-17b6.up.railway.app/api'
        : process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api';
      
      xhr.open('POST', `${baseUrl}${endpoint}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      // Don't set Content-Type header for FormData
      // Let the browser set it with proper boundary
      
      // Send request
      xhr.send(formData);
    });
  }
  
  /**
   * Generate PDF for CV
   */
  async generatePDF(
    token: string, 
    cvData: CVFormData, 
    templateId: string,
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (onProgress) {
          // Simulate progress increments
          const currentProgress = Math.random() * 0.8; // 0-80%
          onProgress(currentProgress);
        }
      }, 500);
      
      const response = await apiService['authenticatedRequest']<{ pdfUrl: string }>(
        '/youth/cv/generate-pdf',
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            data: cvData,
            templateId,
            format: 'pdf',
          }),
        }
      );
      
      clearInterval(progressInterval);
      
      if (onProgress) {
        onProgress(1); // 100%
      }
      
      if (response.success && response.data?.pdfUrl) {
        return response.data.pdfUrl;
      }
      
      throw new Error(response.error?.message || 'PDF generation failed');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    }
  }
  
  /**
   * Get available CV templates
   */
  async getTemplates(token: string) {
    try {
      const response = await apiService['authenticatedRequest']<{ templates: any[] }>(
        '/youth/cv/templates',
        token,
        { method: 'GET' }
      );
      
      if (response.success && response.data?.templates) {
        return response.data.templates;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  }
  
  /**
   * Delete user's CV
   */
  async deleteCV(token: string): Promise<boolean> {
    try {
      const response = await apiService['authenticatedRequest']<void>(
        '/youth/cv',
        token,
        { method: 'DELETE' }
      );
      
      return response.success;
    } catch (error) {
      console.error('Failed to delete CV:', error);
      return false;
    }
  }
  
  /**
   * Export CV data
   */
  async exportCV(
    token: string, 
    format: 'json' | 'pdf' | 'docx' = 'json'
  ): Promise<string | null> {
    try {
      const response = await apiService['authenticatedRequest']<{ downloadUrl: string }>(
        `/youth/cv/export?format=${format}`,
        token,
        { method: 'GET' }
      );
      
      if (response.success && response.data?.downloadUrl) {
        return response.data.downloadUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to export CV:', error);
      return null;
    }
  }
  
  /**
   * Validate CV completeness
   */
  validateCVCompleteness(cvData: CVFormData): {
    isValid: boolean;
    missingFields: string[];
    completionPercentage: number;
  } {
    const missingFields: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    // Personal Info (30 points)
    if (!cvData.personalInfo?.firstName) missingFields.push('Nombre');
    else score += 10;
    
    if (!cvData.personalInfo?.lastName) missingFields.push('Apellido');
    else score += 10;
    
    if (!cvData.personalInfo?.email) missingFields.push('Email');
    else score += 5;
    
    if (!cvData.personalInfo?.personalDescription || cvData.personalInfo.personalDescription.length < 50) {
      missingFields.push('Descripción personal');
    } else {
      score += 5;
    }
    
    // Education (25 points)
    if (!cvData.education?.educationHistory?.length) {
      missingFields.push('Educación');
    } else {
      score += 25;
    }
    
    // Experience (20 points) - Optional but recommended
    if (cvData.workExperience?.length) {
      score += 20;
    }
    
    // Skills (15 points)
    if (!cvData.skills?.length) {
      missingFields.push('Habilidades');
    } else {
      score += 15;
    }
    
    // Projects (10 points) - Optional
    if (cvData.projects?.length) {
      score += 10;
    }
    
    const completionPercentage = Math.min(score, maxScore);
    const isValid = completionPercentage >= 60; // Minimum 60% completion
    
    return {
      isValid,
      missingFields,
      completionPercentage,
    };
  }
}

export const cvService = new CVService();