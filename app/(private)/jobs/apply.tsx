import { FormField } from '@/app/components/FormField';
import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CVCheckModal } from '@/app/components/jobs/CVCheckModal';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { ApplicationForm, JobOffer } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ApplyScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState(75); // Mock profile completion
  const [showCVCheck, setShowCVCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  // Mock job data - in real app, this would come from API/store
  const job: JobOffer = {
    id: jobId || '1',
    title: 'Desarrollador Frontend React',
    company: {
      id: '1',
      name: 'TechCorp Bolivia',
      rating: 4.5,
      sector: 'Tecnología'
    },
    companyRating: 4.5,
    location: 'Cochabamba, Bolivia',
    municipality: 'Cochabamba',
    department: 'Cochabamba',
    workMode: 'Híbrido',
    workModality: 'HYBRID' as const,
    workSchedule: 'Tiempo completo',
    contractType: 'FULL_TIME' as const,
    description: 'Únete a nuestro equipo para desarrollar aplicaciones web modernas con React y TypeScript.',
    requirements: ['Experiencia en React y TypeScript'],
    skillsRequired: ['React', 'JavaScript', 'TypeScript', 'HTML'],
    desiredSkills: [],
    skills: ['React', 'JavaScript', 'TypeScript', 'HTML'],
    experienceLevel: 'MID_LEVEL' as const,
    jobType: 'Tiempo completo',
    salaryMin: 3500,
    salaryMax: 4500,
    salaryCurrency: 'Bs.',
    currency: 'Bs.',
    publishedDate: 'Hace 2 días',
    publishedAt: new Date().toISOString(),
    applicantCount: 47,
    applicationsCount: 47,
    viewCount: 234,
    viewsCount: 234,
    isFeatured: true,
    featured: true,
    isFavorite: false,
    isActive: true,
    status: 'ACTIVE' as const,
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleDocumentsReady = () => {
    setShowCVCheck(false);
    // In a real app, refresh document status here
  };

  const applicationForm = useFormik<ApplicationForm>({
    initialValues: {
      coverLetter: '',
      cvFile: '',
      additionalDocuments: [],
      customAnswers: {},
      availableStartDate: '',
      salaryExpectation: undefined,
    },
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        Alert.alert(
          'Aplicación enviada',
          'Tu aplicación ha sido enviada exitosamente. Te notificaremos cuando haya novedades.',
          [
            {
              text: 'Ver mis aplicaciones',
              onPress: () => router.replace('/jobs?tab=1'),
            },
            {
              text: 'Continuar buscando',
              onPress: () => router.replace('/jobs'),
              style: 'default',
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Hubo un problema al enviar tu aplicación. Intenta nuevamente.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSaveDraft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Borrador guardado', 'Tu aplicación ha sido guardada como borrador.');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar aplicación',
      '¿Estás seguro que deseas cancelar? Los cambios no guardados se perderán.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const getProfileColor = (percentage: number) => {
    if (percentage >= 80) return '#32D74B';
    if (percentage >= 60) return '#FF9500';
    return '#FF453A';
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: 'Aplicar empleo',
          headerShown: true,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Summary Card */}
        <View style={[styles.jobSummaryCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.jobSummaryHeader}>
            <View style={[styles.companyLogo, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name="briefcase-outline" size={24} color={iconColor} />
            </View>
            <View style={styles.jobSummaryInfo}>
              <ThemedText type="subtitle" style={[styles.jobSummaryTitle, { color: textColor }]}>
                {job.title}
              </ThemedText>
              <ThemedText style={[styles.jobSummaryCompany, { color: textColor }]}>
                {job.company?.name || 'Sin especificar'}
              </ThemedText>
              <ThemedText style={[styles.jobSummaryDetails, { color: secondaryTextColor }]}>
                {job.location} • {job.currency} {job.salaryMin}-{job.salaryMax}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.applyingBadge, { backgroundColor: iconColor + '15' }]}>
            <Ionicons name="send" size={16} color={iconColor} />
            <ThemedText style={[styles.applyingText, { color: iconColor }]}>
              Aplicando a este empleo
            </ThemedText>
          </View>
        </View>

        {/* Profile Completion Card */}
        <View style={[styles.profileCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.profileHeader}>
            <ThemedText type="subtitle" style={[styles.profileTitle, { color: textColor }]}>
              Completitud del perfil
            </ThemedText>
            <ThemedText style={[styles.profilePercentage, { color: getProfileColor(profileComplete) }]}>
              {profileComplete}%
            </ThemedText>
          </View>
          
          <View style={styles.profileBarContainer}>
            <View style={[styles.profileBar, { backgroundColor: borderColor }]}>
              <View 
                style={[
                  styles.profileBarFill, 
                  { 
                    backgroundColor: getProfileColor(profileComplete),
                    width: `${profileComplete}%`
                  }
                ]} 
              />
            </View>
          </View>

          <ThemedText style={[styles.profileTip, { color: secondaryTextColor }]}>
            Los empleadores prefieren perfiles completos. 
          </ThemedText>

          <TouchableOpacity style={styles.profileLink}>
            <ThemedText style={[styles.profileLinkText, { color: iconColor }]}>
              Completar mi perfil →
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Application Form Card */}
        <View style={[styles.formCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.formTitle, { color: textColor }]}>
            Información de aplicación
          </ThemedText>

          {/* Cover Letter */}
          <FormField
            label="Carta de presentación *"
            placeholder="Escribe una carta de presentación personalizada..."
            formikKey="coverLetter"
            formikProps={applicationForm as FormikProps<any>}
            multiline
            numberOfLines={6}
            style={styles.formField}
          />

          {/* CV Selection */}
          <View style={styles.cvSection}>
            <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
              Currículum Vitae *
            </ThemedText>
            <TouchableOpacity style={[styles.cvSelector, { borderColor }]}>
              <View style={styles.cvSelectorContent}>
                <Ionicons name="document-text-outline" size={24} color={iconColor} />
                <View style={styles.cvSelectorText}>
                  <ThemedText style={[styles.cvSelectorTitle, { color: textColor }]}>
                    CV_Juan_Perez_2025.pdf
                  </ThemedText>
                  <ThemedText style={[styles.cvSelectorSubtitle, { color: secondaryTextColor }]}>
                    Actualizado hace 2 días
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#32D74B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cvChangeButton}>
              <ThemedText style={[styles.cvChangeText, { color: iconColor }]}>
                Cambiar CV
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Additional Documents */}
          <View style={styles.documentsSection}>
            <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
              Documentos adicionales (opcional)
            </ThemedText>
            <TouchableOpacity style={[styles.uploadButton, { borderColor: iconColor }]}>
              <Ionicons name="cloud-upload-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.uploadButtonText, { color: iconColor }]}>
                Subir documentos
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Custom Questions */}
          <View style={styles.questionsSection}>
            <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
              Preguntas del empleador
            </ThemedText>
            
            <View style={styles.question}>
              <ThemedText style={[styles.questionText, { color: textColor }]}>
                ¿Por qué te interesa trabajar en TechCorp Bolivia?
              </ThemedText>
              <FormField
                label=""
                placeholder="Tu respuesta..."
                formikKey="question1"
                formikProps={applicationForm as FormikProps<any>}
                multiline
                numberOfLines={3}
                style={styles.questionField}
              />
            </View>

            <View style={styles.question}>
              <ThemedText style={[styles.questionText, { color: textColor }]}>
                ¿Cuál es tu experiencia con React y TypeScript?
              </ThemedText>
              <FormField
                label=""
                placeholder="Tu respuesta..."
                formikKey="question2"
                formikProps={applicationForm as FormikProps<any>}
                multiline
                numberOfLines={3}
                style={styles.questionField}
              />
            </View>
          </View>

          {/* Start Date */}
          <FormField
            label="Fecha de disponibilidad *"
            placeholder="¿Cuándo puedes empezar?"
            formikKey="availableStartDate"
            formikProps={applicationForm as FormikProps<any>}
            style={styles.formField}
          />

          {/* Salary Expectation */}
          <FormField
            label="Expectativa salarial (opcional)"
            placeholder="Ej: 3800"
            formikKey="salaryExpectation"
            formikProps={applicationForm as FormikProps<any>}
            keyboardType="numeric"
            style={styles.formField}
            leftIcon={<ThemedText style={{ color: secondaryTextColor }}>Bs.</ThemedText>}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: cardBackgroundColor, borderColor }]}>
        <View style={styles.actionRow}>
          <ThemedButton
            title="Guardar borrador"
            onPress={handleSaveDraft}
            type="outline"
            style={styles.draftButton}
          />
          <ThemedButton
            title={submitting ? "Enviando..." : "Enviar aplicación"}
            onPress={() => applicationForm.handleSubmit()}
            type="primary"
            style={styles.submitButton}
            loading={submitting}
            disabled={submitting}
          />
        </View>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <ThemedText style={[styles.cancelText, { color: secondaryTextColor }]}>
            Cancelar
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* CV Check Modal */}
      <CVCheckModal
        isOpen={showCVCheck}
        onClose={() => setShowCVCheck(false)}
        onDocumentsReady={handleDocumentsReady}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobSummaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobSummaryInfo: {
    flex: 1,
  },
  jobSummaryTitle: {
    marginBottom: 4,
    lineHeight: 20,
  },
  jobSummaryCompany: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobSummaryDetails: {
    fontSize: 14,
    fontWeight: '500',
  },
  applyingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  applyingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileTitle: {
    flex: 1,
  },
  profilePercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileBarContainer: {
    marginBottom: 12,
  },
  profileBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  profileBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  profileTip: {
    fontSize: 14,
    marginBottom: 8,
  },
  profileLink: {
    alignSelf: 'flex-start',
  },
  profileLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cvSection: {
    marginBottom: 20,
  },
  cvSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  cvSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cvSelectorText: {
    marginLeft: 12,
    flex: 1,
  },
  cvSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cvSelectorSubtitle: {
    fontSize: 12,
  },
  cvChangeButton: {
    alignSelf: 'flex-start',
  },
  cvChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentsSection: {
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionsSection: {
    marginBottom: 20,
  },
  question: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  questionField: {
    marginBottom: 0,
  },
  bottomSpacing: {
    height: 120,
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  draftButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  questionSkeleton: {
    marginBottom: 16,
  },
  skeletonQuestionText: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonQuestionField: {
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 