import { useState, useEffect, useCallback } from 'react';
import { entrepreneurshipApiService } from '@/app/services/entrepreneurshipApiService';
import { useAuth } from '@/app/components/AuthContext';
import {
  Conversation,
  Message,
  ExtendedMessage,
  MessagingStats,
} from '@/app/types/entrepreneurship';

export interface UseMessagingReturn {
  conversations: Conversation[];
  currentMessages: Message[];
  stats: MessagingStats | null;
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (contactId: string, options?: { page?: number; limit?: number }) => Promise<void>;
  sendMessage: (receiverId: string, content: string, messageType?: string) => Promise<boolean>;
  markMessageAsRead: (messageId: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
}

/**
 * Hook for managing messaging functionality
 */
export function useMessaging(): UseMessagingReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessagingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getConversations(token);
      if (response.success && response.data) {
        setConversations(response.data);
      } else {
        setError(response.error?.message || 'Error fetching conversations');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (
    contactId: string,
    options?: { page?: number; limit?: number }
  ) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getMessages(token, contactId, options);
      if (response.success && response.data) {
        if (options?.page && options.page > 1) {
          // Append to existing messages for pagination
          setCurrentMessages(prev => [...prev, ...response.data!]);
        } else {
          // Replace messages for initial load
          setCurrentMessages(response.data);
        }
      } else {
        setError(response.error?.message || 'Error fetching messages');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const sendMessage = useCallback(async (
    receiverId: string,
    content: string,
    messageType: string = 'text'
  ): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.sendMessage(token, {
        receiverId,
        content,
        messageType,
      });

      if (response.success && response.data) {
        // Add the new message to current messages
        setCurrentMessages(prev => [response.data!, ...prev]);
        
        // Update conversations list - convert Message to ExtendedMessage
        const extendedMessage: ExtendedMessage = {
          ...response.data!,
          conversationId: receiverId, // Use receiverId as conversation identifier
          messageType: (response.data!.type === 'text' ? 'TEXT' : 
                       response.data!.type === 'file' ? 'FILE' : 
                       response.data!.type === 'system' ? 'SYSTEM' : 'TEXT') as 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM',
          status: 'SENT' as 'SENT' | 'DELIVERED' | 'READ' | 'FAILED',
          sender: {
            firstName: 'Current',
            lastName: 'User',
            avatarUrl: undefined,
          },
          receiver: {
            firstName: 'Unknown',
            lastName: 'User',
            avatarUrl: undefined,
          },
        };
        
        setConversations(prev => 
          prev.map(conv => 
            conv.otherParticipantId === receiverId
              ? { ...conv, lastMessage: extendedMessage, updatedAt: new Date().toISOString() }
              : conv
          )
        );

        return true;
      } else {
        setError(response.error?.message || 'Error sending message');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const markMessageAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.markMessageAsRead(token, messageId);
      if (response.success) {
        // Update message read status
        setCurrentMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, isRead: true, readAt: new Date().toISOString() }
              : msg
          )
        );

        // Update unread count in conversations
        setConversations(prev =>
          prev.map(conv => ({
            ...conv,
            unreadCount: Math.max(0, conv.unreadCount - 1)
          }))
        );

        return true;
      } else {
        setError(response.error?.message || 'Error marking message as read');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.getMessagingStats(token);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error?.message || 'Error fetching messaging stats');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations, fetchStats]);

  return {
    conversations,
    currentMessages,
    stats,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    fetchStats,
  };
}

/**
 * Hook for managing real-time messaging updates
 */
export function useRealtimeMessaging(conversationId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  // Note: In a real implementation, this would connect to WebSocket
  // For now, we'll use polling as a fallback
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      setLastActivity(new Date());
      // In a real app, this would poll for new messages
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [conversationId]);

  return {
    isConnected,
    lastActivity,
  };
}