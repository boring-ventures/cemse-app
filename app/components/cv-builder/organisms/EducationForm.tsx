/**
 * Education Form Organism
 * Form for managing education history entries
 */

import { EducationItem } from '@/app/types/cv';
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
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface EducationFormProps {
  educationHistory: EducationItem[];
  onAdd: (education: EducationItem) => void;
  onUpdate: (index: number, education: Partial<EducationItem>) => void;
  onRemove: (index: number) => void;
}

export const EducationForm = React.memo<EducationFormProps>(({
  educationHistory,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<EducationItem>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrentlyStudying: false,
    description: '',
    gpa: '',
    achievements: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const errorColor = '#FF3B30';
  const successColor = '#34C759';
  
  const resetForm = useCallback(() => {
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
      description: '',
      gpa: '',
      achievements: [],
    });
    setValidationErrors({});
    setEditingIndex(null);
  }, []);
  
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.institution?.trim()) {
      errors.institution = 'La institución es requerida';
    }
    
    if (!formData.degree?.trim()) {
      errors.degree = 'El título es requerido';
    }
    
    if (!formData.fieldOfStudy?.trim()) {
      errors.fieldOfStudy = 'El campo de estudio es requerido';
    }
    
    if (!formData.startDate?.trim()) {
      errors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!formData.isCurrentlyStudying && !formData.endDate?.trim()) {
      errors.endDate = 'La fecha de fin es requerida';
    }
    
    // Validate date logic
    if (formData.startDate && formData.endDate && !formData.isCurrentlyStudying) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  const handleSave = useCallback(() => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const educationItem: EducationItem = {
      id: formData.id || `edu_${Date.now()}`,
      institution: formData.institution || '',
      degree: formData.degree || '',
      fieldOfStudy: formData.fieldOfStudy || '',
      startDate: formData.startDate || '',
      endDate: formData.isCurrentlyStudying ? 'Presente' : formData.endDate || '',
      isCurrentlyStudying: formData.isCurrentlyStudying || false,
      description: formData.description,
      gpa: formData.gpa,
      achievements: formData.achievements,
    };
    
    if (editingIndex !== null) {
      onUpdate(editingIndex, educationItem);
    } else {
      onAdd(educationItem);
    }
    
    setShowModal(false);
    resetForm();
  }, [formData, editingIndex, validateForm, onAdd, onUpdate, resetForm]);
  
  const handleEdit = useCallback((index: number) => {
    const education = educationHistory[index];
    setFormData({
      ...education,
      endDate: education.endDate === 'Presente' ? '' : education.endDate,
    });
    setEditingIndex(index);
    setShowModal(true);
  }, [educationHistory]);
  
  const handleRemove = useCallback((index: number) => {
    Alert.alert(
      'Eliminar educación',
      '¿Estás seguro de que quieres eliminar este registro de educación?',
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
  
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === 'Presente') return dateString;
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
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      flex: 1,
      backgroundColor: backgroundColor,
      marginTop: 50,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
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
    formSection: {
      marginBottom: 24,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: `${borderColor}30`,
      borderRadius: 12,
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: textColor,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    achievementInput: {
      marginBottom: 8,
    },
    achievementChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${primaryColor}15`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    achievementText: {
      fontSize: 14,
      color: primaryColor,
      marginRight: 8,
    },
    achievementsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    saveButton: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 40,
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    educationItem: {
      marginBottom: 4,
    },
    educationDates: {
      fontSize: 13,
      color: secondaryTextColor,
      marginTop: 2,
    },
    educationGpa: {
      fontSize: 13,
      color: successColor,
      fontWeight: '500',
      marginTop: 4,
    },
    educationDescription: {
      fontSize: 14,
      color: textColor,
      marginTop: 8,
      lineHeight: 20,
    },
  });
  
  return (
    <View style={styles.container}>
      <DynamicFormArray
        items={educationHistory}
        onAdd={handleAddNew}
        onRemove={handleRemove}
        onEdit={handleEdit}
        emptyMessage="No has agregado información de educación"
        addButtonText="Agregar Educación"
        itemTitle={(item) => `${item.degree} en ${item.fieldOfStudy}`}
        itemSubtitle={(item) => item.institution}
        renderItem={(item) => (
          <View style={styles.educationItem}>
            <Text style={styles.educationDates}>
              {formatDate(item.startDate)} - {item.isCurrentlyStudying ? 'Presente' : formatDate(item.endDate)}
            </Text>
            {item.gpa && (
              <Text style={styles.educationGpa}>
                GPA: {item.gpa}
              </Text>
            )}
            {item.description && (
              <Text style={styles.educationDescription}>
                {item.description}
              </Text>
            )}
            {item.achievements && item.achievements.length > 0 && (
              <View style={styles.achievementsContainer}>
                {item.achievements.map((achievement, idx) => (
                  <View key={idx} style={styles.achievementChip}>
                    <Text style={styles.achievementText}>{achievement}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
      
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
                {editingIndex !== null ? 'Editar' : 'Agregar'} Educación
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
                <Animated.View entering={FadeInDown.springify()}>
                  <CVFormField
                    label="Institución Educativa"
                    value={formData.institution || ''}
                    onChangeText={(text) => setFormData({ ...formData, institution: text })}
                    placeholder="Universidad, Instituto, etc."
                    required
                    error={validationErrors.institution}
                    maxLength={100}
                  />
                  
                  <CVFormField
                    label="Título o Grado"
                    value={formData.degree || ''}
                    onChangeText={(text) => setFormData({ ...formData, degree: text })}
                    placeholder="Ej: Licenciatura, Técnico, etc."
                    required
                    error={validationErrors.degree}
                    maxLength={100}
                  />
                  
                  <CVFormField
                    label="Campo de Estudio"
                    value={formData.fieldOfStudy || ''}
                    onChangeText={(text) => setFormData({ ...formData, fieldOfStudy: text })}
                    placeholder="Ej: Ingeniería Informática"
                    required
                    error={validationErrors.fieldOfStudy}
                    maxLength={100}
                  />
                  
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <CVFormField
                        label="Fecha de Inicio"
                        value={formData.startDate || ''}
                        onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                        placeholder="MM/AAAA"
                        required
                        error={validationErrors.startDate}
                        maxLength={10}
                      />
                    </View>
                    
                    {!formData.isCurrentlyStudying && (
                      <View style={styles.halfWidth}>
                        <CVFormField
                          label="Fecha de Fin"
                          value={formData.endDate || ''}
                          onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                          placeholder="MM/AAAA"
                          required={!formData.isCurrentlyStudying}
                          error={validationErrors.endDate}
                          maxLength={10}
                        />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>
                      Actualmente estudiando aquí
                    </Text>
                    <Switch
                      value={formData.isCurrentlyStudying}
                      onValueChange={(value) => setFormData({ ...formData, isCurrentlyStudying: value })}
                      trackColor={{ false: borderColor, true: primaryColor }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  
                  <CVFormField
                    label="GPA / Promedio (Opcional)"
                    value={formData.gpa || ''}
                    onChangeText={(text) => setFormData({ ...formData, gpa: text })}
                    placeholder="Ej: 6.5 / 7.0"
                    maxLength={20}
                  />
                  
                  <CVFormField
                    label="Descripción (Opcional)"
                    value={formData.description || ''}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Describe tu experiencia educativa, proyectos destacados, etc."
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                  
                  <Pressable
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingIndex !== null ? 'Actualizar' : 'Agregar'} Educación
                    </Text>
                  </Pressable>
                </Animated.View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
});

EducationForm.displayName = 'EducationForm';