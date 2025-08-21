import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { CVData } from '@/app/types/cv';

interface TemplatePreviewProps {
  cvData: CVData | null;
  templateId: 'modern' | 'creative' | 'minimalist';
}

/**
 * Template Preview Component
 * Shows a miniature preview of how the CV will look with actual user data
 */

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  cvData,
  templateId,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  // Template-specific colors
  const getTemplateColors = () => {
    switch (templateId) {
      case 'modern':
        return {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#dbeafe',
        };
      case 'creative':
        return {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#ede9fe',
        };
      case 'minimalist':
        return {
          primary: '#374151',
          secondary: '#6b7280',
          accent: '#f3f4f6',
        };
      default:
        return {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#dbeafe',
        };
    }
  };

  const colors = getTemplateColors();

  if (!cvData) {
    return (
      <View style={[styles.container, { borderColor }]}>
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={32} color={borderColor} />
          <ThemedText style={styles.emptyText}>
            No CV data available for preview
          </ThemedText>
        </View>
      </View>
    );
  }

  const { personalInfo, skills, workExperience, education, languages } = cvData;

  return (
    <View style={[styles.container, { borderColor }]}>
      <ScrollView 
        style={styles.previewContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.profileSection}>
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.accent }]}>
              <Ionicons name="person" size={16} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.fullName, { color: 'white' }]}>
                {personalInfo.firstName} {personalInfo.lastName}
              </Text>
              <Text style={[styles.contact, { color: colors.accent }]}>
                {personalInfo.email}
              </Text>
              <Text style={[styles.contact, { color: colors.accent }]}>
                {personalInfo.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Sections */}
        <View style={styles.content}>
          {/* Professional Summary */}
          {cvData.professionalSummary && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Professional Summary
              </Text>
              <Text style={[styles.sectionText, { color: textColor }]} numberOfLines={2}>
                {cvData.professionalSummary}
              </Text>
            </View>
          )}

          {/* Work Experience */}
          {workExperience && workExperience.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Work Experience
              </Text>
              {workExperience.slice(0, 2).map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={[styles.experienceTitle, { color: textColor }]}>
                    {exp.jobTitle}
                  </Text>
                  <Text style={[styles.experienceCompany, { color: colors.secondary }]}>
                    {exp.company}
                  </Text>
                  <Text style={[styles.experienceDate, { color: colors.secondary }]}>
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </Text>
                </View>
              ))}
              {workExperience.length > 2 && (
                <Text style={[styles.moreItems, { color: colors.secondary }]}>
                  +{workExperience.length - 2} more...
                </Text>
              )}
            </View>
          )}

          {/* Education */}
          {education && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Education
              </Text>
              <View style={styles.educationItem}>
                <Text style={[styles.educationLevel, { color: textColor }]}>
                  {education.level}
                </Text>
                <Text style={[styles.educationInstitution, { color: colors.secondary }]}>
                  {education.currentInstitution}
                </Text>
                {education.graduationYear && (
                  <Text style={[styles.educationYear, { color: colors.secondary }]}>
                    {education.graduationYear}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Skills
              </Text>
              <View style={styles.skillsContainer}>
                {skills.slice(0, 6).map((skill, index) => (
                  <View 
                    key={index} 
                    style={[styles.skillBadge, { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.skillText, { color: colors.primary }]}>
                      {skill.name}
                    </Text>
                  </View>
                ))}
                {skills.length > 6 && (
                  <Text style={[styles.moreItems, { color: colors.secondary }]}>
                    +{skills.length - 6} more
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Languages
              </Text>
              <View style={styles.languagesContainer}>
                {languages.slice(0, 3).map((lang, index) => (
                  <View key={index} style={styles.languageItem}>
                    <Text style={[styles.languageName, { color: textColor }]}>
                      {lang.name}
                    </Text>
                    <Text style={[styles.languageLevel, { color: colors.secondary }]}>
                      {lang.proficiency}
                    </Text>
                  </View>
                ))}
                {languages.length > 3 && (
                  <Text style={[styles.moreItems, { color: colors.secondary }]}>
                    +{languages.length - 3} more
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileImagePlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  contact: {
    fontSize: 7,
    opacity: 0.9,
  },
  content: {
    padding: 8,
    gap: 8,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 7,
    lineHeight: 10,
  },
  experienceItem: {
    gap: 1,
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 7,
    fontWeight: '600',
  },
  experienceCompany: {
    fontSize: 6,
    fontWeight: '500',
  },
  experienceDate: {
    fontSize: 5,
  },
  educationItem: {
    gap: 1,
  },
  educationLevel: {
    fontSize: 7,
    fontWeight: '600',
  },
  educationInstitution: {
    fontSize: 6,
    fontWeight: '500',
  },
  educationYear: {
    fontSize: 5,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  skillBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 5,
    fontWeight: '500',
  },
  languagesContainer: {
    gap: 2,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 6,
    fontWeight: '500',
  },
  languageLevel: {
    fontSize: 5,
  },
  moreItems: {
    fontSize: 5,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 10,
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default TemplatePreview;