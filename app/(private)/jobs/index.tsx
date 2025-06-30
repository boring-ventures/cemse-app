import { CustomTabBar } from '@/app/components/jobs/CustomTabBar';
import { MyApplicationsContent } from '@/app/components/jobs/MyApplicationsContent';
import { SearchJobsContent } from '@/app/components/jobs/SearchJobsContent';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { TabConfig } from '@/app/types/jobs';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function JobsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

  const tabs: TabConfig[] = [
    { id: 0, title: 'Buscar', icon: 'search-outline' },
    { id: 1, title: 'Mis Apps', icon: 'document-text-outline' },
  ];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate network request
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <SearchJobsContent
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        );
      case 1:
        return (
          <MyApplicationsContent
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        );
      default:
        return (
          <SearchJobsContent
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={[styles.content, { backgroundColor }]}>
        {/* Custom Tab Navigation */}
        <CustomTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        {/* Tab Content */}
        <ThemedView style={styles.tabContent}>
          {renderTabContent()}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
}); 