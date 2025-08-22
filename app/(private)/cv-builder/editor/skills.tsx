/**
 * Skills Editor Screen
 * Screen for editing skills section of CV
 */

import { useCV } from '@/app/contexts/CVContext';
import { SkillsForm } from '@/app/components/cv-builder/organisms/SkillsForm';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

export default function SkillsEditor() {
  const { state, actions } = useCV();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  
  // Set active section when screen is focused
  useFocusEffect(
    useCallback(() => {
      actions.setActiveSection('skills');
    }, [actions])
  );
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
  });
  
  return (
    <View style={styles.container}>
      <SkillsForm
        skills={state.formData.skills || []}
        onAdd={actions.addSkill}
        onUpdate={actions.updateSkillLevel}
        onRemove={actions.removeSkill}
      />
    </View>
  );
}