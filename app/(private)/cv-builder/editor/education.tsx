/**
 * Education Editor Screen
 * Screen for editing education section of CV
 */

import { useCV } from '@/app/contexts/CVContext';
import { EducationForm } from '@/app/components/cv-builder/organisms/EducationForm';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

export default function EducationEditor() {
  const { state, actions } = useCV();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  
  // Set active section when screen is focused
  useFocusEffect(
    useCallback(() => {
      actions.setActiveSection('education');
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
      <EducationForm
        educationHistory={state.formData.education?.educationHistory || []}
        onAdd={actions.addEducation}
        onUpdate={actions.updateEducation}
        onRemove={actions.removeEducation}
      />
    </View>
  );
}