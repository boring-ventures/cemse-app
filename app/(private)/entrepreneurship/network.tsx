import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CustomTabBar } from '@/app/components/entrepreneurship/CustomTabBar';
import { EntrepreneurCard } from '@/app/components/entrepreneurship/EntrepreneurCard';
import { FilterModal } from '@/app/components/entrepreneurship/FilterModal';
import { MessagingModal } from '@/app/components/entrepreneurship/MessagingModal';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Discussion, Entrepreneur, NetworkEvent } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NetworkScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [filteredEntrepreneurs, setFilteredEntrepreneurs] = useState<Entrepreneur[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  // Mock entrepreneur data
  const mockEntrepreneurs: Entrepreneur[] = [
    {
      id: '1',
      name: 'María González',
      avatar: undefined,
      company: 'EcoTech Bolivia',
      location: 'Santa Cruz',
      isOnline: true,
      rating: 4.9,
      ratingCount: 124,
      description: 'Ingeniera en sistemas especializada en soluciones tecnológicas para el agro. Busco colaboraciones e inversionistas para expandir mi startup.',
      skills: ['Desarrollo de Software', 'IoT', 'Agricultura Digital', 'Python'],
      lookingFor: ['Inversionistas', 'Socios Técnicos'],
      connections: 234,
      isAvailableForNetworking: true,
      industry: 'Tecnología',
      companyStage: 'Growth',
      joinedDate: '2023-08-15',
      profileCompletion: 95,
    },
    {
      id: '2',
      name: 'Carlos Mamani',
      avatar: undefined,
      company: 'Artesanías Digitales',
      location: 'La Paz',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      rating: 4.7,
      ratingCount: 89,
      description: 'Emprendedor social enfocado en digitalizar el comercio de artesanías bolivianas y conectar artesanos con mercados internacionales.',
      skills: ['Marketing Digital', 'E-commerce', 'Fotografía', 'Redes Sociales'],
      lookingFor: ['Artesanos', 'Mercados Internacionales'],
      connections: 189,
      isAvailableForNetworking: true,
      industry: 'E-commerce',
      companyStage: 'MVP',
      joinedDate: '2023-09-20',
      profileCompletion: 88,
    },
    {
      id: '3',
      name: 'Ana Gutiérrez',
      avatar: undefined,
      company: 'FoodTech Express',
      location: 'Cochabamba',
      isOnline: true,
      rating: 4.8,
      ratingCount: 156,
      description: 'CEO y fundadora de startup de delivery de comida casera. Experta en logística y operaciones de restaurantes virtuales.',
      skills: ['Operaciones', 'Logística', 'Desarrollo de Apps', 'Gestión'],
      lookingFor: ['Inversionistas Serie A', 'CTO'],
      connections: 312,
      isAvailableForNetworking: true,
      industry: 'Food Tech',
      companyStage: 'Scale',
      joinedDate: '2023-07-10',
      profileCompletion: 92,
    },
    {
      id: '4',
      name: 'Roberto Silva',
      avatar: undefined,
      company: 'GreenEnergy Bolivia',
      location: 'Tarija',
      isOnline: false,
      lastSeen: new Date(Date.now() - 7200000).toISOString(),
      rating: 4.6,
      ratingCount: 67,
      description: 'Especialista en energías renovables con experiencia en proyectos solares. Buscando expandir nuestra tecnología a comunidades rurales.',
      skills: ['Energía Solar', 'Ingeniería', 'Sustentabilidad', 'Gestión de Proyectos'],
      lookingFor: ['Financiamiento', 'Gobierno', 'ONG'],
      connections: 145,
      isAvailableForNetworking: true,
      industry: 'Energía',
      companyStage: 'Growth',
      joinedDate: '2023-10-05',
      profileCompletion: 85,
    },
    {
      id: '5',
      name: 'Lucía Fernández',
      avatar: undefined,
      company: 'EduTech Bolivia',
      location: 'Potosí',
      isOnline: true,
      rating: 4.9,
      ratingCount: 203,
      description: 'Desarrolladora de plataformas educativas enfocadas en educación rural. Conectando estudiantes con oportunidades de aprendizaje digital.',
      skills: ['Desarrollo Web', 'Educación', 'UX/UI Design', 'React Native'],
      lookingFor: ['Profesores', 'Instituciones Educativas', 'Inversionistas'],
      connections: 267,
      isAvailableForNetworking: true,
      industry: 'EdTech',
      companyStage: 'MVP',
      joinedDate: '2023-06-25',
      profileCompletion: 90,
    },
  ];

  // Mock events data
  const mockEvents: NetworkEvent[] = [
    {
      id: '1',
      title: 'Demo Day Cochabamba 2025',
      description: 'Presenta tu startup a inversionistas y mentores de todo el país.',
      date: '2025-02-15',
      location: 'Centro de Convenciones Cochabamba',
      type: 'demo_day',
      attendeesCount: 156,
      maxAttendees: 200,
      price: 0,
      organizer: 'CEMSE Bolivia',
      tags: ['Startups', 'Inversión', 'Networking'],
      isUserAttending: false,
    },
    {
      id: '2',
      title: 'Workshop: Pitch Perfect',
      description: 'Aprende a crear y presentar un pitch que cautive a inversionistas.',
      date: '2025-02-08',
      location: 'Hub de Innovación La Paz',
      type: 'workshop',
      attendeesCount: 45,
      maxAttendees: 50,
      price: 150,
      organizer: 'Startup Bolivia',
      tags: ['Pitch', 'Presentación', 'Workshop'],
      isUserAttending: true,
    },
    {
      id: '3',
      title: 'Networking Startups Bolivia',
      description: 'Conecta con otros emprendedores y expande tu red de contactos.',
      date: '2025-02-12',
      location: 'Café Central Santa Cruz',
      type: 'networking',
      attendeesCount: 89,
      maxAttendees: 100,
      price: 50,
      organizer: 'Red Emprendedores SCZ',
      tags: ['Networking', 'Emprendedores', 'Conexiones'],
      isUserAttending: false,
    },
  ];

  // Mock discussions data
  const mockDiscussions: Discussion[] = [
    {
      id: '1',
      title: '¿Cómo conseguir inversión en Bolivia?',
      description: 'Compartamos experiencias y estrategias para conseguir financiamiento local.',
      authorId: '1',
      authorName: 'María González',
      createdAt: '2025-01-20T10:30:00Z',
      lastActivity: '2025-01-30T14:20:00Z',
      participantCount: 23,
      messageCount: 67,
      tags: ['Inversión', 'Financiamiento', 'Bolivia'],
      isUserParticipating: true,
      isPinned: true,
      category: 'Financiamiento',
    },
    {
      id: '2',
      title: 'Mejores herramientas para startups',
      description: 'Herramientas gratuitas y de pago que todo emprendedor debería conocer.',
      authorId: '3',
      authorName: 'Ana Gutiérrez',
      createdAt: '2025-01-25T16:15:00Z',
      lastActivity: '2025-01-30T11:45:00Z',
      participantCount: 18,
      messageCount: 42,
      tags: ['Herramientas', 'Productividad', 'Startups'],
      isUserParticipating: false,
      isPinned: false,
      category: 'Herramientas',
    },
    {
      id: '3',
      title: 'Networking efectivo en pandemia',
      description: 'Estrategias para hacer networking y expandir contactos de forma virtual.',
      authorId: '2',
      authorName: 'Carlos Mamani',
      createdAt: '2025-01-28T09:00:00Z',
      lastActivity: '2025-01-30T13:30:00Z',
      participantCount: 31,
      messageCount: 89,
      tags: ['Networking', 'Virtual', 'Estrategias'],
      isUserParticipating: true,
      isPinned: false,
      category: 'Networking',
    },
  ];

  React.useEffect(() => {
    setFilteredEntrepreneurs(mockEntrepreneurs);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredEntrepreneurs(mockEntrepreneurs);
    } else {
      const filtered = mockEntrepreneurs.filter(entrepreneur =>
        entrepreneur.name.toLowerCase().includes(query.toLowerCase()) ||
        entrepreneur.company.toLowerCase().includes(query.toLowerCase()) ||
        entrepreneur.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase())) ||
        entrepreneur.lookingFor.some(item => item.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredEntrepreneurs(filtered);
    }
  };

  const handleConnect = (entrepreneurId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Solicitud de Conexión',
      '¿Quieres enviar una solicitud de conexión a este emprendedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar', 
          onPress: () => {
            Alert.alert('¡Solicitud Enviada!', 'Tu solicitud de conexión ha sido enviada.');
          }
        },
      ]
    );
  };

  const handleMessage = (entrepreneur: Entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setShowMessagingModal(true);
  };

  // Tab configuration with proper TabConfig format
  const tabs = [
    { id: 0, title: 'Emprendedores', icon: 'people' },
    { id: 1, title: 'Eventos', icon: 'calendar' },
    { id: 2, title: 'Discusiones', icon: 'chatbubbles' },
  ];

  // Initial filter state
  const [filters, setFilters] = useState({
    industry: [],
    companyStage: [],
    location: [],
    lookingFor: [],
    skills: [],
    availability: false,
    searchQuery: '',
  });

  const renderEntrepreneurItem = ({ item }: { item: Entrepreneur }) => (
    <EntrepreneurCard
      entrepreneur={item}
      connectionStatus="none"
      onConnect={() => handleConnect(item.id)}
      onMessage={() => handleMessage(item)}
    />
  );

  const renderEventCard = (event: NetworkEvent) => (
    <View key={event.id} style={[styles.eventCard, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleRow}>
          <Ionicons 
            name={event.type === 'demo_day' ? 'trending-up' : event.type === 'workshop' ? 'school' : 'people'} 
            size={20} 
            color={iconColor} 
          />
          <ThemedText style={[styles.eventTitle, { color: textColor }]}>
            {event.title}
          </ThemedText>
        </View>
        
        <View style={[styles.eventTypeBadge, { backgroundColor: iconColor + '20' }]}>
          <ThemedText style={[styles.eventTypeText, { color: iconColor }]}>
            {event.type === 'demo_day' ? 'Demo Day' : 
             event.type === 'workshop' ? 'Workshop' : 'Networking'}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.eventDescription, { color: textColor }]}>
        {event.description}
      </ThemedText>

      <View style={styles.eventMeta}>
        <View style={styles.eventMetaRow}>
          <Ionicons name="calendar-outline" size={16} color={secondaryTextColor} />
          <ThemedText style={[styles.eventMetaText, { color: secondaryTextColor }]}>
            {new Date(event.date).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </ThemedText>
        </View>

        <View style={styles.eventMetaRow}>
          <Ionicons name="location-outline" size={16} color={secondaryTextColor} />
          <ThemedText style={[styles.eventMetaText, { color: secondaryTextColor }]}>
            {event.location}
          </ThemedText>
        </View>

        <View style={styles.eventMetaRow}>
          <Ionicons name="people-outline" size={16} color={secondaryTextColor} />
          <ThemedText style={[styles.eventMetaText, { color: secondaryTextColor }]}>
            {event.attendeesCount} asistentes
          </ThemedText>
        </View>
      </View>

      <View style={styles.eventFooter}>
        <ThemedText type="defaultSemiBold" style={[styles.eventPrice, { color: iconColor }]}>
          {event.price === 0 ? 'Gratuito' : `Bs. ${event.price}`}
        </ThemedText>

        <ThemedButton
          title={event.isUserAttending ? 'Inscrito' : 'Inscribirse'}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Inscripción', `Te has inscrito a: ${event.title}`);
          }}
          type={event.isUserAttending ? 'outline' : 'primary'}
          style={styles.eventButton}
        />
      </View>
    </View>
  );

  const renderDiscussionCard = (discussion: Discussion) => (
    <TouchableOpacity 
      key={discussion.id}
      style={[styles.discussionCard, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Unirse a Discusión', `Te unirás a: ${discussion.title}`);
      }}
    >
      {discussion.isPinned && (
        <View style={[styles.pinnedBadge, { backgroundColor: '#FFD60A' + '20' }]}>
          <Ionicons name="pin" size={14} color="#FF9500" />
          <ThemedText style={[styles.pinnedText, { color: '#FF9500' }]}>
            Fijado
          </ThemedText>
        </View>
      )}

      <ThemedText type="defaultSemiBold" style={[styles.discussionTitle, { color: textColor }]}>
        {discussion.title}
      </ThemedText>

      <ThemedText style={[styles.discussionDescription, { color: textColor }]}>
        {discussion.description}
      </ThemedText>

      <View style={styles.discussionMeta}>
        <View style={styles.discussionAuthor}>
          <ThemedText style={[styles.authorName, { color: secondaryTextColor }]}>
            Por {discussion.authorName}
          </ThemedText>
          <ThemedText style={[styles.discussionDate, { color: secondaryTextColor }]}>
            {new Date(discussion.createdAt).toLocaleDateString('es-ES')}
          </ThemedText>
        </View>

        <View style={styles.discussionStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color={secondaryTextColor} />
            <ThemedText style={[styles.statText, { color: secondaryTextColor }]}>
              {discussion.participantCount}
            </ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={14} color={secondaryTextColor} />
            <ThemedText style={[styles.statText, { color: secondaryTextColor }]}>
              {discussion.messageCount}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.discussionTags}>
        {discussion.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={[styles.discussionTag, { backgroundColor: iconColor + '15' }]}>
            <ThemedText style={[styles.discussionTagText, { color: iconColor }]}>
              {tag}
            </ThemedText>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 0: // Emprendedores
        return (
          <FlatList
            data={filteredEntrepreneurs}
            renderItem={renderEntrepreneurItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={secondaryTextColor} />
                <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                  No se encontraron emprendedores
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: secondaryTextColor }]}>
                  Intenta ajustar tus filtros o búsqueda
                </ThemedText>
              </View>
            }
          />
        );
      
      case 1: // Eventos
        return (
          <ScrollView 
            style={styles.eventsContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          >
            {mockEvents.map(renderEventCard)}
          </ScrollView>
        );
        
      case 2: // Discusiones
        return (
          <ScrollView 
            style={styles.discussionsContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          >
            {mockDiscussions.map(renderDiscussionCard)}
          </ScrollView>
        );
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText type="title" style={[styles.headerTitle, { color: textColor }]}>
              Red de Emprendedores
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
              Conecta, colabora y crece junto a otros emprendedores bolivianos
            </ThemedText>
          </View>
        </View>

        {/* Tab Navigation */}
        <CustomTabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Search and Filter Section (only for Emprendedores tab) */}
        {activeTab === 0 && (
          <View style={styles.searchSection}>
            <View style={styles.searchRow}>
              <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}>
                <Ionicons name="search" size={20} color={secondaryTextColor} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Buscar emprendedores por nombre, negocio o habilidades..."
                  placeholderTextColor={secondaryTextColor}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>

              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}
                onPress={() => setShowFilterModal(true)}
              >
                <Ionicons name="filter" size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <ThemedButton
                title="✏️ Completar mi Perfil"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert('Completar Perfil', 'Te dirigiremos a completar tu perfil de emprendedor.');
                }}
                type="primary"
                style={styles.completeProfileButton}
              />
            </View>
          </View>
        )}

        {/* Content */}
        {renderContent()}

        {/* Modals */}
        <MessagingModal
          visible={showMessagingModal}
          onClose={() => setShowMessagingModal(false)}
          recipientName={selectedEntrepreneur?.name || ''}
          recipientId={selectedEntrepreneur?.id || ''}
        />

        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={{
            types: [],
            levels: [],
            categories: [],
            durations: [],
            dateRanges: [],
            searchQuery: searchQuery,
          }}
          onFiltersChange={(newFilters) => {
            // Apply filters logic here
            setShowFilterModal(false);
          }}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 4,
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  completeProfileButton: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    flex: 1,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 16,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 16,
  },
  eventButton: {
    paddingHorizontal: 20,
  },
  discussionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  discussionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  discussionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  discussionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  discussionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discussionAuthor: {
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '500',
  },
  discussionDate: {
    fontSize: 11,
    marginTop: 2,
  },
  discussionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  discussionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  discussionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discussionTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
}); 