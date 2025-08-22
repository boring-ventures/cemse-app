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
  Project,
} from '@/app/types/cv';

interface ProjectsSectionProps {
  cvData: CVData | null;
  onProjectsChange: (projects: Project[]) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Projects Section Component
 * Allows users to add their personal and professional projects
 * Based on CV_MANAGER_MOBILE_SPEC.md requirements
 */

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  cvData,
  onProjectsChange,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const projects = cvData?.projects || [];

  // Modal state for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Project | null>(null);

  // Project Form Component
  const ProjectForm: React.FC<{
    onSubmit?: (item: Project) => void;
    onCancel?: () => void;
    initialData?: Project;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<Project>(
      initialData || {
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      }
    );

    const [isOngoingProject, setIsOngoingProject] = useState(
      initialData ? !initialData.endDate : false
    );

    const handleSubmit = () => {
      if (!formData.title.trim() || !formData.startDate.trim()) {
        Alert.alert('Error', 'Por favor completa al menos el título del proyecto y fecha de inicio');
        return;
      }

      const projectData: Project = {
        ...formData,
        endDate: isOngoingProject ? '' : formData.endDate,
      };

      onSubmit?.(projectData);
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Título del Proyecto"
          value={formData.title}
          onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
          placeholder="Ej. App Móvil de Delivery, Sistema de Gestión Web"
        />
        
        <CVFormField
          label="Ubicación/Contexto"
          value={formData.location || ''}
          onChangeText={(value) => setFormData(prev => ({ ...prev, location: value }))}
          placeholder="Ej. Proyecto Personal, Universidad, Freelance, Hackathon"
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
              value={isOngoingProject ? 'En desarrollo' : formData.endDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              placeholder="MM/AAAA"
              editable={!isOngoingProject}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.ongoingProjectToggle}
          onPress={() => {
            setIsOngoingProject(!isOngoingProject);
            if (!isOngoingProject) {
              setFormData(prev => ({ ...prev, endDate: '' }));
            }
          }}
        >
          <Ionicons
            name={isOngoingProject ? 'checkbox' : 'square-outline'}
            size={20}
            color={tintColor}
          />
          <ThemedText style={styles.ongoingProjectText}>
            Proyecto en desarrollo
          </ThemedText>
        </TouchableOpacity>
        
        <CVFormField
          label="Descripción del Proyecto"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Describe el proyecto, tecnologías utilizadas, tu rol y los resultados. Ej: Desarrollé una aplicación móvil usando React Native y Firebase para delivery de comida. Implementé autenticación, geolocalización y pagos online. El proyecto alcanzó 500+ descargas."
          multiline
          numberOfLines={5}
        />

        <View style={styles.tipsContainer}>
          <ThemedText style={styles.tipsTitle}>💡 Consejos para describir tu proyecto:</ThemedText>
          <ThemedText style={styles.tipsText}>
            • Explica claramente qué hace el proyecto{'\n'}
            • Menciona las tecnologías y herramientas utilizadas{'\n'}
            • Destaca tu rol específico y contribuciones{'\n'}
            • Incluye resultados o métricas si las tienes{'\n'}
            • Agrega enlaces si están disponibles públicamente
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

  // Render project item
  const renderProjectItem = (project: Project, index: number) => {
    const formatDateRange = () => {
      const start = project.startDate;
      const end = project.endDate || 'En desarrollo';
      return `${start} - ${end}`;
    };

    const isOngoing = !project.endDate;

    return (
      <View key={index} style={[styles.projectItem, { borderColor }]}>
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleContainer}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.projectTitle}>{project.title}</ThemedText>
              {isOngoing && (
                <View style={[styles.ongoingBadge, { backgroundColor: `${tintColor}20` }]}>
                  <ThemedText style={[styles.ongoingBadgeText, { color: tintColor }]}>
                    En desarrollo
                  </ThemedText>
                </View>
              )}
            </View>
            {project.location && (
              <ThemedText style={styles.projectLocation}>{project.location}</ThemedText>
            )}
          </View>
          
          <View style={styles.projectActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditProject(index)}
            >
              <Ionicons name="pencil" size={16} color={tintColor} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteProject(index)}
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.projectMeta}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color={textColor} />
            <ThemedText style={styles.dateText}>
              {formatDateRange()}
            </ThemedText>
          </View>
          
          {project.location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={14} color={textColor} />
              <ThemedText style={styles.locationText}>
                {project.location}
              </ThemedText>
            </View>
          )}
        </View>

        {project.description && (
          <ThemedText style={styles.projectDescription} numberOfLines={4}>
            {project.description}
          </ThemedText>
        )}
      </View>
    );
  };

  // Handle add project
  const handleAddProject = async (newProject: Project) => {
    try {
      const updatedProjects = [...projects, newProject];
      await onProjectsChange(updatedProjects);
    } catch (error) {
      console.error('Error adding project:', error);
      Alert.alert('Error', 'No se pudo agregar el proyecto');
    }
  };

  // Handle edit project
  const handleEditProject = (index: number) => {
    const project = projects[index];
    if (project) {
      setEditingItem(project);
      setEditingIndex(index);
      setShowEditModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (updatedProject: Project) => {
    if (editingIndex !== null) {
      try {
        const updatedProjects = [...projects];
        updatedProjects[editingIndex] = updatedProject;
        await onProjectsChange(updatedProjects);
        handleCloseEditModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating project:', error);
        Alert.alert('Error', 'No se pudo actualizar el proyecto');
      }
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingIndex(null);
    setEditingItem(null);
  };

  // Handle delete project
  const handleDeleteProject = async (index: number) => {
    try {
      Alert.alert(
        'Eliminar Proyecto',
        '¿Estás seguro de que quieres eliminar este proyecto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const updatedProjects = projects.filter((_, i) => i !== index);
              await onProjectsChange(updatedProjects);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert('Error', 'No se pudo eliminar el proyecto');
    }
  };

  return (
    <>
      <CollapsibleSection
        title="Proyectos"
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        icon={<Ionicons name="code-working" size={20} color={tintColor} />}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.description}>
            Incluye proyectos personales, académicos, de código abierto o freelance que demuestren tus habilidades técnicas y creatividad.
          </ThemedText>

          {/* Projects List */}
          {projects.length > 0 && (
            <View style={styles.projectsList}>
              {projects.map((project, index) => renderProjectItem(project, index))}
            </View>
          )}

          {/* Add Project Form */}
          <DynamicList
            data={[]}
            title="Agregar Proyecto"
            addButtonText="Agregar Proyecto"
            renderAddForm={() => (
              <ProjectForm onSubmit={handleAddProject} />
            )}
            renderItem={() => null}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            emptyMessage="No has agregado ningún proyecto aún. Incluye proyectos personales, académicos o de trabajo que demuestren tus habilidades técnicas."
          />
        </ThemedView>
      </CollapsibleSection>

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        title="Editar Proyecto"
        onClose={handleCloseEditModal}
      >
        {editingItem && (
          <ProjectForm
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
  projectsList: {
    marginBottom: 16,
  },
  projectItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  ongoingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  ongoingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  projectLocation: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  projectMeta: {
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  projectDescription: {
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
  ongoingProjectToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  ongoingProjectText: {
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

export default memo(ProjectsSection);