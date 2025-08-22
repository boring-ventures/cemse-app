/**
 * Dynamic CV Section Editor
 * Routes to the appropriate editor based on section parameter
 */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/app/hooks/useThemeColor';

// Import all section editors
import PersonalInfoEditor from './personal-info';
import EducationEditor from './education';
import ExperienceEditor from './experience';
import SkillsEditor from './skills';
import ProjectsEditor from './projects';
import LanguagesEditor from './languages';

export default function DynamicSectionEditor() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const renderEditor = () => {
    switch (section) {
      case 'personal-info':
      case 'personalInfo':
        return <PersonalInfoEditor />;
      case 'education':
        return <EducationEditor />;
      case 'experience':
      case 'workExperience':
        return <ExperienceEditor />;
      case 'skills':
        return <SkillsEditor />;
      case 'projects':
        return <ProjectsEditor />;
      case 'languages':
        return <LanguagesEditor />;
      default:
        return (
          <View style={[styles.container, { backgroundColor }]}>
            <Text style={[styles.errorText, { color: textColor }]}>
              Sección no encontrada: {section}
            </Text>
          </View>
        );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      textAlign: 'center',
    },
  });

  return renderEditor();
}