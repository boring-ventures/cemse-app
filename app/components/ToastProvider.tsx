import React, { createContext, useContext } from 'react';
import { useToast, ToastData } from '@/app/hooks/useToast';
import { ToastContainer } from './Toast';

interface ToastContextType {
  toasts: ToastData[];
  toast: (options: Omit<ToastData, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastHook = useToast();

  return (
    <ToastContext.Provider value={toastHook}>
      {children}
      <ToastContainer 
        toasts={toastHook.toasts} 
        onDismiss={toastHook.dismissToast} 
      />
    </ToastContext.Provider>
  );
};