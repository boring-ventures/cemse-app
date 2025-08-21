import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Switch,
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
  EducationHistoryItem,
  AcademicAchievement,
} from '@/app/types/cv';

interface EducationSectionProps {
  cvData: CVData | null;
  onEducationChange: (field: string, value: any) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Education Section Component
 * 3 Sub-sections: Basic Education, University Info, Education History & Achievements
 * Implements exact patterns from web cv-manager.tsx
 */

const EducationSection: React.FC<EducationSectionProps> = ({
  cvData,
  onEducationChange,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const education = cvData?.education;

  // Modal states for editing
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [editingAchievementIndex, setEditingAchievementIndex] = useState<number | null>(null);
  const [editingHistoryItem, setEditingHistoryItem] = useState<EducationHistoryItem | null>(null);
  const [editingAchievementItem, setEditingAchievementItem] = useState<AcademicAchievement | null>(null);

  // Handle field changes
  const handleFieldChange = async (field: string, value: any) => {
    try {
      await onEducationChange(field, value);
    } catch (error) {
      console.error(`Error updating education ${field}:`, error);
    }
  };

  // Handle education history changes
  const handleEducationHistoryChange = async (newHistory: EducationHistoryItem[]) => {
    try {
      await onEducationChange('educationHistory', newHistory);
    } catch (error) {
      console.error('Error updating education history:', error);
    }
  };

  // Handle academic achievements changes
  const handleAchievementsChange = async (newAchievements: AcademicAchievement[]) => {
    try {
      await onEducationChange('academicAchievements', newAchievements);
    } catch (error) {
      console.error('Error updating academic achievements:', error);
    }
  };

  // Education History edit handlers
  const handleEditEducationHistory = (index: number) => {
    const item = education?.educationHistory?.[index];
    if (item) {
      setEditingHistoryItem(item);
      setEditingHistoryIndex(index);
      setShowHistoryModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEditHistorySubmit = async (updatedItem: EducationHistoryItem) => {
    if (editingHistoryIndex !== null) {
      try {
        const newHistory = [...(education?.educationHistory || [])];
        newHistory[editingHistoryIndex] = updatedItem;
        await handleEducationHistoryChange(newHistory);
        handleCloseHistoryModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating education history:', error);
        Alert.alert('Error', 'No se pudo actualizar el historial educativo');
      }
    }
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setEditingHistoryIndex(null);
    setEditingHistoryItem(null);
  };

  // Academic Achievement edit handlers
  const handleEditAchievement = (index: number) => {
    const item = education?.academicAchievements?.[index];
    if (item) {
      setEditingAchievementItem(item);
      setEditingAchievementIndex(index);
      setShowAchievementModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEditAchievementSubmit = async (updatedItem: AcademicAchievement) => {
    if (editingAchievementIndex !== null) {
      try {
        const newAchievements = [...(education?.academicAchievements || [])];
        newAchievements[editingAchievementIndex] = updatedItem;
        await handleAchievementsChange(newAchievements);
        handleCloseAchievementModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating academic achievement:', error);
        Alert.alert('Error', 'No se pudo actualizar el logro académico');
      }
    }
  };

  const handleCloseAchievementModal = () => {
    setShowAchievementModal(false);
    setEditingAchievementIndex(null);
    setEditingAchievementItem(null);
  };

  // Education History Form Component
  const EducationHistoryForm: React.FC<{
    onSubmit?: (item: EducationHistoryItem) => void;
    onCancel?: () => void;
    initialData?: EducationHistoryItem;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<EducationHistoryItem>(
      initialData || {
        institution: '',
        degree: '',
        startDate: '',
        endDate: null,
        status: 'Completed',
        gpa: 0,
      }
    );

    const handleSubmit = () => {
      if (formData.institution.trim() && formData.degree.trim()) {
        onSubmit?.(formData);
      }
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Institution"
          value={formData.institution}
          onChangeText={(value) => setFormData(prev => ({ ...prev, institution: value }))}
          placeholder="Name of educational institution"
        />
        
        <CVFormField
          label="Degree/Program"
          value={formData.degree}
          onChangeText={(value) => setFormData(prev => ({ ...prev, degree: value }))}
          placeholder="Bachelor's degree, Certificate, etc."
        />
        
        <View style={styles.formRow}>
          <View style={styles.formColumn}>
            <CVFormField
              label="Start Date"
              value={formData.startDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
              placeholder="MM/YYYY"
            />
          </View>
          <View style={styles.formColumn}>
            <CVFormField
              label="End Date"
              value={formData.endDate || ''}
              onChangeText={(value) => setFormData(prev => ({ ...prev, endDate: value || null }))}
              placeholder="MM/YYYY or Current"
            />
          </View>
        </View>
        
        <CVFormField
          label="Status"
          value={formData.status}
          onChangeText={(value) => setFormData(prev => ({ ...prev, status: value }))}
          placeholder="Completed, In Progress, etc."
        />
        
        <CVFormField
          label="GPA (Optional)"
          value={formData.gpa?.toString() || ''}
          onChangeText={(value) => setFormData(prev => ({ ...prev, gpa: parseFloat(value) || 0 }))}
          placeholder="3.8"
          keyboardType="decimal-pad"
        />

        <View style={styles.formActions}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, { borderColor }]}
              onPress={onCancel}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Update' : 'Add'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Academic Achievement Form Component
  const AchievementForm: React.FC<{
    onSubmit?: (item: AcademicAchievement) => void;
    onCancel?: () => void;
    initialData?: AcademicAchievement;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<AcademicAchievement>(
      initialData || {
        title: '',
        date: '',
        description: '',
        type: 'award',
      }
    );

    const handleSubmit = () => {
      if (formData.title.trim() && formData.date.trim()) {
        onSubmit?.(formData);
      }
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Achievement Title"
          value={formData.title}
          onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
          placeholder="Dean's List, Scholarship, etc."
        />
        
        <CVFormField
          label="Date"
          value={formData.date}
          onChangeText={(value) => setFormData(prev => ({ ...prev, date: value }))}
          placeholder="MM/YYYY"
        />
        
        <CVFormField
          label="Type"
          value={formData.type}
          onChangeText={(value) => setFormData(prev => ({ ...prev, type: value }))}
          placeholder="award, honor, certification, etc."
        />
        
        <CVFormField
          label="Description"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Brief description of the achievement"
          multiline
          numberOfLines={3}
        />

        <View style={styles.formActions}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, { borderColor }]}
              onPress={onCancel}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Update' : 'Add'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <>
    <CollapsibleSection
      title="Education"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      icon={<Ionicons name="school-outline" size={20} color={tintColor} />}
    >
      <View style={styles.container}>
        {/* Basic Education Information */}
        <View style={styles.subsection}>
          <ThemedText style={styles.subsectionTitle}>Basic Education</ThemedText>
          
          <CVFormField
            label="Education Level"
            value={education?.level || ''}
            onChangeText={(value) => handleFieldChange('level', value)}
            placeholder="Primary, Secondary, University, etc."
          />
          
          <CVFormField
            label="Current Institution"
            value={education?.currentInstitution || ''}
            onChangeText={(value) => handleFieldChange('currentInstitution', value)}
            placeholder="Name of your current/latest institution"
          />
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <CVFormField
                label="Graduation Year"
                value={education?.graduationYear?.toString() || ''}
                onChangeText={(value) => handleFieldChange('graduationYear', parseInt(value) || new Date().getFullYear())}
                placeholder="2024"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.formColumn}>
              <View style={styles.switchContainer}>
                <ThemedText style={styles.switchLabel}>Currently Studying</ThemedText>
                <Switch
                  value={education?.isStudying || false}
                  onValueChange={(value) => handleFieldChange('isStudying', value)}
                  trackColor={{ false: borderColor, true: tintColor }}
                  thumbColor="white"
                />
              </View>
            </View>
          </View>
        </View>

        {/* University Information */}
        <View style={styles.subsection}>
          <ThemedText style={styles.subsectionTitle}>University Information</ThemedText>
          
          <CVFormField
            label="Current Degree"
            value={education?.currentDegree || ''}
            onChangeText={(value) => handleFieldChange('currentDegree', value)}
            placeholder="Bachelor's in Computer Science, etc."
          />
          
          <CVFormField
            label="University Name"
            value={education?.universityName || ''}
            onChangeText={(value) => handleFieldChange('universityName', value)}
            placeholder="Universidad Mayor de San Andrés"
          />
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <CVFormField
                label="Start Date"
                value={education?.universityStartDate || ''}
                onChangeText={(value) => handleFieldChange('universityStartDate', value)}
                placeholder="MM/YYYY"
              />
            </View>
            <View style={styles.formColumn}>
              <CVFormField
                label="End Date"
                value={education?.universityEndDate || ''}
                onChangeText={(value) => handleFieldChange('universityEndDate', value)}
                placeholder="MM/YYYY or Current"
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <CVFormField
                label="Status"
                value={education?.universityStatus || ''}
                onChangeText={(value) => handleFieldChange('universityStatus', value)}
                placeholder="In Progress, Completed, etc."
              />
            </View>
            <View style={styles.formColumn}>
              <CVFormField
                label="GPA"
                value={education?.gpa?.toString() || ''}
                onChangeText={(value) => handleFieldChange('gpa', parseFloat(value) || 0)}
                placeholder="3.8"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Education History */}
        <View style={styles.subsection}>
          <DynamicList
            data={education?.educationHistory || []}
            renderItem={(item: EducationHistoryItem, index: number) => (
              <View>
                <ThemedText style={styles.itemTitle}>{item.degree}</ThemedText>
                <ThemedText style={styles.itemSubtitle}>{item.institution}</ThemedText>
                <ThemedText style={styles.itemDetails}>
                  {item.startDate} - {item.endDate || 'Current'} • {item.status}
                  {item.gpa && item.gpa > 0 && ` • GPA: ${item.gpa}`}
                </ThemedText>
              </View>
            )}
            renderAddForm={() => <EducationHistoryForm />}
            onAdd={(item) => {
              const newHistory = [...(education?.educationHistory || []), item];
              handleEducationHistoryChange(newHistory);
            }}
            onEdit={(index, item) => handleEditEducationHistory(index)}
            onDelete={(index) => {
              const newHistory = (education?.educationHistory || []).filter((_, i) => i !== index);
              handleEducationHistoryChange(newHistory);
            }}
            addButtonText="Add Education History"
            title="Education History"
            emptyMessage="No education history added yet"
          />
        </View>

        {/* Academic Achievements */}
        <View style={styles.subsection}>
          <DynamicList
            data={education?.academicAchievements || []}
            renderItem={(item: AcademicAchievement, index: number) => (
              <View>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.itemSubtitle}>{item.type} • {item.date}</ThemedText>
                {item.description && (
                  <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
                )}
              </View>
            )}
            renderAddForm={() => <AchievementForm />}
            onAdd={(item) => {
              const newAchievements = [...(education?.academicAchievements || []), item];
              handleAchievementsChange(newAchievements);
            }}
            onEdit={(index, item) => handleEditAchievement(index)}
            onDelete={(index) => {
              const newAchievements = (education?.academicAchievements || []).filter((_, i) => i !== index);
              handleAchievementsChange(newAchievements);
            }}
            addButtonText="Add Achievement"
            title="Academic Achievements"
            emptyMessage="No academic achievements added yet"
          />
        </View>
      </View>
    </CollapsibleSection>

    {/* Education History Edit Modal */}
    <EditModal
      visible={showHistoryModal}
      title="Editar Historial Educativo"
      onClose={handleCloseHistoryModal}
    >
      {editingHistoryItem && (
        <EducationHistoryForm
          onSubmit={handleEditHistorySubmit}
          onCancel={handleCloseHistoryModal}
          initialData={editingHistoryItem}
          isEditing={true}
        />
      )}
    </EditModal>

    {/* Academic Achievement Edit Modal */}
    <EditModal
      visible={showAchievementModal}
      title="Editar Logro Académico"
      onClose={handleCloseAchievementModal}
    >
      {editingAchievementItem && (
        <AchievementForm
          onSubmit={handleEditAchievementSubmit}
          onCancel={handleCloseAchievementModal}
          initialData={editingAchievementItem}
          isEditing={true}
        />
      )}
    </EditModal>
  </>);
};

const styles = StyleSheet.create({
  container: {
    gap: 25,
  },
  subsection: {
    gap: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formColumn: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    gap: 15,
  },
  formActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    opacity: 0.6,
  },
  itemDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
    lineHeight: 16,
  },
});

export default EducationSection;