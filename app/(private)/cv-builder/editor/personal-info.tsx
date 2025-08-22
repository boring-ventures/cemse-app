/**
 * Personal Info Editor Screen
 * Screen for editing personal information section of CV
 */

import { useCV } from '@/app/contexts/CVContext';
import { PersonalInfoForm } from '@/app/components/cv-builder/organisms/PersonalInfoForm';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

export default function PersonalInfoEditor() {
  const { state, actions } = useCV();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  
  // Set active section when screen is focused
  useFocusEffect(
    useCallback(() => {
      actions.setActiveSection('personalInfo');
    }, [actions])
  );
  
  // Handle image upload with error handling
  const handleImageUpload = useCallback(async (imageUri: string): Promise<void> => {
    try {
      await actions.uploadProfileImage(imageUri);
    } catch (error) {
      Alert.alert(
        'Error de subida',
        'No se pudo subir la imagen. Por favor inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
      throw error; // Re-throw to let the form component handle it
    }
  }, [actions]);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
  });
  
  return (
    <View style={styles.container}>
      <PersonalInfoForm
        data={state.formData.personalInfo}
        onUpdate={actions.updatePersonalInfo}
        profileImageUri={state.files.profileImage.uri}
        onImageUpload={handleImageUpload}
        uploadProgress={state.files.profileImage.uploadProgress}
        uploadError={state.files.profileImage.error}
      />
    </View>
  );
}