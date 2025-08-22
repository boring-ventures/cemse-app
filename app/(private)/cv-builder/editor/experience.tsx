/**
 * Experience Editor Screen
 * Screen for editing work experience section of CV
 */

import { useCV } from '@/app/contexts/CVContext';
import { ExperienceForm } from '@/app/components/cv-builder/organisms/ExperienceForm';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

export default function ExperienceEditor() {
  const { state, actions } = useCV();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  
  // Set active section when screen is focused
  useFocusEffect(
    useCallback(() => {
      actions.setActiveSection('workExperience');
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
      <ExperienceForm
        workExperience={state.formData.workExperience || []}
        onAdd={actions.addExperience}
        onUpdate={actions.updateExperience}
        onRemove={actions.removeExperience}
      />
    </View>
  );
}