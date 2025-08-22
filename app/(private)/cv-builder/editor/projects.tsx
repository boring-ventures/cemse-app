/**
 * Projects Editor Screen
 * Screen for editing projects section of CV
 */

import { useCV } from '@/app/contexts/CVContext';
import { ProjectsForm } from '@/app/components/cv-builder/organisms/ProjectsForm';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProjectsEditor() {
  const { state, actions } = useCV();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  
  // Set active section when screen is focused
  useFocusEffect(
    useCallback(() => {
      actions.setActiveSection('projects');
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
      <ProjectsForm
        projects={state.formData.projects || []}
        onAdd={actions.addProject}
        onUpdate={actions.updateProject}
        onRemove={actions.removeProject}
      />
    </View>
  );
}