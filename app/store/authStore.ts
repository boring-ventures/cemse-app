import { authService } from "@/app/services/authService";
import { AuthTokens, ImageFile, User } from "@/app/types/auth";
import { create } from "zustand";

// Legacy profile type for backward compatibility
type ProfileState = {
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  error: string | null;

  // Computed property for legacy compatibility
  profile: ProfileState | null;

  // Actions
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar?: ImageFile | null
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  restoreSession: () => Promise<boolean>;
  updateUserData: (user: User) => void;
  updateProfile: (profileData: ProfileState) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tokens: null,
  error: null,

  // Computed profile property for backward compatibility
  get profile() {
    const state = get();
    if (!state.user) return null;
    
    return {
      first_name: state.user.firstName,
      last_name: state.user.lastName,
      email: state.user.email,
      avatar_url: state.user.avatarUrl,
    };
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const success = await get().restoreSession();

      if (!success) {
        set({ isAuthenticated: false, user: null, tokens: null });
      }
    } catch (error) {
      console.error("Error initializing auth store:", error);
      set({ isAuthenticated: false, user: null, tokens: null });
    } finally {
      set({ isLoading: false });
    }
  },

  restoreSession: async () => {
    try {
      // Try to restore session from secure storage
      const storedSession = await authService.getStoredSession();

      if (storedSession?.user && storedSession?.tokens) {
        // Validate token before restoring session
        const isTokenValid = await authService.validateToken();
        
        if (isTokenValid) {
          // Validate user role for JOVENES
          if (storedSession.user.role !== 'JOVENES') {
            console.warn('Invalid user role, clearing session');
            await authService.clearSession();
            return false;
          }

          set({
            isAuthenticated: true,
            user: storedSession.user,
            tokens: storedSession.tokens,
            error: null,
          });

          return true;
        } else {
          // Token is invalid, try to refresh
          const newTokens = await authService.refreshAccessToken();
          
          if (newTokens) {
            set({
              isAuthenticated: true,
              user: storedSession.user,
              tokens: newTokens,
              error: null,
            });

            return true;
          } else {
            // Refresh failed, clear session
            await authService.clearSession();
            return false;
          }
        }
      }

      return false;
    } catch (error) {
      console.error("Error restoring session:", error);
      await authService.clearSession();
      return false;
    }
  },

  login: async (username, password) => {
    set({  error: null });
    try {
      const response = await authService.signIn(username, password);

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        set({
          isAuthenticated: true,
          user,
          tokens,
          error: null,
        });
        
        return true;
      } else {
        const errorMessage = response.error?.message || 'Error de inicio de sesión';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, firstName, lastName, avatar) => {
    set({  error: null });
    try {
      const response = await authService.signUp(
        email,
        password,
        firstName,
        lastName,
        avatar
      );

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        set({
          isAuthenticated: true,
          user,
          tokens,
          error: null,
        });
        
        return true;
      } else {
        const errorMessage = response.error?.message || 'Error en el registro';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: null,
      });
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if logout API call fails, clear local session
      set({
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  updateUserData: (user) => {
    set((state) => ({
      ...state,
      user
    }));
  },

  updateProfile: (profileData) => {
    set((state) => ({
      ...state,
      user: state.user ? {
        ...state.user,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        avatarUrl: profileData.avatar_url,
      } : null
    }));
  },
}));
