import { ImageFile, User, AuthTokens } from '@/app/types/auth';
import { LoadingScreen } from '@/app/components/LoadingScreen';
import { useAuthStore } from '@/app/store/authStore';
import React, { createContext, useContext } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar?: ImageFile | null
  ) => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    tokens,
    login,
    logout,
    register,
  } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        tokens,
        token: tokens?.token || null,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 