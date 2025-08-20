import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';

interface ImageUploadProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => Promise<void>;
}

/**
 * Mobile Image Upload Component
 * Features: Camera access, photo library, image compression, crop support
 * Uses Expo ImagePicker for cross-platform compatibility
 */

const ImageUpload: React.FC<ImageUploadProps> = ({
  visible,
  onClose,
  onImageSelected,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { tokens } = useAuthStore();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  // Request camera permissions
  const requestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Request media library permissions
  const requestMediaLibraryPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please grant photo library permission to select images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Open camera to take a photo
  const openCamera = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photos
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  // Open photo library to select an image
  const openPhotoLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photos
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening photo library:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };

  // Upload image to server
  const uploadImage = async () => {
    if (!selectedImage || !tokens?.token) return;

    setUploading(true);
    try {
      // Create form data
      const formData = new FormData();
      
      // Extract file info from URI
      const filename = selectedImage.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri: selectedImage,
        name: filename,
        type,
      } as any);

      // Upload using existing API service
      const response = await apiService.uploadAvatar(tokens.token, formData);

      if (response.success && response.data?.avatarUrl) {
        await onImageSelected(response.data.avatarUrl);
        setSelectedImage(null);
        onClose();
      } else {
        throw new Error(response.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Upload Error',
        error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Cancel and close modal
  const handleCancel = () => {
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Pressable onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Select Profile Photo</ThemedText>
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {selectedImage ? (
            /* Image Preview */
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              
              <View style={styles.previewActions}>
                <Pressable
                  style={[styles.actionButton, styles.retakeButton, { borderColor }]}
                  onPress={() => setSelectedImage(null)}
                  disabled={uploading}
                >
                  <Ionicons name="refresh" size={20} color={textColor} />
                  <Text style={[styles.actionButtonText, { color: textColor }]}>
                    Choose Different
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.uploadButton, { backgroundColor: tintColor }]}
                  onPress={uploadImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="cloud-upload" size={20} color="white" />
                  )}
                  <Text style={styles.uploadButtonText}>
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Selection Options */
            <View style={styles.optionsContainer}>
              <ThemedText style={styles.instructions}>
                Choose how you'd like to add your profile photo
              </ThemedText>

              <View style={styles.options}>
                <Pressable
                  style={[styles.optionButton, { backgroundColor: cardColor, borderColor }]}
                  onPress={openCamera}
                >
                  <View style={[styles.optionIcon, { backgroundColor: tintColor }]}>
                    <Ionicons name="camera" size={32} color="white" />
                  </View>
                  <ThemedText style={styles.optionTitle}>Take Photo</ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    Use your camera to take a new photo
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[styles.optionButton, { backgroundColor: cardColor, borderColor }]}
                  onPress={openPhotoLibrary}
                >
                  <View style={[styles.optionIcon, { backgroundColor: tintColor }]}>
                    <Ionicons name="images" size={32} color="white" />
                  </View>
                  <ThemedText style={styles.optionTitle}>Choose from Library</ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    Select an existing photo from your gallery
                  </ThemedText>
                </Pressable>
              </View>

              <View style={styles.guidelines}>
                <ThemedText style={styles.guidelinesTitle}>Photo Guidelines:</ThemedText>
                <ThemedText style={styles.guidelinesText}>
                  • Use a clear, professional headshot{'\n'}
                  • Square format works best{'\n'}
                  • Good lighting and neutral background{'\n'}
                  • Maximum file size: 5MB
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 30,
  },
  previewActions: {
    width: '100%',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  retakeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  uploadButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  optionsContainer: {
    flex: 1,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  options: {
    gap: 20,
    marginBottom: 40,
  },
  optionButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  guidelines: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  guidelinesText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default ImageUpload;