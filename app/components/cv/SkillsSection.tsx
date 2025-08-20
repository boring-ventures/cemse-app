import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import CollapsibleSection from './CollapsibleSection';
import { CVData, Skill } from '@/app/types/cv';

interface SkillsSectionProps {
  cvData: CVData | null;
  newSkill: string;
  onNewSkillChange: (text: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skillName: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Skills Section Component
 * Features: Tag-based input system, skill badges with remove functionality
 * Implements exact patterns from web cv-manager.tsx
 */

const SkillsSection: React.FC<SkillsSectionProps> = ({
  cvData,
  newSkill,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const skills = cvData?.skills || [];

  // Handle key press for adding skills
  const handleKeyPress = (key: string) => {
    if (key === 'Enter' && newSkill.trim()) {
      onAddSkill();
    }
  };

  // Skill badge component
  const SkillBadge: React.FC<{ skill: Skill; onRemove: () => void }> = ({ skill, onRemove }) => (
    <View style={[styles.skillBadge, { backgroundColor: tintColor }]}>
      <Text style={styles.skillText}>{skill.name}</Text>
      <Pressable onPress={onRemove} style={styles.removeButton}>
        <Ionicons name="close" size={16} color="white" />
      </Pressable>
    </View>
  );

  return (
    <CollapsibleSection
      title="Skills"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      icon={<Ionicons name="bulb-outline" size={20} color={tintColor} />}
    >
      <View style={styles.container}>
        <ThemedText style={styles.description}>
          Add your technical and professional skills
        </ThemedText>

        {/* Add Skill Input */}
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={newSkill}
              onChangeText={onNewSkillChange}
              placeholder="Enter a skill (e.g., JavaScript, Project Management)"
              placeholderTextColor={borderColor}
              onSubmitEditing={onAddSkill}
              returnKeyType="done"
            />
            <Pressable
              style={[
                styles.addButton,
                { backgroundColor: newSkill.trim() ? tintColor : borderColor }
              ]}
              onPress={onAddSkill}
              disabled={!newSkill.trim()}
            >
              <Ionicons name="add" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Skills Display */}
        {skills.length > 0 ? (
          <View style={styles.skillsContainer}>
            <ThemedText style={styles.skillsLabel}>Your Skills ({skills.length})</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.skillsScrollContainer}
            >
              <View style={styles.skillsGrid}>
                {skills.map((skill, index) => (
                  <SkillBadge
                    key={`${skill.name}-${index}`}
                    skill={skill}
                    onRemove={() => onRemoveSkill(skill.name)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={48} color={borderColor} />
            <ThemedText style={styles.emptyText}>No skills added yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Start adding your technical and professional skills
            </ThemedText>
          </View>
        )}

        {/* Skill Categories Suggestions */}
        <View style={styles.suggestionsContainer}>
          <ThemedText style={styles.suggestionsTitle}>Skill Categories:</ThemedText>
          <View style={styles.suggestions}>
            <View style={styles.suggestionCategory}>
              <ThemedText style={styles.categoryTitle}>Technical:</ThemedText>
              <ThemedText style={styles.categoryExamples}>
                JavaScript, Python, React, SQL, Adobe Photoshop
              </ThemedText>
            </View>
            <View style={styles.suggestionCategory}>
              <ThemedText style={styles.categoryTitle}>Professional:</ThemedText>
              <ThemedText style={styles.categoryExamples}>
                Project Management, Leadership, Communication, Problem Solving
              </ThemedText>
            </View>
            <View style={styles.suggestionCategory}>
              <ThemedText style={styles.categoryTitle}>Languages:</ThemedText>
              <ThemedText style={styles.categoryExamples}>
                Spanish (Native), English (Advanced), Portuguese (Intermediate)
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </CollapsibleSection>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  inputContainer: {
    gap: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContainer: {
    gap: 10,
  },
  skillsLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  skillsScrollContainer: {
    paddingRight: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 20,
    gap: 6,
  },
  skillText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  suggestions: {
    gap: 10,
  },
  suggestionCategory: {
    gap: 4,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  categoryExamples: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 16,
  },
});

export default SkillsSection;