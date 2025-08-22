import React, { useState, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CVFormField } from './CVFormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import CollapsibleSection from './CollapsibleSection';
import DynamicList from './DynamicList';
import EditModal from './EditModal';
import {
  CVData,
  Language,
} from '@/app/types/cv';

interface LanguagesSectionProps {
  cvData: CVData | null;
  onLanguagesChange: (languages: Language[]) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Languages Section Component
 * Allows users to add their language skills with proficiency levels
 * Based on CV_MANAGER_MOBILE_SPEC.md requirements
 */

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  cvData,
  onLanguagesChange,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const languages = cvData?.languages || [];

  // Modal state for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Language | null>(null);

  // Language proficiency options
  const proficiencyLevels = [
    { value: 'Nativo', label: 'Nativo' },
    { value: 'Avanzado', label: 'Avanzado' },
    { value: 'Intermedio', label: 'Intermedio' },
    { value: 'Principiante', label: 'Principiante' },
  ];

  // Language Form Component
  const LanguageForm: React.FC<{
    onSubmit?: (item: Language) => void;
    onCancel?: () => void;
    initialData?: Language;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<Language>(
      initialData || {
        name: '',
        proficiency: 'Intermedio',
      }
    );

    const handleSubmit = () => {
      if (formData.name.trim()) {
        onSubmit?.(formData);
      } else {
        Alert.alert('Error', 'Por favor ingresa el nombre del idioma');
      }
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Idioma"
          value={formData.name}
          onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Ej. Inglés, Francés, Quechua"
        />
        
        <ThemedText style={styles.fieldLabel}>Nivel de Competencia</ThemedText>
        <View style={styles.proficiencyContainer}>
          {proficiencyLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.proficiencyOption,
                {
                  borderColor: formData.proficiency === level.value ? tintColor : borderColor,
                  backgroundColor: formData.proficiency === level.value ? `${tintColor}20` : 'transparent'
                }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, proficiency: level.value }))}
            >
              <ThemedText
                style={[
                  styles.proficiencyText,
                  { color: formData.proficiency === level.value ? tintColor : textColor }
                ]}
              >
                {level.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.formActions}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor }]}
              onPress={onCancel}
            >
              <ThemedText style={[styles.cancelButtonText, { color: textColor }]}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Actualizar' : 'Agregar'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render language item
  const renderLanguageItem = (language: Language, index: number) => (
    <View key={index} style={[styles.languageItem, { borderColor }]}>
      <View style={styles.languageInfo}>
        <ThemedText style={styles.languageName}>{language.name}</ThemedText>
        <View style={[styles.proficiencyBadge, { backgroundColor: `${tintColor}20` }]}>
          <ThemedText style={[styles.proficiencyBadgeText, { color: tintColor }]}>
            {language.proficiency}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.languageActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditLanguage(index)}
        >
          <Ionicons name="pencil" size={16} color={tintColor} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteLanguage(index)}
        >
          <Ionicons name="trash" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Handle add language
  const handleAddLanguage = async (newLanguage: Language) => {
    try {
      const updatedLanguages = [...languages, newLanguage];
      await onLanguagesChange(updatedLanguages);
    } catch (error) {
      console.error('Error adding language:', error);
      Alert.alert('Error', 'No se pudo agregar el idioma');
    }
  };

  // Handle edit language
  const handleEditLanguage = (index: number) => {
    const language = languages[index];
    if (language) {
      setEditingItem(language);
      setEditingIndex(index);
      setShowEditModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (updatedLanguage: Language) => {
    if (editingIndex !== null) {
      try {
        const updatedLanguages = [...languages];
        updatedLanguages[editingIndex] = updatedLanguage;
        await onLanguagesChange(updatedLanguages);
        handleCloseEditModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating language:', error);
        Alert.alert('Error', 'No se pudo actualizar el idioma');
      }
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingIndex(null);
    setEditingItem(null);
  };

  // Handle delete language
  const handleDeleteLanguage = async (index: number) => {
    try {
      Alert.alert(
        'Eliminar Idioma',
        '¿Estás seguro de que quieres eliminar este idioma?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const updatedLanguages = languages.filter((_, i) => i !== index);
              await onLanguagesChange(updatedLanguages);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting language:', error);
      Alert.alert('Error', 'No se pudo eliminar el idioma');
    }
  };

  return (
    <>
      <CollapsibleSection
        title="Idiomas"
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        icon={<Ionicons name="language" size={20} color={tintColor} />}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.description}>
            Agrega los idiomas que hablas y tu nivel de competencia en cada uno.
          </ThemedText>

          {/* Languages List */}
          {languages.length > 0 && (
            <View style={styles.languagesList}>
              {languages.map((language, index) => renderLanguageItem(language, index))}
            </View>
          )}

          {/* Add Language Form */}
          <DynamicList
            data={[]}
            title="Agregar Idioma"
            addButtonText="Agregar Idioma"
            renderAddForm={() => (
              <LanguageForm onSubmit={handleAddLanguage} />
            )}
            renderItem={() => null}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            emptyMessage="No has agregado ningún idioma aún. Agrega los idiomas que conoces para destacar en tu CV."
          />
        </ThemedView>
      </CollapsibleSection>

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        title="Editar Idioma"
        onClose={handleCloseEditModal}
      >
        {editingItem && (
          <LanguageForm
            onSubmit={handleEditSubmit}
            onCancel={handleCloseEditModal}
            initialData={editingItem}
            isEditing={true}
          />
        )}
      </EditModal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  languagesList: {
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  proficiencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proficiencyBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  languageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  formContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  proficiencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  proficiencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  proficiencyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default memo(LanguagesSection);