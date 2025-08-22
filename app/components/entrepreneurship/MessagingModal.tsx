import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Message } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState, useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useMessaging } from '@/app/hooks/useMessaging';
import Shimmer from '../Shimmer';

interface MessagingModalProps {
  visible: boolean;
  onClose: () => void;
  recipientName: string;
  recipientId: string;
  messages?: Message[];
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  visible,
  onClose,
  recipientName,
  recipientId,
  messages = [],
}) => {
  const [inputMessage, setInputMessage] = useState('');
  
  // API integration using useMessaging hook
  const { 
    currentMessages, 
    loading, 
    error, 
    fetchMessages, 
    sendMessage 
  } = useMessaging();
  
  // Load messages when modal opens
  useEffect(() => {
    if (visible && recipientId) {
      fetchMessages(recipientId);
    }
  }, [visible, recipientId, fetchMessages]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const success = await sendMessage(recipientId, inputMessage.trim());
      if (success) {
        setInputMessage('');
      }
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === 'current_user';
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser 
            ? { backgroundColor: tintColor }
            : { backgroundColor: cardBackground, borderColor: borderColor + '40' }
        ]}>
          <ThemedText style={[
            styles.messageText,
            { color: isCurrentUser ? 'white' : textColor }
          ]}>
            {item.content}
          </ThemedText>
        </View>
        <ThemedText style={[styles.messageTime, { color: secondaryTextColor }]}>
          {formatMessageTime(item.timestamp)}
        </ThemedText>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <ThemedView style={styles.wrapper}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor + '40' }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: textColor }]}>
                {recipientName}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
                En línea
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          {loading ? (
            <View style={styles.messagesContent}>
              {[1, 2, 3].map((_, index) => (
                <Shimmer key={index}>
                  <View style={[
                    styles.skeletonMessage,
                    { 
                      backgroundColor: `${tintColor}20`,
                      alignSelf: index % 2 === 0 ? 'flex-start' : 'flex-end',
                      width: `${60 + Math.random() * 30}%`
                    }
                  ]} />
                </Shimmer>
              ))}
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <ThemedText style={styles.errorTitle}>Error al cargar mensajes</ThemedText>
              <ThemedText style={styles.errorMessage}>{error}</ThemedText>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: tintColor }]}
                onPress={() => fetchMessages(recipientId)}
              >
                <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={currentMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              inverted
            />
          )}

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.inputContainer, { backgroundColor: cardBackground, borderTopColor: borderColor + '40' }]}
          >
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add-circle-outline" size={24} color={tintColor} />
              </TouchableOpacity>
              
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: backgroundColor,
                    borderColor: borderColor + '60',
                    color: textColor,
                  }
                ]}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Escribe un mensaje..."
                placeholderTextColor={secondaryTextColor}
                multiline
                maxLength={500}
              />
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  { backgroundColor: inputMessage.trim() ? tintColor : secondaryTextColor + '40' }
                ]}
                onPress={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                <Ionicons name="send" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginHorizontal: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  attachButton: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonMessage: {
    height: 40,
    borderRadius: 18,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
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
    fontSize: 14,
    fontWeight: '600',
  },
}); 