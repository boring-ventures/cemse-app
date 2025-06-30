import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useAuthStore } from '@/app/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../ThemedText';
import { UserAvatar } from '../UserAvatar';

interface DashboardHeaderProps {
  welcomeMessage: string;
  subtitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  welcomeMessage,
  subtitle,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuthStore();
  const isDark = useThemeColor({}, 'background') === '#151718';

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(private)/profile');
  };

  const gradientColors = isDark 
    ? ['#2D1B69', '#1A1A2E', '#16213E'] as const
    : ['#667eea', '#764ba2', '#667eea'] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 10 }]}
    >
      <View style={styles.content}>
        {/* Header with avatar */}
        <View style={styles.headerRow}>
          <View style={styles.welcomeContainer}>
            <ThemedText 
              type="title" 
              style={[styles.welcomeText, { color: '#FFFFFF' }]}
            >
              {welcomeMessage}
            </ThemedText>
            <ThemedText 
              style={[styles.subtitleText, { color: '#FFFFFF' }]}
            >
              {subtitle}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <UserAvatar 
              imageUrl={profile?.avatar_url} 
              size={50}
              firstName={profile?.first_name}
              lastName={profile?.last_name}
            />
            <View style={styles.avatarBadge}>
              <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick stats row */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStat}>
            <Ionicons name="briefcase-outline" size={16} color="#FFFFFF" />
            <ThemedText style={[styles.quickStatText, { color: '#FFFFFF' }]}>
              3 Postulaciones
            </ThemedText>
          </View>
          <View style={styles.separator} />
          <View style={styles.quickStat}>
            <Ionicons name="school-outline" size={16} color="#FFFFFF" />
            <ThemedText style={[styles.quickStatText, { color: '#FFFFFF' }]}>
              2 Cursos
            </ThemedText>
          </View>
          <View style={styles.separator} />
          <View style={styles.quickStat}>
            <Ionicons name="bulb-outline" size={16} color="#FFFFFF" />
            <ThemedText style={[styles.quickStatText, { color: '#FFFFFF' }]}>
              1 Proyecto
            </ThemedText>
          </View>
                          </View>
       </View>
     </LinearGradient>
   );
 };

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeContainer: {
    flex: 1,
    paddingRight: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 22,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  quickStatText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
}); 