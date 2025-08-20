import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CVFormField } from './CVFormField';
import { UserAvatar } from '@/app/components/UserAvatar';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { CVData } from '@/app/types/cv';
import ImageUpload from './ImageUpload';

interface PersonalInfoSectionProps {
  cvData: CVData | null;
  onPersonalInfoChange: (field: string, value: string) => Promise<void>;
  uploading: boolean;
  uploadError: string;
}

/**
 * Personal Information Section Component
 * Always visible section containing basic personal info and profile image
 * Features: Real-time updates, image upload, validation
 */

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  cvData,
  onPersonalInfoChange,
  uploading,
  uploadError,
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  const personalInfo = cvData?.personalInfo;

  // Handle field changes with debouncing
  const handleFieldChange = async (field: string, value: string) => {
    try {
      await onPersonalInfoChange(field, value);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Alert.alert('Error', `Failed to update ${field}. Please try again.`);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (imageUri: string) => {
    setLocalUploading(true);
    try {
      // Image upload logic will be implemented in ImageUpload component
      await onPersonalInfoChange('profileImage', imageUri);
      setShowImageUpload(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
    } finally {
      setLocalUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Job Title Card */}
      <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
        <ThemedText style={styles.cardTitle}>Target Position</ThemedText>
        <CVFormField
          label="Job Title"
          value={cvData?.jobTitle || ''}
          onChangeText={(value) => handleFieldChange('jobTitle', value)}
          placeholder="e.g. Software Developer, Marketing Assistant"
        />
      </ThemedView>

      {/* Profile Image Upload Card */}
      <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
        <ThemedText style={styles.cardTitle}>Profile Image</ThemedText>
        
        <View style={styles.imageSection}>
          <View style={styles.avatarContainer}>
            <UserAvatar
              size={80}
              imageUrl={personalInfo?.profileImage}
              firstName={personalInfo?.firstName}
              lastName={personalInfo?.lastName}
            />
            
            {(uploading || localUploading) && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={tintColor} />
              </View>
            )}
          </View>

          <View style={styles.imageActions}>
            <Pressable
              style={[styles.imageButton, { backgroundColor: tintColor }]}
              onPress={() => setShowImageUpload(true)}
              disabled={uploading || localUploading}
            >
              <Ionicons name="camera" size={16} color="white" />
              <Text style={styles.imageButtonText}>Change Photo</Text>
            </Pressable>

            {personalInfo?.profileImage && (
              <Pressable
                style={[styles.imageButton, styles.removeButton, { borderColor }]}
                onPress={() => handleFieldChange('profileImage', '')}
                disabled={uploading || localUploading}
              >
                <Ionicons name="trash" size={16} color={textColor} />
                <Text style={[styles.imageButtonText, { color: textColor }]}>Remove</Text>
              </Pressable>
            )}
          </View>
        </View>

        {uploadError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{uploadError}</Text>
          </View>
        )}
      </ThemedView>

      {/* Personal Information Card */}
      <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
        <ThemedText style={styles.cardTitle}>Personal Information</ThemedText>
        
        <View style={styles.formGrid}>
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <CVFormField
                label="First Name"
                value={personalInfo?.firstName || ''}
                onChangeText={(value) => handleFieldChange('firstName', value)}
                placeholder="Enter your first name"
              />
            </View>
            <View style={styles.formColumn}>
              <CVFormField
                label="Last Name"
                value={personalInfo?.lastName || ''}
                onChangeText={(value) => handleFieldChange('lastName', value)}
                placeholder="Enter your last name"
              />
            </View>
          </View>

          <CVFormField
            label="Email"
            value={personalInfo?.email || ''}
            onChangeText={(value) => handleFieldChange('email', value)}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CVFormField
            label="Phone"
            value={personalInfo?.phone || ''}
            onChangeText={(value) => handleFieldChange('phone', value)}
            placeholder="+591 700 123 456"
            keyboardType="phone-pad"
          />

          <CVFormField
            label="Address"
            value={personalInfo?.address || ''}
            onChangeText={(value) => handleFieldChange('address', value)}
            placeholder="Street address"
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <CVFormField
                label="Municipality"
                value={personalInfo?.municipality || ''}
                onChangeText={(value) => handleFieldChange('municipality', value)}
                placeholder="Municipality"
              />
            </View>
            <View style={styles.formColumn}>
              <CVFormField
                label="Department"
                value={personalInfo?.department || ''}
                onChangeText={(value) => handleFieldChange('department', value)}
                placeholder="Department"
              />
            </View>
          </View>

          <CVFormField
            label="Country"
            value={personalInfo?.country || 'Bolivia'}
            onChangeText={(value) => handleFieldChange('country', value)}
            placeholder="Country"
          />
        </View>
      </ThemedView>

      {/* Professional Summary Card */}
      <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
        <ThemedText style={styles.cardTitle}>Professional Summary</ThemedText>
        <CVFormField
          label="Summary"
          value={cvData?.professionalSummary || ''}
          onChangeText={(value) => handleFieldChange('professionalSummary', value)}
          placeholder="Write a brief professional summary about yourself..."
          multiline
          numberOfLines={4}
        />
      </ThemedView>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUpload
          visible={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onImageSelected={handleImageUpload}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActions: {
    flex: 1,
    gap: 10,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    flex: 1,
  },
  formGrid: {
    gap: 15,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formColumn: {
    flex: 1,
  },
});

export default PersonalInfoSection;