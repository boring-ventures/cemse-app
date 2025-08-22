import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CVBuilderShortcutProps {
  completionPercentage?: number;
  hasCV?: boolean;
}

export const CVBuilderShortcut: React.FC<CVBuilderShortcutProps> = ({ 
  completionPercentage = 0, 
  hasCV = false 
}) => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(private)/cv-builder/' as any);
  };

  const getProgressColor = () => {
    if (completionPercentage >= 80) return successColor;
    if (completionPercentage >= 50) return '#f093fb';
    if (completionPercentage >= 25) return '#667eea';
    return secondaryTextColor;
  };

  const getStatusConfig = () => {
    if (!hasCV) {
      return {
        title: 'Crea tu Currículum',
        description: 'Construye tu CV profesional en pocos pasos',
        actionText: 'Comenzar CV',
        icon: 'document-text-outline' as const,
        iconBg: 'rgba(102, 126, 234, 0.15)',
        iconColor: '#667eea',
      };
    }
    
    if (completionPercentage < 100) {
      return {
        title: 'Continúa tu CV',
        description: `${completionPercentage}% completado - Faltan algunas secciones`,
        actionText: 'Continuar',
        icon: 'create-outline' as const,
        iconBg: 'rgba(240, 147, 251, 0.15)',
        iconColor: '#f093fb',
      };
    }
    
    return {
      title: '¡CV Completado!',
      description: 'Tu currículum está listo. Puedes editarlo o generar PDF',
      actionText: 'Ver CV',
      icon: 'checkmark-circle-outline' as const,
      iconBg: `${successColor}20`,
      iconColor: successColor,
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <Pressable
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={handlePress}
      android_ripple={{ color: `${primaryColor}20` }}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: statusConfig.iconBg }]}>
          <Ionicons 
            name={statusConfig.icon} 
            size={28} 
            color={statusConfig.iconColor} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            {statusConfig.title}
          </Text>
          <Text style={[styles.description, { color: secondaryTextColor }]}>
            {statusConfig.description}
          </Text>
          
          {hasCV && completionPercentage > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: `${secondaryTextColor}20` }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: getProgressColor(),
                      width: `${completionPercentage}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: getProgressColor() }]}>
                {completionPercentage}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionIcon}>
          <Ionicons name="chevron-forward" size={24} color={secondaryTextColor} />
        </View>
      </View>

      {/* Highlight indicator for new users */}
      {!hasCV && (
        <View style={styles.highlightIndicator}>
          <View style={[styles.pulse, { backgroundColor: primaryColor }]} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 12,
  },
  highlightIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});