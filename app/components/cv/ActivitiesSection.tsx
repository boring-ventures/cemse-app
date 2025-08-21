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
  Activity,
} from '@/app/types/cv';

interface ActivitiesSectionProps {
  cvData: CVData | null;
  onActivitiesChange: (activities: Activity[]) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Activities Section Component
 * Allows users to add extracurricular activities, volunteer work, organizations
 * Based on CV_MANAGER_MOBILE_SPEC.md requirements
 */

const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  cvData,
  onActivitiesChange,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const activities = cvData?.activities || [];

  // Modal state for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Activity | null>(null);

  // Activity Form Component
  const ActivityForm: React.FC<{
    onSubmit?: (item: Activity) => void;
    onCancel?: () => void;
    initialData?: Activity;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<Activity>(
      initialData || {
        title: '',
        organization: '',
        startDate: '',
        endDate: '',
        description: '',
      }
    );

    const [isCurrentActivity, setIsCurrentActivity] = useState(
      initialData ? !initialData.endDate : false
    );

    const handleSubmit = () => {
      if (!formData.title.trim() || !formData.startDate.trim()) {
        Alert.alert('Error', 'Por favor completa al menos el título y fecha de inicio');
        return;
      }

      const activityData: Activity = {
        ...formData,
        endDate: isCurrentActivity ? '' : formData.endDate,
      };

      onSubmit?.(activityData);
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Título de la Actividad"
          value={formData.title}
          onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
          placeholder="Ej. Voluntario en Cruz Roja, Presidente de Club"
        />
        
        <CVFormField
          label="Organización"
          value={formData.organization || ''}
          onChangeText={(value) => setFormData(prev => ({ ...prev, organization: value }))}
          placeholder="Ej. Cruz Roja Boliviana, Club de Estudiantes"
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
              value={isCurrentActivity ? 'Actualidad' : formData.endDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              placeholder="MM/AAAA"
              editable={!isCurrentActivity}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.currentActivityToggle}
          onPress={() => {
            setIsCurrentActivity(!isCurrentActivity);
            if (!isCurrentActivity) {
              setFormData(prev => ({ ...prev, endDate: '' }));
            }
          }}
        >
          <Ionicons
            name={isCurrentActivity ? 'checkbox' : 'square-outline'}
            size={20}
            color={tintColor}
          />
          <ThemedText style={styles.currentActivityText}>
            Actividad actual
          </ThemedText>
        </TouchableOpacity>
        
        <CVFormField
          label="Descripción"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Describe tus responsabilidades, logros y el impacto de tu participación"
          multiline
          numberOfLines={4}
        />

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

  // Render activity item
  const renderActivityItem = (activity: Activity, index: number) => {
    const formatDateRange = () => {
      const start = activity.startDate;
      const end = activity.endDate || 'Actualidad';
      return `${start} - ${end}`;
    };

    return (
      <View key={index} style={[styles.activityItem, { borderColor }]}>
        <View style={styles.activityHeader}>
          <View style={styles.activityTitleContainer}>
            <ThemedText style={styles.activityTitle}>{activity.title}</ThemedText>
            {activity.organization && (
              <ThemedText style={styles.activityOrganization}>
                {activity.organization}
              </ThemedText>
            )}
          </View>
          
          <View style={styles.activityActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditActivity(index)}
            >
              <Ionicons name="pencil" size={16} color={tintColor} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteActivity(index)}
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.activityMeta}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color={textColor} />
            <ThemedText style={styles.dateText}>
              {formatDateRange()}
            </ThemedText>
          </View>
        </View>

        {activity.description && (
          <ThemedText style={styles.activityDescription} numberOfLines={3}>
            {activity.description}
          </ThemedText>
        )}
      </View>
    );
  };

  // Handle add activity
  const handleAddActivity = async (newActivity: Activity) => {
    try {
      const updatedActivities = [...activities, newActivity];
      await onActivitiesChange(updatedActivities);
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'No se pudo agregar la actividad');
    }
  };

  // Handle edit activity
  const handleEditActivity = (index: number) => {
    const activity = activities[index];
    if (activity) {
      setEditingItem(activity);
      setEditingIndex(index);
      setShowEditModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (updatedActivity: Activity) => {
    if (editingIndex !== null) {
      try {
        const updatedActivities = [...activities];
        updatedActivities[editingIndex] = updatedActivity;
        await onActivitiesChange(updatedActivities);
        handleCloseEditModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating activity:', error);
        Alert.alert('Error', 'No se pudo actualizar la actividad');
      }
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingIndex(null);
    setEditingItem(null);
  };

  // Handle delete activity
  const handleDeleteActivity = async (index: number) => {
    try {
      Alert.alert(
        'Eliminar Actividad',
        '¿Estás seguro de que quieres eliminar esta actividad?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const updatedActivities = activities.filter((_, i) => i !== index);
              await onActivitiesChange(updatedActivities);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting activity:', error);
      Alert.alert('Error', 'No se pudo eliminar la actividad');
    }
  };

  return (
    <>
      <CollapsibleSection
        title="Actividades Extracurriculares"
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        icon={<Ionicons name="trophy" size={20} color={tintColor} />}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.description}>
            Incluye actividades extracurriculares, voluntariado, liderazgo en organizaciones, deportes y otros compromisos que demuestren tus habilidades y valores.
          </ThemedText>

          {/* Activities List */}
          {activities.length > 0 && (
            <View style={styles.activitiesList}>
              {activities.map((activity, index) => renderActivityItem(activity, index))}
            </View>
          )}

          {/* Add Activity Form */}
          <DynamicList
            data={[]}
            title="Agregar Actividad"
            addButtonText="Agregar Actividad"
            renderAddForm={() => (
              <ActivityForm onSubmit={handleAddActivity} />
            )}
            renderItem={() => null}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            emptyMessage="No has agregado ninguna actividad extracurricular aún. Incluye voluntariado, liderazgo, deportes u otras actividades que demuestren tus habilidades."
          />
        </ThemedView>
      </CollapsibleSection>

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        title="Editar Actividad"
        onClose={handleCloseEditModal}
      >
        {editingItem && (
          <ActivityForm
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
  activitiesList: {
    marginBottom: 16,
  },
  activityItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityOrganization: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  activityActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  activityDescription: {
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
  currentActivityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  currentActivityText: {
    fontSize: 14,
    marginLeft: 8,
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

export default ActivitiesSection;