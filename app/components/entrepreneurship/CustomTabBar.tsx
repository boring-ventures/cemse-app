import { useThemeColor } from '@/app/hooks/useThemeColor';
import { TabConfig } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface CustomTabBarProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  tabs: TabConfig[];
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  activeTab,
  setActiveTab,
  tabs
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const handleTabPress = (tabId: number) => {
    if (tabId !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tabId);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.tabBar, { backgroundColor: cardBackground }]}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && [
                  styles.activeTab,
                  { backgroundColor: iconColor + '20', borderColor: iconColor + '40' }
                ]
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={isActive ? iconColor : secondaryTextColor}
                  style={styles.tabIcon}
                />
                <ThemedText
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? iconColor : secondaryTextColor,
                      fontWeight: isActive ? '600' : '500',
                    }
                  ]}
                  numberOfLines={2}
                >
                  {tab.title}
                </ThemedText>
              </View>
              
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: iconColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  activeTab: {
    borderWidth: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 2,
  },
}); 