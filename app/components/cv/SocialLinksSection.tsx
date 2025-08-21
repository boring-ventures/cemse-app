import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { CVFormField } from './CVFormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import CollapsibleSection from './CollapsibleSection';
import DynamicList from './DynamicList';
import EditModal from './EditModal';
import {
  CVData,
  SocialLink,
} from '@/app/types/cv';

interface SocialLinksSectionProps {
  cvData: CVData | null;
  onSocialLinksChange: (socialLinks: SocialLink[]) => Promise<void>;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Social Links Section Component
 * Allows users to add their professional and social media links
 * Based on CV_MANAGER_MOBILE_SPEC.md requirements
 */

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  cvData,
  onSocialLinksChange,
  isCollapsed,
  onToggle,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const socialLinks = cvData?.socialLinks || [];

  // Modal state for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null);

  // Platform options with icons and validation patterns
  const platformOptions = [
    {
      value: 'LinkedIn',
      label: 'LinkedIn',
      icon: 'logo-linkedin',
      color: '#0077b5',
      placeholder: 'https://linkedin.com/in/tu-perfil',
      pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
    },
    {
      value: 'GitHub',
      label: 'GitHub',
      icon: 'logo-github',
      color: '#333',
      placeholder: 'https://github.com/tu-usuario',
      pattern: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/
    },
    {
      value: 'Portfolio',
      label: 'Portfolio Personal',
      icon: 'globe',
      color: '#6366f1',
      placeholder: 'https://tu-portfolio.com',
      pattern: /^https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+$/
    },
    {
      value: 'Twitter',
      label: 'Twitter/X',
      icon: 'logo-twitter',
      color: '#1da1f2',
      placeholder: 'https://twitter.com/tu-usuario',
      pattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w-]+\/?$/
    },
    {
      value: 'Instagram',
      label: 'Instagram',
      icon: 'logo-instagram',
      color: '#e1306c',
      placeholder: 'https://instagram.com/tu-usuario',
      pattern: /^https?:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/
    },
    {
      value: 'Facebook',
      label: 'Facebook',
      icon: 'logo-facebook',
      color: '#1877f2',
      placeholder: 'https://facebook.com/tu-perfil',
      pattern: /^https?:\/\/(www\.)?facebook\.com\/[\w.]+\/?$/
    },
    {
      value: 'YouTube',
      label: 'YouTube',
      icon: 'logo-youtube',
      color: '#ff0000',
      placeholder: 'https://youtube.com/c/tu-canal',
      pattern: /^https?:\/\/(www\.)?youtube\.com\/(c|channel|user)\/[\w-]+\/?$/
    },
    {
      value: 'Behance',
      label: 'Behance',
      icon: 'globe',
      color: '#1769ff',
      placeholder: 'https://behance.net/tu-usuario',
      pattern: /^https?:\/\/(www\.)?behance\.net\/[\w-]+\/?$/
    },
    {
      value: 'Dribbble',
      label: 'Dribbble',
      icon: 'basketball',
      color: '#ea4c89',
      placeholder: 'https://dribbble.com/tu-usuario',
      pattern: /^https?:\/\/(www\.)?dribbble\.com\/[\w-]+\/?$/
    },
    {
      value: 'Other',
      label: 'Otro',
      icon: 'link',
      color: '#6b7280',
      placeholder: 'https://tu-sitio-web.com',
      pattern: /^https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+$/
    },
  ];

  // Validate URL based on platform
  const validateURL = (platform: string, url: string): boolean => {
    const platformData = platformOptions.find(p => p.value === platform);
    if (!platformData) return false;
    
    return platformData.pattern.test(url);
  };

  // Social Link Form Component
  const SocialLinkForm: React.FC<{
    onSubmit?: (item: SocialLink) => void;
    onCancel?: () => void;
    initialData?: SocialLink;
    isEditing?: boolean;
  }> = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [formData, setFormData] = useState<SocialLink>(
      initialData || {
        platform: 'LinkedIn',
        url: '',
      }
    );

    const selectedPlatform = platformOptions.find(p => p.value === formData.platform);

    const handleSubmit = () => {
      if (!formData.platform || !formData.url.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }

      if (!validateURL(formData.platform, formData.url.trim())) {
        Alert.alert(
          'URL Inválida',
          `Por favor ingresa una URL válida para ${selectedPlatform?.label}.\n\nEjemplo: ${selectedPlatform?.placeholder}`
        );
        return;
      }

      onSubmit?.(formData);
    };

    return (
      <ScrollView style={styles.formContainer}>
        <ThemedText style={styles.fieldLabel}>Plataforma</ThemedText>
        <View style={styles.platformContainer}>
          {platformOptions.map((platform) => (
            <TouchableOpacity
              key={platform.value}
              style={[
                styles.platformOption,
                {
                  borderColor: formData.platform === platform.value ? platform.color : borderColor,
                  backgroundColor: formData.platform === platform.value ? `${platform.color}20` : 'transparent'
                }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, platform: platform.value }))}
            >
              <Ionicons
                name={platform.icon as any}
                size={16}
                color={formData.platform === platform.value ? platform.color : textColor}
              />
              <ThemedText
                style={[
                  styles.platformText,
                  { color: formData.platform === platform.value ? platform.color : textColor }
                ]}
              >
                {platform.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        
        <CVFormField
          label="URL del Perfil"
          value={formData.url}
          onChangeText={(value) => setFormData(prev => ({ ...prev, url: value }))}
          placeholder={selectedPlatform?.placeholder}
          keyboardType="url"
          autoCapitalize="none"
        />

        <View style={styles.formActions}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor }]}
              onPress={onCancel}
            >
              <ThemedText style={[styles.cancelButtonText, { color: textColor }]}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? 'Actualizar' : 'Agregar'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render social link item
  const renderSocialLinkItem = (socialLink: SocialLink, index: number) => {
    const platformData = platformOptions.find(p => p.value === socialLink.platform);
    
    const handleOpenLink = () => {
      Linking.openURL(socialLink.url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el enlace');
      });
    };

    return (
      <View key={index} style={[styles.socialLinkItem, { borderColor }]}>
        <TouchableOpacity
          style={styles.socialLinkInfo}
          onPress={handleOpenLink}
        >
          <View style={styles.platformIconContainer}>
            <Ionicons
              name={platformData?.icon as any || 'link'}
              size={20}
              color={platformData?.color || tintColor}
            />
          </View>
          <View style={styles.linkDetails}>
            <ThemedText style={styles.platformName}>
              {platformData?.label || socialLink.platform}
            </ThemedText>
            <ThemedText style={styles.linkUrl} numberOfLines={1}>
              {socialLink.url}
            </ThemedText>
          </View>
          <Ionicons name="open-outline" size={16} color={textColor} />
        </TouchableOpacity>
        
        <View style={styles.socialLinkActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditSocialLink(index)}
          >
            <Ionicons name="pencil" size={16} color={tintColor} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteSocialLink(index)}
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Handle add social link
  const handleAddSocialLink = async (newSocialLink: SocialLink) => {
    try {
      // Check for duplicate platform
      const existingPlatform = socialLinks.find(link => link.platform === newSocialLink.platform);
      if (existingPlatform) {
        Alert.alert(
          'Plataforma Duplicada',
          `Ya tienes un enlace para ${newSocialLink.platform}. ¿Quieres reemplazarlo?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Reemplazar',
              onPress: async () => {
                const updatedLinks = socialLinks.map(link =>
                  link.platform === newSocialLink.platform ? newSocialLink : link
                );
                await onSocialLinksChange(updatedLinks);
              }
            }
          ]
        );
        return;
      }

      const updatedSocialLinks = [...socialLinks, newSocialLink];
      await onSocialLinksChange(updatedSocialLinks);
    } catch (error) {
      console.error('Error adding social link:', error);
      Alert.alert('Error', 'No se pudo agregar el enlace');
    }
  };

  // Handle edit social link
  const handleEditSocialLink = (index: number) => {
    const socialLink = socialLinks[index];
    if (socialLink) {
      setEditingItem(socialLink);
      setEditingIndex(index);
      setShowEditModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (updatedSocialLink: SocialLink) => {
    if (editingIndex !== null) {
      try {
        const updatedSocialLinks = [...socialLinks];
        updatedSocialLinks[editingIndex] = updatedSocialLink;
        await onSocialLinksChange(updatedSocialLinks);
        handleCloseEditModal();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error updating social link:', error);
        Alert.alert('Error', 'No se pudo actualizar el enlace');
      }
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingIndex(null);
    setEditingItem(null);
  };

  // Handle delete social link
  const handleDeleteSocialLink = async (index: number) => {
    try {
      Alert.alert(
        'Eliminar Enlace',
        '¿Estás seguro de que quieres eliminar este enlace?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const updatedSocialLinks = socialLinks.filter((_, i) => i !== index);
              await onSocialLinksChange(updatedSocialLinks);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting social link:', error);
      Alert.alert('Error', 'No se pudo eliminar el enlace');
    }
  };

  return (
    <>
      <CollapsibleSection
        title="Enlaces Sociales"
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        icon={<Ionicons name="link" size={20} color={tintColor} />}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.description}>
            Agrega enlaces a tus perfiles profesionales y redes sociales para que los empleadores puedan conocer más sobre ti.
          </ThemedText>

          {/* Social Links List */}
          {socialLinks.length > 0 && (
            <View style={styles.socialLinksList}>
              {socialLinks.map((socialLink, index) => renderSocialLinkItem(socialLink, index))}
            </View>
          )}

          {/* Add Social Link Form */}
          <DynamicList
            data={[]}
            title="Agregar Enlace Social"
            addButtonText="Agregar Enlace"
            renderAddForm={() => (
              <SocialLinkForm onSubmit={handleAddSocialLink} />
            )}
            renderItem={() => null}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            emptyMessage="No has agregado ningún enlace social aún. Agrega tus perfiles profesionales para destacar en tu CV."
          />
        </ThemedView>
      </CollapsibleSection>

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        title="Editar Enlace Social"
        onClose={handleCloseEditModal}
      >
        {editingItem && (
          <SocialLinkForm
            onSubmit={handleEditSubmit}
            onCancel={handleCloseEditModal}
            initialData={editingItem}
            isEditing={true}
          />
        )}
      </EditModal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  socialLinksList: {
    marginBottom: 16,
  },
  socialLinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  socialLinkInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkDetails: {
    flex: 1,
    marginRight: 8,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '500',
  },
  linkUrl: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  socialLinkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  formContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    minWidth: 80,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SocialLinksSection;