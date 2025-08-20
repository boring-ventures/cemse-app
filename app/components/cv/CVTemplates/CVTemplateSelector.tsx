import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import Shimmer from '@/app/components/Shimmer';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { CVData } from '@/app/types/cv';
import { pdfGenerator } from '@/app/services/pdfGenerator';

interface CVTemplateSelectorProps {
  cvData: CVData | null;
  loading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

/**
 * CV Template Selector Component
 * Features: Template selection, preview, PDF generation, sharing
 */

const CVTemplateSelector: React.FC<CVTemplateSelectorProps> = ({
  cvData,
  loading,
  isRefreshing,
  onRefresh,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'creative' | 'minimalist'>('modern');
  const [generating, setGenerating] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  const templates = [
    {
      id: 'modern' as const,
      name: 'Modern Professional',
      description: 'Clean design with blue accent colors',
      icon: 'document-outline',
    },
    {
      id: 'creative' as const,
      name: 'Creative Portfolio',
      description: 'Vibrant design with purple gradients',
      icon: 'color-palette-outline',
    },
    {
      id: 'minimalist' as const,
      name: 'Minimalist Clean',
      description: 'Simple black and white layout',
      icon: 'library-outline',
    },
  ];

  // Handle template selection
  const handleTemplateSelect = (templateId: 'modern' | 'creative' | 'minimalist') => {
    setSelectedTemplate(templateId);
  };

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!cvData) {
      Alert.alert('Error', 'No CV data available to generate PDF');
      return;
    }

    setGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const pdfUri = await pdfGenerator.generateCV(cvData, selectedTemplate);
      
      Alert.alert(
        'CV Generated Successfully!',
        'Your CV has been generated. What would you like to do?',
        [
          {
            text: 'Share',
            onPress: () => handleShare(pdfUri),
          },
          {
            text: 'Save to Device',
            onPress: () => handleSave(pdfUri),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Generation Failed',
        error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  // Handle sharing
  const handleShare = async (pdfUri?: string) => {
    try {
      let uri = pdfUri;
      
      if (!uri) {
        if (!cvData) {
          Alert.alert('Error', 'No CV data available');
          return;
        }
        
        setGenerating(true);
        uri = await pdfGenerator.generateCV(cvData, selectedTemplate);
      }
      
      await pdfGenerator.sharePDF(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error sharing CV:', error);
      Alert.alert(
        'Sharing Failed',
        error instanceof Error ? error.message : 'Failed to share CV. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  // Handle saving to device
  const handleSave = async (pdfUri?: string) => {
    try {
      let uri = pdfUri;
      
      if (!uri) {
        if (!cvData) {
          Alert.alert('Error', 'No CV data available');
          return;
        }
        
        setGenerating(true);
        uri = await pdfGenerator.generateCV(cvData, selectedTemplate);
      }
      
      const fileName = `CV_${cvData?.personalInfo.firstName}_${cvData?.personalInfo.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
      await pdfGenerator.savePDF(uri, fileName);
      
      Alert.alert('Success', 'CV saved to your device successfully!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving CV:', error);
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Failed to save CV. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>CV Templates</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Choose a template and generate your CV
          </ThemedText>
        </View>
        
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
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        isRefreshing && onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={tintColor} />
        ) : undefined
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>CV Templates</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Choose a template and generate your professional CV
        </ThemedText>
      </View>

      {/* Template Selection */}
      <View style={styles.templatesSection}>
        <ThemedText style={styles.sectionTitle}>Available Templates</ThemedText>
        
        <View style={styles.templateGrid}>
          {templates.map((template) => (
            <Pressable
              key={template.id}
              style={[
                styles.templateCard,
                { borderColor, backgroundColor: cardColor },
                selectedTemplate === template.id && { borderColor: tintColor, borderWidth: 2 }
              ]}
              onPress={() => handleTemplateSelect(template.id)}
            >
              <View style={styles.templateHeader}>
                <View style={[
                  styles.templateIcon,
                  { backgroundColor: selectedTemplate === template.id ? tintColor : borderColor }
                ]}>
                  <Ionicons
                    name={template.icon as any}
                    size={24}
                    color={selectedTemplate === template.id ? 'white' : textColor}
                  />
                </View>
                {selectedTemplate === template.id && (
                  <View style={[styles.selectedBadge, { backgroundColor: tintColor }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </View>
              
              <ThemedText style={styles.templateName}>{template.name}</ThemedText>
              <ThemedText style={styles.templateDescription}>{template.description}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Preview Section */}
      <View style={styles.previewSection}>
        <ThemedText style={styles.sectionTitle}>Template Preview</ThemedText>
        
        <ThemedView style={[styles.previewCard, { borderColor, backgroundColor: cardColor }]}>
          <View style={styles.previewHeader}>
            <Ionicons name="eye-outline" size={24} color={tintColor} />
            <ThemedText style={styles.previewTitle}>
              {templates.find(t => t.id === selectedTemplate)?.name} Preview
            </ThemedText>
          </View>
          
          <View style={styles.previewContent}>
            <ThemedText style={styles.previewText}>
              Preview of your CV with the selected template will appear here.
              This feature will show how your data looks in the chosen design.
            </ThemedText>
            
            {/* Placeholder preview */}
            <View style={[styles.previewPlaceholder, { borderColor }]}>
              <Ionicons name="document-text-outline" size={48} color={borderColor} />
              <ThemedText style={styles.placeholderText}>CV Preview</ThemedText>
            </View>
          </View>
        </ThemedView>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <ThemedText style={styles.sectionTitle}>Actions</ThemedText>
        
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handleGeneratePDF}
            disabled={generating || !cvData}
          >
            {generating ? (
              <Ionicons name="hourglass-outline" size={20} color="white" />
            ) : (
              <Ionicons name="download-outline" size={20} color="white" />
            )}
            <Text style={styles.actionButtonText}>
              {generating ? 'Generating...' : 'Generate PDF'}
            </Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.secondaryButton, { borderColor }]}
            onPress={() => handleShare()}
            disabled={generating || !cvData}
          >
            <Ionicons name="share-outline" size={20} color={tintColor} />
            <Text style={[styles.actionButtonText, { color: tintColor }]}>Share CV</Text>
          </Pressable>
        </View>
        
        {/* CV Data Summary */}
        {cvData && (
          <View style={[styles.summaryCard, { borderColor, backgroundColor: cardColor }]}>
            <ThemedText style={styles.summaryTitle}>Your CV Data Summary</ThemedText>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {cvData.skills?.length || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Skills</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {cvData.workExperience?.length || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Experience</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {cvData.projects?.length || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Projects</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {cvData.languages?.length || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Languages</ThemedText>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  loadingContainer: {
    padding: 20,
    gap: 15,
  },
  shimmerCard: {
    height: 120,
    borderRadius: 12,
  },
  templatesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  templateGrid: {
    gap: 15,
  },
  templateCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  templateDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  previewCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewContent: {
    gap: 15,
  },
  previewText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  previewPlaceholder: {
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  placeholderText: {
    fontSize: 16,
    opacity: 0.5,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButtons: {
    gap: 15,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default CVTemplateSelector;