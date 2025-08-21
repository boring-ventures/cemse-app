import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useAuth } from '@/app/components/AuthContext';
import { Conversation, Message } from '@/app/types/entrepreneurship';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => Promise<boolean>;
  onBack: () => void;
  loading?: boolean;
}

/**
 * Chat Window Component
 * Real-time messaging interface
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  onBack,
  loading = false,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      }, 100);
    }
  }, [messages.length]);

  // Handle send message
  const handleSend = useCallback(async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || sending) return;

    try {
      setSending(true);
      const success = await onSendMessage(trimmedText);
      
      if (success) {
        setInputText('');
      } else {
        Alert.alert('Error', 'No se pudo enviar el mensaje');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  }, [inputText, sending, onSendMessage]);

  // Format message timestamp
  const formatMessageTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '';
    }
  };

  // Check if message is from current user
  const isMyMessage = (message: Message): boolean => {
    return message.senderId === user?.id;
  };

  // Render message item
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isFromMe = isMyMessage(item);
    const showAvatar = index === messages.length - 1 || 
      (index < messages.length - 1 && 
       isMyMessage(messages[index + 1]) !== isFromMe);
    
    const showTimestamp = index === messages.length - 1 || 
      (index < messages.length - 1 && 
       new Date(item.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 300000); // 5 minutes

    return (
      <View style={[
        styles.messageContainer,
        isFromMe ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        {/* Avatar for other user's messages */}
        {!isFromMe && showAvatar && (
          <View style={styles.avatarContainer}>
            {conversation.participant.avatarUrl ? (
              <Image
                source={{ uri: conversation.participant.avatarUrl }}
                style={styles.messageAvatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: `${tintColor}20` }]}>
                <ThemedText style={[styles.avatarText, { color: tintColor }]}>
                  {conversation.participant.firstName[0]}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Message bubble */}
        <View style={[
          styles.messageBubble,
          isFromMe 
            ? { backgroundColor: tintColor }
            : { backgroundColor: cardBackground, borderColor, borderWidth: 1 }
        ]}>
          <ThemedText style={[
            styles.messageText,
            isFromMe && { color: 'white' }
          ]}>
            {item.content}
          </ThemedText>
          
          <View style={styles.messageFooter}>
            <ThemedText style={[
              styles.messageTime,
              isFromMe ? { color: 'rgba(255,255,255,0.7)' } : { opacity: 0.5 }
            ]}>
              {formatMessageTime(item.timestamp)}
            </ThemedText>
            
            {isFromMe && (
              <Ionicons
                name={item.isRead ? "checkmark-done" : "checkmark"}
                size={16}
                color="rgba(255,255,255,0.7)"
                style={styles.messageStatus}
              />
            )}
          </View>
        </View>

        {/* Timestamp separator */}
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <ThemedText style={styles.timestampText}>
              {new Date(item.timestamp).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  // Header component
  const ChatHeader = () => (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={24} color={tintColor} />
      </TouchableOpacity>

      <View style={styles.participantInfo}>
        {conversation.participant.avatarUrl ? (
          <Image
            source={{ uri: conversation.participant.avatarUrl }}
            style={styles.headerAvatar}
          />
        ) : (
          <View style={[styles.headerAvatarPlaceholder, { backgroundColor: `${tintColor}20` }]}>
            <ThemedText style={[styles.headerAvatarText, { color: tintColor }]}>
              {conversation.participant.firstName[0]}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.participantDetails}>
          <ThemedText style={styles.participantName}>
            {conversation.participant.firstName} {conversation.participant.lastName}
          </ThemedText>
          <ThemedText style={styles.participantStatus}>
            En línea
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity style={styles.headerAction}>
        <Ionicons name="call" size={24} color={tintColor} />
      </TouchableOpacity>
    </View>
  );

  // Message input component
  const MessageInput = () => (
    <View style={[styles.inputContainer, { borderTopColor: borderColor }]}>
      <View style={[styles.inputWrapper, { backgroundColor: cardBackground, borderColor }]}>
        <TextInput
          style={[styles.textInput, { color: textColor }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={`${textColor}60`}
          multiline
          maxLength={1000}
          editable={!sending}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() ? tintColor : 'transparent',
              opacity: sending ? 0.5 : 1,
            }
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? 'white' : textColor}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty messages component
  const EmptyMessages = () => (
    <View style={styles.emptyMessages}>
      <Ionicons name="chatbubble-outline" size={48} color={textColor} />
      <ThemedText style={styles.emptyMessagesTitle}>
        Inicia la conversación
      </ThemedText>
      <ThemedText style={styles.emptyMessagesText}>
        Envía un mensaje para comenzar a conversar con {conversation.participant.firstName}
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      <ChatHeader />
      
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <EmptyMessages />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={() => {
              // Handle scroll failure gracefully
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
        )}
      </View>

      <MessageInput />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantStatus: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  headerAction: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 2,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  messageStatus: {
    marginLeft: 4,
  },
  timestampContainer: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  timestampText: {
    fontSize: 12,
    opacity: 0.5,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyMessagesTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessagesText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

export default ChatWindow;