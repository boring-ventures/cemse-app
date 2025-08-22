/**
 * Languages Form Organism
 * Form for managing language skills with proficiency levels
 */

import { Language } from '@/app/types/cv';
import { CVFormField } from '../atoms/CVFormField';
import { DynamicFormArray } from '../molecules/DynamicFormArray';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface LanguagesFormProps {
  languages: Language[];
  onAdd: (language: Language) => void;
  onUpdate: (index: number, language: Partial<Language>) => void;
  onRemove: (index: number) => void;
}

const PROFICIENCY_LEVELS: Language['proficiency'][] = ['Basic', 'Conversational', 'Fluent', 'Native'];

const PROFICIENCY_DESCRIPTIONS = {
  'Basic': 'Conocimientos básicos del idioma',
  'Conversational': 'Puedo mantener conversaciones simples',
  'Fluent': 'Dominio avanzado del idioma',
  'Native': 'Idioma materno o bilingüe'
};

const PROFICIENCY_COLORS = {
  'Basic': '#FF9500',
  'Conversational': '#007AFF',
  'Fluent': '#34C759',
  'Native': '#AF52DE'
};

export const LanguagesForm = React.memo<LanguagesFormProps>(({
  languages,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Language>>({
    language: '',
    proficiency: 'Conversational',
    certifications: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const errorColor = '#FF3B30';
  
  const resetForm = useCallback(() => {
    setFormData({
      language: '',
      proficiency: 'Conversational',
      certifications: [],
    });
    setValidationErrors({});
    setEditingIndex(null);
  }, []);
  
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.language?.trim()) {
      errors.language = 'El idioma es requerido';
    } else if (languages.some((lang, index) => 
      lang.language.toLowerCase() === formData.language?.trim().toLowerCase() && 
      index !== editingIndex
    )) {
      errors.language = 'Este idioma ya está agregado';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, languages, editingIndex]);
  
  const handleSave = useCallback(() => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const languageItem: Language = {
      id: formData.id || `lang_${Date.now()}`,
      language: formData.language?.trim() || '',
      proficiency: formData.proficiency || 'Conversational',
      certifications: formData.certifications || [],
    };
    
    if (editingIndex !== null) {
      onUpdate(editingIndex, languageItem);
    } else {
      onAdd(languageItem);
    }
    
    setShowModal(false);
    resetForm();
  }, [formData, editingIndex, validateForm, onAdd, onUpdate, resetForm]);
  
  const handleEdit = useCallback((index: number) => {
    const language = languages[index];
    setFormData({ ...language });
    setEditingIndex(index);
    setShowModal(true);
  }, [languages]);
  
  const handleRemove = useCallback((index: number) => {
    Alert.alert(
      'Eliminar idioma',
      '¿Estás seguro de que quieres eliminar este idioma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onRemove(index);
          }
        }
      ]
    );
  }, [onRemove]);
  
  const handleAddNew = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);
  
  const getProficiencyColor = (proficiency: Language['proficiency']) => {
    return PROFICIENCY_COLORS[proficiency];
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: secondaryTextColor,
      lineHeight: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: backgroundColor,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
    },
    closeButton: {
      padding: 8,
    },
    modalScrollContent: {
      padding: 20,
    },
    proficiencyOptions: {
      gap: 8,
      marginBottom: 16,
    },
    proficiencyOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: borderColor,
    },
    proficiencyOptionSelected: {
      backgroundColor: `${primaryColor}15`,
      borderColor: primaryColor,
    },
    proficiencyIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    proficiencyInfo: {
      flex: 1,
    },
    proficiencyLevel: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 4,
    },
    proficiencyDescription: {
      fontSize: 14,
      color: secondaryTextColor,
    },
    checkIcon: {
      marginLeft: 8,
    },
    saveButton: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
      marginTop: 16,
    },
    languageItem: {
      marginBottom: 4,
    },
    languageProficiency: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    proficiencyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    proficiencyBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    certificationsText: {
      fontSize: 12,
      color: secondaryTextColor,
      marginTop: 4,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: secondaryTextColor,
      textAlign: 'center',
      lineHeight: 20,
    },
    addButton: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });
  
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <Text style={styles.title}>Idiomas</Text>
        <Text style={styles.subtitle}>
          Agrega los idiomas que dominas y tu nivel de competencia en cada uno
        </Text>
      </Animated.View>
      
      {languages.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.emptyState}>
          <Ionicons 
            name="language" 
            size={64} 
            color={secondaryTextColor} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No hay idiomas agregados</Text>
          <Text style={styles.emptyText}>
            Agrega los idiomas que conoces para destacar tus habilidades de comunicación
          </Text>
        </Animated.View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <DynamicFormArray
            items={languages}
            onAdd={handleAddNew}
            onRemove={handleRemove}
            onEdit={handleEdit}
            emptyMessage="No has agregado idiomas"
            addButtonText="Agregar Idioma"
            itemTitle={(item) => item.language}
            itemSubtitle={(item) => PROFICIENCY_DESCRIPTIONS[item.proficiency]}
            renderItem={(item) => (
              <View style={styles.languageItem}>
                <View style={styles.languageProficiency}>
                  <View style={[
                    styles.proficiencyBadge,
                    { backgroundColor: getProficiencyColor(item.proficiency) }
                  ]}>
                    <Text style={styles.proficiencyBadgeText}>
                      {item.proficiency === 'Basic' ? 'Básico' :
                       item.proficiency === 'Conversational' ? 'Conversacional' :
                       item.proficiency === 'Fluent' ? 'Fluido' :
                       'Nativo'}
                    </Text>
                  </View>
                </View>
                {item.certifications && item.certifications.length > 0 && (
                  <Text style={styles.certificationsText}>
                    Certificaciones: {item.certifications.join(', ')}
                  </Text>
                )}
              </View>
            )}
          />
        </ScrollView>
      )}
      
      {languages.length === 0 && (
        <Pressable
          style={styles.addButton}
          onPress={handleAddNew}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Agregar Primer Idioma</Text>
        </Pressable>
      )}
      
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIndex !== null ? 'Editar' : 'Agregar'} Idioma
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </Pressable>
            </View>
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <CVFormField
                  label="Idioma"
                  value={formData.language || ''}
                  onChangeText={(text) => setFormData({ ...formData, language: text })}
                  placeholder="Ej: Inglés, Francés, Alemán..."
                  required
                  error={validationErrors.language}
                  maxLength={50}
                />
                
                <Text style={styles.sectionLabel}>Nivel de Competencia</Text>
                <View style={styles.proficiencyOptions}>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.proficiencyOption,
                        formData.proficiency === level && styles.proficiencyOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, proficiency: level })}
                    >
                      <View style={[
                        styles.proficiencyIndicator,
                        { backgroundColor: getProficiencyColor(level) }
                      ]} />
                      
                      <View style={styles.proficiencyInfo}>
                        <Text style={styles.proficiencyLevel}>
                          {level === 'Basic' ? 'Básico' :
                           level === 'Conversational' ? 'Conversacional' :
                           level === 'Fluent' ? 'Fluido' :
                           'Nativo'}
                        </Text>
                        <Text style={styles.proficiencyDescription}>
                          {PROFICIENCY_DESCRIPTIONS[level]}
                        </Text>
                      </View>
                      
                      {formData.proficiency === level && (
                        <Ionicons 
                          name="checkmark-circle" 
                          size={24} 
                          color={primaryColor}
                          style={styles.checkIcon}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
                
                <Pressable
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {editingIndex !== null ? 'Actualizar' : 'Agregar'} Idioma
                  </Text>
                </Pressable>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
});

LanguagesForm.displayName = 'LanguagesForm';