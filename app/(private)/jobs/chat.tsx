import { FormField } from '@/app/components/FormField';
import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useJobMessages } from '@/app/hooks/useJobMessages';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { JobMessage } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { 
  Alert, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/app/store/authStore';
import Shimmer from '@/app/components/Shimmer';

interface MessageBubbleProps {
  message: JobMessage;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  
  const bubbleColor = isOwnMessage ? iconColor : cardBackgroundColor;
  const textBubbleColor = isOwnMessage ? '#FFFFFF' : textColor;

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        { backgroundColor: bubbleColor }
      ]}>
        <ThemedText style={[
          styles.messageText,
          { color: textBubbleColor }
        ]}>
          {message.content}
        </ThemedText>
        <ThemedText style={[
          styles.messageTime,
          { color: isOwnMessage ? '#FFFFFF99' : secondaryTextColor }
        ]}>
          {new Date(message.sentAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </ThemedText>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const { applicationId, jobTitle, company } = useLocalSearchParams<{
    applicationId: string;
    jobTitle: string;
    company: string;
  }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const {
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
  } = useJobMessages();

  const messageForm = useFormik({
    initialValues: { message: '' },
    onSubmit: async (values, { resetForm }) => {
      if (!values.message.trim() || !applicationId) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const success = await sendMessage(applicationId, {
        content: values.message.trim(),
        messageType: 'TEXT'
      });

      if (success) {
        resetForm();
        // Scroll to bottom after sending
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'No se pudo enviar el mensaje. Intenta nuevamente.');
      }
    },
  });

  useEffect(() => {
    if (applicationId) {
      // Initial load
      refreshMessages(applicationId);
      // Start auto-refresh every 30 seconds
      startAutoRefresh(applicationId);
    }

    return () => {
      // Cleanup auto-refresh and clear messages
      stopAutoRefresh();
      clearMessages();
    };
  }, [applicationId, refreshMessages, startAutoRefresh, stopAutoRefresh, clearMessages]);

  const renderMessage = ({ item }: { item: JobMessage }) => {
    const isOwnMessage = item.senderId === user?.id;
    return <MessageBubble message={item} isOwnMessage={isOwnMessage} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name="chatbubbles-outline" size={48} color={iconColor} />
      </View>
      <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
        Inicia la conversación
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: secondaryTextColor }]}>
        Envía un mensaje para comenzar a conversar con el empleador sobre tu aplicación.
      </ThemedText>
    </View>
  );

  // Message Skeleton Component
  const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <Shimmer>
        <View style={[
          styles.skeletonMessageBubble,
          {
            backgroundColor: isOwn ? iconColor + '30' : cardBackgroundColor,
            alignSelf: isOwn ? 'flex-end' : 'flex-start'
          }
        ]}>
          <View style={[
            styles.skeletonMessageText,
            { backgroundColor: isOwn ? '#FFFFFF40' : secondaryTextColor + '30' }
          ]} />
          <View style={[
            styles.skeletonMessageTime,
            { backgroundColor: isOwn ? '#FFFFFF30' : secondaryTextColor + '20' }
          ]} />
        </View>
      </Shimmer>
    </View>
  );

  const renderLoadingMessages = () => (
    <View style={styles.loadingMessagesContainer}>
      <MessageSkeleton isOwn={false} />
      <MessageSkeleton isOwn={true} />
      <MessageSkeleton isOwn={false} />
      <MessageSkeleton isOwn={true} />
      <MessageSkeleton isOwn={false} />
    </View>
  );

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: `Chat - ${jobTitle}`,
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF453A" />
          <ThemedText style={[styles.errorTitle, { color: textColor }]}>
            Error al cargar el chat
          </ThemedText>
          <ThemedText style={[styles.errorDescription, { color: secondaryTextColor }]}>
            {error.message}
          </ThemedText>
          <ThemedButton
            title="Reintentar"
            onPress={() => applicationId && refreshMessages(applicationId)}
            type="primary"
            style={styles.retryButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: `Chat - ${jobTitle}`,
          headerShown: true,
        }}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Job Info Header */}
        <View style={[styles.jobInfoHeader, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={[styles.jobIcon, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name="briefcase-outline" size={20} color={iconColor} />
          </View>
          <View style={styles.jobInfo}>
            <ThemedText style={[styles.jobInfoTitle, { color: textColor }]}>
              {jobTitle}
            </ThemedText>
            <ThemedText style={[styles.jobInfoCompany, { color: secondaryTextColor }]}>
              {company}
            </ThemedText>
            <ThemedText style={[styles.lastRefresh, { color: secondaryTextColor }]}>
              Última actualización: {new Date(lastRefresh).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: '#FF453A' }]}>
                <ThemedText style={styles.unreadText}>
                  {unreadCount}
                </ThemedText>
              </View>
            )}
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => applicationId && refreshMessages(applicationId)}
            >
              <Ionicons name="refresh-outline" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        {loading ? (
          <View style={styles.messagesList}>
            <ScrollView 
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            >
              {renderLoadingMessages()}
            </ScrollView>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContainer,
              messages.length === 0 && styles.emptyMessagesContainer
            ]}
            ListEmptyComponent={renderEmptyState}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Message Input */}
        <View style={[styles.inputContainer, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.inputRow}>
            <View style={styles.textInputContainer}>
              <FormField
                label=""
                placeholder="Escribe tu mensaje..."
                formikKey="message"
                formikProps={messageForm as FormikProps<any>}
                multiline
                style={styles.messageInput}
                onSubmitEditing={() => messageForm.handleSubmit()}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: messageForm.values.message.trim() ? iconColor : borderColor,
                  opacity: sending ? 0.5 : 1
                }
              ]}
              onPress={() => messageForm.handleSubmit()}
              disabled={sending || !messageForm.values.message.trim()}
            >
              <Ionicons 
                name={sending ? "hourglass-outline" : "send"} 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  jobInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
  },
  jobInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  jobInfoCompany: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastRefresh: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyMessagesContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputContainer: {
    borderTopWidth: 1,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInputContainer: {
    flex: 1,
  },
  messageInput: {
    marginBottom: 0,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  // Message Skeleton Styles
  loadingMessagesContainer: {
    padding: 16,
    gap: 12,
  },
  skeletonMessageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  skeletonMessageText: {
    height: 16,
    borderRadius: 4,
    width: '100%',
  },
  skeletonMessageTime: {
    height: 12,
    borderRadius: 4,
    width: '40%',
    alignSelf: 'flex-end',
  },
});