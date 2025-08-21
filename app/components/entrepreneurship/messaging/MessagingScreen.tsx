import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useMessaging } from '@/app/hooks/useMessaging';
import Shimmer from '@/app/components/Shimmer';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import MessagingStats from './MessagingStats';
import { Conversation } from '@/app/types/entrepreneurship';

/**
 * Messaging Screen Component
 * Main messaging interface with conversations list and chat window
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const MessagingScreen: React.FC = () => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Messaging hook
  const {
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
  } = useMessaging();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchConversations(),
      fetchStats(),
    ]);
  }, [fetchConversations, fetchStats]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    try {
      await fetchMessages(conversation.otherParticipantId, { limit: 50 });
      
      // Mark unread messages as read
      if (conversation.unreadCount > 0) {
        // In a real implementation, you might batch mark multiple messages
        // For now, we'll assume the API handles this when fetching messages
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    }
  }, [fetchMessages]);

  // Handle send message
  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!selectedConversation) return false;

    const success = await sendMessage(
      selectedConversation.otherParticipantId,
      content,
      'text'
    );

    if (success) {
      // Refresh conversations to update last message
      fetchConversations();
    }

    return success;
  }, [selectedConversation, sendMessage, fetchConversations]);

  // Handle back from chat (mobile only)
  const handleBackFromChat = () => {
    setSelectedConversation(null);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    router.push('/entrepreneurship/network?tab=contacts');
  };

  // Toggle stats view
  const toggleStats = () => {
    setShowStats(!showStats);
    if (!showStats) {
      fetchStats();
    }
  };

  // Header component
  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Mensajes</ThemedText>
          {stats && (
            <ThemedText style={styles.headerSubtitle}>
              {stats.totalConversations} conversaciones, {stats.unreadMessages} sin leer
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={toggleStats}
        >
          <Ionicons 
            name={showStats ? "stats-chart" : "stats-chart-outline"} 
            size={24} 
            color={tintColor} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={handleNewConversation}
        >
          <Ionicons name="add-circle" size={24} color={tintColor} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading state
  if (loading && conversations.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Header />
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={32} color={tintColor} />
          <ThemedText style={styles.loadingText}>Cargando conversaciones...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && conversations.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <ThemedText style={styles.errorTitle}>Error al cargar</ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={handleRefresh}
          >
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Header />

      {showStats && stats && (
        <MessagingStats
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}

      <View style={styles.content}>
        {/* Mobile: Show either conversations list or chat */}
        {!selectedConversation ? (
          <ConversationsList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={handleRefresh}
                tintColor={tintColor}
              />
            }
            loading={loading}
            error={error}
            onNewConversation={handleNewConversation}
          />
        ) : (
          <ChatWindow
            conversation={selectedConversation}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onBack={handleBackFromChat}
            loading={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessagingScreen;