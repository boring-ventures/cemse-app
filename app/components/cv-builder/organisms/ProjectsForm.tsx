/**
 * Projects Form Organism
 * Form for managing project entries
 */

import { Project } from '@/app/types/cv';
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

interface ProjectsFormProps {
  projects: Project[];
  onAdd: (project: Project) => void;
  onUpdate: (index: number, project: Partial<Project>) => void;
  onRemove: (index: number) => void;
}

export const ProjectsForm = React.memo<ProjectsFormProps>(({
  projects,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    technologies: [],
    startDate: '',
    endDate: '',
    isOngoing: false,
    url: '',
    repositoryUrl: '',
  });
  const [newTechnology, setNewTechnology] = useState('');
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
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      isOngoing: false,
      url: '',
      repositoryUrl: '',
    });
    setNewTechnology('');
    setValidationErrors({});
    setEditingIndex(null);
  }, []);
  
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'El nombre del proyecto es requerido';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'La descripción es requerida';
    }
    
    if (!formData.startDate?.trim()) {
      errors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!formData.isOngoing && !formData.endDate?.trim()) {
      errors.endDate = 'La fecha de fin es requerida';
    }
    
    // Validate date logic
    if (formData.startDate && formData.endDate && !formData.isOngoing) {
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
    
    const projectItem: Project = {
      id: formData.id || `proj_${Date.now()}`,
      name: formData.name || '',
      description: formData.description || '',
      technologies: formData.technologies || [],
      startDate: formData.startDate || '',
      endDate: formData.isOngoing ? 'Presente' : formData.endDate || '',
      isOngoing: formData.isOngoing || false,
      url: formData.url,
      repositoryUrl: formData.repositoryUrl,
    };
    
    if (editingIndex !== null) {
      onUpdate(editingIndex, projectItem);
    } else {
      onAdd(projectItem);
    }
    
    setShowModal(false);
    resetForm();
  }, [formData, editingIndex, validateForm, onAdd, onUpdate, resetForm]);
  
  const handleEdit = useCallback((index: number) => {
    const project = projects[index];
    setFormData({
      ...project,
      endDate: project.endDate === 'Presente' ? '' : project.endDate,
    });
    setEditingIndex(index);
    setShowModal(true);
  }, [projects]);
  
  const handleRemove = useCallback((index: number) => {
    Alert.alert(
      'Eliminar proyecto',
      '¿Estás seguro de que quieres eliminar este proyecto?',
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
  
  const handleAddTechnology = useCallback(() => {
    if (newTechnology.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), newTechnology.trim()],
      }));
      setNewTechnology('');
    }
  }, [newTechnology]);
  
  const handleRemoveTechnology = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || [],
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
    projectItem: {
      marginBottom: 4,
    },
    projectDates: {
      fontSize: 13,
      color: secondaryTextColor,
      marginTop: 2,
    },
    projectDescription: {
      fontSize: 14,
      color: textColor,
      marginTop: 8,
      lineHeight: 20,
    },
    projectLinks: {
      marginTop: 8,
      flexDirection: 'row',
      gap: 16,
    },
    projectLink: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    projectLinkText: {
      fontSize: 12,
      color: primaryColor,
      marginLeft: 4,
    },
  });
  
  return (
    <View style={styles.container}>
      <DynamicFormArray
        items={projects}
        onAdd={handleAddNew}
        onRemove={handleRemove}
        onEdit={handleEdit}
        emptyMessage="No has agregado proyectos"
        addButtonText="Agregar Proyecto"
        itemTitle={(item) => item.name}
        itemSubtitle={(item) => `${formatDate(item.startDate)} - ${item.isOngoing ? 'Presente' : formatDate(item.endDate || '')}`}
        renderItem={(item) => (
          <View style={styles.projectItem}>
            <Text style={styles.projectDates}>
              {formatDate(item.startDate)} - {item.isOngoing ? 'Presente' : formatDate(item.endDate || '')}
            </Text>
            {item.description && (
              <Text style={styles.projectDescription}>
                {item.description}
              </Text>
            )}
            {item.technologies && item.technologies.length > 0 && (
              <View style={styles.tagContainer}>
                {item.technologies.map((tech, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tech}</Text>
                  </View>
                ))}
              </View>
            )}
            {(item.url || item.repositoryUrl) && (
              <View style={styles.projectLinks}>
                {item.url && (
                  <View style={styles.projectLink}>
                    <Ionicons name="link" size={14} color={primaryColor} />
                    <Text style={styles.projectLinkText}>Demo</Text>
                  </View>
                )}
                {item.repositoryUrl && (
                  <View style={styles.projectLink}>
                    <Ionicons name="logo-github" size={14} color={primaryColor} />
                    <Text style={styles.projectLinkText}>Código</Text>
                  </View>
                )}
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
                {editingIndex !== null ? 'Editar' : 'Agregar'} Proyecto
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
                    label="Nombre del Proyecto"
                    value={formData.name || ''}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Ej: App Móvil E-commerce"
                    required
                    error={validationErrors.name}
                    maxLength={100}
                  />
                  
                  <CVFormField
                    label="Descripción"
                    value={formData.description || ''}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Describe el proyecto, tu rol y los resultados obtenidos..."
                    multiline
                    numberOfLines={4}
                    required
                    error={validationErrors.description}
                    maxLength={500}
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
                    
                    {!formData.isOngoing && (
                      <View style={styles.halfWidth}>
                        <CVFormField
                          label="Fecha de Fin"
                          value={formData.endDate || ''}
                          onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                          placeholder="MM/AAAA"
                          required={!formData.isOngoing}
                          error={validationErrors.endDate}
                          maxLength={10}
                        />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>
                      Proyecto en curso
                    </Text>
                    <Switch
                      value={formData.isOngoing}
                      onValueChange={(value) => setFormData({ ...formData, isOngoing: value })}
                      trackColor={{ false: borderColor, true: primaryColor }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  
                  <Text style={styles.sectionLabel}>Tecnologías Utilizadas</Text>
                  <View style={styles.tagInput}>
                    <TextInput
                      style={styles.tagInputField}
                      value={newTechnology}
                      onChangeText={setNewTechnology}
                      placeholder="Agregar tecnología..."
                      placeholderTextColor={secondaryTextColor}
                    />
                    <Pressable
                      style={styles.addTagButton}
                      onPress={handleAddTechnology}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                  {formData.technologies && formData.technologies.length > 0 && (
                    <View style={styles.tagContainer}>
                      {formData.technologies.map((tech, idx) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{tech}</Text>
                          <Pressable
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveTechnology(idx)}
                          >
                            <Ionicons name="close-circle" size={16} color={errorColor} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <CVFormField
                    label="URL del Proyecto (Opcional)"
                    value={formData.url || ''}
                    onChangeText={(text) => setFormData({ ...formData, url: text })}
                    placeholder="https://mi-proyecto.com"
                    keyboardType="default"
                    autoCapitalize="none"
                    maxLength={200}
                  />
                  
                  <CVFormField
                    label="Repositorio de Código (Opcional)"
                    value={formData.repositoryUrl || ''}
                    onChangeText={(text) => setFormData({ ...formData, repositoryUrl: text })}
                    placeholder="https://github.com/usuario/proyecto"
                    keyboardType="default"
                    autoCapitalize="none"
                    maxLength={200}
                  />
                  
                  <Pressable
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingIndex !== null ? 'Actualizar' : 'Agregar'} Proyecto
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

ProjectsForm.displayName = 'ProjectsForm';