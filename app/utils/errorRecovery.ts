import { AuthError } from '@/app/types/auth';
import { useAuthStore } from '@/app/store/authStore';
import { router } from 'expo-router';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

export interface ErrorRecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: AuthError;
  retryCount: number;
}

/**
 * Implements retry logic with exponential backoff for API calls
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<ErrorRecoveryResult<T>> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true
  } = options;

  let retryCount = 0;
  let lastError: AuthError | undefined;

  while (retryCount <= maxRetries) {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        retryCount
      };
    } catch (error) {
      retryCount++;
      
      const authError: AuthError = error instanceof Error 
        ? {
            message: error.message,
            code: 'OPERATION_FAILED'
          }
        : {
            message: 'Unknown error occurred',
            code: 'UNKNOWN_ERROR'
          };

      lastError = authError;

      // Don't retry on authentication errors
      if (isAuthenticationError(authError)) {
        break;
      }

      // Don't retry if we've reached max retries
      if (retryCount > maxRetries) {
        break;
      }

      // Wait before retrying
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, retryCount - 1)
        : retryDelay;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError,
    retryCount
  };
}

/**
 * Checks if an error is related to authentication
 */
export function isAuthenticationError(error: AuthError): boolean {
  return (
    error.statusCode === 401 ||
    error.code === 'TOKEN_EXPIRED' ||
    error.code === 'INVALID_TOKEN' ||
    error.code === 'UNAUTHORIZED' ||
    error.message.toLowerCase().includes('token') ||
    error.message.toLowerCase().includes('unauthorized') ||
    error.message.toLowerCase().includes('forbidden')
  );
}

/**
 * Checks if an error is related to network connectivity
 */
export function isNetworkError(error: AuthError): boolean {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch') ||
    error.message.toLowerCase().includes('connection') ||
    error.message.toLowerCase().includes('timeout')
  );
}

/**
 * Handles authentication errors by clearing tokens and redirecting to login
 */
export function handleAuthenticationError(): void {
  const { logout } = useAuthStore.getState();
  logout();
  
  // Redirect to login screen
  router.replace('/login');
}

/**
 * Creates a standardized error recovery strategy for different error types
 */
export function createErrorRecoveryStrategy(error: AuthError): {
  shouldRetry: boolean;
  shouldRedirectToLogin: boolean;
  userMessage: string;
  retryAction?: () => void;
} {
  if (isAuthenticationError(error)) {
    return {
      shouldRetry: false,
      shouldRedirectToLogin: true,
      userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    };
  }

  if (isNetworkError(error)) {
    return {
      shouldRetry: true,
      shouldRedirectToLogin: false,
      userMessage: 'Error de conexión. Verifica tu conexión e intenta nuevamente.',
    };
  }

  // Generic server error
  if (error.statusCode && error.statusCode >= 500) {
    return {
      shouldRetry: true,
      shouldRedirectToLogin: false,
      userMessage: 'Error del servidor. Intentando nuevamente...',
    };
  }

  // Client error (400-499)
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return {
      shouldRetry: false,
      shouldRedirectToLogin: false,
      userMessage: error.message || 'Error en la solicitud. Por favor, verifica los datos.',
    };
  }

  // Unknown error
  return {
    shouldRetry: true,
    shouldRedirectToLogin: false,
    userMessage: 'Error inesperado. Intenta nuevamente.',
  };
}

/**
 * HOC for automatic error recovery in API calls
 */
export function withErrorRecovery<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  return async (...args: T): Promise<R> => {
    const result = await withRetry(() => fn(...args), options);
    
    if (result.success && result.data) {
      return result.data;
    }

    if (result.error) {
      const strategy = createErrorRecoveryStrategy(result.error);
      
      if (strategy.shouldRedirectToLogin) {
        handleAuthenticationError();
      }
      
      throw result.error;
    }

    throw new Error('Operation failed after retries');
  };
}

/**
 * Utility for handling common API patterns with error recovery
 */
export class ErrorRecoveryService {
  static async executeWithRecovery<T>(
    operation: () => Promise<{ success: boolean; data?: T; error?: AuthError }>,
    options: RetryOptions = {}
  ): Promise<T> {
    const result = await withRetry(async () => {
      const response = await operation();
      if (response.success && response.data) {
        return response.data;
      }
      throw response.error || new Error('Operation failed');
    }, options);

    if (result.success && result.data) {
      return result.data;
    }

    if (result.error) {
      const strategy = createErrorRecoveryStrategy(result.error);
      
      if (strategy.shouldRedirectToLogin) {
        handleAuthenticationError();
      }
      
      throw result.error;
    }

    throw new Error('Operation failed after retries');
  }
}