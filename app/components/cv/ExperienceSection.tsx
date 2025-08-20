import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CVFormField } from './CVFormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import CollapsibleSection from './CollapsibleSection';
import DynamicList from './DynamicList';
import {
  CVData,
  WorkExperience,
  Project,
  Language,
  SocialLink,
  CollapsedSections,
} from '@/app/types/cv';

interface ExperienceSectionProps {
  cvData: CVData | null;
  onUpdateCVData: (data: Partial<CVData>) => Promise<any>;
  collapsedSections: CollapsedSections;
  onToggleSection: (section: keyof CollapsedSections) => void;
}

/**
 * Experience Section Component
 * Includes: Work Experience, Projects, Languages, Social Links
 * Implements exact patterns from web cv-manager.tsx
 */

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  cvData,
  onUpdateCVData,
  collapsedSections,
  onToggleSection,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

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

    const handleSubmit = () => {
      if (formData.jobTitle.trim() && formData.company.trim()) {
        onSubmit?.(formData);
      }
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Job Title"
          value={formData.jobTitle}
          onChangeText={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}
          placeholder="Software Developer, Marketing Assistant, etc."
        />
        
        <CVFormField
          label="Company"
          value={formData.company}
          onChangeText={(value) => setFormData(prev => ({ ...prev, company: value }))}
          placeholder="Company name"
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
              value={formData.endDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              placeholder="MM/YYYY or Current"
            />
          </View>
        </View>
        
        <CVFormField
          label="Description"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Describe your responsibilities and achievements"
          multiline
          numberOfLines={4}
        />

        <View style={styles.formActions}>
          <ThemedView 
            style={[styles.actionButton, styles.cancelButton, { borderColor }]}
            onTouchEnd={onCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </ThemedView>
          
          <ThemedView 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onTouchEnd={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Update' : 'Add'}
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    );
  };

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

    const handleSubmit = () => {
      if (formData.title.trim()) {
        onSubmit?.(formData);
      }
    };

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Project Title"
          value={formData.title}
          onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
          placeholder="E-commerce Website, Mobile App, etc."
        />
        
        <CVFormField
          label="Location (Optional)"
          value={formData.location || ''}
          onChangeText={(value) => setFormData(prev => ({ ...prev, location: value }))}
          placeholder="Company, University, Personal"
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
              value={formData.endDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              placeholder="MM/YYYY or Ongoing"
            />
          </View>
        </View>
        
        <CVFormField
          label="Description"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Describe the project, technologies used, and outcomes"
          multiline
          numberOfLines={4}
        />

        <View style={styles.formActions}>
          <ThemedView 
            style={[styles.actionButton, styles.cancelButton, { borderColor }]}
            onTouchEnd={onCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </ThemedView>
          
          <ThemedView 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onTouchEnd={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Update' : 'Add'}
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    );
  };

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
        proficiency: 'Intermediate',
      }
    );

    const handleSubmit = () => {
      if (formData.name.trim()) {
        onSubmit?.(formData);
      }
    };

    const proficiencyLevels = ['Native', 'Advanced', 'Intermediate', 'Basic'];

    return (
      <ScrollView style={styles.formContainer}>
        <CVFormField
          label="Language"
          value={formData.name}
          onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Spanish, English, Portuguese, etc."
        />
        
        <View style={styles.pickerContainer}>
          <ThemedText style={styles.pickerLabel}>Proficiency Level</ThemedText>
          <View style={styles.proficiencyButtons}>
            {proficiencyLevels.map((level) => (
              <ThemedView
                key={level}
                style={[
                  styles.proficiencyButton,
                  { borderColor },
                  formData.proficiency === level && { backgroundColor: tintColor }
                ]}
                onTouchEnd={() => setFormData(prev => ({ ...prev, proficiency: level }))}
              >
                <ThemedText
                  style={[
                    styles.proficiencyButtonText,
                    formData.proficiency === level && { color: 'white' }
                  ]}
                >
                  {level}
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        </View>

        <View style={styles.formActions}>
          <ThemedView 
            style={[styles.actionButton, styles.cancelButton, { borderColor }]}
            onTouchEnd={onCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </ThemedView>
          
          <ThemedView 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onTouchEnd={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Update' : 'Add'}
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    );
  };

  // Social Link Form Component
  const SocialLinkForm: React.FC<{
    onSubmit?: (item: SocialLink) => void;
    onCancel?: () => void;
    initialData?: SocialLink;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<SocialLink>(
      initialData || {
        platform: 'LinkedIn',
        url: '',
      }
    );

    const handleSubmit = () => {
      if (formData.url.trim()) {
        onSubmit?.(formData);
      }
    };

    const platforms = ['LinkedIn', 'GitHub', 'Twitter', 'Instagram', 'Facebook', 'Portfolio', 'Other'];

    return (
      <ScrollView style={styles.formContainer}>
        <View style={styles.pickerContainer}>
          <ThemedText style={styles.pickerLabel}>Platform</ThemedText>
          <View style={styles.platformButtons}>
            {platforms.map((platform) => (
              <ThemedView
                key={platform}
                style={[
                  styles.platformButton,
                  { borderColor },
                  formData.platform === platform && { backgroundColor: tintColor }
                ]}
                onTouchEnd={() => setFormData(prev => ({ ...prev, platform }))}
              >
                <ThemedText
                  style={[
                    styles.platformButtonText,
                    formData.platform === platform && { color: 'white' }
                  ]}
                >
                  {platform}
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        </View>
        
        <CVFormField
          label="URL"
          value={formData.url}
          onChangeText={(value) => setFormData(prev => ({ ...prev, url: value }))}
          placeholder="https://linkedin.com/in/yourprofile"
          keyboardType="url"
          autoCapitalize="none"
        />

        <View style={styles.formActions}>
          <ThemedView 
            style={[styles.actionButton, styles.cancelButton, { borderColor }]}
            onTouchEnd={onCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </ThemedView>
          
          <ThemedView 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onTouchEnd={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Update' : 'Add'}
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Work Experience Section */}
      <CollapsibleSection
        title="Work Experience"
        isCollapsed={collapsedSections.workExperience}
        onToggle={() => onToggleSection('workExperience')}
        icon={<Ionicons name="briefcase-outline" size={20} color={tintColor} />}
      >
        <DynamicList
          data={cvData?.workExperience || []}
          renderItem={(item: WorkExperience, index: number) => (
            <View>
              <ThemedText style={styles.itemTitle}>{item.jobTitle}</ThemedText>
              <ThemedText style={styles.itemSubtitle}>{item.company}</ThemedText>
              <ThemedText style={styles.itemDetails}>
                {item.startDate} - {item.endDate || 'Current'}
              </ThemedText>
              {item.description && (
                <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
              )}
            </View>
          )}
          renderAddForm={() => <WorkExperienceForm />}
          onAdd={(item) => {
            const newExperience = [...(cvData?.workExperience || []), item];
            onUpdateCVData({ workExperience: newExperience });
          }}
          onEdit={(index, item) => {
            const newExperience = [...(cvData?.workExperience || [])];
            newExperience[index] = item;
            onUpdateCVData({ workExperience: newExperience });
          }}
          onDelete={(index) => {
            const newExperience = (cvData?.workExperience || []).filter((_, i) => i !== index);
            onUpdateCVData({ workExperience: newExperience });
          }}
          addButtonText="Add Work Experience"
          emptyMessage="No work experience added yet"
        />
      </CollapsibleSection>

      {/* Projects Section */}
      <CollapsibleSection
        title="Projects"
        isCollapsed={collapsedSections.projects}
        onToggle={() => onToggleSection('projects')}
        icon={<Ionicons name="code-slash-outline" size={20} color={tintColor} />}
      >
        <DynamicList
          data={cvData?.projects || []}
          renderItem={(item: Project, index: number) => (
            <View>
              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
              {item.location && (
                <ThemedText style={styles.itemSubtitle}>{item.location}</ThemedText>
              )}
              <ThemedText style={styles.itemDetails}>
                {item.startDate} - {item.endDate || 'Ongoing'}
              </ThemedText>
              {item.description && (
                <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
              )}
            </View>
          )}
          renderAddForm={() => <ProjectForm />}
          onAdd={(item) => {
            const newProjects = [...(cvData?.projects || []), item];
            onUpdateCVData({ projects: newProjects });
          }}
          onEdit={(index, item) => {
            const newProjects = [...(cvData?.projects || [])];
            newProjects[index] = item;
            onUpdateCVData({ projects: newProjects });
          }}
          onDelete={(index) => {
            const newProjects = (cvData?.projects || []).filter((_, i) => i !== index);
            onUpdateCVData({ projects: newProjects });
          }}
          addButtonText="Add Project"
          emptyMessage="No projects added yet"
        />
      </CollapsibleSection>

      {/* Languages Section */}
      <CollapsibleSection
        title="Languages"
        isCollapsed={collapsedSections.languages}
        onToggle={() => onToggleSection('languages')}
        icon={<Ionicons name="language-outline" size={20} color={tintColor} />}
      >
        <DynamicList
          data={cvData?.languages || []}
          renderItem={(item: Language, index: number) => (
            <View>
              <ThemedText style={styles.itemTitle}>{item.name}</ThemedText>
              <ThemedText style={styles.itemSubtitle}>{item.proficiency}</ThemedText>
            </View>
          )}
          renderAddForm={() => <LanguageForm />}
          onAdd={(item) => {
            const newLanguages = [...(cvData?.languages || []), item];
            onUpdateCVData({ languages: newLanguages });
          }}
          onEdit={(index, item) => {
            const newLanguages = [...(cvData?.languages || [])];
            newLanguages[index] = item;
            onUpdateCVData({ languages: newLanguages });
          }}
          onDelete={(index) => {
            const newLanguages = (cvData?.languages || []).filter((_, i) => i !== index);
            onUpdateCVData({ languages: newLanguages });
          }}
          addButtonText="Add Language"
          emptyMessage="No languages added yet"
        />
      </CollapsibleSection>

      {/* Social Links Section */}
      <CollapsibleSection
        title="Social Links"
        isCollapsed={collapsedSections.socialLinks}
        onToggle={() => onToggleSection('socialLinks')}
        icon={<Ionicons name="link-outline" size={20} color={tintColor} />}
      >
        <DynamicList
          data={cvData?.socialLinks || []}
          renderItem={(item: SocialLink, index: number) => (
            <View>
              <ThemedText style={styles.itemTitle}>{item.platform}</ThemedText>
              <ThemedText style={styles.itemLink}>{item.url}</ThemedText>
            </View>
          )}
          renderAddForm={() => <SocialLinkForm />}
          onAdd={(item) => {
            const newSocialLinks = [...(cvData?.socialLinks || []), item];
            onUpdateCVData({ socialLinks: newSocialLinks });
          }}
          onEdit={(index, item) => {
            const newSocialLinks = [...(cvData?.socialLinks || [])];
            newSocialLinks[index] = item;
            onUpdateCVData({ socialLinks: newSocialLinks });
          }}
          onDelete={(index) => {
            const newSocialLinks = (cvData?.socialLinks || []).filter((_, i) => i !== index);
            onUpdateCVData({ socialLinks: newSocialLinks });
          }}
          addButtonText="Add Social Link"
          emptyMessage="No social links added yet"
        />
      </CollapsibleSection>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  formContainer: {
    flex: 1,
    gap: 15,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formColumn: {
    flex: 1,
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
  itemLink: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  pickerContainer: {
    gap: 10,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  proficiencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  proficiencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  proficiencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  platformButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  platformButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ExperienceSection;