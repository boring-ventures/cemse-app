import { useThemeColor } from '@/app/hooks/useThemeColor';
import { TabConfig } from '@/app/types/training';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/ThemedView';
import { AvailableCoursesContent } from '../../components/training/AvailableCoursesContent';
import { CertificatesContent } from '../../components/training/CertificatesContent';
import { CustomTabBar } from '../../components/training/CustomTabBar';
import { MyCoursesContent } from '../../components/training/MyCoursesContent';

export default function TrainingScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

  const tabs: TabConfig[] = [
    { id: 0, title: 'Disponibles', icon: 'book-outline' },
    { id: 1, title: 'Mis Cursos', icon: 'bookmark-outline' },
    { id: 2, title: 'Certificados', icon: 'trophy-outline' },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <AvailableCoursesContent
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        );
      case 1:
        return (
          <MyCoursesContent
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        );
      case 2:
        return (
          <CertificatesContent
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        );
      default:
        return (
          <AvailableCoursesContent
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.wrapper}>
        <CustomTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />
        
        <View style={styles.content}>
          {renderContent()}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
}); 