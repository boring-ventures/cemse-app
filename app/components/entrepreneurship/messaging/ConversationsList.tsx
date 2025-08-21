import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Conversation, Message } from '@/app/types/entrepreneurship';

interface ConversationsListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  refreshControl?: React.ReactElement<any>;
  loading?: boolean;
  error?: string | null;
  onNewConversation: () => void;
  selectedConversationId?: string;
}

/**
 * Conversations List Component
 * Displays list of user's conversations
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onSelectConversation,
  refreshControl,
  loading = false,
  error = null,
  onNewConversation,
  selectedConversationId,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // Format date for last message
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        return diffDays === 1 ? 'ayer' : `${diffDays}d`;
      } else if (diffHours > 0) {
        return `${diffHours}h`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m`;
      } else {
        return 'ahora';
      }
    } catch (error) {
      return '';
    }
  };

  // Render conversation item
  const renderConversation = ({ item }: { item: Conversation }) => {
    const participant = item.participant;
    const lastMessage = item.lastMessage;
    const isSelected = selectedConversationId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: isSelected ? `${tintColor}10` : cardBackground,
            borderColor: isSelected ? tintColor : borderColor,
          }
        ]}
        onPress={() => onSelectConversation(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {participant.avatarUrl ? (
            <Image
              source={{ uri: participant.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: `${tintColor}20` }]}>
              <ThemedText style={[styles.avatarText, { color: tintColor }]}>
                {participant.firstName[0]}{participant.lastName[0]}
              </ThemedText>
            </View>
          )}
          
          {/* Online status indicator */}
          <View style={[styles.onlineIndicator, { backgroundColor: '#10b981' }]} />
        </View>

        {/* Conversation Details */}
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <ThemedText style={styles.participantName} numberOfLines={1}>
              {participant.firstName} {participant.lastName}
            </ThemedText>
            {lastMessage && (
              <ThemedText style={styles.lastMessageTime}>
                {formatDate(item.updatedAt)}
              </ThemedText>
            )}
          </View>

          <View style={styles.conversationFooter}>
            {lastMessage ? (
              <ThemedText style={styles.lastMessage} numberOfLines={1}>
                {lastMessage.content}
              </ThemedText>
            ) : (
              <ThemedText style={styles.noMessages}>
                Sin mensajes aún
              </ThemedText>
            )}

            {/* Unread count badge */}
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={16} color={textColor} />
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={textColor} />
      <ThemedText style={styles.emptyTitle}>
        No hay conversaciones
      </ThemedText>
      <ThemedText style={styles.emptyMessage}>
        Conecta con otros emprendedores para iniciar una conversación
      </ThemedText>
      <TouchableOpacity
        style={[styles.newConversationButton, { backgroundColor: tintColor }]}
        onPress={onNewConversation}
      >
        <Ionicons name="add" size={20} color="white" />
        <ThemedText style={styles.newConversationButtonText}>
          Nueva conversación
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Header component
  const ListHeader = () => {
    if (conversations.length === 0) return null;
    
    return (
      <View style={styles.listHeader}>
        <ThemedText style={styles.conversationsCount}>
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
        </ThemedText>
        <TouchableOpacity
          style={styles.newConversationHeaderButton}
          onPress={onNewConversation}
        >
          <Ionicons name="add-circle-outline" size={20} color={tintColor} />
          <ThemedText style={[styles.newConversationHeaderText, { color: tintColor }]}>
            Nueva
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        refreshControl={refreshControl}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.emptyContent
        ]}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: borderColor }]} />
        )}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conversationsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  newConversationHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  newConversationHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  separator: {
    height: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  lastMessageTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
    marginRight: 8,
  },
  noMessages: {
    fontSize: 14,
    opacity: 0.5,
    fontStyle: 'italic',
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  chevronContainer: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 32,
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  newConversationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ConversationsList;