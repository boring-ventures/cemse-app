import React, { memo } from 'react';
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
import { CVData } from '@/app/types/cv';

interface InterestsSectionProps {
  cvData: CVData | null;
  newInterest: string;
  onNewInterestChange: (text: string) => void;
  onAddInterest: () => void;
  onRemoveInterest: (interest: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Interests Section Component
 * Features: Tag-based input system, interest badges with remove functionality
 * Implements exact patterns from web cv-manager.tsx for interests
 */

const InterestsSection: React.FC<InterestsSectionProps> = ({
  cvData,
  newInterest,
  onNewInterestChange,
  onAddInterest,
  onRemoveInterest,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const interests = cvData?.interests || [];

  // Handle key press for adding interests
  const handleKeyPress = (key: string) => {
    if (key === 'Enter' && newInterest.trim()) {
      onAddInterest();
    }
  };

  // Interest badge component
  const InterestBadge: React.FC<{ interest: string; onRemove: () => void }> = ({ interest, onRemove }) => (
    <View style={[styles.interestBadge, { backgroundColor: tintColor }]}>
      <Text style={styles.interestText}>{interest}</Text>
      <Pressable onPress={onRemove} style={styles.removeButton}>
        <Ionicons name="close" size={16} color="white" />
      </Pressable>
    </View>
  );

  return (
    <CollapsibleSection
      title="Intereses y Pasatiempos"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      icon={<Ionicons name="heart-outline" size={20} color={tintColor} />}
    >
      <View style={styles.container}>
        <ThemedText style={styles.description}>
          Agrega tus intereses personales, pasatiempos y actividades
        </ThemedText>

        {/* Add Interest Input */}
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={newInterest}
              onChangeText={onNewInterestChange}
              placeholder="Ingresa un interés (ej: Fotografía, Fútbol, Lectura)"
              placeholderTextColor={borderColor}
              onSubmitEditing={onAddInterest}
              returnKeyType="done"
            />
            <Pressable
              style={[
                styles.addButton,
                { backgroundColor: newInterest.trim() ? tintColor : borderColor }
              ]}
              onPress={onAddInterest}
              disabled={!newInterest.trim()}
            >
              <Ionicons name="add" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Interests Display */}
        {interests.length > 0 ? (
          <View style={styles.interestsContainer}>
            <ThemedText style={styles.interestsLabel}>Your Interests ({interests.length})</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.interestsScrollContainer}
            >
              <View style={styles.interestsGrid}>
                {interests.map((interest, index) => (
                  <InterestBadge
                    key={`${interest}-${index}`}
                    interest={interest}
                    onRemove={() => onRemoveInterest(interest)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color={borderColor} />
            <ThemedText style={styles.emptyText}>No interests added yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Share your hobbies and personal interests
            </ThemedText>
          </View>
        )}

        {/* Interest Categories Suggestions */}
        <View style={styles.suggestionsContainer}>
          <ThemedText style={styles.suggestionsTitle}>Interest Categories:</ThemedText>
          <View style={styles.suggestions}>
            <View style={styles.suggestionCategory}>
              <ThemedText style={styles.categoryTitle}>Sports & Fitness:</ThemedText>
              <ThemedText style={styles.categoryExamples}>
                Football, Basketball, Running, Gym, Swimming, Cycling
              </ThemedText>
            </View>
            <View style={styles.suggestionCategory}>
              <ThemedText style={styles.categoryTitle}>Creative:</ThemedText>
              <ThemedText style={styles.categoryExamples}>
                Photography, Painting, Music, Writing, Cooking, Crafts
              </ThemedText>
            </View>
            <View style={styles.suggestionCategory}>
              <ThemedText style={styles.categoryTitle}>Learning:</ThemedText>
              <ThemedText style={styles.categoryExamples}>
                Reading, Technology, History, Languages, Travel, Volunteering
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
  interestsContainer: {
    gap: 10,
  },
  interestsLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  interestsScrollContainer: {
    paddingRight: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 20,
    gap: 6,
  },
  interestText: {
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

export default memo(InterestsSection);