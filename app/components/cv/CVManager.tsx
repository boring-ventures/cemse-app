import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useCV } from '@/app/hooks/useCV';
import { useNetworkSync } from '@/app/hooks/useNetworkSync';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import Shimmer from '@/app/components/Shimmer';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import {
  CVData,
  CVManagerState,
  DEFAULT_COLLAPSED_SECTIONS,
} from '@/app/types/cv';

// Import section components
import PersonalInfoSection from './PersonalInfoSection';
import ProfessionalSummarySection from './ProfessionalSummarySection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import LanguagesSection from './LanguagesSection';
import SocialLinksSection from './SocialLinksSection';
import WorkExperienceSection from './WorkExperienceSection';
import ProjectsSection from './ProjectsSection';
import ActivitiesSection from './ActivitiesSection';
import InterestsSection from './InterestsSection';
import ExperienceSection from './ExperienceSection';
import CVTemplateSelector from './CVTemplates/CVTemplateSelector';
import CoverLetterEditor from './CoverLetter/CoverLetterEditor';
import { CVCustomTabBar } from './CVCustomTabBar';
import NetworkStatus from './NetworkStatus';
import EmergencyClearButton from '../debug/EmergencyClearButton';

/**
 * Main CV Manager Component
 * Implements the complete web cv-manager.tsx functionality for mobile
 * Features: Custom tab navigation, collapsible sections, real-time updates, offline support
 */

