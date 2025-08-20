import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { ToastData, ToastVariant } from '@/app/hooks/useToast';
import { ThemedButton } from './ThemedButton';

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const getToastColors = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return {
        backgroundColor: '#32D74B',
        borderColor: '#28A745',
        iconName: 'checkmark-circle' as const,
        iconColor: '#FFFFFF',
        textColor: '#FFFFFF',
      };
    case 'error':
      return {
        backgroundColor: '#FF453A',
        borderColor: '#DC3545',
        iconName: 'alert-circle' as const,
        iconColor: '#FFFFFF',
        textColor: '#FFFFFF',
      };
    case 'warning':
      return {
        backgroundColor: '#FF9500',
        borderColor: '#FD7E14',
        iconName: 'warning' as const,
        iconColor: '#FFFFFF',
        textColor: '#FFFFFF',
      };
    default:
      return {
        backgroundColor: undefined, // Will use theme color
        borderColor: undefined,
        iconName: 'information-circle' as const,
        iconColor: undefined, // Will use theme color
        textColor: undefined, // Will use theme color
      };
  }
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;

  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const colors = getToastColors(toast.variant);

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  };

  const handleSwipeGesture = Animated.event(
    [{ nativeEvent: { translationX: translateXAnim } }],
    { useNativeDriver: true }
  );

  const handleSwipeEnd = ({ nativeEvent }: any) => {
    if (Math.abs(nativeEvent.translationX) > 100) {
      // Swipe to dismiss
      Animated.timing(translateXAnim, {
        toValue: nativeEvent.translationX > 0 ? 300 : -300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onDismiss(toast.id);
      });
    } else {
      // Snap back
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handleSwipeGesture}
        onHandlerStateChange={handleSwipeEnd}
      >
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: colors.backgroundColor || cardBackgroundColor,
              borderColor: colors.borderColor || borderColor,
              transform: [
                { translateY: slideAnim },
                { translateX: translateXAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={colors.iconName}
                size={20}
                color={colors.iconColor || iconColor}
              />
            </View>

            <View style={styles.textContainer}>
              <ThemedText
                style={[
                  styles.title,
                  { color: colors.textColor || textColor }
                ]}
                numberOfLines={1}
              >
                {toast.title}
              </ThemedText>
              {toast.description && (
                <ThemedText
                  style={[
                    styles.description,
                    { color: colors.textColor || secondaryTextColor }
                  ]}
                  numberOfLines={2}
                >
                  {toast.description}
                </ThemedText>
              )}
            </View>

            {toast.action && (
              <ThemedButton
                title={toast.action.label}
                onPress={toast.action.onPress}
                type="outline"
                style={styles.actionButton}
                textStyle={[
                  styles.actionButtonText,
                  { color: colors.textColor || iconColor }
                ]}
              />
            )}

            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.dismissButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={16}
                color={colors.textColor || secondaryTextColor}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <View style={styles.containerOverlay} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View
          key={toast.id}
          style={[
            styles.toastWrapper,
            { top: 60 + index * 80 } // Stack toasts with 80pt spacing
          ]}
        >
          <Toast toast={toast} onDismiss={onDismiss} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    flexShrink: 0,
  },
});