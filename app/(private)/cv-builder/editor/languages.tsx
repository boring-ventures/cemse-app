/**
 * Languages Editor Screen
 * Screen for editing languages section of CV
 */

import { useCV } from '@/app/contexts/CVContext';
import { LanguagesForm } from '@/app/components/cv-builder/organisms/LanguagesForm';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

export default function LanguagesEditor() {
  const { state, actions } = useCV();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  
  // Set active section when screen is focused
  useFocusEffect(
    useCallback(() => {
      actions.setActiveSection('languages');
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
      <LanguagesForm
        languages={state.formData.languages || []}
        onAdd={actions.addLanguage}
        onUpdate={actions.updateLanguage}
        onRemove={actions.removeLanguage}
      />
    </View>
  );
}