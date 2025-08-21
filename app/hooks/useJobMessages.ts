import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';
import { JobMessage, SendMessageRequest } from '@/app/types/jobs';

interface UseJobMessagesReturn {
  messages: JobMessage[];
  loading: boolean;
  sending: boolean;
  error: Error | null;
  unreadCount: number;
  lastRefresh: number;
  sendMessage: (applicationId: string, messageData: SendMessageRequest) => Promise<boolean>;
  refreshMessages: (applicationId: string) => Promise<void>;
  startAutoRefresh: (applicationId: string) => void;
  stopAutoRefresh: () => void;
  clearMessages: () => void;
}

export function useJobMessages(): UseJobMessagesReturn {
  const { user, tokens } = useAuthStore();
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshMessages = useCallback(async (applicationId: string) => {
    if (!tokens?.token || !applicationId) {
      setError(new Error('No authentication token or application ID'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getJobMessages(tokens.token, applicationId);

      if (response.success && response.data) {
        const messagesArray = Array.isArray(response.data) ? response.data : [];
        setMessages(messagesArray);
        
        // Calculate unread count (messages from company/admin that haven't been read)
        const unread = messagesArray.filter(msg => 
          !msg.readAt && (msg.senderType !== 'USER' && msg.senderType !== 'APPLICANT')
        ).length;
        setUnreadCount(unread);
        setLastRefresh(Date.now());
      } else {
        throw new Error(response.error?.message || 'Failed to fetch messages');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  const sendMessage = useCallback(async (
    applicationId: string, 
    messageData: SendMessageRequest
  ): Promise<boolean> => {
    if (!tokens?.token || !applicationId) {
      setError(new Error('No authentication token or application ID'));
      return false;
    }

    setSending(true);
    setError(null);

    try {
      const response = await apiService.sendJobMessage(tokens.token, applicationId, messageData);

      if (response.success) {
        // Refresh messages to get the new message
        await refreshMessages(applicationId);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to send message');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error sending message:', error);
      return false;
    } finally {
      setSending(false);
    }
  }, [tokens?.token, refreshMessages]);

  const startAutoRefresh = useCallback((applicationId: string) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new auto-refresh every 30 seconds as per spec
    intervalRef.current = setInterval(() => {
      refreshMessages(applicationId);
    }, 30000);
  }, [refreshMessages]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setUnreadCount(0);
    stopAutoRefresh();
  }, [stopAutoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    messages,
    loading,
    sending,
    error,
    unreadCount,
    lastRefresh,
    sendMessage,
    refreshMessages,
    startAutoRefresh,
    stopAutoRefresh,
    clearMessages,
  };
}