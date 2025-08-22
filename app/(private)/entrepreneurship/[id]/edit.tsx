import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TextInputProps,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedButton } from '../../../components/ThemedButton';
// Remove FormField import since we'll create our own input component
import Shimmer from '../../../components/Shimmer';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useAuth } from '../../../components/AuthContext';
import { useEntrepreneurship } from '../../../hooks/useEntrepreneurship';
import { EditFormData } from '../../../types/entrepreneurship';

// Custom Input Component
interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ 
  label, 
  error, 
  required = false, 
  style, 
  ...props 
}) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');

  return (
    <View style={inputStyles.container}>
      <ThemedText style={[inputStyles.label, { color: textColor }]}>
        {label}{required && ' *'}
      </ThemedText>
      <TextInput
        style={[
          inputStyles.input,
          {
            color: textColor,
            borderColor: error ? '#FF3B30' : borderColor,
            backgroundColor,
          },
          style
        ]}
        placeholderTextColor={secondaryTextColor}
        {...props}
      />
      {error && (
        <ThemedText style={inputStyles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});

// Custom URL validation for social media
const validateSocialMediaUrl = (url: string, platform: string): boolean => {
  if (!url) return true; // Empty URLs are allowed
  
  const patterns = {
    facebook: /^https?:\/\/(www\.)?(facebook|fb)\.com\/[a-zA-Z0-9\.\-_]+\/?$/,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9\.\-_]+\/?$/,
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9\-_]+\/?$/,
  };
  
  return patterns[platform as keyof typeof patterns]?.test(url) || false;
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_.áéíóúñÁÉÍÓÚÑ]+$/, 'El nombre contiene caracteres no válidos')
    .required('El nombre es requerido'),
  description: Yup.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .required('La descripción es requerida'),
  category: Yup.string().required('La categoría es requerida'),
  businessStage: Yup.string().required('La etapa del negocio es requerida'),
  municipality: Yup.string()
    .min(2, 'El municipio debe tener al menos 2 caracteres')
    .matches(/^[a-zA-Z\s\-áéíóúñÁÉÍÓÚÑ]+$/, 'El municipio contiene caracteres no válidos')
    .required('El municipio es requerido'),
  department: Yup.string().required('El departamento es requerido'),
  email: Yup.string()
    .email('Email inválido')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido')
    .required('El email es requerido'),
  phone: Yup.string()
    .matches(/^[\+]?[0-9\s\-()]{7,15}$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos'),
  website: Yup.string()
    .url('URL inválida')
    .matches(/^https?:\/\/.+\..+/, 'La URL debe incluir http:// o https://'),
  socialMedia: Yup.object().shape({
    facebook: Yup.string().test(
      'facebook-url',
      'URL de Facebook inválida. Debe ser como: https://facebook.com/tuempresa',
      (value) => validateSocialMediaUrl(value || '', 'facebook')
    ),
    instagram: Yup.string().test(
      'instagram-url',
      'URL de Instagram inválida. Debe ser como: https://instagram.com/tuempresa',
      (value) => validateSocialMediaUrl(value || '', 'instagram')
    ),
    linkedin: Yup.string().test(
      'linkedin-url',
      'URL de LinkedIn inválida. Debe ser como: https://linkedin.com/company/tuempresa',
      (value) => validateSocialMediaUrl(value || '', 'linkedin')
    ),
  }),
  founded: Yup.string()
    .matches(/^[0-9]{4}$/, 'Debe ser un año válido de 4 dígitos')
    .test('valid-year', 'El año debe estar entre 1900 y el año actual', (value) => {
      if (!value) return true;
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear;
    }),
  employees: Yup.string()
    .matches(/^[0-9]+$/, 'Debe ser un número entero')
    .test('positive-number', 'Debe ser un número mayor a 0', (value) => {
      if (!value) return true;
      return parseInt(value) > 0;
    }),
  annualRevenue: Yup.string()
    .matches(/^[0-9]+$/, 'Debe ser un número entero')
    .test('positive-number', 'Debe ser un número mayor a 0', (value) => {
      if (!value) return true;
      return parseInt(value) > 0;
    }),
});

