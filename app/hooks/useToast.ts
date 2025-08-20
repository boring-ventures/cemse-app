import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface UseToastReturn {
  toasts: ToastData[];
  toast: (options: Omit<ToastData, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((options: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    const duration = options.duration ?? (options.variant === 'error' ? 6000 : 4000);

    const newToast: ToastData = {
      ...options,
      id,
      duration,
    };

    // Add haptic feedback based on variant
    switch (options.variant) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }

    setToasts(prev => [newToast, ...prev.slice(0, 2)]); // Keep max 3 toasts

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    toast,
    dismissToast,
    clearAllToasts,
  };
}

// Toast messages as per specification
export const toastMessages = {
  // Success messages
  applicationSent: {
    title: "¡Aplicación enviada!",
    description: "Tu aplicación ha sido enviada exitosamente.",
    variant: 'success' as ToastVariant
  },
  applicationSubmitted: {
    title: "¡Aplicación enviada!",
    description: "Tu aplicación ha sido enviada exitosamente.",
    variant: 'success' as ToastVariant
  },
  applicationCancelled: {
    title: "¡Aplicación cancelada!",
    description: "Tu aplicación ha sido cancelada exitosamente",
    variant: 'default' as ToastVariant
  },
  cvUploaded: {
    title: "¡CV subido exitosamente!",
    description: "Tu CV ha sido guardado correctamente",
    variant: 'success' as ToastVariant
  },
  messageSent: {
    title: "Mensaje enviado",
    description: "Tu mensaje ha sido enviado al empleador",
    variant: 'success' as ToastVariant
  },

  // Error messages
  applicationError: {
    title: "Error",
    description: "No se pudo cancelar la aplicación",
    variant: 'error' as ToastVariant
  },
  documentsRequired: {
    title: "Documentos requeridos",
    description: "Necesitas al menos un CV o carta de presentación PDF para aplicar",
    variant: 'error' as ToastVariant
  },
  questionsIncomplete: {
    title: "Preguntas incompletas",
    description: "Debes responder todas las preguntas obligatorias",
    variant: 'error' as ToastVariant
  },
  networkError: {
    title: "Error de conexión",
    description: "Verifica tu conexión e intenta nuevamente.",
    variant: 'error' as ToastVariant
  },
  sessionExpired: {
    title: "Sesión expirada",
    description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
    variant: 'error' as ToastVariant
  },
  unexpectedError: {
    title: "Error inesperado",
    description: "Algo salió mal. Por favor, intenta nuevamente.",
    variant: 'error' as ToastVariant
  },

  // Info messages
  linkCopied: {
    title: "Enlace copiado",
    description: "El enlace del empleo ha sido copiado al portapapeles",
    variant: 'default' as ToastVariant
  },
  favoritesComingSoon: {
    title: "Favoritos",
    description: "Funcionalidad de favoritos próximamente disponible",
    variant: 'default' as ToastVariant
  }
};