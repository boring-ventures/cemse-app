import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import Shimmer from '../../../components/Shimmer';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useAuth } from '../../../components/AuthContext';
import { entrepreneurshipApiService } from '../../../services/entrepreneurshipApiService';
import { Conversation, MessagingStats } from '../../../types/entrepreneurship';

export default function MessagingScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<MessagingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conversation =>
        conversation.participant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.participant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.participant.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchData = async () => {
    if (!token) return;

    try {
      const [conversationsResponse, statsResponse] = await Promise.all([
        entrepreneurshipApiService.getConversations(token),
        entrepreneurshipApiService.getMessagingStats(token)
      ]);

      if (conversationsResponse.success && conversationsResponse.data) {
        setConversations(conversationsResponse.data);
        setFilteredConversations(conversationsResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching messaging data:', error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleConversationPress = (conversation: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/entrepreneurship/messaging/${conversation.otherParticipantId}`);
  };

  const handleMarkAllRead = async () => {
    if (!token) return;

    try {
      const response = await entrepreneurshipApiService.markAllMessagesAsRead(token);
      if (response.success) {
        // Refresh conversations
        fetchData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron marcar los mensajes como leídos');
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderLoadingState = () => (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Mensajes
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {[...Array(6)].map((_, index) => (
          <Shimmer key={index}>
            <View style={[styles.conversationCard, { backgroundColor: cardColor }]}>
              <View style={[styles.cardPlaceholder, { backgroundColor: borderColor }]} />
            </View>
          </Shimmer>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  if (loading) return renderLoadingState();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Mensajes
        </ThemedText>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerAction}>
          <Ionicons name="checkmark-done" size={24} color={iconColor} />
        </TouchableOpacity>
      </ThemedView>

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: cardColor }]}>
            <ThemedText style={[styles.statNumber, { color: iconColor }]}>
              {stats.totalConversations}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
              Conversaciones
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardColor }]}>
            <ThemedText style={[styles.statNumber, { color: '#FF6B6B' }]}>
              {stats.unreadMessages}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
              Sin leer
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardColor }]}>
            <ThemedText style={[styles.statNumber, { color: '#4ECDC4' }]}>
              {stats.activeConversations}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
              Activas
            </ThemedText>
          </View>
        </View>
      )}

      {/* Search */}
      <ThemedView style={styles.searchContainer}>
        <View style={[styles.searchBox, { borderColor, backgroundColor: cardColor }]}>
          <Ionicons name="search" size={20} color={secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar conversaciones..."
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      {/* Conversations List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredConversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={[styles.conversationCard, { backgroundColor: cardColor }]}
            onPress={() => handleConversationPress(conversation)}
          >
            <View style={styles.cardContent}>
              {/* Avatar */}
              <View style={[styles.avatar, { backgroundColor: iconColor }]}>
                <ThemedText style={styles.avatarText}>
                  {conversation.participant.firstName[0]}{conversation.participant.lastName[0]}
                </ThemedText>
                {conversation.participant.isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
              </View>

              {/* Conversation Info */}
              <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                  <ThemedText type="defaultSemiBold" style={[styles.participantName, { color: textColor }]}>
                    {conversation.participant.firstName} {conversation.participant.lastName}
                  </ThemedText>
                  {conversation.lastMessage && (
                    <ThemedText style={[styles.messageTime, { color: secondaryTextColor }]}>
                      {formatLastMessageTime(conversation.lastMessage.timestamp)}
                    </ThemedText>
                  )}
                </View>

                {conversation.participant.currentInstitution && (
                  <ThemedText style={[styles.institution, { color: secondaryTextColor }]}>
                    {conversation.participant.currentInstitution}
                  </ThemedText>
                )}

                {conversation.lastMessage && (
                  <ThemedText 
                    style={[styles.lastMessage, { color: secondaryTextColor }]}
                    numberOfLines={2}
                  >
                    {conversation.lastMessage.content}
                  </ThemedText>
                )}
              </View>

              {/* Unread Badge */}
              {conversation.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: '#FF6B6B' }]}>
                  <ThemedText style={styles.unreadText}>
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {filteredConversations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={secondaryTextColor} />
            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: textColor }]}>
              No hay mensajes aún
            </ThemedText>
            <ThemedText style={[styles.emptyMessage, { color: secondaryTextColor }]}>
              Conecta con otros emprendedores para comenzar a conversar
            </ThemedText>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerAction: {
    padding: 8,
    marginRight: -8,
  },
  headerActions: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  conversationCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationInfo: {
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
  },
  messageTime: {
    fontSize: 12,
  },
  institution: {
    fontSize: 12,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Loading states
  cardPlaceholder: {
    height: 70,
    borderRadius: 8,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
});