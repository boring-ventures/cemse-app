import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CVFormField } from '../CVFormField';
import Shimmer from '@/app/components/Shimmer';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useCV } from '@/app/hooks/useCV';
import { CVData, CoverLetterData, RecipientData } from '@/app/types/cv';
import { pdfGenerator } from '@/app/services/pdfGenerator';

interface CoverLetterEditorProps {
  cvData: CVData | null;
  coverLetterData: CoverLetterData | null;
  loading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

/**
 * Cover Letter Editor Component
 * Features: Template selection, live editing, recipient information, content management
 */

const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  cvData,
  coverLetterData,
  loading,
}) => {
  const { saveCoverLetterData } = useCV();
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'creative' | 'minimalist'>('professional');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState<RecipientData>({
    department: '',
    companyName: '',
    address: '',
    city: '',
    country: 'Bolivia',
  });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  // Load existing cover letter data
  useEffect(() => {
    if (coverLetterData) {
      setContent(coverLetterData.content || '');
      setSubject(coverLetterData.subject || '');
      setSelectedTemplate(coverLetterData.template as any || 'professional');
      if (coverLetterData.recipient) {
        setRecipient(coverLetterData.recipient);
      }
    }
  }, [coverLetterData]);

  const templates = [
    {
      id: 'professional' as const,
      name: 'Professional Business',
      description: 'Formal layout for corporate positions',
      icon: 'business-outline',
    },
    {
      id: 'creative' as const,
      name: 'Modern Creative',
      description: 'Card-based design for creative roles',
      icon: 'color-palette-outline',
    },
    {
      id: 'minimalist' as const,
      name: 'Minimalist Clean',
      description: 'Simple layout for any industry',
      icon: 'library-outline',
    },
  ];

  // Generate default content based on CV data
  const generateDefaultContent = () => {
    if (!cvData) return '';

    const firstName = cvData.personalInfo?.firstName || '';
    const lastName = cvData.personalInfo?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return `Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] role at ${recipient.companyName || '[Company Name]'}. With my background in [Your Field/Industry], I am excited about the opportunity to contribute to your team.

${cvData.professionalSummary ? `${cvData.professionalSummary}\n\n` : ''}In my previous experience, I have developed strong skills in ${cvData.skills?.slice(0, 3).map(skill => skill.name).join(', ') || '[Your Key Skills]'}. I am particularly drawn to this opportunity because [Specific reason for interest in the company/role].

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to ${recipient.companyName || '[Company Name]'}. Thank you for considering my application.

Sincerely,
${fullName || '[Your Name]'}`;
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: 'professional' | 'creative' | 'minimalist') => {
    setSelectedTemplate(templateId);
  };

  // Handle save
  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Please enter cover letter content');
      return;
    }

    setSaving(true);
    try {
      await saveCoverLetterData(content, selectedTemplate, recipient, subject);
      Alert.alert('Success', 'Cover letter saved successfully!');
    } catch (error) {
      console.error('Error saving cover letter:', error);
      Alert.alert('Error', 'Failed to save cover letter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle generate default content
  const handleGenerateDefault = () => {
    const defaultContent = generateDefaultContent();
    setContent(defaultContent);
  };

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Please enter cover letter content before generating PDF');
      return;
    }

    if (!recipient.companyName || !recipient.department) {
      Alert.alert('Validation Error', 'Please fill in recipient information before generating PDF');
      return;
    }

    setGenerating(true);
    try {
      const coverLetterData: CoverLetterData = {
        content,
        template: selectedTemplate,
        recipient,
        subject: subject || 'Job Application',
      };

      const pdfUri = await pdfGenerator.generateCoverLetter(coverLetterData, selectedTemplate);
      
      Alert.alert(
        'Cover Letter Generated Successfully!',
        'Your cover letter has been generated. What would you like to do?',
        [
          {
            text: 'Share',
            onPress: () => handleShare(pdfUri),
          },
          {
            text: 'Save to Device',
            onPress: () => handleSavePDF(pdfUri),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error generating cover letter PDF:', error);
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
        const coverLetterData: CoverLetterData = {
          content,
          template: selectedTemplate,
          recipient,
          subject: subject || 'Job Application',
        };
        
        setGenerating(true);
        uri = await pdfGenerator.generateCoverLetter(coverLetterData, selectedTemplate);
      }
      
      await pdfGenerator.sharePDF(uri);
    } catch (error) {
      console.error('Error sharing cover letter:', error);
      Alert.alert(
        'Sharing Failed',
        error instanceof Error ? error.message : 'Failed to share cover letter. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  // Handle saving PDF to device
  const handleSavePDF = async (pdfUri?: string) => {
    try {
      let uri = pdfUri;
      
      if (!uri) {
        const coverLetterData: CoverLetterData = {
          content,
          template: selectedTemplate,
          recipient,
          subject: subject || 'Job Application',
        };
        
        setGenerating(true);
        uri = await pdfGenerator.generateCoverLetter(coverLetterData, selectedTemplate);
      }
      
      const fileName = `CoverLetter_${recipient.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      await pdfGenerator.savePDF(uri, fileName);
      
      Alert.alert('Success', 'Cover letter saved to your device successfully!');
    } catch (error) {
      console.error('Error saving cover letter:', error);
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Failed to save cover letter. Please try again.'
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
          <ThemedText style={styles.headerTitle}>Cover Letter</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Create your professional cover letter
          </ThemedText>
        </View>
        
        <View style={styles.loadingContainer}>
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
    <ScrollView style={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Cover Letter</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Create a personalized cover letter for your job applications
        </ThemedText>
      </View>

      {/* Template Selection */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Template Style</ThemedText>
        
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
                    size={20}
                    color={selectedTemplate === template.id ? 'white' : textColor}
                  />
                </View>
                {selectedTemplate === template.id && (
                  <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                )}
              </View>
              
              <ThemedText style={styles.templateName}>{template.name}</ThemedText>
              <ThemedText style={styles.templateDescription}>{template.description}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recipient Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Recipient Information</ThemedText>
        
        <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
          <CVFormField
            label="Company Name"
            value={recipient.companyName}
            onChangeText={(value) => setRecipient(prev => ({ ...prev, companyName: value }))}
            placeholder="Company or organization name"
          />
          
          <CVFormField
            label="Department"
            value={recipient.department}
            onChangeText={(value) => setRecipient(prev => ({ ...prev, department: value }))}
            placeholder="HR Department, Engineering Team, etc."
          />
          
          <CVFormField
            label="Address"
            value={recipient.address}
            onChangeText={(value) => setRecipient(prev => ({ ...prev, address: value }))}
            placeholder="Company address"
          />
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <CVFormField
                label="City"
                value={recipient.city}
                onChangeText={(value) => setRecipient(prev => ({ ...prev, city: value }))}
                placeholder="City"
              />
            </View>
            <View style={styles.formColumn}>
              <CVFormField
                label="Country"
                value={recipient.country}
                onChangeText={(value) => setRecipient(prev => ({ ...prev, country: value }))}
                placeholder="Country"
              />
            </View>
          </View>
        </ThemedView>
      </View>

      {/* Subject Line */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Subject Line</ThemedText>
        
        <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
          <CVFormField
            label="Email Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="Application for [Position Title] - [Your Name]"
          />
        </ThemedView>
      </View>

      {/* Cover Letter Content */}
      <View style={styles.section}>
        <View style={styles.contentHeader}>
          <ThemedText style={styles.sectionTitle}>Cover Letter Content</ThemedText>
          
          <Pressable
            style={[styles.generateButton, { backgroundColor: tintColor }]}
            onPress={handleGenerateDefault}
          >
            <Ionicons name="bulb-outline" size={16} color="white" />
            <Text style={styles.generateButtonText}>Generate Template</Text>
          </Pressable>
        </View>
        
        <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={[styles.textArea, { color: textColor, borderColor }]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your cover letter content here..."
              placeholderTextColor={borderColor}
              multiline
              numberOfLines={15}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.contentStats}>
            <ThemedText style={styles.statsText}>
              {content.length} characters • {content.split(' ').filter(word => word.length > 0).length} words
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handleSave}
            disabled={saving || !content.trim()}
          >
            {saving ? (
              <Ionicons name="hourglass-outline" size={20} color="white" />
            ) : (
              <Ionicons name="save-outline" size={20} color="white" />
            )}
            <Text style={styles.actionButtonText}>
              {saving ? 'Saving...' : 'Save Cover Letter'}
            </Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.secondaryButton, { borderColor }]}
            onPress={handleGeneratePDF}
            disabled={generating || !content.trim()}
          >
            {generating ? (
              <Ionicons name="hourglass-outline" size={20} color={tintColor} />
            ) : (
              <Ionicons name="document-outline" size={20} color={tintColor} />
            )}
            <Text style={[styles.actionButtonText, { color: tintColor }]}>
              {generating ? 'Generating...' : 'Generate PDF'}
            </Text>
          </Pressable>
        </View>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  templateGrid: {
    gap: 12,
  },
  templateCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  templateDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 15,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formColumn: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  generateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  textAreaContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
  },
  contentStats: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButtons: {
    gap: 15,
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
  bottomSpacing: {
    height: 50,
  },
});

export default CoverLetterEditor;