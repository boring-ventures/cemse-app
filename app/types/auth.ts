/**
 * Authentication types for JWT-based system
 * Supporting YOUTH role for youth users
 */

export type UserRole = 'YOUTH' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
  type: string;
  user: User;
  municipality?: any;
  company?: any;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface DecodedJWT {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  error: string | null;
}

export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}

// Profile update types
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// Session types
export interface StoredSession {
  user: User;
  tokens: AuthTokens;
  timestamp: number;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// API endpoints types
export interface AuthEndpoints {
  login: string;
  register: string;
  logout: string;
  refresh: string;
  me: string;
  updateProfile: string;
  changePassword: string;
}

// Image file type for avatar uploads
export interface ImageFile {
  uri: string;
  name: string;
  type: string;
}