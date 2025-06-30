import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface VideoPlayerProps {
  videoTitle: string;
  duration: string;
  thumbnail?: string;
  onPlay?: () => void;
  onFullscreen?: () => void;
  isPlaying?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoTitle,
  duration,
  thumbnail,
  onPlay,
  onFullscreen,
  isPlaying = false
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlay?.();
  };

  const handleFullscreenPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFullscreen?.();
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      {/* Video Display Area */}
      <View style={styles.videoArea}>
        <View style={[styles.videoPlaceholder, { backgroundColor: '#000' }]}>
          {/* Play Button */}
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: iconColor }]}
            onPress={handlePlayPress}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>
          
          {/* Fullscreen Button */}
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={handleFullscreenPress}
            activeOpacity={0.7}
          >
            <Ionicons name="expand" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Video Title */}
      <View style={styles.titleSection}>
        <ThemedText type="subtitle" style={[styles.videoTitle, { color: textColor }]}>
          {videoTitle}
        </ThemedText>
      </View>

      {/* Video Controls */}
      <View style={styles.controlsSection}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: iconColor,
                  width: `${progress}%`
                }
              ]} 
            />
          </View>
        </View>

        {/* Time and Controls */}
        <View style={styles.timeControls}>
          <ThemedText style={[styles.timeText, { color: secondaryTextColor }]}>
            {currentTime} / {duration}
          </ThemedText>
          
          <View style={styles.playbackControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-back" size={20} color={secondaryTextColor} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handlePlayPress}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={20} 
                color={iconColor} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-forward" size={20} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.speedButton}>
            <ThemedText style={[styles.speedText, { color: secondaryTextColor }]}>
              1x
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  videoArea: {
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fullscreenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    padding: 16,
    paddingBottom: 12,
  },
  videoTitle: {
    lineHeight: 22,
  },
  controlsSection: {
    padding: 16,
    paddingTop: 0,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 8,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 