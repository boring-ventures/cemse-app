import React, { useState, memo, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import {
  CVData,
} from '@/app/types/cv';

interface ProfessionalSummarySectionProps {
  cvData: CVData | null;
  onSummaryChange: (summary: string) => Promise<void>;
}

/**
 * Professional Summary Section Component
 * Always visible section for professional summary/bio
 * Based on CV_MANAGER_MOBILE_SPEC.md requirements
 */

const ProfessionalSummarySection: React.FC<ProfessionalSummarySectionProps> = ({
  cvData,
  onSummaryChange,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [localSummary, setLocalSummary] = useState(cvData?.professionalSummary || '');
  const [isLoading, setIsLoading] = useState(false);

  // Character limit and counter
  const maxCharacters = 500;
  const currentLength = localSummary.length;
  const remainingCharacters = maxCharacters - currentLength;

  // Handle save
  const handleSave = async () => {
    if (localSummary === cvData?.professionalSummary) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      await onSummaryChange(localSummary);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating professional summary:', error);
      // Reset to original value on error
      setLocalSummary(cvData?.professionalSummary || '');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalSummary(cvData?.professionalSummary || '');
    setIsEditing(false);
  };

  // Handle start editing
  const handleStartEditing = () => {
    setLocalSummary(cvData?.professionalSummary || '');
    setIsEditing(true);
  };

  // Placeholder text for empty summary
  const placeholderText = "Describe tu perfil profesional, experiencia clave y objetivos. Ejemplo: 'Desarrollador de software con 3 años de experiencia en React Native y TypeScript. Apasionado por crear aplicaciones móviles innovadoras y interfaces de usuario intuitivas...'";

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="person-circle-outline" size={20} color={tintColor} />
          <ThemedText style={styles.title}>Resumen Profesional</ThemedText>
        </View>
        
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleStartEditing}
          >
            <Ionicons name="pencil" size={16} color={tintColor} />
            <ThemedText style={[styles.editButtonText, { color: tintColor }]}>
              Editar
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <ThemedText style={[styles.cancelButtonText, { color: textColor }]}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: tintColor }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? 'Guardando...' : 'Guardar'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: remainingCharacters < 0 ? '#ef4444' : borderColor,
                  color: textColor,
                }
              ]}
              value={localSummary}
              onChangeText={setLocalSummary}
              placeholder={placeholderText}
              placeholderTextColor={`${textColor}60`}
              multiline
              textAlignVertical="top"
              maxLength={maxCharacters + 50} // Allow slight overflow for warning
              autoFocus
            />
            
            {/* Character Counter */}
            <View style={styles.characterCounter}>
              <ThemedText
                style={[
                  styles.characterCountText,
                  {
                    color: remainingCharacters < 0 ? '#ef4444' : 
                           remainingCharacters < 50 ? '#f59e0b' : textColor
                  }
                ]}
              >
                {currentLength}/{maxCharacters} caracteres
                {remainingCharacters < 0 && ` (${Math.abs(remainingCharacters)} de más)`}
              </ThemedText>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <ThemedText style={styles.tipsTitle}>💡 Consejos:</ThemedText>
              <ThemedText style={styles.tipsText}>
                • Menciona tu experiencia más relevante{'\n'}
                • Incluye tecnologías o habilidades clave{'\n'}
                • Describe tus objetivos profesionales{'\n'}
                • Mantén un tono profesional pero personal
              </ThemedText>
            </View>
          </>
        ) : (
          <View style={styles.displayContent}>
            {cvData?.professionalSummary ? (
              <ThemedText style={styles.summaryText}>
                {cvData.professionalSummary}
              </ThemedText>
            ) : (
              <TouchableOpacity
                style={styles.emptyState}
                onPress={handleStartEditing}
              >
                <Ionicons name="add-circle-outline" size={32} color={tintColor} />
                <ThemedText style={[styles.emptyStateTitle, { color: tintColor }]}>
                  Agregar Resumen Profesional
                </ThemedText>
                <ThemedText style={styles.emptyStateDescription}>
                  Un resumen profesional ayuda a los empleadores a conocer rápidamente tu perfil y experiencia.
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCounter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },
  displayContent: {
    minHeight: 60,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
});

export default memo(ProfessionalSummarySection);