const BUSINESS_STAGES = [
  { label: 'Idea', value: 'IDEA' },
  { label: 'Startup', value: 'STARTUP' },
  { label: 'En Crecimiento', value: 'GROWING' },
  { label: 'Establecido', value: 'ESTABLISHED' },
];

const CATEGORIES = [
  'Tecnología',
  'Comercio',
  'Servicios',
  'Manufactura',
  'Agricultura',
  'Turismo',
  'Educación',
  'Salud',
  'Otro',
];

const DEPARTMENTS = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Tarija',
  'Sucre',
  'Beni',
  'Pando',
];

interface ImageUploadState {
  uploading: boolean;
  progress: number;
  uri?: string;
  error?: string;
}

export default function EditEntrepreneurshipScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { entrepreneurship, loading, error, fetchEntrepreneurship, updateEntrepreneurship } = useEntrepreneurship(id);
  
  const [isSaving, setIsSaving] = useState(false);
  const [logoUpload, setLogoUpload] = useState<ImageUploadState>({ uploading: false, progress: 0 });
  const [imagesUpload, setImagesUpload] = useState<ImageUploadState>({ uploading: false, progress: 0 });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const isOwner = user?.id === entrepreneurship?.ownerId;

  useEffect(() => {
    if (!loading && !isOwner) {
      Alert.alert(
        'Acceso Denegado',
        'No tienes permisos para editar este proyecto.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [loading, isOwner, router]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const validateFormData = (values: EditFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Real-time custom validations
    if (values.name && values.name.length < 2) {
      errors.name = 'El nombre es demasiado corto';
    }
    
    if (values.email && !values.email.includes('@')) {
      errors.email = 'Email debe contener @';
    }
    
    if (values.phone && values.phone.length > 0 && values.phone.length < 7) {
      errors.phone = 'Teléfono muy corto';
    }
    
    return errors;
  };

  const handleImagePicker = async (type: 'logo' | 'images') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesita acceso a la galería para subir imágenes.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
        allowsMultipleSelection: type === 'images',
      });

      if (!result.canceled && result.assets[0]) {
        const uploadState = type === 'logo' ? setLogoUpload : setImagesUpload;
        
        uploadState({ uploading: true, progress: 0 });
        
        // Simulate upload progress
        const interval = setInterval(() => {
          uploadState(prev => ({ 
            ...prev, 
            progress: Math.min(prev.progress + 10, 90) 
          }));
        }, 200);

        // TODO: Implement actual image upload to API
        setTimeout(() => {
          clearInterval(interval);
          uploadState({ 
            uploading: false, 
            progress: 100, 
            uri: result.assets[0].uri 
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 3000);
      }
    } catch (error) {
      const uploadState = type === 'logo' ? setLogoUpload : setImagesUpload;
      uploadState({ 
        uploading: false, 
        progress: 0, 
        error: 'Error al subir imagen' 
      });
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  };

  const handleSubmit = async (values: EditFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      setValidationErrors({});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Additional client-side validation
      const clientErrors = validateFormData(values);
      if (Object.keys(clientErrors).length > 0) {
        setValidationErrors(clientErrors);
        setIsSaving(false);
        return;
      }

      const success = await updateEntrepreneurship(id, values);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Éxito',
          'El proyecto ha sido actualizado correctamente.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'No se pudo actualizar el proyecto. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Handle validation errors from API
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      } else {
        Alert.alert('Error', err.message || 'Error inesperado');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderLoadingState = () => (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Editar Proyecto
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {[...Array(4)].map((_, index) => (
          <Shimmer key={index}>
            <View style={[styles.section, { backgroundColor: cardColor }]}>
              <View style={[styles.titlePlaceholder, { backgroundColor: borderColor }]} />
              {[...Array(3)].map((_, i) => (
                <View key={i} style={[styles.fieldPlaceholder, { backgroundColor: borderColor }]} />
              ))}
            </View>
          </Shimmer>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  if (loading) return renderLoadingState();

  if (!entrepreneurship || !isOwner) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Error
          </ThemedText>
          <View style={styles.headerActions} />
        </ThemedView>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={secondaryTextColor} />
          <ThemedText type="subtitle" style={[styles.errorTitle, { color: textColor }]}>
            {error || 'No se pudo cargar el proyecto'}
          </ThemedText>
          <ThemedText style={[styles.errorMessage, { color: secondaryTextColor }]}>
            Verifica que tienes permisos para editar este proyecto.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const initialValues: EditFormData = {
    name: entrepreneurship.name || '',
    description: entrepreneurship.description || '',
    category: entrepreneurship.category || '',
    subcategory: entrepreneurship.subcategory || '',
    businessStage: entrepreneurship.businessStage || 'IDEA',
    municipality: entrepreneurship.municipality || '',
    department: entrepreneurship.department || '',
    website: entrepreneurship.website || '',
    email: entrepreneurship.email || '',
    phone: entrepreneurship.phone || '',
    address: entrepreneurship.address || '',
    socialMedia: {
      facebook: entrepreneurship.socialMedia?.facebook || '',
      instagram: entrepreneurship.socialMedia?.instagram || '',
      linkedin: entrepreneurship.socialMedia?.linkedin || '',
    },
    founded: entrepreneurship.founded ? new Date(entrepreneurship.founded).getFullYear().toString() : '',
    employees: entrepreneurship.employees?.toString() || '',
    annualRevenue: entrepreneurship.annualRevenue?.toString() || '',
    businessModel: entrepreneurship.businessModel || '',
    targetMarket: entrepreneurship.targetMarket || '',
    isPublic: entrepreneurship.isPublic,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Editar Proyecto
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, values, errors, touched, setFieldValue, isValid, dirty }) => (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Image Upload Section */}
              <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                  Imágenes del Proyecto
                </ThemedText>

                {/* Logo Upload */}
                <View style={styles.imageUploadContainer}>
                  <ThemedText style={[styles.imageLabel, { color: textColor }]}>
                    Logo de la Empresa
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.imageUploadButton, { borderColor }]}
                    onPress={() => handleImagePicker('logo')}
                    disabled={logoUpload.uploading}
                  >
                    {logoUpload.uploading ? (
                      <View style={styles.uploadProgress}>
                        <ActivityIndicator size="small" color={iconColor} />
                        <ThemedText style={[styles.uploadText, { color: textColor }]}>
                          Subiendo... {logoUpload.progress}%
                        </ThemedText>
                      </View>
                    ) : logoUpload.uri ? (
                      <View style={styles.imagePreview}>
                        <Image source={{ uri: logoUpload.uri }} style={styles.logoPreview} />
                        <ThemedText style={[styles.uploadText, { color: textColor }]}>
                          Toca para cambiar
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Ionicons name="camera" size={32} color={secondaryTextColor} />
                        <ThemedText style={[styles.uploadText, { color: secondaryTextColor }]}>
                          Subir Logo
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                  {logoUpload.error && (
                    <ThemedText style={styles.errorText}>
                      {logoUpload.error}
                    </ThemedText>
                  )}
                </View>

                {/* Gallery Images Upload */}
                <View style={styles.imageUploadContainer}>
                  <ThemedText style={[styles.imageLabel, { color: textColor }]}>
                    Imágenes de Galería
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.imageUploadButton, styles.galleryUpload, { borderColor }]}
                    onPress={() => handleImagePicker('images')}
                    disabled={imagesUpload.uploading}
                  >
                    {imagesUpload.uploading ? (
                      <View style={styles.uploadProgress}>
                        <ActivityIndicator size="small" color={iconColor} />
                        <ThemedText style={[styles.uploadText, { color: textColor }]}>
                          Subiendo... {imagesUpload.progress}%
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Ionicons name="images" size={32} color={secondaryTextColor} />
                        <ThemedText style={[styles.uploadText, { color: secondaryTextColor }]}>
                          Subir Imágenes (hasta 5)
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                  {imagesUpload.error && (
                    <ThemedText style={styles.errorText}>
                      {imagesUpload.error}
                    </ThemedText>
                  )}
                </View>
              </ThemedView>

              {/* Basic Information */}
              <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                  Información Básica
                </ThemedText>

                <CustomInput
                  label="Nombre del Proyecto"
                  value={values.name}
                  onChangeText={(text) => setFieldValue('name', text)}
                  placeholder="Ej: Mi Startup Innovadora"
                  error={touched.name && errors.name ? errors.name : undefined}
                  required
                />

                <View style={styles.fieldContainer}>
                  <CustomInput
                    label="Descripción"
                    value={values.description}
                    onChangeText={(text) => {
                      setFieldValue('description', text);
                      // Clear validation error when typing
                      if (validationErrors.description) {
                        setValidationErrors(prev => ({ ...prev, description: '' }));
                      }
                    }}
                    placeholder="Describe detalladamente tu proyecto de emprendimiento..."
                    multiline
                    numberOfLines={6}
                    error={touched.description && errors.description ? errors.description : validationErrors.description}
                    required
                    style={{ height: 120, textAlignVertical: 'top' }}
                  />
                  <View style={styles.characterCount}>
                    <ThemedText style={[styles.characterCountText, { color: secondaryTextColor }]}>
                      {values.description.length}/1000 caracteres
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.fieldContainer}>
                  <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                    Categoría *
                  </ThemedText>
                  <View style={[styles.selectContainer, { borderColor }]}>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => {
                        const buttons = [
                          ...CATEGORIES.map(category => ({
                            text: category,
                            onPress: () => setFieldValue('category', category),
                          })),
                          { text: 'Cancelar', style: 'cancel' as const }
                        ];
                        Alert.alert('Seleccionar Categoría', '', buttons);
                      }}
                    >
                      <ThemedText style={[styles.selectText, { color: values.category ? textColor : secondaryTextColor }]}>
                        {values.category || 'Selecciona una categoría'}
                      </ThemedText>
                      <Ionicons name="chevron-down" size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                  </View>
                  {touched.category && errors.category && (
                    <ThemedText style={styles.errorText}>{errors.category}</ThemedText>
                  )}
                </View>

                <CustomInput
                  label="Subcategoría"
                  value={values.subcategory}
                  onChangeText={(text) => setFieldValue('subcategory', text)}
                  placeholder="Subcategoría específica"
                />

                <View style={styles.fieldContainer}>
                  <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                    Etapa del Negocio *
                  </ThemedText>
                  <View style={[styles.selectContainer, { borderColor }]}>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => {
                        const buttons = [
                          ...BUSINESS_STAGES.map(stage => ({
                            text: stage.label,
                            onPress: () => setFieldValue('businessStage', stage.value),
                          })),
                          { text: 'Cancelar', style: 'cancel' as const }
                        ];
                        Alert.alert('Seleccionar Etapa', '', buttons);
                      }}
                    >
                      <ThemedText style={[styles.selectText, { color: textColor }]}>
                        {BUSINESS_STAGES.find(stage => stage.value === values.businessStage)?.label || 'Selecciona la etapa'}
                      </ThemedText>
                      <Ionicons name="chevron-down" size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                  </View>
                  {touched.businessStage && errors.businessStage && (
                    <ThemedText style={styles.errorText}>{errors.businessStage}</ThemedText>
                  )}
                </View>
              </ThemedView>

              {/* Location & Contact */}
              <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                  Ubicación y Contacto
                </ThemedText>

                <View style={styles.fieldContainer}>
                  <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                    Departamento *
                  </ThemedText>
                  <View style={[styles.selectContainer, { borderColor }]}>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => {
                        const buttons = [
                          ...DEPARTMENTS.map(dept => ({
                            text: dept,
                            onPress: () => setFieldValue('department', dept),
                          })),
                          { text: 'Cancelar', style: 'cancel' as const }
                        ];
                        Alert.alert('Seleccionar Departamento', '', buttons);
                      }}
                    >
                      <ThemedText style={[styles.selectText, { color: values.department ? textColor : secondaryTextColor }]}>
                        {values.department || 'Selecciona un departamento'}
                      </ThemedText>
                      <Ionicons name="chevron-down" size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                  </View>
                  {touched.department && errors.department && (
                    <ThemedText style={styles.errorText}>{errors.department}</ThemedText>
                  )}
                </View>

                <CustomInput
                  label="Municipio"
                  value={values.municipality}
                  onChangeText={(text: string) => setFieldValue('municipality', text)}
                  placeholder="Municipio o ciudad"
                  error={touched.municipality && errors.municipality ? errors.municipality : undefined}
                  required
                />

                <CustomInput
                  label="Dirección"
                  value={values.address}
                  onChangeText={(text: string) => setFieldValue('address', text)}
                  placeholder="Dirección completa (opcional)"
                />

                <CustomInput
                  label="Email de Contacto"
                  value={values.email}
                  onChangeText={(text: string) => {
                    setFieldValue('email', text.toLowerCase().trim());
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="contacto@miempresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={touched.email && errors.email ? errors.email : validationErrors.email}
                  required
                />

                <CustomInput
                  label="Teléfono"
                  value={values.phone}
                  onChangeText={(text: string) => setFieldValue('phone', text)}
                  placeholder="Ej: +591 70123456"
                  keyboardType="phone-pad"
                  error={touched.phone && errors.phone ? errors.phone : undefined}
                />

                <CustomInput
                  label="Sitio Web"
                  value={values.website}
                  onChangeText={(text: string) => {
                    let formattedUrl = text.toLowerCase().trim();
                    // Auto-add https:// if missing
                    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
                      formattedUrl = 'https://' + formattedUrl;
                    }
                    setFieldValue('website', formattedUrl);
                  }}
                  placeholder="https://miempresa.com"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={touched.website && errors.website ? errors.website : undefined}
                />
              </ThemedView>

              {/* Business Details */}
              <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                  Detalles del Negocio
                </ThemedText>

                <CustomInput
                  label="Año de Fundación"
                  value={values.founded}
                  onChangeText={(text: string) => setFieldValue('founded', text)}
                  placeholder="Ej: 2023"
                  keyboardType="numeric"
                />

                <CustomInput
                  label="Número de Empleados"
                  value={values.employees}
                  onChangeText={(text: string) => setFieldValue('employees', text)}
                  placeholder="Ej: 5"
                  keyboardType="numeric"
                />

                <CustomInput
                  label="Ingresos Anuales (Bs.)"
                  value={values.annualRevenue}
                  onChangeText={(text: string) => setFieldValue('annualRevenue', text)}
                  placeholder="Ej: 100000"
                  keyboardType="numeric"
                />

                <CustomInput
                  label="Modelo de Negocio"
                  value={values.businessModel}
                  onChangeText={(text: string) => setFieldValue('businessModel', text)}
                  placeholder="Describe tu modelo de negocio"
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top' }}
                />

                <CustomInput
                  label="Mercado Objetivo"
                  value={values.targetMarket}
                  onChangeText={(text: string) => setFieldValue('targetMarket', text)}
                  placeholder="Describe tu mercado objetivo"
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top' }}
                />
              </ThemedView>

              {/* Social Media & Visibility */}
              <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                  Redes Sociales y Visibilidad
                </ThemedText>

                <CustomInput
                  label="Facebook"
                  value={values.socialMedia.facebook}
                  onChangeText={(text: string) => setFieldValue('socialMedia.facebook', text)}
                  placeholder="https://facebook.com/miempresa"
                  keyboardType="url"
                  autoCapitalize="none"
                  error={touched.socialMedia?.facebook && errors.socialMedia?.facebook ? errors.socialMedia.facebook : validationErrors['socialMedia.facebook']}
                />

                <CustomInput
                  label="Instagram"
                  value={values.socialMedia.instagram}
                  onChangeText={(text: string) => setFieldValue('socialMedia.instagram', text)}
                  placeholder="https://instagram.com/miempresa"
                  keyboardType="url"
                  autoCapitalize="none"
                  error={touched.socialMedia?.instagram && errors.socialMedia?.instagram ? errors.socialMedia.instagram : validationErrors['socialMedia.instagram']}
                />

                <CustomInput
                  label="LinkedIn"
                  value={values.socialMedia.linkedin}
                  onChangeText={(text: string) => setFieldValue('socialMedia.linkedin', text)}
                  placeholder="https://linkedin.com/company/miempresa"
                  keyboardType="url"
                  autoCapitalize="none"
                  error={touched.socialMedia?.linkedin && errors.socialMedia?.linkedin ? errors.socialMedia.linkedin : validationErrors['socialMedia.linkedin']}
                />

                <View style={styles.switchContainer}>
                  <View style={styles.switchContent}>
                    <ThemedText style={[styles.switchLabel, { color: textColor }]}>
                      Proyecto Público
                    </ThemedText>
                    <ThemedText style={[styles.switchDescription, { color: secondaryTextColor }]}>
                      Permitir que otros usuarios vean este proyecto
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setFieldValue('isPublic', !values.isPublic)}
                    style={[
                      styles.switch,
                      { backgroundColor: values.isPublic ? iconColor : borderColor }
                    ]}
                  >
                    <View style={[
                      styles.switchThumb,
                      {
                        backgroundColor: 'white',
                        transform: [{ translateX: values.isPublic ? 20 : 2 }]
                      }
                    ]} />
                  </TouchableOpacity>
                </View>
                {/* Enhanced Visibility Controls */}
                <View style={styles.visibilityContainer}>
                  <View style={styles.switchContainer}>
                    <View style={styles.switchContent}>
                      <ThemedText style={[styles.switchLabel, { color: textColor }]}>
                        Proyecto Público
                      </ThemedText>
                      <ThemedText style={[styles.switchDescription, { color: secondaryTextColor }]}>
                        Permitir que otros usuarios vean este proyecto en el directorio público
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      onPress={() => setFieldValue('isPublic', !values.isPublic)}
                      style={[
                        styles.switch,
                        { backgroundColor: values.isPublic ? iconColor : borderColor }
                      ]}
                    >
                      <View style={[
                        styles.switchThumb,
                        {
                          backgroundColor: 'white',
                          transform: [{ translateX: values.isPublic ? 20 : 2 }]
                        }
                      ]} />
                    </TouchableOpacity>
                  </View>
                  
                  {values.isPublic && (
                    <View style={styles.publicInfoBox}>
                      <Ionicons name="information-circle" size={16} color={iconColor} />
                      <ThemedText style={[styles.publicInfoText, { color: secondaryTextColor }]}>
                        Los proyectos públicos aparecen en búsquedas y pueden recibir contactos de otros emprendedores
                      </ThemedText>
                    </View>
                  )}
                </View>
              </ThemedView>

              {/* Save Button */}
              <View style={styles.saveContainer}>
                <ThemedButton
                  title={isSaving ? "Guardando..." : "Guardar Cambios"}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty || isSaving}
                  style={[
                    styles.saveButton,
                    { opacity: (!isValid || !dirty || isSaving) ? 0.6 : 1 }
                  ]}
                />
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    width: 40, // Match back button width for centering
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectContainer: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  saveContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  saveButton: {
    paddingVertical: 16,
  },
  // Loading states
  titlePlaceholder: {
    height: 20,
    width: '60%',
    borderRadius: 6,
    marginBottom: 20,
  },
  fieldPlaceholder: {
    height: 50,
    width: '100%',
    borderRadius: 8,
    marginBottom: 16,
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
  // Image Upload Styles
  imageUploadContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  galleryUpload: {
    minHeight: 80,
  },
  uploadProgress: {
    alignItems: 'center',
    gap: 8,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    textAlign: 'center',
  },
  imagePreview: {
    alignItems: 'center',
    gap: 8,
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  // Enhanced Form Styles
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
  },
  visibilityContainer: {
    marginTop: 16,
  },
  publicInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  publicInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});