import { FormField } from '@/app/components/FormField';
import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CVCheckModal } from '@/app/components/jobs/CVCheckModal';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useCVStatus } from '@/app/hooks/useCVStatus';
import { useJobQuestions } from '@/app/hooks/useJobQuestions';
import { useToast, toastMessages } from '@/app/hooks/useToast';
import { ApplicationForm, JobOffer } from '@/app/types/jobs';
import { apiService } from '@/app/services/apiService';
import { useAuthStore } from '@/app/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Shimmer from '@/app/components/Shimmer';

export default function ApplyScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const { tokens } = useAuthStore();
  const [profileComplete, setProfileComplete] = useState(0);
  const [profileMissingFields, setProfileMissingFields] = useState<string[]>([]);
  const [showCVCheck, setShowCVCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const { hasCV, hasCoverLetter, cvUrl, coverLetterUrl, loading: cvLoading, checkCVStatus } = useCVStatus();
  const { questions, loading: questionsLoading, error: questionsError, fetchQuestions } = useJobQuestions();
  const { toast } = useToast();

  // Fetch job data from API
  useEffect(() => {
    if (jobId && tokens?.token) {
      fetchJobDetail();
      checkCVStatus();
      fetchProfileCompletion();
    }
  }, [jobId, tokens?.token]);

  // Fetch job questions when job is loaded
  useEffect(() => {
    if (job && tokens?.token) {
      fetchQuestions(job.id);
    }
  }, [job?.id, tokens?.token]);

  const fetchJobDetail = async (retryCount = 0) => {
    if (!jobId || !tokens?.token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getJobDetail(tokens.token, jobId);
      if (response.success && response.data) {
        // Transform API data to UI format
        const apiJob = response.data;
        const transformedJob: JobOffer = {
          ...apiJob,
          companyData: apiJob.company,
          company: typeof apiJob.company === 'string' ? apiJob.company : apiJob.company?.name || 'Sin especificar',
          companyRating: apiJob.company?.rating || 4.0,
          workMode: apiJob.workModality === 'ON_SITE' ? 'Presencial' : 
                    apiJob.workModality === 'REMOTE' ? 'Remoto' : 'Híbrido',
          skills: [...(apiJob.skillsRequired || []), ...(apiJob.desiredSkills || [])],
          jobType: apiJob.contractType === 'FULL_TIME' ? 'Tiempo completo' :
                   apiJob.contractType === 'PART_TIME' ? 'Medio tiempo' : 'Prácticas',
          currency: apiJob.salaryCurrency || 'Bs.',
          publishedDate: new Date(apiJob.publishedAt).toLocaleDateString('es-ES'),
          applicantCount: apiJob.applicationsCount,
          viewCount: apiJob.viewsCount,
          isFeatured: apiJob.featured,
          isFavorite: false,
        };
        setJob(transformedJob);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch job details');
      }
    } catch (err) {
      console.error('Error fetching job detail:', err);
      
      // Retry mechanism for network errors
      if (retryCount < 2 && err instanceof Error && 
          (err.message.includes('network') || err.message.includes('fetch'))) {
        console.log(`Retrying job fetch, attempt ${retryCount + 1}`);
        setTimeout(() => fetchJobDetail(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      // Set appropriate error message
      let errorMessage = 'Error desconocido al cargar el empleo';
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('token')) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Este empleo ya no está disponible o fue eliminado.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileCompletion = async (retryCount = 0) => {
    if (!tokens?.token) return;

    try {
      const response = await apiService.getProfileCompletion(tokens.token);
      if (response.success && response.data) {
        setProfileComplete(response.data.completionPercentage);
        setProfileMissingFields(response.data.missingFields || []);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch profile completion');
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error);
      
      // Retry mechanism for network errors
      if (retryCount < 1 && error instanceof Error && 
          (error.message.includes('network') || error.message.includes('fetch'))) {
        console.log(`Retrying profile completion fetch, attempt ${retryCount + 1}`);
        setTimeout(() => fetchProfileCompletion(retryCount + 1), 1000);
        return;
      }
      
      // Set fallback values if API fails after retries
      setProfileComplete(75);
      setProfileMissingFields([]);
    }
  };

  const handleDocumentsReady = async () => {
    setShowCVCheck(false);
    // Refresh document status
    await checkCVStatus();
    // Re-validate form after documents are ready
    applicationForm.validateForm();
  };

  // Utility function to extract filename from URL
  const extractFileName = (url: string): string => {
    if (!url) return 'Documento';
    
    try {
      // Extract filename from URL path
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split('/').pop() || 'Documento';
      
      // If filename is too long, truncate it
      if (fileName.length > 30) {
        const extension = fileName.split('.').pop();
        const name = fileName.substring(0, 25);
        return `${name}...${extension ? '.' + extension : ''}`;
      }
      
      return fileName;
    } catch (error) {
      // If URL parsing fails, try to extract from the end of the string
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Documento';
    }
  };

  const applicationForm = useFormik<ApplicationForm>({
    initialValues: {
      coverLetter: '',
      cvFile: cvUrl || '',
      additionalDocuments: [],
      customAnswers: {},
      availableStartDate: '',
      salaryExpectation: undefined,
    },
    enableReinitialize: true, // Re-initialize when CV status changes
    validate: (values) => {
      const errors: any = {};
      
      // Validate documents
      if (!hasCV && !hasCoverLetter) {
        errors.documents = 'Necesitas al menos un CV o carta de presentación PDF';
      }
      
      // Validate cover letter
      if (values.coverLetter && values.coverLetter.length > 1000) {
        errors.coverLetter = 'La carta de presentación no puede exceder 1000 caracteres';
      }
      
      // Validate required questions
      const requiredQuestions = questions.filter(q => q.required);
      for (const question of requiredQuestions) {
        const answer = values.customAnswers[question.id];
        if (!answer || !answer.toString().trim()) {
          errors[`question_${question.id}`] = `Debes responder: "${question.question}"`;
        } else {
          // Validate answer length for text questions
          if (question.type === 'text' && answer.toString().length > 500) {
            errors[`question_${question.id}`] = `La respuesta no puede exceder 500 caracteres`;
          }
        }
      }
      
      // Validate start date
      if (values.availableStartDate && values.availableStartDate.trim()) {
        const startDate = new Date(values.availableStartDate);
        const today = new Date();
        if (startDate < today) {
          errors.availableStartDate = 'La fecha de disponibilidad debe ser futura';
        }
      }
      
      // Validate salary expectation
      if (values.salaryExpectation && (values.salaryExpectation < 0 || values.salaryExpectation > 50000)) {
        errors.salaryExpectation = 'La expectativa salarial debe estar entre 0 y 50,000 Bs.';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      if (!job || !tokens?.token) {
        toast(toastMessages.unexpectedError);
        return;
      }

      // Validate form before submitting
      const formErrors = applicationForm.errors;
      if (Object.keys(formErrors).length > 0) {
        toast({
          title: 'Formulario incompleto',
          description: 'Por favor completa todos los campos requeridos',
          variant: 'error'
        });
        return;
      }

      // Check documents before submitting
      if (!hasCV && !hasCoverLetter) {
        toast({
          title: 'Documentos requeridos',
          description: 'Necesitas al menos un CV o carta de presentación PDF para aplicar',
          variant: 'error'
        });
        setShowCVCheck(true);
        return;
      }

      // Validate required questions
      const requiredQuestions = questions.filter(q => q.required);
      const missingAnswers = requiredQuestions.filter(q => 
        !values.customAnswers[q.id] || !values.customAnswers[q.id].toString().trim()
      );
      
      if (missingAnswers.length > 0) {
        toast({
          title: 'Preguntas incompletas',
          description: `Debes responder todas las preguntas obligatorias (${missingAnswers.length} pendientes)`,
          variant: 'error'
        });
        return;
      }

      setSubmitting(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Prepare question answers
        const questionAnswers = questions
          .filter(q => values.customAnswers[q.id])
          .map(q => ({
            questionId: q.id,
            question: q.question,
            answer: values.customAnswers[q.id].toString(),
          }));

        const applicationData = {
          jobOfferId: job.id,
          cvUrl: hasCV ? cvUrl : undefined,
          coverLetterUrl: hasCoverLetter ? coverLetterUrl : undefined,
          status: 'PENDING' as const,
          message: values.coverLetter.trim() || undefined,
          questionAnswers,
        };

        const response = await apiService.createApplication(tokens.token, applicationData);
        
        if (response.success) {
          toast(toastMessages.applicationSubmitted);
          
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
        } else {
          throw new Error(response.error?.message || 'Failed to submit application');
        }
      } catch (error) {
        console.error('Error submitting application:', error);
        
        // Handle specific error types
        let errorTitle = 'Error al enviar aplicación';
        let errorDescription = 'No se pudo enviar la aplicación. Intenta nuevamente.';
        
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('token')) {
            errorTitle = 'Sesión expirada';
            errorDescription = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorTitle = 'Error de conexión';
            errorDescription = 'Verifica tu conexión a internet e intenta nuevamente.';
          } else if (error.message.includes('already applied')) {
            errorTitle = 'Aplicación duplicada';
            errorDescription = 'Ya has aplicado a este empleo anteriormente.';
          } else {
            errorDescription = error.message;
          }
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: 'error'
        });
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

  const renderQuestionInput = (question: any) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <View style={styles.pickerContainer}>
            {question.options?.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { 
                    borderColor,
                    backgroundColor: applicationForm.values.customAnswers[question.id] === option 
                      ? iconColor + '20' 
                      : 'transparent'
                  }
                ]}
                onPress={() => {
                  applicationForm.setFieldValue(`customAnswers.${question.id}`, option);
                }}
              >
                <ThemedText style={[styles.optionText, { color: textColor }]}>
                  {option}
                </ThemedText>
                {applicationForm.values.customAnswers[question.id] === option && (
                  <Ionicons name="checkmark-circle" size={20} color={iconColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'boolean':
        return (
          <View style={styles.pickerContainer}>
            {['Sí', 'No'].map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { 
                    borderColor,
                    backgroundColor: applicationForm.values.customAnswers[question.id] === option 
                      ? iconColor + '20' 
                      : 'transparent'
                  }
                ]}
                onPress={() => {
                  applicationForm.setFieldValue(`customAnswers.${question.id}`, option);
                }}
              >
                <ThemedText style={[styles.optionText, { color: textColor }]}>
                  {option}
                </ThemedText>
                {applicationForm.values.customAnswers[question.id] === option && (
                  <Ionicons name="checkmark-circle" size={20} color={iconColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'text':
      default:
        return (
          <FormField
            label=""
            placeholder="Tu respuesta..."
            formikKey={`customAnswers.${question.id}`}
            formikProps={applicationForm as FormikProps<any>}
            multiline
            numberOfLines={3}
            style={styles.questionField}
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: 'Cargando...',
            headerShown: true,
          }}
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Job Summary Skeleton */}
          <Shimmer>
            <View style={[styles.jobSummaryCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <View style={styles.jobSummaryHeader}>
                <View style={[styles.companyLogo, { backgroundColor: iconColor + '20' }]} />
                <View style={styles.jobSummaryInfo}>
                  <View style={[styles.skeletonTitle, { backgroundColor: secondaryTextColor + '30' }]} />
                  <View style={[styles.skeletonCompany, { backgroundColor: secondaryTextColor + '30' }]} />
                  <View style={[styles.skeletonDetails, { backgroundColor: secondaryTextColor + '30' }]} />
                </View>
              </View>
            </View>
          </Shimmer>
          
          {/* Form Skeleton */}
          <Shimmer>
            <View style={[styles.formCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <View style={[styles.skeletonFormTitle, { backgroundColor: secondaryTextColor + '30' }]} />
              {[1, 2, 3, 4, 5].map((index) => (
                <View key={index} style={styles.questionSkeleton}>
                  <View style={[styles.skeletonQuestionText, { backgroundColor: secondaryTextColor + '30' }]} />
                  <View style={[styles.skeletonQuestionField, { backgroundColor: secondaryTextColor + '30', borderColor }]} />
                </View>
              ))}
            </View>
          </Shimmer>
        </ScrollView>
      </ThemedView>
    );
  }

  // Error state
  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: 'Error',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF453A" />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Error al cargar el empleo
          </ThemedText>
          <ThemedText style={[{ color: secondaryTextColor, textAlign: 'center', marginTop: 8 }]}>
            {error}
          </ThemedText>
          <ThemedButton
            title="Reintentar"
            onPress={() => fetchJobDetail()}
            type="primary"
            style={{ marginTop: 20, minWidth: 120 }}
          />
          <ThemedButton
            title="Volver"
            onPress={() => router.back()}
            type="outline"
            style={{ marginTop: 12, minWidth: 120 }}
          />
        </View>
      </ThemedView>
    );
  }

  // Job not found
  if (!job) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: 'No encontrado',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF9500" />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Empleo no encontrado
          </ThemedText>
          <ThemedText style={[{ color: secondaryTextColor, textAlign: 'center', marginTop: 8 }]}>
            No se pudo encontrar la información de este empleo.
          </ThemedText>
          <ThemedButton
            title="Volver"
            onPress={() => router.back()}
            type="primary"
            style={{ marginTop: 20, minWidth: 120 }}
          />
        </View>
      </ThemedView>
    );
  }

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
                {job.company}
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

          {/* CV and Cover Letter Status */}
          <View style={styles.cvSection}>
            <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
              Documentos requeridos *
            </ThemedText>
            <ThemedText style={[styles.documentHint, { color: secondaryTextColor }]}>
              Necesitas al menos un CV o carta de presentación PDF
            </ThemedText>
            
            {cvLoading ? (
              <Shimmer>
                <View style={styles.documentLoadingContainer}>
                  <View style={[styles.documentLoadingSkeleton, { backgroundColor: secondaryTextColor + '30', borderColor }]} />
                  <View style={[styles.documentLoadingSkeleton, { backgroundColor: secondaryTextColor + '30', borderColor }]} />
                </View>
              </Shimmer>
            ) : (
              <>
            {/* CV Status */}
            <View style={styles.documentItem}>
              <View style={[styles.documentSelector, { borderColor: hasCV ? '#32D74B' : borderColor }]}>
                <View style={styles.documentSelectorContent}>
                  <Ionicons 
                    name={hasCV ? "document-text" : "document-text-outline"} 
                    size={24} 
                    color={hasCV ? '#32D74B' : iconColor} 
                  />
                  <View style={styles.documentSelectorText}>
                    <ThemedText style={[styles.documentSelectorTitle, { color: textColor }]}>
                      {hasCV ? (
                        cvUrl ? extractFileName(cvUrl) : 'CV disponible'
                      ) : (
                        'Sin CV'
                      )}
                    </ThemedText>
                    <ThemedText style={[styles.documentSelectorSubtitle, { color: secondaryTextColor }]}>
                      {hasCV ? 'CV cargado correctamente' : 'No has subido un CV'}
                    </ThemedText>
                  </View>
                </View>
                {hasCV ? (
                  <Ionicons name="checkmark-circle" size={20} color="#32D74B" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="#FF453A" />
                )}
              </View>
            </View>

            {/* Cover Letter Status */}
            <View style={styles.documentItem}>
              <View style={[styles.documentSelector, { borderColor: hasCoverLetter ? '#32D74B' : borderColor }]}>
                <View style={styles.documentSelectorContent}>
                  <Ionicons 
                    name={hasCoverLetter ? "document-text" : "document-text-outline"} 
                    size={24} 
                    color={hasCoverLetter ? '#32D74B' : iconColor} 
                  />
                  <View style={styles.documentSelectorText}>
                    <ThemedText style={[styles.documentSelectorTitle, { color: textColor }]}>
                      {hasCoverLetter ? (
                        coverLetterUrl ? extractFileName(coverLetterUrl) : 'Carta de presentación disponible'
                      ) : (
                        'Sin carta de presentación'
                      )}
                    </ThemedText>
                    <ThemedText style={[styles.documentSelectorSubtitle, { color: secondaryTextColor }]}>
                      {hasCoverLetter ? 'Carta cargada correctamente' : 'No has subido una carta de presentación'}
                    </ThemedText>
                  </View>
                </View>
                {hasCoverLetter ? (
                  <Ionicons name="checkmark-circle" size={20} color="#32D74B" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="#FF453A" />
                )}
              </View>
            </View>

            {/* Document Management Actions */}
            <View style={styles.documentActions}>
              {(!hasCV && !hasCoverLetter) ? (
                <TouchableOpacity 
                  style={[styles.uploadDocumentButton, { backgroundColor: iconColor }]}
                  onPress={() => setShowCVCheck(true)}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color="white" />
                  <ThemedText style={[styles.uploadDocumentButtonText, { color: 'white' }]}>
                    Subir documentos
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <View style={styles.documentManagementActions}>
                  <TouchableOpacity 
                    style={[styles.manageDocumentButton, { borderColor: iconColor }]}
                    onPress={() => setShowCVCheck(true)}
                  >
                    <Ionicons name="settings-outline" size={16} color={iconColor} />
                    <ThemedText style={[styles.manageDocumentText, { color: iconColor }]}>
                      Gestionar documentos
                    </ThemedText>
                  </TouchableOpacity>
                  
                  {hasCV && cvUrl && (
                    <TouchableOpacity style={[styles.viewDocumentButton, { borderColor: secondaryTextColor }]}>
                      <Ionicons name="eye-outline" size={16} color={secondaryTextColor} />
                      <ThemedText style={[styles.viewDocumentText, { color: secondaryTextColor }]}>
                        Ver CV
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Document Status Summary */}
            {!hasCV && !hasCoverLetter && (
              <View style={[styles.documentWarning, { backgroundColor: '#FF453A' + '15', borderColor: '#FF453A' }]}>
                <Ionicons name="warning-outline" size={16} color="#FF453A" />
                <ThemedText style={[styles.documentWarningText, { color: '#FF453A' }]}>
                  Debes subir al menos un documento para aplicar
                </ThemedText>
              </View>
            )}
              </>
            )}
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
          {questionsLoading ? (
            <Shimmer>
              <View style={styles.questionsSection}>
                <View style={[styles.skeletonQuestionTitle, { backgroundColor: secondaryTextColor + '30' }]} />
                {[1, 2].map((index) => (
                  <View key={index} style={styles.questionSkeleton}>
                    <View style={[styles.skeletonQuestionText, { backgroundColor: secondaryTextColor + '30' }]} />
                    <View style={[styles.skeletonQuestionField, { backgroundColor: secondaryTextColor + '30', borderColor }]} />
                  </View>
                ))}
              </View>
            </Shimmer>
          ) : questions.length > 0 ? (
            <View style={styles.questionsSection}>
              <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                Preguntas del empleador
              </ThemedText>
              
              {questions.map((question, index) => (
                <View key={question.id} style={styles.question}>
                  <ThemedText style={[styles.questionText, { color: textColor }]}>
                    {question.question} {question.required && <ThemedText style={[styles.requiredAsterisk, { color: '#FF453A' }]}>*</ThemedText>}
                  </ThemedText>
                  
                  {renderQuestionInput(question)}
                  
                  {(applicationForm.errors as any)[`question_${question.id}`] && (
                    <ThemedText style={[styles.errorText, { color: '#FF453A' }]}>
                      {(applicationForm.errors as any)[`question_${question.id}`]}
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          ) : null}

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
  documentHint: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  documentItem: {
    marginBottom: 12,
  },
  documentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  documentSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentSelectorText: {
    marginLeft: 12,
    flex: 1,
  },
  documentSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  documentSelectorSubtitle: {
    fontSize: 12,
  },
  documentActions: {
    marginTop: 8,
  },
  uploadDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadDocumentButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentManagementActions: {
    flexDirection: 'row',
    gap: 12,
  },
  manageDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  manageDocumentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  viewDocumentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  documentWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  documentWarningText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  documentLoadingContainer: {
    gap: 12,
  },
  documentLoadingSkeleton: {
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
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
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCompany: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDetails: {
    height: 16,
    width: '70%',
    borderRadius: 4,
  },
  skeletonFormTitle: {
    height: 20,
    width: '50%',
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  skeletonQuestionTitle: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: 16,
  },
  requiredAsterisk: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 