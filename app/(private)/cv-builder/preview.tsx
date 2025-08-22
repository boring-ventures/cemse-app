/**
 * CV Preview Screen
 * Shows a preview of the CV with the selected template
 */

import { useCV } from '@/app/contexts/CVContext';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Pressable,
  Alert
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function CVPreview() {
  const { state, actions } = useCV();
  const { formData, pdf } = state;
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  
  const handleGeneratePDF = useCallback(async () => {
    try {
      await actions.generatePDF(pdf.selectedTemplate);
      Alert.alert(
        'PDF Generado',
        'Tu CV ha sido generado exitosamente',
        [
          { text: 'Ver PDF', onPress: () => router.push('/(private)/cv-builder/pdf-generator') },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  }, [actions, pdf.selectedTemplate]);
  
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    if (dateString === 'Presente') return 'Presente';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    header: {
      backgroundColor: primaryColor,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    generateButtonText: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '500',
      marginLeft: 4,
    },
    previewContainer: {
      flex: 1,
      margin: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    cvContent: {
      padding: 24,
    },
    personalSection: {
      alignItems: 'center',
      marginBottom: 32,
      paddingBottom: 24,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      backgroundColor: borderColor,
    },
    fullName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: 8,
      textAlign: 'center',
    },
    contactInfo: {
      alignItems: 'center',
      gap: 4,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    contactText: {
      fontSize: 14,
      color: '#666',
    },
    description: {
      fontSize: 16,
      color: '#333',
      lineHeight: 24,
      textAlign: 'center',
      marginTop: 16,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: primaryColor,
    },
    itemContainer: {
      marginBottom: 16,
      paddingLeft: 16,
      borderLeftWidth: 3,
      borderLeftColor: `${primaryColor}40`,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 4,
    },
    itemSubtitle: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    itemDate: {
      fontSize: 12,
      color: '#999',
      marginBottom: 8,
    },
    itemDescription: {
      fontSize: 14,
      color: '#333',
      lineHeight: 20,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    skillTag: {
      backgroundColor: `${primaryColor}15`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${primaryColor}30`,
    },
    skillText: {
      fontSize: 14,
      color: primaryColor,
      fontWeight: '500',
    },
    languageItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      marginBottom: 8,
    },
    languageName: {
      fontSize: 16,
      fontWeight: '500',
      color: '#1a1a1a',
    },
    languageProficiency: {
      fontSize: 14,
      color: primaryColor,
      fontWeight: '500',
    },
    emptySection: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: '#999',
      fontStyle: 'italic',
    },
    projectLinks: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 8,
    },
    projectLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    linkText: {
      fontSize: 12,
      color: primaryColor,
    },
    technologiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 8,
    },
    technologyTag: {
      backgroundColor: '#e9ecef',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    technologyText: {
      fontSize: 12,
      color: '#495057',
    },
  });
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vista Previa del CV</Text>
        <Pressable style={styles.generateButton} onPress={handleGeneratePDF}>
          <Ionicons name="download" size={16} color="#FFFFFF" />
          <Text style={styles.generateButtonText}>Generar PDF</Text>
        </Pressable>
      </View>
      
      {/* CV Preview */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Animated.View entering={FadeIn} style={styles.previewContainer}>
          <ScrollView style={styles.cvContent}>
            {/* Personal Information */}
            <Animated.View entering={FadeInDown} style={styles.personalSection}>
              {formData.personalInfo.profileImageUrl && (
                <Animated.Image
                  source={{ uri: formData.personalInfo.profileImageUrl }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              )}
              
              <Text style={styles.fullName}>
                {formData.personalInfo.firstName} {formData.personalInfo.lastName}
              </Text>
              
              <View style={styles.contactInfo}>
                {formData.personalInfo.email && (
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={14} color="#666" />
                    <Text style={styles.contactText}>{formData.personalInfo.email}</Text>
                  </View>
                )}
                
                {formData.personalInfo.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={14} color="#666" />
                    <Text style={styles.contactText}>{formData.personalInfo.phone}</Text>
                  </View>
                )}
                
                {(formData.personalInfo.city || formData.personalInfo.country) && (
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.contactText}>
                      {[formData.personalInfo.city, formData.personalInfo.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
              
              {formData.personalInfo.personalDescription && (
                <Text style={styles.description}>
                  {formData.personalInfo.personalDescription}
                </Text>
              )}
            </Animated.View>
            
            {/* Education */}
            {formData.education?.educationHistory && formData.education.educationHistory.length > 0 && (
              <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
                <Text style={styles.sectionTitle}>Educación</Text>
                {formData.education.educationHistory.map((edu, index) => (
                  <View key={edu.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{edu.degree} en {edu.fieldOfStudy}</Text>
                    <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                    <Text style={styles.itemDate}>
                      {formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Presente' : formatDate(edu.endDate)}
                    </Text>
                    {edu.description && (
                      <Text style={styles.itemDescription}>{edu.description}</Text>
                    )}
                  </View>
                ))}
              </Animated.View>
            )}
            
            {/* Work Experience */}
            {formData.workExperience && formData.workExperience.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
                <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
                {formData.workExperience.map((exp, index) => (
                  <View key={exp.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{exp.jobTitle}</Text>
                    <Text style={styles.itemSubtitle}>{exp.company} • {exp.location}</Text>
                    <Text style={styles.itemDate}>
                      {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Presente' : formatDate(exp.endDate)}
                    </Text>
                    <Text style={styles.itemDescription}>{exp.description}</Text>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        {exp.achievements.map((achievement, idx) => (
                          <Text key={idx} style={[styles.itemDescription, { marginLeft: 16 }]}>
                            • {achievement}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </Animated.View>
            )}
            
            {/* Projects */}
            {formData.projects && formData.projects.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
                <Text style={styles.sectionTitle}>Proyectos</Text>
                {formData.projects.map((project, index) => (
                  <View key={project.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{project.name}</Text>
                    <Text style={styles.itemDate}>
                      {formatDate(project.startDate)} - {project.isOngoing ? 'En curso' : formatDate(project.endDate || '')}
                    </Text>
                    <Text style={styles.itemDescription}>{project.description}</Text>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <View style={styles.technologiesContainer}>
                        {project.technologies.map((tech, idx) => (
                          <View key={idx} style={styles.technologyTag}>
                            <Text style={styles.technologyText}>{tech}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {(project.url || project.repositoryUrl) && (
                      <View style={styles.projectLinks}>
                        {project.url && (
                          <View style={styles.projectLink}>
                            <Ionicons name="link" size={12} color={primaryColor} />
                            <Text style={styles.linkText}>Demo</Text>
                          </View>
                        )}
                        {project.repositoryUrl && (
                          <View style={styles.projectLink}>
                            <Ionicons name="logo-github" size={12} color={primaryColor} />
                            <Text style={styles.linkText}>Código</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </Animated.View>
            )}
            
            {/* Skills */}
            {formData.skills && formData.skills.length > 0 && (
              <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                <Text style={styles.sectionTitle}>Habilidades</Text>
                <View style={styles.skillsContainer}>
                  {formData.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>
                        {skill.name} ({skill.experienceLevel})
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
            
            {/* Languages */}
            {formData.languages && formData.languages.length > 0 && (
              <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
                <Text style={styles.sectionTitle}>Idiomas</Text>
                {formData.languages.map((language, index) => (
                  <View key={index} style={styles.languageItem}>
                    <Text style={styles.languageName}>{language.language}</Text>
                    <Text style={styles.languageProficiency}>
                      {language.proficiency === 'Basic' ? 'Básico' :
                       language.proficiency === 'Conversational' ? 'Conversacional' :
                       language.proficiency === 'Fluent' ? 'Fluido' :
                       'Nativo'}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </View>
  );
}