import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface DownloadButtonProps {
  onPress: () => void;
  isDownloading?: boolean;
  progress?: number;
  isCompleted?: boolean;
  title?: string;
  style?: any;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onPress,
  isDownloading = false,
  progress = 0,
  isCompleted = false,
  title = "Descargar",
  style,
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'tint');
  
  const [animatedProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isDownloading) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(0);
    }
  }, [progress, isDownloading]);

  const handlePress = () => {
    if (!isDownloading && !isCompleted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getButtonContent = () => {
    if (isCompleted) {
      return {
        icon: 'checkmark-circle',
        text: 'Descargado',
        color: '#32D74B',
        backgroundColor: '#32D74B' + '20',
      };
    }
    
    if (isDownloading) {
      return {
        icon: 'download',
        text: `${Math.round(progress)}%`,
        color: iconColor,
        backgroundColor: iconColor + '20',
      };
    }
    
    return {
      icon: 'download-outline',
      text: title,
      color: iconColor,
      backgroundColor: iconColor + '20',
    };
  };

  const buttonContent = getButtonContent();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: buttonContent.backgroundColor,
          opacity: isDownloading ? 0.8 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={isDownloading || isCompleted}
      activeOpacity={0.7}
    >
      {/* Progress Background */}
      {isDownloading && (
        <Animated.View
          style={[
            styles.progressBackground,
            {
              backgroundColor: buttonContent.color + '40',
              width: animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      )}

      {/* Button Content */}
      <View style={styles.content}>
        <Ionicons
          name={buttonContent.icon as any}
          size={16}
          color={buttonContent.color}
        />
        <ThemedText
          style={[
            styles.text,
            {
              color: buttonContent.color,
              fontWeight: isCompleted ? '600' : '500',
            },
          ]}
        >
          {buttonContent.text}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 44,
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    zIndex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 