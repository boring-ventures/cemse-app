import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useNetworking } from '@/app/hooks/useNetworking';
import Shimmer from '@/app/components/Shimmer';
import NetworkingStats from './NetworkingStats';
import EntrepreneursTab from './EntrepreneursTab';
import RequestsTab from './RequestsTab';
import ContactsTab from './ContactsTab';
import DiscussionsTab from './DiscussionsTab';
import OrganizationsTab from './OrganizationsTab';

/**
 * Networking Screen Component
 * 5-tab networking interface for entrepreneurs
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

type TabId = 'entrepreneurs' | 'requests' | 'contacts' | 'discussions' | 'organizations';

interface Tab {
  id: TabId;
  title: string;
  icon: string;
  badge?: number;
}

const NetworkingScreen: React.FC = () => {
  const { tab } = useLocalSearchParams<{ tab?: TabId }>();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const [activeTab, setActiveTab] = useState<TabId>(tab || 'entrepreneurs');
  const [refreshing, setRefreshing] = useState(false);

  // Networking hook
  const {
    users,
    requests,
    contacts,
    stats,
    loading,
    error,
    searchUsers,
    sendContactRequest,
    acceptRequest,
    rejectRequest,
    fetchReceivedRequests,
    fetchMyContacts,
    fetchStats,
  } = useNetworking();

  // Tab configuration
  const tabs: Tab[] = [
    {
      id: 'entrepreneurs',
      title: 'Emprendedores',
      icon: 'people',
    },
    {
      id: 'requests',
      title: 'Solicitudes',
      icon: 'mail',
      badge: requests.filter(req => req.status === 'pending').length,
    },
    {
      id: 'contacts',
      title: 'Contactos',
      icon: 'person-add',
    },
    {
      id: 'discussions',
      title: 'Discusiones',
      icon: 'chatbubbles',
    },
    {
      id: 'organizations',
      title: 'Organizaciones',
      icon: 'business',
    },
  ];

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        searchUsers(),
        fetchReceivedRequests(),
        fetchMyContacts(),
        fetchStats(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [searchUsers, fetchReceivedRequests, fetchMyContacts, fetchStats]);

  // Handle tab change
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  // Handle contact request
  const handleSendRequest = useCallback(async (userId: string, message?: string): Promise<boolean> => {
    return await sendContactRequest(userId, message);
  }, [sendContactRequest]);

  // Handle accept request
  const handleAcceptRequest = useCallback(async (requestId: string): Promise<boolean> => {
    return await acceptRequest(requestId);
  }, [acceptRequest]);

  // Handle reject request
  const handleRejectRequest = useCallback(async (requestId: string): Promise<boolean> => {
    return await rejectRequest(requestId);
  }, [rejectRequest]);

  // Header component
  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Red de Contactos</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Conecta con emprendedores y organizaciones
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity
        style={styles.headerAction}
        onPress={() => router.push('/entrepreneurship/messaging')}
      >
        <Ionicons name="chatbubbles" size={24} color={tintColor} />
      </TouchableOpacity>
    </View>
  );

  // Stats component
  const StatsSection = () => {
    if (!stats) return null;

    return (
      <NetworkingStats
        stats={stats}
        style={styles.statsSection}
      />
    );
  };

  // Tab bar component
  const TabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && { borderBottomColor: tintColor }
            ]}
            onPress={() => handleTabChange(tab.id)}
          >
            <View style={styles.tabButtonContent}>
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? tintColor : textColor}
              />
              <ThemedText
                style={[
                  styles.tabButtonText,
                  { color: activeTab === tab.id ? tintColor : textColor }
                ]}
              >
                {tab.title}
              </ThemedText>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: '#ef4444' }]}>
                  <ThemedText style={styles.tabBadgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Tab content renderer
  const renderTabContent = () => {
    const commonProps = {
      loading,
      error,
      refreshControl: (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={tintColor}
        />
      ),
    };

    switch (activeTab) {
      case 'entrepreneurs':
        return (
          <EntrepreneursTab
            users={users}
            onSendRequest={handleSendRequest}
            onSearch={searchUsers}
            {...commonProps}
          />
        );
      case 'requests':
        return (
          <RequestsTab
            requests={requests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            {...commonProps}
          />
        );
      case 'contacts':
        return (
          <ContactsTab
            contacts={contacts}
            {...commonProps}
          />
        );
      case 'discussions':
        return (
          <DiscussionsTab
            {...commonProps}
          />
        );
      case 'organizations':
        return (
          <OrganizationsTab
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Header />
      <StatsSection />
      <TabBar />
      
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  headerAction: {
    padding: 8,
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabBar: {
    borderBottomWidth: 1,
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
});

export default NetworkingScreen;