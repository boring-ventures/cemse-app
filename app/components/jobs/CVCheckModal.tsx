import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { ThemedButton } from '../ThemedButton';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useCVStatus } from '@/app/hooks/useCVStatus';
import { useToast, toastMessages } from '@/app/hooks/useToast';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';
import Shimmer from '../Shimmer';

interface CVCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentsReady?: () => void;
}

export const CVCheckModal: React.FC<CVCheckModalProps> = ({
  isOpen,
  onClose,
  onDocumentsReady
}) => {
  const { tokens } = useAuthStore();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'cv' | 'coverLetter' | null>(null);

  const {
    hasCV,
    hasCoverLetter,
    cvUrl,
    coverLetterUrl,
    cvData,
    loading,
    error,
    checkCVStatus,
    refreshCVStatus
  } = useCVStatus();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (isOpen) {
      checkCVStatus();
    }
  }, [isOpen, checkCVStatus]);

  const handleFileUpload = async (type: 'cv' | 'coverLetter') => {
    if (!tokens?.token) {
      toast({
        ...toastMessages.sessionExpired,
        variant: 'error'
      });
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file size (max 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Archivo muy grande',
          description: 'El archivo debe ser menor a 10MB',
          variant: 'error'
        });
        return;
      }

      setUploading(true);
      setUploadingType(type);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/pdf',
        name: file.name,
      } as any);
      formData.append('type', type);

      // Upload using existing avatar endpoint as reference
      // Note: You'll need to create a proper document upload endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api'}/profile/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
        },
        body: formData
      });

      if (response.ok) {
        await refreshCVStatus();
        
        toast({
          title: type === 'cv' ? '¡CV subido exitosamente!' : '¡Carta subida exitosamente!',
          description: `Tu ${type === 'cv' ? 'CV' : 'carta de presentación'} ha sido guardado correctamente`,
          variant: 'success'
        });

        // Check if we have at least one document and call callback
        if ((hasCV || type === 'cv') || (hasCoverLetter || type === 'coverLetter')) {
          onDocumentsReady?.();
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error al subir archivo',
        description: 'No se pudo subir el archivo. Intenta nuevamente.',
        variant: 'error'
      });
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleDeleteDocument = async (type: 'cv' | 'coverLetter') => {
    Alert.alert(
      'Eliminar documento',
      `¿Estás seguro que deseas eliminar tu ${type === 'cv' ? 'CV' : 'carta de presentación'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement delete API call
            toast({
              title: 'Documento eliminado',
              description: `Tu ${type === 'cv' ? 'CV' : 'carta de presentación'} ha sido eliminado`,
              variant: 'default'
            });
            await refreshCVStatus();
          }
        }
      ]
    );
  };

  const handleViewDocument = async (url: string) => {
    try {
      // TODO: Implement document viewing
      // This would typically open the PDF in a viewer
      toast({
        title: 'Vista previa',
        description: 'Funcionalidad de vista previa próximamente disponible',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo abrir el documento',
        variant: 'error'
      });
    }
  };

  const handleContinue = () => {
    if (hasCV || hasCoverLetter) {
      onDocumentsReady?.();
      onClose();
    } else {
      toast({
        ...toastMessages.documentsRequired,
        variant: 'error'
      });
    }
  };

  const DocumentSection = ({ 
    type, 
    title, 
    hasDocument, 
    documentUrl, 
    icon 
  }: {
    type: 'cv' | 'coverLetter';
    title: string;
    hasDocument: boolean;
    documentUrl?: string;
    icon: string;
  }) => (
    <View style={[styles.documentSection, { borderColor }]}>
      <View style={styles.documentHeader}>
        <View style={styles.documentInfo}>
          <View style={[styles.documentIcon, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon as any} size={24} color={iconColor} />
          </View>
          <View style={styles.documentText}>
            <ThemedText style={[styles.documentTitle, { color: textColor }]}>
              {title}
            </ThemedText>
            <ThemedText style={[styles.documentStatus, { color: hasDocument ? '#32D74B' : secondaryTextColor }]}>
              {hasDocument ? 'Disponible' : 'No disponible'}
            </ThemedText>
          </View>
        </View>
        {hasDocument && (
          <Ionicons name="checkmark-circle" size={24} color="#32D74B" />
        )}
      </View>

      {hasDocument ? (
        <View style={styles.documentActions}>
          <ThemedButton
            title="Ver"
            onPress={() => documentUrl && handleViewDocument(documentUrl)}
            type="outline"
            style={styles.documentActionButton}
          />
          <ThemedButton
            title="Reemplazar"
            onPress={() => handleFileUpload(type)}
            type="outline"
            style={styles.documentActionButton}
            loading={uploading && uploadingType === type}
          />
          <TouchableOpacity
            onPress={() => handleDeleteDocument(type)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={16} color="#FF453A" />
          </TouchableOpacity>
        </View>
      ) : (
        <ThemedButton
          title={uploading && uploadingType === type ? "Subiendo..." : "Subir PDF"}
          onPress={() => handleFileUpload(type)}
          type="primary"
          style={styles.uploadButton}
          loading={uploading && uploadingType === type}
          leftIcon={<Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />}
        />
      )}
    </View>
  );

  // Document Section Skeleton Component
  const DocumentSectionSkeleton = () => (
    <Shimmer>
      <View style={[styles.documentSection, { borderColor }]}>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <View style={[styles.skeletonDocumentIcon, { backgroundColor: iconColor + '20' }]} />
            <View style={styles.documentText}>
              <View style={[styles.skeletonDocumentTitle, { backgroundColor: secondaryTextColor + '30' }]} />
              <View style={[styles.skeletonDocumentStatus, { backgroundColor: secondaryTextColor + '30' }]} />
            </View>
          </View>
          <View style={[styles.skeletonCheckmark, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>
        <View style={[styles.skeletonUploadButton, { backgroundColor: iconColor + '30' }]} />
      </View>
    </Shimmer>
  );

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: textColor }]}>
            Documentos para aplicar
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
            <View style={[styles.infoIcon, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name="information-circle" size={24} color={iconColor} />
            </View>
            <View style={styles.infoText}>
              <ThemedText style={[styles.infoTitle, { color: textColor }]}>
                Documentos requeridos
              </ThemedText>
              <ThemedText style={[styles.infoDescription, { color: secondaryTextColor }]}>
                Necesitas al menos un CV o carta de presentación en formato PDF para aplicar a empleos.
              </ThemedText>
            </View>
          </View>

          {loading ? (
            <View style={styles.documentsContainer}>
              <DocumentSectionSkeleton />
              <DocumentSectionSkeleton />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={32} color="#FF453A" />
              <ThemedText style={[styles.errorText, { color: textColor }]}>
                Error al cargar documentos
              </ThemedText>
              <ThemedButton
                title="Reintentar"
                onPress={checkCVStatus}
                type="outline"
                style={styles.retryButton}
              />
            </View>
          ) : (
            <View style={styles.documentsContainer}>
              <DocumentSection
                type="cv"
                title="Currículum Vitae"
                hasDocument={hasCV}
                documentUrl={cvUrl}
                icon="document-text-outline"
              />

              <DocumentSection
                type="coverLetter"
                title="Carta de presentación"
                hasDocument={hasCoverLetter}
                documentUrl={coverLetterUrl}
                icon="mail-outline"
              />
            </View>
          )}

          <View style={styles.helpSection}>
            <ThemedText style={[styles.helpTitle, { color: textColor }]}>
              Consejos para tus documentos
            </ThemedText>
            <View style={styles.helpTips}>
              <View style={styles.helpTip}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#32D74B" />
                <ThemedText style={[styles.helpTipText, { color: secondaryTextColor }]}>
                  Asegúrate de que el archivo esté en formato PDF
                </ThemedText>
              </View>
              <View style={styles.helpTip}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#32D74B" />
                <ThemedText style={[styles.helpTipText, { color: secondaryTextColor }]}>
                  El tamaño máximo es de 10MB por archivo
                </ThemedText>
              </View>
              <View style={styles.helpTip}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#32D74B" />
                <ThemedText style={[styles.helpTipText, { color: secondaryTextColor }]}>
                  Mantén tus documentos actualizados
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderColor }]}>
          <ThemedButton
            title="Continuar sin documentos"
            onPress={onClose}
            type="outline"
            style={styles.footerButton}
          />
          <ThemedButton
            title="Continuar"
            onPress={handleContinue}
            type="primary"
            style={styles.footerButton}
            disabled={!hasCV && !hasCoverLetter}
          />
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  documentsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  documentSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentText: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  documentStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  documentActionButton: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  uploadButton: {
    minHeight: 44,
  },
  helpSection: {
    marginBottom: 40,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpTips: {
    gap: 8,
  },
  helpTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpTipText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  // Document Section Skeleton Styles
  skeletonDocumentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  skeletonDocumentTitle: {
    height: 16,
    width: '70%',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonDocumentStatus: {
    height: 14,
    width: '50%',
    borderRadius: 4,
  },
  skeletonCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  skeletonUploadButton: {
    height: 44,
    borderRadius: 8,
    width: '100%',
  },
});