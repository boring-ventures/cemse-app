/**
 * Personal Info Form Organism
 * Complete form for personal information section with image upload
 */

import { PersonalInfo } from '@/app/types/cv';
import { CVFormField } from '../atoms/CVFormField';
import { ImagePickerModal } from '@/app/components/ImagePickerModal';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onUpdate: (data: Partial<PersonalInfo>) => void;
  profileImageUri?: string | null;
  onImageUpload: (imageUri: string) => Promise<void>;
  uploadProgress?: number;
  uploadError?: string | null;
}

export const PersonalInfoForm = React.memo<PersonalInfoFormProps>(({
  data,
  onUpdate,
  profileImageUri,
  onImageUpload,
  uploadProgress = 0,
  uploadError,
}) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const errorColor = '#FF3B30';
  
  // Field validation
  const validateField = useCallback((field: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Por favor ingresa un email válido';
        }
        break;
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]{8,}$/.test(value)) {
          errors.phone = 'Por favor ingresa un número de teléfono válido';
        }
        break;
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'El nombre es requerido';
        } else if (value.length < 2) {
          errors.firstName = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'El apellido es requerido';
        } else if (value.length < 2) {
          errors.lastName = 'El apellido debe tener al menos 2 caracteres';
        }
        break;
      case 'personalDescription':
        if (value && value.length < 50) {
          errors.personalDescription = 'La descripción debe tener al menos 50 caracteres';
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: errors[field],
    }));
    
    return !errors[field];
  }, []);
  
  const handleFieldChange = useCallback((field: keyof PersonalInfo, value: string) => {
    validateField(field, value);
    onUpdate({ [field]: value });
  }, [onUpdate, validateField]);
  
  const handleImageSelected = useCallback(async (imageFile: { uri: string; name: string; type: string }) => {
    try {
      await onImageUpload(imageFile.uri);
    } catch (error) {
      Alert.alert(
        'Error de subida',
        'No se pudo subir la imagen. Por favor inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  }, [onImageUpload]);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: textColor,
      marginBottom: 16,
    },
    imageSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    imageContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    profileImageWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: primaryColor,
      overflow: 'hidden',
      backgroundColor: backgroundColor,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 57,
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 57,
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: primaryColor,
      borderRadius: 18,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: backgroundColor,
    },
    progressContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: primaryColor,
      borderRadius: 2,
    },
    imageHint: {
      fontSize: 14,
      color: secondaryTextColor,
      textAlign: 'center',
      marginTop: 8,
    },
    errorText: {
      fontSize: 14,
      color: errorColor,
      textAlign: 'center',
      marginTop: 8,
    },
    fieldsContainer: {
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: borderColor,
      marginVertical: 24,
    },
    subSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 16,
      marginTop: 8,
    },
  });
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Text 
          entering={FadeIn}
          style={styles.sectionTitle}
        >
          Información Personal
        </Animated.Text>
        
        {/* Profile Image Section */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={styles.imageSection}
        >
          <View style={styles.imageContainer}>
            <Pressable
              style={styles.profileImageWrapper}
              onPress={() => setShowImagePicker(true)}
            >
              {profileImageUri ? (
                <Animated.Image 
                  source={{ uri: profileImageUri }} 
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="person" size={40} color={secondaryTextColor} />
                </View>
              )}
              
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </View>
              
              {uploadProgress > 0 && uploadProgress < 1 && (
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${uploadProgress * 100}%` }
                    ]} 
                  />
                </View>
              )}
            </Pressable>
          </View>
          
          <Text style={styles.imageHint}>
            Toca para {profileImageUri ? 'cambiar' : 'agregar'} foto de perfil
          </Text>
          
          {uploadError && (
            <Text style={styles.errorText}>
              {uploadError}
            </Text>
          )}
        </Animated.View>
        
        {/* Basic Information */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.fieldsContainer}
        >
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <CVFormField
                label="Nombre"
                value={data.firstName || ''}
                onChangeText={(text) => handleFieldChange('firstName', text)}
                placeholder="Tu nombre"
                required
                error={validationErrors.firstName}
                testID="personal-info-first-name"
                maxLength={50}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <CVFormField
                label="Apellido"
                value={data.lastName || ''}
                onChangeText={(text) => handleFieldChange('lastName', text)}
                placeholder="Tu apellido"
                required
                error={validationErrors.lastName}
                testID="personal-info-last-name"
                maxLength={50}
              />
            </View>
          </View>
          
          <CVFormField
            label="Email"
            value={data.email || ''}
            onChangeText={(text) => handleFieldChange('email', text)}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={validationErrors.email}
            testID="personal-info-email"
            maxLength={100}
          />
          
          <CVFormField
            label="Teléfono"
            value={data.phone || ''}
            onChangeText={(text) => handleFieldChange('phone', text)}
            placeholder="+56 9 1234 5678"
            keyboardType="phone-pad"
            error={validationErrors.phone}
            testID="personal-info-phone"
            maxLength={20}
          />
        </Animated.View>
        
        <View style={styles.sectionDivider} />
        
        {/* Location Information */}
        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={styles.fieldsContainer}
        >
          <Text style={styles.subSectionTitle}>Ubicación</Text>
          
          <CVFormField
            label="Dirección"
            value={data.address || ''}
            onChangeText={(text) => handleFieldChange('address', text)}
            placeholder="Dirección completa"
            testID="personal-info-address"
            maxLength={200}
          />
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <CVFormField
                label="Ciudad"
                value={data.city || ''}
                onChangeText={(text) => handleFieldChange('city', text)}
                placeholder="Tu ciudad"
                testID="personal-info-city"
                maxLength={50}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <CVFormField
                label="País"
                value={data.country || 'Chile'}
                onChangeText={(text) => handleFieldChange('country', text)}
                placeholder="País"
                testID="personal-info-country"
                maxLength={50}
              />
            </View>
          </View>
        </Animated.View>
        
        <View style={styles.sectionDivider} />
        
        {/* Professional Summary */}
        <Animated.View 
          entering={FadeInDown.delay(400)}
          style={styles.fieldsContainer}
        >
          <Text style={styles.subSectionTitle}>Descripción Profesional</Text>
          
          <CVFormField
            label="Acerca de ti"
            value={data.personalDescription || ''}
            onChangeText={(text) => handleFieldChange('personalDescription', text)}
            placeholder="Describe brevemente tu perfil profesional, experiencia y objetivos..."
            multiline
            numberOfLines={4}
            error={validationErrors.personalDescription}
            testID="personal-info-description"
            maxLength={500}
          />
        </Animated.View>
        
        <View style={styles.sectionDivider} />
        
        {/* Social Links */}
        <Animated.View 
          entering={FadeInDown.delay(500)}
          style={styles.fieldsContainer}
        >
          <Text style={styles.subSectionTitle}>Enlaces Profesionales (Opcional)</Text>
          
          <CVFormField
            label="LinkedIn"
            value={data.linkedinUrl || ''}
            onChangeText={(text) => handleFieldChange('linkedinUrl', text)}
            placeholder="https://linkedin.com/in/tu-perfil"
            keyboardType="default"
            autoCapitalize="none"
            testID="personal-info-linkedin"
            maxLength={200}
          />
          
          <CVFormField
            label="GitHub"
            value={data.githubUrl || ''}
            onChangeText={(text) => handleFieldChange('githubUrl', text)}
            placeholder="https://github.com/tu-usuario"
            keyboardType="default"
            autoCapitalize="none"
            testID="personal-info-github"
            maxLength={200}
          />
          
          <CVFormField
            label="Portafolio Personal"
            value={data.portfolioUrl || ''}
            onChangeText={(text) => handleFieldChange('portfolioUrl', text)}
            placeholder="https://tu-portafolio.com"
            keyboardType="default"
            autoCapitalize="none"
            testID="personal-info-portfolio"
            maxLength={200}
          />
        </Animated.View>
        
        {/* Bottom spacing for better UX */}
        <View style={{ height: 60 }} />
      </ScrollView>
      
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
      />
    </KeyboardAvoidingView>
  );
});

PersonalInfoForm.displayName = 'PersonalInfoForm';