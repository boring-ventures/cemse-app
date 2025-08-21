import React, { useState } from 'react';
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
  WorkExperience,
} from '@/app/types/cv';

interface WorkExperienceSectionProps {
  cvData: CVData | null;
  onWorkExperienceChange: (workExperience: WorkExperience[]) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Work Experience Section Component
 * Allows users to add their professional work experience
 * Based on CV_MANAGER_MOBILE_SPEC.md requirements
 */

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  cvData,
  onWorkExperienceChange,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const workExperience = cvData?.workExperience || [];

  // Modal state for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<WorkExperience | null>(null);

  // Work Experience Form Component
  const WorkExperienceForm: React.FC<{
    onSubmit?: (item: WorkExperience) => void;
    onCancel?: () => void;
    initialData?: WorkExperience;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<WorkExperience>(
      initialData || {
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
      }
    );

    const [isCurrentJob, setIsCurrentJob] = useState(
      initialData ? !initialData.endDate : false
    );

    const handleSubmit = () => {
      if (!formData.jobTitle.trim() || !formData.company.trim() || !formData.startDate.trim()) {
        Alert.alert('Error', 'Por favor completa al menos el título del trabajo, empresa y fecha de inicio');
        return;
      }

      const workData: WorkExperience = {
        ...formData,
        endDate: isCurrentJob ? '' : formData.endDate,
      };

      onSubmit?.(workData);
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Título del Trabajo"
          value={formData.jobTitle}
          onChangeText={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}
          placeholder="Ej. Desarrollador Frontend, Asistente de Marketing"
        />
        
        <CVFormField
          label="Empresa"
          value={formData.company}
          onChangeText={(value) => setFormData(prev => ({ ...prev, company: value }))}
          placeholder="Ej. Tech Solutions Bolivia, Startup ABC"
        />
        
        <View style={styles.dateContainer}>
          <View style={styles.dateColumn}>
            <CVFormField
              label="Fecha de Inicio"
              value={formData.startDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
              placeholder="MM/AAAA"
            />
          </View>
          
          <View style={styles.dateColumn}>
            <CVFormField
              label="Fecha de Fin"
              value={isCurrentJob ? 'Actualidad' : formData.endDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              placeholder="MM/AAAA"
              editable={!isCurrentJob}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.currentJobToggle}
          onPress={() => {
            setIsCurrentJob(!isCurrentJob);
            if (!isCurrentJob) {
              setFormData(prev => ({ ...prev, endDate: '' }));
            }
          }}
        >
          <Ionicons
            name={isCurrentJob ? 'checkbox' : 'square-outline'}
            size={20}
            color={tintColor}
          />
          <ThemedText style={styles.currentJobText}>
            Trabajo actual
          </ThemedText>
        </TouchableOpacity>
        
        <CVFormField
          label="Descripción"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Describe tus responsabilidades principales, logros y tecnologías utilizadas. Ej: Desarrollé aplicaciones móviles usando React Native, lideré un equipo de 3 personas, incrementé la eficiencia en 20%"
          multiline
          numberOfLines={4}
        />

        <View style={styles.tipsContainer}>
          <ThemedText style={styles.tipsTitle}>💡 Consejos para una buena descripción:</ThemedText>
          <ThemedText style={styles.tipsText}>
            • Usa verbos de acción (desarrollé, lideré, implementé){'\n'}
            • Incluye números y resultados específicos{'\n'}
            • Menciona tecnologías y herramientas relevantes{'\n'}
            • Enfócate en logros, no solo responsabilidades
          </ThemedText>
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

  // Render work experience item
  const renderWorkExperienceItem = (experience: WorkExperience, index: number) => {
    const formatDateRange = () => {
      const start = experience.startDate;
      const end = experience.endDate || 'Actualidad';
      return `${start} - ${end}`;
    };

    const isCurrentPosition = !experience.endDate;

    return (
      <View key={index} style={[styles.experienceItem, { borderColor }]}>
        <View style={styles.experienceHeader}>
          <View style={styles.experienceTitleContainer}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.jobTitle}>{experience.jobTitle}</ThemedText>
              {isCurrentPosition && (
                <View style={[styles.currentBadge, { backgroundColor: `${tintColor}20` }]}>
                  <ThemedText style={[styles.currentBadgeText, { color: tintColor }]}>
                    Actual
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.companyName}>{experience.company}</ThemedText>
          </View>
          
          <View style={styles.experienceActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditExperience(index)}
            >
              <Ionicons name="pencil" size={16} color={tintColor} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteExperience(index)}
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.experienceMeta}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color={textColor} />
            <ThemedText style={styles.dateText}>
              {formatDateRange()}
            </ThemedText>
          </View>
          
          <View style={styles.companyInfo}>
            <Ionicons name="business-outline" size={14} color={textColor} />
            <ThemedText style={styles.companyText}>
              {experience.company}
            </ThemedText>
          </View>
        </View>

        {experience.description && (
          <ThemedText style={styles.experienceDescription} numberOfLines={4}>
            {experience.description}
          </ThemedText>
        )}
      </View>
    );
  };

  // Handle add work experience
  const handleAddWorkExperience = async (newExperience: WorkExperience) => {
    try {
      const updatedExperience = [...workExperience, newExperience];
      await onWorkExperienceChange(updatedExperience);
    } catch (error) {
      console.error('Error adding work experience:', error);
      Alert.alert('Error', 'No se pudo agregar la experiencia laboral');
    }
  };

  // Handle edit work experience
  const handleEditExperience = (index: number) => {
    const experience = workExperience[index];
    if (experience) {
      setEditingItem(experience);
      setEditingIndex(index);
      setShowEditModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (updatedExperience: WorkExperience) => {
    if (editingIndex !== null) {
      try {
        const updatedWorkExperience = [...workExperience];
        updatedWorkExperience[editingIndex] = updatedExperience;
        await onWorkExperienceChange(updatedWorkExperience);
        handleCloseEditModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating work experience:', error);
        Alert.alert('Error', 'No se pudo actualizar la experiencia laboral');
      }
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingIndex(null);
    setEditingItem(null);
  };

  // Handle delete work experience
  const handleDeleteExperience = async (index: number) => {
    try {
      Alert.alert(
        'Eliminar Experiencia',
        '¿Estás seguro de que quieres eliminar esta experiencia laboral?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const updatedExperience = workExperience.filter((_, i) => i !== index);
              await onWorkExperienceChange(updatedExperience);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting work experience:', error);
      Alert.alert('Error', 'No se pudo eliminar la experiencia laboral');
    }
  };

  return (
    <>
      <CollapsibleSection
        title="Experiencia Laboral"
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        icon={<Ionicons name="briefcase" size={20} color={tintColor} />}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.description}>
            Agrega tu experiencia laboral profesional, incluyendo trabajos de tiempo completo, medio tiempo, prácticas profesionales y trabajos independientes.
          </ThemedText>

          {/* Work Experience List */}
          {workExperience.length > 0 && (
            <View style={styles.experienceList}>
              {workExperience.map((experience, index) => renderWorkExperienceItem(experience, index))}
            </View>
          )}

          {/* Add Work Experience Form */}
          <DynamicList
            data={[]}
            title="Agregar Experiencia Laboral"
            addButtonText="Agregar Experiencia"
            renderAddForm={() => (
              <WorkExperienceForm onSubmit={handleAddWorkExperience} />
            )}
            renderItem={() => null}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            emptyMessage="No has agregado ninguna experiencia laboral aún. Incluye trabajos, prácticas profesionales o proyectos independientes para destacar tu trayectoria."
          />
        </ThemedView>
      </CollapsibleSection>

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        title="Editar Experiencia Laboral"
        onClose={handleCloseEditModal}
      >
        {editingItem && (
          <WorkExperienceForm
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
  experienceList: {
    marginBottom: 16,
  },
  experienceItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  experienceTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  experienceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  experienceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  experienceDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateColumn: {
    flex: 1,
  },
  currentJobToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  currentJobText: {
    fontSize: 14,
    marginLeft: 8,
  },
  tipsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748b',
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

export default WorkExperienceSection;