const CVManager: React.FC = () => {
  const {
    cvData,
    coverLetterData,
    loading,
    error,
    fetchCVData,
    updateCVData,
    fetchCoverLetterData,
  } = useCV();
  
  const { pendingUpdates } = useNetworkSync();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Component state matching web implementation
  const [state, setState] = useState({
    newSkill: '',
    newInterest: '',
    uploading: false,
    uploadError: '',
    collapsedSections: DEFAULT_COLLAPSED_SECTIONS,
  });

  // Tab configuration
  const tabs = useMemo(() => [
    { id: 0, title: 'Mi CV', icon: 'create-outline' as const },
    { id: 1, title: 'Plantillas', icon: 'document-text-outline' as const },
    { id: 2, title: 'Carta', icon: 'mail-outline' as const },
  ], []);

  // Load data on component mount
  useEffect(() => {
    fetchCVData();
    fetchCoverLetterData();
  }, [fetchCVData, fetchCoverLetterData]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await fetchCVData();
      await fetchCoverLetterData();
    } catch (refreshError) {
      console.error('Error al actualizar datos del CV:', refreshError);
      // Only show user alert for refresh errors (manual action)
      Alert.alert('Error', 'Error al actualizar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  }, [fetchCVData, fetchCoverLetterData]);

  // Update CV data handlers - matching web patterns
  const handlePersonalInfoChange = useCallback(async (field: string, value: string) => {
    if (!cvData) return;

    try {
      await updateCVData({
        personalInfo: {
          ...cvData.personalInfo,
          [field]: value
        }
      });
    } catch (updateError) {
      console.error('Error al actualizar información personal:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  const handleEducationChange = useCallback(async (field: string, value: any) => {
    if (!cvData) return;

    try {
      const currentEducation = cvData.education || {
        level: '',
        currentInstitution: '',
        graduationYear: new Date().getFullYear(),
        isStudying: false,
        educationHistory: [],
        currentDegree: '',
        universityName: '',
        universityStartDate: '',
        universityEndDate: null,
        universityStatus: '',
        gpa: 0,
        academicAchievements: []
      };

      await updateCVData({
        education: {
          ...currentEducation,
          [field]: value
        }
      });
    } catch (updateError) {
      console.error('Error al actualizar educación:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  const handleSkillsChange = useCallback(async (skills: any[]) => {
    if (!cvData) return;

    try {
      await updateCVData({ skills });
    } catch (updateError) {
      console.error('Error al actualizar habilidades:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  const handleInterestsChange = useCallback(async (interests: string[]) => {
    if (!cvData) return;

    try {
      await updateCVData({ interests });
    } catch (updateError) {
      console.error('Error al actualizar intereses:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  // Professional summary handler
  const handleSummaryChange = useCallback(async (professionalSummary: string) => {
    if (!cvData) return;

    try {
      await updateCVData({ professionalSummary });
    } catch (updateError) {
      console.error('Error al actualizar resumen profesional:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  // Languages handler
  const handleLanguagesChange = useCallback(async (languages: any[]) => {
    if (!cvData) return;

    try {
      await updateCVData({ languages });
    } catch (updateError) {
      console.error('Error al actualizar idiomas:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  // Social links handler
  const handleSocialLinksChange = useCallback(async (socialLinks: any[]) => {
    if (!cvData) return;

    try {
      await updateCVData({ socialLinks });
    } catch (updateError) {
      console.error('Error al actualizar enlaces sociales:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  // Work experience handler
  const handleWorkExperienceChange = useCallback(async (workExperience: any[]) => {
    if (!cvData) return;

    try {
      await updateCVData({ workExperience });
    } catch (updateError) {
      console.error('Error al actualizar experiencia laboral:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  // Projects handler
  const handleProjectsChange = useCallback(async (projects: any[]) => {
    if (!cvData) return;

    try {
      await updateCVData({ projects });
    } catch (updateError) {
      console.error('Error al actualizar proyectos:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  // Activities handler
  const handleActivitiesChange = useCallback(async (activities: any[]) => {
    if (!cvData) return;

    try {
      await updateCVData({ activities });
    } catch (updateError) {
      console.error('Error al actualizar actividades:', updateError);
      // Internal error - no user alert for sync errors
    }
  }, [cvData, updateCVData]);

  // Toggle collapsible sections
  const toggleSection = useCallback((section: keyof typeof DEFAULT_COLLAPSED_SECTIONS) => {
    setState(prev => ({
      ...prev,
      collapsedSections: {
        ...prev.collapsedSections,
        [section]: !prev.collapsedSections[section]
      }
    }));
  }, []);

  // Skills management functions
  const addSkill = useCallback(() => {
    if (!state.newSkill.trim() || !cvData) return;

    const skillExists = cvData.skills?.some(skill => skill.name === state.newSkill.trim());
    if (skillExists) {
      Alert.alert('Habilidad Duplicada', 'Esta habilidad ya existe');
      return;
    }

    const newSkills = [
      ...(cvData.skills || []),
      { name: state.newSkill.trim(), experienceLevel: 'Skillful' }
    ];

    handleSkillsChange(newSkills);
    setState(prev => ({ ...prev, newSkill: '' }));
  }, [state.newSkill, cvData, handleSkillsChange]);

  const removeSkill = useCallback((skillToRemove: string) => {
    if (!cvData) return;

    const updatedSkills = cvData.skills?.filter(skill => skill.name !== skillToRemove) || [];
    handleSkillsChange(updatedSkills);
  }, [cvData, handleSkillsChange]);

  // Interests management functions
  const addInterest = useCallback(() => {
    if (!state.newInterest.trim() || !cvData) return;

    const interestExists = cvData.interests?.includes(state.newInterest.trim());
    if (interestExists) {
      Alert.alert('Interés Duplicado', 'Este interés ya existe');
      return;
    }

    const newInterests = [...(cvData.interests || []), state.newInterest.trim()];
    handleInterestsChange(newInterests);
    setState(prev => ({ ...prev, newInterest: '' }));
  }, [state.newInterest, cvData, handleInterestsChange]);

  const removeInterest = useCallback((interestToRemove: string) => {
    if (!cvData) return;

    const updatedInterests = cvData.interests?.filter(interest => interest !== interestToRemove) || [];
    handleInterestsChange(updatedInterests);
  }, [cvData, handleInterestsChange]);

  // Header component
  const CVHeader = () => (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>Gestor de CV</ThemedText>
      <ThemedText style={styles.headerSubtitle}>
        Crea y gestiona tu currículum vitae profesional
      </ThemedText>
    </View>
  );

  // Edit Data Tab Content
  const EditDataContent = () => (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing || loading} onRefresh={handleRefresh} tintColor={tintColor} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Always Visible Sections */}
      <PersonalInfoSection
        cvData={cvData}
        onPersonalInfoChange={handlePersonalInfoChange}
        uploading={state.uploading}
        uploadError={state.uploadError}
      />

      <ProfessionalSummarySection
        cvData={cvData}
        onSummaryChange={handleSummaryChange}
      />

      {/* Collapsible Sections */}
      <EducationSection
        cvData={cvData}
        onEducationChange={handleEducationChange}
        isCollapsed={state.collapsedSections.education}
        onToggle={() => toggleSection('education')}
      />

      <SkillsSection
        cvData={cvData}
        newSkill={state.newSkill}
        onNewSkillChange={(text) => setState(prev => ({ ...prev, newSkill: text }))}
        onAddSkill={addSkill}
        onRemoveSkill={removeSkill}
        isCollapsed={state.collapsedSections.skills}
        onToggle={() => toggleSection('skills')}
      />

      <LanguagesSection
        cvData={cvData}
        onLanguagesChange={handleLanguagesChange}
        isCollapsed={state.collapsedSections.languages}
        onToggle={() => toggleSection('languages')}
      />

      <SocialLinksSection
        cvData={cvData}
        onSocialLinksChange={handleSocialLinksChange}
        isCollapsed={state.collapsedSections.socialLinks}
        onToggle={() => toggleSection('socialLinks')}
      />

      <WorkExperienceSection
        cvData={cvData}
        onWorkExperienceChange={handleWorkExperienceChange}
        isCollapsed={state.collapsedSections.workExperience}
        onToggle={() => toggleSection('workExperience')}
      />

      <ProjectsSection
        cvData={cvData}
        onProjectsChange={handleProjectsChange}
        isCollapsed={state.collapsedSections.projects}
        onToggle={() => toggleSection('projects')}
      />

      <ActivitiesSection
        cvData={cvData}
        onActivitiesChange={handleActivitiesChange}
        isCollapsed={state.collapsedSections.activities}
        onToggle={() => toggleSection('activities')}
      />

      <InterestsSection
        cvData={cvData}
        newInterest={state.newInterest}
        onNewInterestChange={(text) => setState(prev => ({ ...prev, newInterest: text }))}
        onAddInterest={addInterest}
        onRemoveInterest={removeInterest}
        isCollapsed={state.collapsedSections.interests}
        onToggle={() => toggleSection('interests')}
      />

      <ExperienceSection
        cvData={cvData}
        onUpdateCVData={updateCVData}
        collapsedSections={state.collapsedSections}
        onToggleSection={toggleSection}
      />

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  // CV Preview Tab Content
  const CVPreviewContent = () => (
    <CVTemplateSelector 
      cvData={cvData} 
      loading={loading}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  );

  // Cover Letter Tab Content
  const CoverLetterContent = () => (
    <CoverLetterEditor 
      cvData={cvData}
      coverLetterData={coverLetterData}
      loading={loading}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  );

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <EditDataContent />;
      case 1:
        return <CVPreviewContent />;
      case 2:
        return <CoverLetterContent />;
      default:
        return <EditDataContent />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={[styles.content, { backgroundColor }]}>
        {/* Header */}
        <CVHeader />
        
        {/* Network Status */}
        <NetworkStatus onSyncPress={fetchCVData} />
        
        {/* Emergency Clear Button - Remove after fixing the issue */}
        {pendingUpdates && pendingUpdates.length > 50 && (
          <EmergencyClearButton />
        )}
        
        {/* Custom Tab Navigation */}
        <CVCustomTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        {/* Tab Content */}
        <ThemedView style={styles.tabContent}>
          {loading && !cvData ? (
            // Loading state with Shimmer
            <View style={styles.loadingContainer}>
              <Shimmer>
                <View style={[styles.shimmerCard, { backgroundColor: borderColor }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.shimmerCard, { backgroundColor: borderColor }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.shimmerCard, { backgroundColor: borderColor }]} />
              </Shimmer>
            </View>
          ) : error && !cvData ? (
            // Error state
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color={tintColor} />
              <ThemedText style={styles.errorTitle}>Error al cargar datos del CV</ThemedText>
              <ThemedText style={styles.errorMessage}>{error.message}</ThemedText>
              <Pressable style={[styles.retryButton, { backgroundColor: tintColor }]} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            // Normal tab content
            renderTabContent()
          )}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  tabContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 15,
  },
  shimmerCard: {
    height: 100,
    borderRadius: 12,
    marginBottom: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default CVManager;