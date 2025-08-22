/**
 * PDF Generator Screen
 * Screen for generating and customizing CV PDFs
 */

import { useCV } from '@/app/contexts/CVContext';
import { PDFGenerator } from '@/app/components/cv-builder/organisms/PDFGenerator';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

export default function PDFGeneratorScreen() {
  const { state, actions } = useCV();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  
  const handleTemplateChange = useCallback((template: any) => {
    // We'll need to add this action to the CV context actions
    // For now, we'll use the dispatch directly
    // actions.dispatch({ type: 'SET_PDF_TEMPLATE', payload: { template } });
  }, [actions]);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
  });
  
  return (
    <View style={styles.container}>
      <PDFGenerator
        cvData={state.formData}
        selectedTemplate={state.pdf.selectedTemplate}
        onTemplateChange={handleTemplateChange}
        availableTemplates={state.pdf.availableTemplates}
        isGenerating={state.pdf.isGenerating}
        generationProgress={state.pdf.generationProgress}
        onGeneratePDF={actions.generatePDF}
      />
    </View>
  );
}