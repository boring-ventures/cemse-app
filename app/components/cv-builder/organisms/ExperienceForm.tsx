/**
 * Experience Form Organism
 * Form for managing work experience entries
 */

import { WorkExperience } from '@/app/types/cv';
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
  Alert,
  TextInput
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ExperienceFormProps {
  workExperience: WorkExperience[];
  onAdd: (experience: WorkExperience) => void;
  onUpdate: (index: number, experience: Partial<WorkExperience>) => void;
  onRemove: (index: number) => void;
}

export const ExperienceForm = React.memo<ExperienceFormProps>(({
  workExperience,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkExperience>>({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrentJob: false,
    description: '',
    achievements: [],
    skills: [],
  });
  const [newAchievement, setNewAchievement] = useState('');
  const [newSkill, setNewSkill] = useState('');
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
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      description: '',
      achievements: [],
      skills: [],
    });
    setNewAchievement('');
    setNewSkill('');
    setValidationErrors({});
    setEditingIndex(null);
  }, []);
  
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.jobTitle?.trim()) {
      errors.jobTitle = 'El cargo es requerido';
    }
    
    if (!formData.company?.trim()) {
      errors.company = 'La empresa es requerida';
    }
    
    if (!formData.location?.trim()) {
      errors.location = 'La ubicación es requerida';
    }
    
    if (!formData.startDate?.trim()) {
      errors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!formData.isCurrentJob && !formData.endDate?.trim()) {
      errors.endDate = 'La fecha de fin es requerida';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'La descripción es requerida';
    }
    
    // Validate date logic
    if (formData.startDate && formData.endDate && !formData.isCurrentJob) {
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
    
    const experienceItem: WorkExperience = {
      id: formData.id || `exp_${Date.now()}`,
      jobTitle: formData.jobTitle || '',
      company: formData.company || '',
      location: formData.location || '',
      startDate: formData.startDate || '',
      endDate: formData.isCurrentJob ? 'Presente' : formData.endDate || '',
      isCurrentJob: formData.isCurrentJob || false,
      description: formData.description || '',
      achievements: formData.achievements || [],
      skills: formData.skills || [],
    };
    
    if (editingIndex !== null) {
      onUpdate(editingIndex, experienceItem);
    } else {
      onAdd(experienceItem);
    }
    
    setShowModal(false);
    resetForm();
  }, [formData, editingIndex, validateForm, onAdd, onUpdate, resetForm]);
  
  const handleEdit = useCallback((index: number) => {
    const experience = workExperience[index];
    setFormData({
      ...experience,
      endDate: experience.endDate === 'Presente' ? '' : experience.endDate,
    });
    setEditingIndex(index);
    setShowModal(true);
  }, [workExperience]);
  
  const handleRemove = useCallback((index: number) => {
    Alert.alert(
      'Eliminar experiencia',
      '¿Estás seguro de que quieres eliminar este registro de experiencia?',
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
  
  const handleAddAchievement = useCallback(() => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()],
      }));
      setNewAchievement('');
    }
  }, [newAchievement]);
  
  const handleRemoveAchievement = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements?.filter((_, i) => i !== index) || [],
    }));
  }, []);
  
  const handleAddSkill = useCallback(() => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill('');
    }
  }, [newSkill]);
  
  const handleRemoveSkill = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || [],
    }));
  }, []);
  
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
    tagInput: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    tagInputField: {
      flex: 1,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: textColor,
    },
    addTagButton: {
      backgroundColor: primaryColor,
      borderRadius: 8,
      padding: 8,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${primaryColor}15`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 14,
      color: primaryColor,
      marginRight: 8,
    },
    removeTagButton: {
      padding: 2,
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
      marginTop: 16,
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
    experienceItem: {
      marginBottom: 4,
    },
    experienceDates: {
      fontSize: 13,
      color: secondaryTextColor,
      marginTop: 2,
    },
    experienceLocation: {
      fontSize: 13,
      color: secondaryTextColor,
      marginTop: 2,
    },
    experienceDescription: {
      fontSize: 14,
      color: textColor,
      marginTop: 8,
      lineHeight: 20,
    },
    bulletPoint: {
      fontSize: 14,
      color: textColor,
      marginTop: 4,
      paddingLeft: 16,
    },
  });
  
  return (
    <View style={styles.container}>
      <DynamicFormArray
        items={workExperience}
        onAdd={handleAddNew}
        onRemove={handleRemove}
        onEdit={handleEdit}
        emptyMessage="No has agregado experiencia laboral"
        addButtonText="Agregar Experiencia"
        itemTitle={(item) => item.jobTitle}
        itemSubtitle={(item) => `${item.company} • ${item.location}`}
        renderItem={(item) => (
          <View style={styles.experienceItem}>
            <Text style={styles.experienceDates}>
              {formatDate(item.startDate)} - {item.isCurrentJob ? 'Presente' : formatDate(item.endDate)}
            </Text>
            {item.description && (
              <Text style={styles.experienceDescription}>
                {item.description}
              </Text>
            )}
            {item.achievements && item.achievements.length > 0 && (
              <View style={{ marginTop: 8 }}>
                {item.achievements.map((achievement, idx) => (
                  <Text key={idx} style={styles.bulletPoint}>
                    • {achievement}
                  </Text>
                ))}
              </View>
            )}
            {item.skills && item.skills.length > 0 && (
              <View style={styles.tagContainer}>
                {item.skills.map((skill, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
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
                {editingIndex !== null ? 'Editar' : 'Agregar'} Experiencia
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
                    label="Cargo"
                    value={formData.jobTitle || ''}
                    onChangeText={(text) => setFormData({ ...formData, jobTitle: text })}
                    placeholder="Ej: Desarrollador Full Stack"
                    required
                    error={validationErrors.jobTitle}
                    maxLength={100}
                  />
                  
                  <CVFormField
                    label="Empresa"
                    value={formData.company || ''}
                    onChangeText={(text) => setFormData({ ...formData, company: text })}
                    placeholder="Nombre de la empresa"
                    required
                    error={validationErrors.company}
                    maxLength={100}
                  />
                  
                  <CVFormField
                    label="Ubicación"
                    value={formData.location || ''}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="Ciudad, País"
                    required
                    error={validationErrors.location}
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
                    
                    {!formData.isCurrentJob && (
                      <View style={styles.halfWidth}>
                        <CVFormField
                          label="Fecha de Fin"
                          value={formData.endDate || ''}
                          onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                          placeholder="MM/AAAA"
                          required={!formData.isCurrentJob}
                          error={validationErrors.endDate}
                          maxLength={10}
                        />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>
                      Trabajo actual
                    </Text>
                    <Switch
                      value={formData.isCurrentJob}
                      onValueChange={(value) => setFormData({ ...formData, isCurrentJob: value })}
                      trackColor={{ false: borderColor, true: primaryColor }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  
                  <CVFormField
                    label="Descripción del Cargo"
                    value={formData.description || ''}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Describe tus responsabilidades principales..."
                    multiline
                    numberOfLines={4}
                    required
                    error={validationErrors.description}
                    maxLength={500}
                  />
                  
                  <Text style={styles.sectionLabel}>Logros (Opcional)</Text>
                  <View style={styles.tagInput}>
                    <TextInput
                      style={styles.tagInputField}
                      value={newAchievement}
                      onChangeText={setNewAchievement}
                      placeholder="Agregar logro..."
                      placeholderTextColor={secondaryTextColor}
                    />
                    <Pressable
                      style={styles.addTagButton}
                      onPress={handleAddAchievement}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                  {formData.achievements && formData.achievements.length > 0 && (
                    <View style={styles.tagContainer}>
                      {formData.achievements.map((achievement, idx) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{achievement}</Text>
                          <Pressable
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveAchievement(idx)}
                          >
                            <Ionicons name="close-circle" size={16} color={errorColor} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <Text style={styles.sectionLabel}>Habilidades Utilizadas (Opcional)</Text>
                  <View style={styles.tagInput}>
                    <TextInput
                      style={styles.tagInputField}
                      value={newSkill}
                      onChangeText={setNewSkill}
                      placeholder="Agregar habilidad..."
                      placeholderTextColor={secondaryTextColor}
                    />
                    <Pressable
                      style={styles.addTagButton}
                      onPress={handleAddSkill}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                  {formData.skills && formData.skills.length > 0 && (
                    <View style={styles.tagContainer}>
                      {formData.skills.map((skill, idx) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{skill}</Text>
                          <Pressable
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveSkill(idx)}
                          >
                            <Ionicons name="close-circle" size={16} color={errorColor} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <Pressable
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingIndex !== null ? 'Actualizar' : 'Agregar'} Experiencia
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

ExperienceForm.displayName = 'ExperienceForm';