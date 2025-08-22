/**
 * PDF Generator Organism
 * Handles CV PDF generation and preview
 */

import { CVFormData, CVTemplate, PDFGenerationOptions } from '@/app/types/cv';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Pressable,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface PDFGeneratorProps {
  cvData: CVFormData;
  selectedTemplate: CVTemplate;
  onTemplateChange: (template: CVTemplate) => void;
  availableTemplates: CVTemplate[];
  isGenerating: boolean;
  generationProgress: number;
  onGeneratePDF: (template: CVTemplate, options?: PDFGenerationOptions) => Promise<string>;
}

const DEFAULT_PDF_OPTIONS: PDFGenerationOptions = {
  template: {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño moderno y profesional',
    thumbnailUrl: '',
    isPopular: true,
    isPremium: false,
    colorScheme: ['#0066CC', '#FFFFFF'],
  },
  colorScheme: '#0066CC',
  fontSize: 'medium',
  includePhoto: true,
  sections: {
    education: true,
    experience: true,
    skills: true,
    projects: true,
    languages: true,
    socialLinks: true,
  },
};

export const PDFGenerator = React.memo<PDFGeneratorProps>(({
  cvData,
  selectedTemplate,
  onTemplateChange,
  availableTemplates,
  isGenerating,
  generationProgress,
  onGeneratePDF,
}) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<PDFGenerationOptions>(DEFAULT_PDF_OPTIONS);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const successColor = '#34C759';
  
  const handleGeneratePDF = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const pdfUri = await onGeneratePDF(selectedTemplate, {
        ...pdfOptions,
        template: selectedTemplate,
      });
      
      // Show sharing options
      Alert.alert(
        'PDF Generado',
        'Tu CV ha sido generado exitosamente. ¿Qué te gustaría hacer?',
        [
          { text: 'Ver PDF', onPress: () => viewPDF(pdfUri) },
          { text: 'Compartir', onPress: () => sharePDF(pdfUri) },
          { text: 'Guardar', onPress: () => savePDF(pdfUri) },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo generar el PDF. Por favor inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  }, [selectedTemplate, pdfOptions, onGeneratePDF]);
  
  const viewPDF = useCallback(async (pdfUri: string) => {
    // For now, we'll just show an alert. In a real implementation,
    // you would use react-native-pdf or similar to display the PDF
    Alert.alert('PDF Viewer', 'PDF viewer not implemented yet');
  }, []);
  
  const sharePDF = useCallback(async (pdfUri: string) => {
    try {
      const fileName = `CV_${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}.pdf`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir CV',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el PDF');
    }
  }, [cvData.personalInfo]);
  
  const savePDF = useCallback(async (pdfUri: string) => {
    try {
      const fileName = `CV_${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}.pdf`;
      const documentsDir = FileSystem.documentDirectory;
      const localUri = `${documentsDir}${fileName}`;
      
      await FileSystem.copyAsync({
        from: pdfUri,
        to: localUri,
      });
      
      Alert.alert(
        'Guardado',
        `Tu CV ha sido guardado como ${fileName}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el PDF');
    }
  }, [cvData.personalInfo]);
  
  const toggleSection = useCallback((section: keyof PDFGenerationOptions['sections']) => {
    setPdfOptions(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section],
      },
    }));
  }, []);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: textColor,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: secondaryTextColor,
      lineHeight: 22,
    },
    templateSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
      marginBottom: 16,
    },
    templateCard: {
      backgroundColor: backgroundColor,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: primaryColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    templateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    templateInfo: {
      flex: 1,
    },
    templateName: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 4,
    },
    templateDescription: {
      fontSize: 14,
      color: secondaryTextColor,
    },
    changeTemplateButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: primaryColor,
    },
    changeTemplateText: {
      fontSize: 14,
      color: primaryColor,
      fontWeight: '500',
    },
    templateColors: {
      flexDirection: 'row',
      gap: 8,
    },
    colorDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: borderColor,
    },
    optionsSection: {
      marginBottom: 24,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: `${borderColor}20`,
      borderRadius: 8,
      marginBottom: 8,
    },
    optionLabel: {
      fontSize: 16,
      color: textColor,
    },
    optionDescription: {
      fontSize: 12,
      color: secondaryTextColor,
      marginTop: 2,
    },
    switch: {
      transform: [{ scale: 0.8 }],
    },
    generateSection: {
      marginTop: 'auto',
    },
    generateButton: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    generateButtonDisabled: {
      backgroundColor: borderColor,
      shadowOpacity: 0,
      elevation: 0,
    },
    generateButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    generateButtonTextDisabled: {
      color: secondaryTextColor,
    },
    progressContainer: {
      alignItems: 'center',
      padding: 20,
    },
    progressText: {
      fontSize: 16,
      color: textColor,
      marginBottom: 16,
    },
    progressBar: {
      width: '100%',
      height: 6,
      backgroundColor: borderColor,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: primaryColor,
      borderRadius: 3,
    },
    progressPercentage: {
      fontSize: 14,
      color: primaryColor,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: backgroundColor,
      borderRadius: 16,
      padding: 20,
      margin: 20,
      maxHeight: '80%',
      width: '90%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
      marginBottom: 16,
      textAlign: 'center',
    },
    templateOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: borderColor,
      marginBottom: 8,
    },
    templateOptionSelected: {
      backgroundColor: `${primaryColor}15`,
      borderColor: primaryColor,
    },
    templateOptionInfo: {
      flex: 1,
      marginLeft: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: borderColor,
    },
    confirmButton: {
      backgroundColor: primaryColor,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: textColor,
    },
    confirmButtonText: {
      color: '#FFFFFF',
    },
  });
  
  const completionPercentage = Math.round(
    ((cvData.personalInfo?.firstName ? 1 : 0) +
     (cvData.personalInfo?.lastName ? 1 : 0) +
     (cvData.personalInfo?.email ? 1 : 0) +
     ((cvData.education?.educationHistory?.length || 0) > 0 ? 1 : 0) +
     ((cvData.workExperience?.length || 0) > 0 ? 1 : 0) +
     ((cvData.skills?.length || 0) > 0 ? 1 : 0)) / 6 * 100
  );
  
  const canGenerate = completionPercentage >= 50 && !isGenerating;
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Generar PDF</Text>
        <Text style={styles.subtitle}>
          Personaliza tu CV y genera un PDF profesional listo para compartir
        </Text>
      </Animated.View>
      
      {/* Template Selection */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.templateSection}>
        <Text style={styles.sectionTitle}>Plantilla Seleccionada</Text>
        <View style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{selectedTemplate.name}</Text>
              <Text style={styles.templateDescription}>
                {selectedTemplate.description}
              </Text>
            </View>
            <Pressable
              style={styles.changeTemplateButton}
              onPress={() => setShowTemplateSelector(true)}
            >
              <Text style={styles.changeTemplateText}>Cambiar</Text>
            </Pressable>
          </View>
          <View style={styles.templateColors}>
            {selectedTemplate.colorScheme.map((color, index) => (
              <View
                key={index}
                style={[styles.colorDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
      
      {/* PDF Options */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>Opciones de Generación</Text>
        
        <View style={styles.optionItem}>
          <View>
            <Text style={styles.optionLabel}>Incluir Foto de Perfil</Text>
            <Text style={styles.optionDescription}>
              Agrega tu foto al CV generado
            </Text>
          </View>
          <Pressable
            style={[styles.switch, { opacity: pdfOptions.includePhoto ? 1 : 0.5 }]}
            onPress={() => setPdfOptions(prev => ({ ...prev, includePhoto: !prev.includePhoto }))}
          >
            <Ionicons
              name={pdfOptions.includePhoto ? "toggle" : "toggle-outline"}
              size={32}
              color={pdfOptions.includePhoto ? primaryColor : borderColor}
            />
          </Pressable>
        </View>
        
        {Object.entries(pdfOptions.sections).map(([section, enabled]) => (
          <View key={section} style={styles.optionItem}>
            <View>
              <Text style={styles.optionLabel}>
                Incluir {
                  section === 'education' ? 'Educación' :
                  section === 'experience' ? 'Experiencia' :
                  section === 'skills' ? 'Habilidades' :
                  section === 'projects' ? 'Proyectos' :
                  section === 'languages' ? 'Idiomas' :
                  'Enlaces Sociales'
                }
              </Text>
            </View>
            <Pressable
              style={[styles.switch, { opacity: enabled ? 1 : 0.5 }]}
              onPress={() => toggleSection(section as keyof PDFGenerationOptions['sections'])}
            >
              <Ionicons
                name={enabled ? "toggle" : "toggle-outline"}
                size={32}
                color={enabled ? primaryColor : borderColor}
              />
            </Pressable>
          </View>
        ))}
      </Animated.View>
      
      {/* Generation Progress */}
      {isGenerating && (
        <Animated.View entering={FadeInDown} style={styles.progressContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.progressText}>Generando tu CV...</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${generationProgress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>{generationProgress}%</Text>
        </Animated.View>
      )}
      
      {/* Generate Button */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.generateSection}>
        {completionPercentage < 50 && (
          <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 16 }]}>
            Completa al menos el 50% de tu CV para generar el PDF ({completionPercentage}% completado)
          </Text>
        )}
        
        <Pressable
          style={[
            styles.generateButton,
            !canGenerate && styles.generateButtonDisabled
          ]}
          onPress={canGenerate ? handleGeneratePDF : undefined}
          disabled={!canGenerate}
        >
          <Ionicons
            name="download"
            size={24}
            color={canGenerate ? '#FFFFFF' : secondaryTextColor}
          />
          <Text style={[
            styles.generateButtonText,
            !canGenerate && styles.generateButtonTextDisabled
          ]}>
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </Text>
        </Pressable>
      </Animated.View>
      
      {/* Template Selector Modal */}
      <Modal
        visible={showTemplateSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTemplateSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Plantilla</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableTemplates.map((template) => (
                <Pressable
                  key={template.id}
                  style={[
                    styles.templateOption,
                    selectedTemplate.id === template.id && styles.templateOptionSelected
                  ]}
                  onPress={() => onTemplateChange(template)}
                >
                  <View style={styles.templateColors}>
                    {template.colorScheme.map((color, index) => (
                      <View
                        key={index}
                        style={[styles.colorDot, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                  <View style={styles.templateOptionInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>
                      {template.description}
                    </Text>
                  </View>
                  {selectedTemplate.id === template.id && (
                    <Ionicons name="checkmark-circle" size={24} color={successColor} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTemplateSelector(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowTemplateSelector(false)}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                  Confirmar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
});

PDFGenerator.displayName = 'PDFGenerator';