import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CustomTabBar } from '@/app/components/entrepreneurship/CustomTabBar';
import { FilterModal } from '@/app/components/entrepreneurship/FilterModal';
import { MentorCard } from '@/app/components/entrepreneurship/MentorCard';
import { MessagingModal } from '@/app/components/entrepreneurship/MessagingModal';
import { SchedulingModal } from '@/app/components/entrepreneurship/SchedulingModal';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Mentor, MentorshipProgram, MentorshipSession, ResourceFilter } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MentorsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  // Mock mentor data
  const mockMentors: Mentor[] = [
    {
      id: '1',
      name: 'Dr. Roberto Silva',
      title: 'CEO & Fundador',
      company: 'TechBolivia',
      avatar: undefined,
      isVerified: true,
      isOnline: true,
      rating: 4.9,
      reviewCount: 89,
      menteeCount: 156,
      description: 'Emprendedor serial con más de 15 años de experiencia en tecnología. He fundado 3 startups exitosas y actualmente mentor jóvenes emprendedores en LATAM.',
      expertise: ['Tecnología', 'Startups', 'Liderazgo', 'Fundraising'],
      responseTime: '2 horas',
      pricing: 'Gratuito',
      achievements: ['Fundador Exitoso', 'Mentor del Año 2023'],
      availability: [],
      experience: '15+ años',
      language: ['Español', 'Inglés'],
      sessionTypes: ['1-on-1', 'Grupal'],
      totalSessions: 324,
    },
    {
      id: '2',
      name: 'Lic. Carmen Rodríguez',
      title: 'Directora de Marketing',
      company: 'Grupo Boliviano',
      avatar: undefined,
      isVerified: true,
      isOnline: true,
      rating: 4.8,
      reviewCount: 67,
      menteeCount: 98,
      description: 'Especialista en marketing digital y desarrollo de marcas. He ayudado a más de 100 emprendimientos a posicionarse en el mercado.',
      expertise: ['Marketing Digital', 'Branding', 'Redes Sociales', 'Estrategia'],
      responseTime: '4 horas',
      pricing: 'Bs. 150/hora',
      achievements: ['Top Marketer 2022', 'Certificación Google'],
      availability: [],
      experience: '10+ años',
      language: ['Español'],
      sessionTypes: ['1-on-1', 'Workshop'],
      totalSessions: 198,
    },
    {
      id: '3',
      name: 'Ing. Luis Mamani',
      title: 'Consultor Financiero',
      company: 'FinanzasPro',
      avatar: undefined,
      isVerified: true,
      isOnline: true,
      rating: 4.7,
      reviewCount: 43,
      menteeCount: 72,
      description: 'Contador público y consultor financiero especializado in startups. Ayudo a emprendedores a estructurar sus finanzas y conseguir inversión.',
      expertise: ['Finanzas', 'Contabilidad', 'Inversión', 'Modelado Financiero'],
      responseTime: '6 horas',
      pricing: 'Bs. 100/hora',
      achievements: ['CPA Certificado', 'Especialista en Startups'],
      availability: [],
      experience: '8+ años',
      language: ['Español', 'Quechua'],
      sessionTypes: ['1-on-1'],
      totalSessions: 156,
    },
    {
      id: '4',
      name: 'Dra. Ana Gutiérrez',
      title: 'Innovation Consultant',
      company: 'Innovation Hub',
      avatar: undefined,
      isVerified: true,
      isOnline: false,
      lastSeen: new Date(Date.now() - 1800000).toISOString(),
      rating: 4.9,
      reviewCount: 112,
      menteeCount: 203,
      description: 'Doctora en innovación con experiencia en transformación digital y desarrollo de productos. Especialista en metodologías ágiles.',
      expertise: ['Innovación', 'Design Thinking', 'Producto', 'Agile'],
      responseTime: '3 horas',
      pricing: 'Bs. 200/hora',
      achievements: ['PhD Innovation', 'Certified Scrum Master'],
      availability: [],
      experience: '12+ años',
      language: ['Español', 'Inglés', 'Francés'],
      sessionTypes: ['1-on-1', 'Grupal', 'Workshop'],
      totalSessions: 289,
    },
  ];

  // Mock sessions data
  const mockSessions: MentorshipSession[] = [
    {
      id: '1',
      mentorId: '1',
      menteeId: 'current_user',
      mentorName: 'Dr. Roberto Silva',
      menteeName: 'Usuario Actual',
      scheduledDate: '2025-02-05T14:00:00Z',
      duration: 60,
      status: 'scheduled',
      meetingType: 'virtual',
      agenda: 'Revisión de modelo de negocio y estrategia de go-to-market',
      price: 0,
      meetingLink: 'https://zoom.us/j/123456789',
    },
    {
      id: '2',
      mentorId: '2',
      menteeId: 'current_user',
      mentorName: 'Lic. Carmen Rodríguez',
      menteeName: 'Usuario Actual',
      scheduledDate: '2025-01-25T10:30:00Z',
      duration: 90,
      status: 'completed',
      meetingType: 'virtual',
      agenda: 'Estrategia de marketing digital para startup',
      rating: 5,
      review: 'Excelente sesión, muy útiles los consejos sobre redes sociales.',
      price: 225,
    },
  ];

  // Mock programs data
  const mockPrograms: MentorshipProgram[] = [
    {
      id: '1',
      title: 'Programa Aceleración 3 meses',
      description: 'Programa intensivo para acelerar tu startup desde la idea hasta el MVP.',
      duration: '3 meses',
      price: 1500,
      mentorId: '1',
      mentorName: 'Dr. Roberto Silva',
      maxParticipants: 10,
      currentParticipants: 7,
      startDate: '2025-03-01',
      curriculum: ['Validación de idea', 'Desarrollo MVP', 'Go-to-market', 'Fundraising'],
      benefits: ['Mentorías semanales', 'Red de contactos', 'Acceso a inversionistas'],
      level: 'Intermedio',
      category: 'Aceleración',
      rating: 4.8,
      reviewCount: 23,
    },
    {
      id: '2',
      title: 'Bootcamp Financiero',
      description: 'Aprende a manejar las finanzas de tu startup como un experto.',
      duration: '6 semanas',
      price: 800,
      mentorId: '3',
      mentorName: 'Ing. Luis Mamani',
      maxParticipants: 15,
      currentParticipants: 12,
      startDate: '2025-02-15',
      curriculum: ['Contabilidad básica', 'Proyecciones financieras', 'Búsqueda de inversión'],
      benefits: ['Plantillas financieras', 'Sesiones grupales', 'Seguimiento personalizado'],
      level: 'Principiante',
      category: 'Finanzas',
      rating: 4.7,
      reviewCount: 18,
    },
  ];

  React.useEffect(() => {
    setFilteredMentors(mockMentors);
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
      setFilteredMentors(mockMentors);
    } else {
      const filtered = mockMentors.filter(mentor =>
        mentor.name.toLowerCase().includes(query.toLowerCase()) ||
        mentor.title.toLowerCase().includes(query.toLowerCase()) ||
        mentor.company.toLowerCase().includes(query.toLowerCase()) ||
        mentor.expertise.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredMentors(filtered);
    }
  };

  const handleMessage = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowMessagingModal(true);
  };

  const handleSchedule = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowSchedulingModal(true);
  };

  const handleBookSession = (sessionData: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      '¡Sesión Agendada!', 
      `Tu sesión con ${sessionData.mentorName} ha sido confirmada para el ${new Date(sessionData.date).toLocaleDateString('es-ES')}.`,
      [{ text: 'Entendido' }]
    );
  };

  // Tab configuration with proper TabConfig format
  const tabs = [
    { id: 0, title: 'Mentores', icon: 'people' },
    { id: 1, title: 'Mis Sesiones', icon: 'calendar' },
    { id: 2, title: 'Programas', icon: 'school' },
    { id: 3, title: 'Ser Mentor', icon: 'bulb' },
  ];

  // Initial filter state
  const [filters, setFilters] = useState<ResourceFilter>({
    types: [],
    levels: [],
    categories: [],
    durations: [],
    dateRanges: [],
    searchQuery: '',
  });

  const renderMentorItem = ({ item }: { item: Mentor }) => (
    <MentorCard
      mentor={item}
      onMessage={() => handleMessage(item)}
      onSchedule={() => handleSchedule(item)}
    />
  );

  const renderSessionCard = (session: MentorshipSession) => (
    <View key={session.id} style={[styles.sessionCard, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.sessionMentor, { color: textColor }]}>
            {session.mentorName}
          </ThemedText>
          <View style={[
            styles.sessionStatus,
            { backgroundColor: 
              session.status === 'scheduled' ? '#007AFF' + '20' :
              session.status === 'completed' ? '#32D74B' + '20' : '#FF3B30' + '20'
            }
          ]}>
            <ThemedText style={[
              styles.sessionStatusText,
              { color: 
                session.status === 'scheduled' ? '#007AFF' :
                session.status === 'completed' ? '#32D74B' : '#FF3B30'
              }
            ]}>
              {session.status === 'scheduled' ? 'Programada' :
               session.status === 'completed' ? 'Completada' : 'Cancelada'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.sessionMeta}>
          <View style={styles.sessionMetaRow}>
            <Ionicons name="calendar-outline" size={16} color={secondaryTextColor} />
            <ThemedText style={[styles.sessionMetaText, { color: secondaryTextColor }]}>
              {new Date(session.scheduledDate).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </ThemedText>
          </View>

          <View style={styles.sessionMetaRow}>
            <Ionicons name="time-outline" size={16} color={secondaryTextColor} />
            <ThemedText style={[styles.sessionMetaText, { color: secondaryTextColor }]}>
              {session.duration} minutos
            </ThemedText>
          </View>

          <View style={styles.sessionMetaRow}>
            <Ionicons 
              name={session.meetingType === 'virtual' ? 'videocam-outline' : 'location-outline'} 
              size={16} 
              color={secondaryTextColor} 
            />
            <ThemedText style={[styles.sessionMetaText, { color: secondaryTextColor }]}>
              {session.meetingType === 'virtual' ? 'Virtual' : 'Presencial'}
            </ThemedText>
          </View>
        </View>

        {session.agenda && (
          <ThemedText style={[styles.sessionAgenda, { color: textColor }]}>
            {session.agenda}
          </ThemedText>
        )}

        <View style={styles.sessionFooter}>
          <ThemedText type="defaultSemiBold" style={[styles.sessionPrice, { color: iconColor }]}>
            {session.price === 0 ? 'Gratuito' : `Bs. ${session.price}`}
          </ThemedText>

          {session.status === 'scheduled' && (
            <View style={styles.sessionActions}>
              <ThemedButton
                title="Reagendar"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Reagendar', 'Función de reagendar sesión.');
                }}
                type="outline"
                style={styles.sessionButton}
              />
              <ThemedButton
                title="Unirse"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert('Unirse', 'Te unirías a la sesión virtual.');
                }}
                type="primary"
                style={styles.sessionButton}
              />
            </View>
          )}

          {session.status === 'completed' && session.rating && (
            <View style={styles.sessionRating}>
              <View style={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < session.rating! ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD60A"
                  />
                ))}
              </View>
              {session.review && (
                <ThemedText style={[styles.sessionReview, { color: secondaryTextColor }]}>
                  "{session.review}"
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderProgramCard = (program: MentorshipProgram) => (
    <TouchableOpacity 
      key={program.id}
      style={[styles.programCard, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Inscribirse al Programa', `¿Te gustaría inscribirte a: ${program.title}?`);
      }}
    >
      <View style={styles.programHeader}>
        <ThemedText type="defaultSemiBold" style={[styles.programTitle, { color: textColor }]}>
          {program.title}
        </ThemedText>
        
        <View style={[styles.programLevel, { backgroundColor: iconColor + '20' }]}>
          <ThemedText style={[styles.programLevelText, { color: iconColor }]}>
            {program.level}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.programDescription, { color: textColor }]}>
        {program.description}
      </ThemedText>

      <View style={styles.programMeta}>
        <View style={styles.programMetaRow}>
          <Ionicons name="person-outline" size={16} color={secondaryTextColor} />
          <ThemedText style={[styles.programMetaText, { color: secondaryTextColor }]}>
            Por {program.mentorName}
          </ThemedText>
        </View>

        <View style={styles.programMetaRow}>
          <Ionicons name="time-outline" size={16} color={secondaryTextColor} />
          <ThemedText style={[styles.programMetaText, { color: secondaryTextColor }]}>
            {program.duration}
          </ThemedText>
        </View>

        <View style={styles.programMetaRow}>
          <Ionicons name="people-outline" size={16} color={secondaryTextColor} />
          <ThemedText style={[styles.programMetaText, { color: secondaryTextColor }]}>
            {program.currentParticipants}/{program.maxParticipants} participantes
          </ThemedText>
        </View>
      </View>

      <View style={styles.programCurriculum}>
        <ThemedText style={[styles.programCurriculumTitle, { color: secondaryTextColor }]}>
          Curriculum:
        </ThemedText>
        <View style={styles.programCurriculumList}>
          {program.curriculum.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.programCurriculumItem}>
              <Ionicons name="checkmark-circle" size={14} color="#32D74B" />
              <ThemedText style={[styles.programCurriculumText, { color: textColor }]}>
                {item}
              </ThemedText>
            </View>
          ))}
          {program.curriculum.length > 3 && (
            <ThemedText style={[styles.programCurriculumMore, { color: secondaryTextColor }]}>
              +{program.curriculum.length - 3} más
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.programFooter}>
        <View style={styles.programRating}>
          <View style={styles.ratingStars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(program.rating) ? 'star' : 'star-outline'}
                size={14}
                color="#FFD60A"
              />
            ))}
          </View>
          <ThemedText style={[styles.programRatingText, { color: secondaryTextColor }]}>
            {program.rating} ({program.reviewCount})
          </ThemedText>
        </View>

        <ThemedText type="defaultSemiBold" style={[styles.programPrice, { color: iconColor }]}>
          Bs. {program.price}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderBecomeMentorContent = () => (
    <ScrollView style={styles.becomeMentorContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.becomeMentorContent}>
        <View style={[styles.becomeMentorCard, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}>
          <Ionicons name="bulb-outline" size={48} color={iconColor} />
          
          <ThemedText type="title" style={[styles.becomeMentorTitle, { color: textColor }]}>
            Únete como Mentor
          </ThemedText>
          
          <ThemedText style={[styles.becomeMentorDescription, { color: textColor }]}>
            Comparte tu experiencia y ayuda a la próxima generación de emprendedores bolivianos a alcanzar sus metas.
          </ThemedText>

          <View style={styles.becomeMentorRequirements}>
            <ThemedText type="defaultSemiBold" style={[styles.requirementsTitle, { color: textColor }]}>
              Requisitos:
            </ThemedText>
            
            {[
              '3+ años de experiencia emprendedora',
              'Historial comprobable de éxito',
              'Disponibilidad de al menos 2 horas/semana',
              'Compromiso mínimo de 6 meses'
            ].map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
                <ThemedText style={[styles.requirementText, { color: textColor }]}>
                  {requirement}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.becomeMentorBenefits}>
            <ThemedText type="defaultSemiBold" style={[styles.benefitsTitle, { color: textColor }]}>
              Beneficios de ser mentor:
            </ThemedText>
            
            {[
              'Impacta positivamente en el ecosistema',
              'Expande tu red de contactos',
              'Ingresos adicionales por sesiones',
              'Reconocimiento en la comunidad'
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="star" size={16} color="#FFD60A" />
                <ThemedText style={[styles.benefitText, { color: textColor }]}>
                  {benefit}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedButton
            title="Aplicar como Mentor"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert(
                'Aplicación de Mentor',
                'Te dirigiremos al formulario de aplicación para convertirte en mentor.',
                [{ text: 'Continuar' }]
              );
            }}
            style={styles.applyButton}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 0: // Mentores
        return (
          <FlatList
            data={filteredMentors}
            renderItem={renderMentorItem}
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
                  No se encontraron mentores
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: secondaryTextColor }]}>
                  Intenta ajustar tus filtros o búsqueda
                </ThemedText>
              </View>
            }
          />
        );
      
      case 1: // Mis Sesiones
        return (
          <ScrollView 
            style={styles.sessionsContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          >
            {mockSessions.map(renderSessionCard)}
          </ScrollView>
        );
        
      case 2: // Programas
        return (
          <ScrollView 
            style={styles.programsContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          >
            {mockPrograms.map(renderProgramCard)}
          </ScrollView>
        );
        
      case 3: // Ser Mentor
        return renderBecomeMentorContent();
        
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
              Plataforma de Mentorías
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
              Conecta con mentores expertos y acelera el crecimiento de tu emprendimiento
            </ThemedText>
          </View>
        </View>

        {/* Tab Navigation */}
        <CustomTabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Search and Filter Section (only for Mentores tab) */}
        {activeTab === 0 && (
          <View style={styles.searchSection}>
            <View style={styles.searchRow}>
              <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}>
                <Ionicons name="search" size={20} color={secondaryTextColor} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Buscar mentores por nombre, expertise o empresa..."
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
          </View>
        )}

        {/* Content */}
        {renderContent()}

        {/* Modals */}
        {selectedMentor && (
          <>
            <MessagingModal
              visible={showMessagingModal}
              onClose={() => setShowMessagingModal(false)}
              recipientName={selectedMentor.name}
              recipientId={selectedMentor.id}
            />

            <SchedulingModal
              visible={showSchedulingModal}
              onClose={() => setShowSchedulingModal(false)}
              mentor={selectedMentor}
              onBookSession={handleBookSession}
            />
          </>
        )}

        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
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
  sessionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionCard: {
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
  sessionHeader: {
    gap: 12,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionMentor: {
    fontSize: 16,
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sessionMeta: {
    gap: 8,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sessionAgenda: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sessionPrice: {
    fontSize: 16,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionButton: {
    paddingHorizontal: 16,
  },
  sessionRating: {
    alignItems: 'flex-end',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  sessionReview: {
    fontSize: 12,
    fontStyle: 'italic',
    maxWidth: 200,
    textAlign: 'right',
  },
  programsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  programCard: {
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
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  programTitle: {
    fontSize: 16,
    flex: 1,
  },
  programLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  programLevelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  programDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  programMeta: {
    gap: 8,
    marginBottom: 16,
  },
  programMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  programMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  programCurriculum: {
    marginBottom: 16,
  },
  programCurriculumTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  programCurriculumList: {
    gap: 6,
  },
  programCurriculumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programCurriculumText: {
    fontSize: 13,
    flex: 1,
  },
  programCurriculumMore: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 22,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  programRatingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  programPrice: {
    fontSize: 16,
  },
  becomeMentorContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  becomeMentorContent: {
    paddingBottom: 20,
  },
  becomeMentorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  becomeMentorTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  becomeMentorDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  becomeMentorRequirements: {
    width: '100%',
    marginBottom: 32,
  },
  requirementsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    flex: 1,
  },
  becomeMentorBenefits: {
    width: '100%',
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  applyButton: {
    width: '100%',
  },
}); 