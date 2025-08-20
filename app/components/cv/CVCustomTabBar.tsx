import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface CVTabConfig {
  id: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CVCustomTabBarProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
  tabs: CVTabConfig[];
}

export const CVCustomTabBar: React.FC<CVCustomTabBarProps> = ({
  activeTab,
  setActiveTab,
  tabs
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const activeColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({}, 'textSecondary');
  const activeTextColor = useThemeColor({}, 'text');
  const inactiveTextColor = useThemeColor({}, 'textSecondary');

  const handleTabPress = (index: number) => {
    if (index !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(index);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderBottomColor: borderColor }]}>
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && [styles.activeTab, { borderBottomColor: activeColor }]
              ]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={tab.icon} 
                size={18} 
                color={isActive ? activeColor : inactiveColor} 
              />
              <ThemedText 
                style={[
                  styles.tabText,
                  {
                    color: isActive ? activeTextColor : inactiveTextColor,
                    fontWeight: isActive ? '600' : '500'
                  }
                ]}
              >
                {tab.title}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    textAlign: 'center',
  },
});