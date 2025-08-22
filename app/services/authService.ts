import {
  ApiResponse,
  AuthTokens,
  ImageFile,
  LoginCredentials,
  ProfileUpdateData,
  RegisterData,
  StoredSession,
  User
} from '@/app/types/auth';
import * as SecureStore from 'expo-secure-store';
import { apiService } from './apiService';

// Secure storage keys
const TOKEN_KEY = 'auth.token';
const REFRESH_TOKEN_KEY = 'auth.refresh_token';
const USER_KEY = 'auth.user';
const SESSION_KEY = 'auth.session';

/**
 * Enhanced AuthService with JWT-based authentication
 * Replaces Supabase with custom backend integration
 */

export const authService = {
  /**
   * Store tokens securely
   */
  storeTokens: async (tokens: AuthTokens): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, tokens.token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
      ]);
      console.log('Tokens stored successfully');
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  },

  /**
   * Get stored tokens
   */
  getStoredTokens: async (): Promise<AuthTokens | null> => {
    try {
      const [token, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);

      if (token && refreshToken) {
        return { token, refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  },

  /**
   * Store user data securely
   */
  storeUser: async (user: User): Promise<void> => {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  },

  /**
   * Get stored user data
   */
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userString = await SecureStore.getItemAsync(USER_KEY);
      if (userString) {
        return JSON.parse(userString) as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },

  /**
   * Store complete session (user + tokens)
   */
  storeSession: async (user: User, tokens: AuthTokens): Promise<void> => {
    try {
      const session: StoredSession = {
        user,
        tokens,
        timestamp: Date.now(),
      };

      await Promise.all([
        authService.storeTokens(tokens),
        authService.storeUser(user),
        SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)),
      ]);

      console.log('Complete session stored successfully');
    } catch (error) {
      console.error('Error storing session:', error);
      throw error;
    }
  },

  /**
   * Get stored session
   */
  getStoredSession: async (): Promise<StoredSession | null> => {
    try {
      const sessionString = await SecureStore.getItemAsync(SESSION_KEY);
      if (sessionString) {
        const session = JSON.parse(sessionString) as StoredSession;
        
        // Check if session is not too old (24 hours)
        const dayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - session.timestamp < dayInMs) {
          return session;
        } else {
          // Session too old, remove it
          await authService.clearSession();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting stored session:', error);
      return null;
    }
  },

  /**
   * Clear all stored authentication data
   */
  clearSession: async (): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(USER_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {}),
      ]);
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  /**
   * Login with username and password
   */
  signIn: async (username: string, password: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    try {
      const credentials: LoginCredentials = { username, password };
      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        const tokens: AuthTokens = { token, refreshToken };

        // Validate that user has YOUTH role
        if (user.role !== 'YOUTH') {
          return {
            success: false,
            error: {
              message: 'Acceso restringido. Esta aplicación es solo para usuarios YOUTH.',
              code: 'INVALID_ROLE'
            }
          };
        }

        // Store session securely
        await authService.storeSession(user, tokens);

        return {
          success: true,
          data: { user, tokens }
        };
      }

      return {
        success: false,
        error: response.error || { message: 'Error de inicio de sesión', code: 'SIGNIN_ERROR' }
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error de inicio de sesión',
          code: 'SIGNIN_ERROR'
        }
      };
    }
  },

  /**
   * Register new user
   */
  signUp: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatarFile?: ImageFile | null
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    try {
      const registerData: RegisterData = {
        email,
        password,
        firstName,
        lastName,
        avatarUrl: undefined, // Will be set after upload if needed
      };

      const response = await apiService.register(registerData);

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        const tokens: AuthTokens = { token, refreshToken };

        // Upload avatar if provided
        if (avatarFile) {
          // TODO: Implement avatar upload
          console.log('Avatar upload will be implemented in future iteration');
        }

        // Store session securely
        await authService.storeSession(user, tokens);

        return {
          success: true,
          data: { user, tokens }
        };
      }

      return {
        success: false,
        error: response.error || { message: 'Error en el registro', code: 'SIGNUP_ERROR' }
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error en el registro',
          code: 'SIGNUP_ERROR'
        }
      };
    }
  },

  /**
   * Logout user
   */
  signOut: async (): Promise<void> => {
    try {
      const tokens = await authService.getStoredTokens();
      
      if (tokens) {
        // Call API logout endpoint
        await apiService.logout(tokens.token);
      }
    } catch (error) {
      console.error('Error calling logout API:', error);
    } finally {
      // Always clear local session regardless of API call result
      await authService.clearSession();
    }
  },

  /**
   * Get current user from API
   */
  getCurrentUser: async (token?: string): Promise<User | null> => {
    try {
      const accessToken = token || (await authService.getStoredTokens())?.token;
      
      if (!accessToken) {
        return null;
      }

      const response = await apiService.getCurrentUser(accessToken);
      
      if (response.success && response.data) {
        // Update stored user data
        await authService.storeUser(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Refresh access token
   */
  refreshAccessToken: async (): Promise<AuthTokens | null> => {
    try {
      const storedTokens = await authService.getStoredTokens();
      
      if (!storedTokens?.refreshToken) {
        return null;
      }

      const response = await apiService.refreshToken(storedTokens.refreshToken);
      
      if (response.success && response.data) {
        const newTokens: AuthTokens = {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        };

        await authService.storeTokens(newTokens);
        return newTokens;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  },

  /**
   * Validate and refresh token if needed
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const tokens = await authService.getStoredTokens();
      
      if (!tokens) {
        return false;
      }

      // Try to validate current token
      const isValid = await apiService.validateToken(tokens.token);
      
      if (isValid) {
        return true;
      }

      // Try to refresh token
      const newTokens = await authService.refreshAccessToken();
      return !!newTokens;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: ProfileUpdateData): Promise<ApiResponse<User>> => {
    try {
      const tokens = await authService.getStoredTokens();
      
      if (!tokens) {
        return {
          success: false,
          error: { message: 'No authentication token found', code: 'NO_TOKEN' }
        };
      }

      const response = await apiService.updateProfile(tokens.token, profileData);
      
      if (response.success && response.data) {
        // Update stored user data
        await authService.storeUser(response.data);
      }

      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error actualizando perfil',
          code: 'UPDATE_PROFILE_ERROR'
        }
      };
    }
  },

  /**
   * Upload file - for backward compatibility
   */
  uploadFile: async (
    file: ImageFile,
    userId: string,
    contentType = 'image/jpeg'
  ): Promise<string | null> => {
    return authService.uploadAvatar(file);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (imageFile: ImageFile): Promise<string | null> => {
    try {
      const tokens = await authService.getStoredTokens();
      
      if (!tokens) {
        console.error('No authentication token found');
        return null;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Create a blob from the image URI for React Native
      const response = await fetch(imageFile.uri);
      const blob = await response.blob();
      
      formData.append('avatar', blob as any, imageFile.name);

      const uploadResponse = await apiService.uploadAvatar(tokens.token, formData);
      
      if (uploadResponse.success && uploadResponse.data) {
        return uploadResponse.data.avatarUrl;
      }

      return null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<ApiResponse<void>> => {
    return apiService.requestPasswordReset(email);
  },

  /**
   * Get avatar URL - for backward compatibility
   */
  getAvatarUrl: (avatarUrl: string | null): string | null => {
    return avatarUrl; // With new API, URLs are returned directly
  },

  // Legacy compatibility methods (for gradual migration)
  getSession: async () => {
    const session = await authService.getStoredSession();
    return session ? { user: session.user, session: session } : null;
  },

  getProfile: async (userId?: string) => {
    const user = await authService.getStoredUser();
    if (user) {
      return {
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.avatarUrl,
      };
    }
    return null;
  },
}; 