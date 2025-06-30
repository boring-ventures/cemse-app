import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ConnectionButtonProps {
  connectionStatus: 'none' | 'pending' | 'connected' | 'declined';
  onConnect?: () => void;
  onMessage?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  isAvailableForNetworking?: boolean;
  size?: 'small' | 'medium';
}

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  connectionStatus,
  onConnect,
  onMessage,
  onAccept,
  onDecline,
  isAvailableForNetworking = true,
  size = 'medium',
}) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const handlePress = (action: () => void | undefined) => {
    if (action) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      action();
    }
  };

  const getButtonConfig = () => {
    const isSmall = size === 'small';
    const padding = isSmall ? 8 : 12;
    const fontSize = isSmall ? 12 : 14;
    const iconSize = isSmall ? 16 : 18;

    return { padding, fontSize, iconSize };
  };

  const { padding, fontSize, iconSize } = getButtonConfig();

  const renderButtons = () => {
    switch (connectionStatus) {
      case 'none':
        if (!isAvailableForNetworking) {
          return (
            <View style={[styles.singleButton, styles.disabledButton]}>
              <Ionicons name="person-remove-outline" size={iconSize} color={secondaryTextColor} />
              <ThemedText style={[styles.buttonText, { fontSize, color: secondaryTextColor }]}>
                No disponible
              </ThemedText>
            </View>
          );
        }
        return (
          <TouchableOpacity
            style={[styles.singleButton, { backgroundColor: iconColor + '20', borderColor: iconColor + '40' }]}
            onPress={() => handlePress(onConnect)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={iconSize} color={iconColor} />
            <ThemedText style={[styles.buttonText, { fontSize, color: iconColor, fontWeight: '600' }]}>
              Conectar
            </ThemedText>
          </TouchableOpacity>
        );

      case 'pending':
        return (
          <View style={[styles.singleButton, { backgroundColor: '#FF9500' + '20', borderColor: '#FF9500' + '40' }]}>
            <Ionicons name="time-outline" size={iconSize} color="#FF9500" />
            <ThemedText style={[styles.buttonText, { fontSize, color: '#FF9500', fontWeight: '600' }]}>
              Pendiente
            </ThemedText>
          </View>
        );

      case 'connected':
        return (
          <View style={styles.connectedButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: backgroundColor, borderColor: borderColor + '60' }]}
              onPress={() => handlePress(onMessage)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={iconSize} color={iconColor} />
              <ThemedText style={[styles.buttonText, { fontSize, color: iconColor }]}>
                Mensaje
              </ThemedText>
            </TouchableOpacity>
            
            <View style={[styles.connectedIndicator, { backgroundColor: '#32D74B' + '20' }]}>
              <Ionicons name="checkmark-circle" size={iconSize} color="#32D74B" />
              <ThemedText style={[styles.buttonText, { fontSize, color: '#32D74B', fontWeight: '600' }]}>
                Conectado
              </ThemedText>
            </View>
          </View>
        );

      case 'declined':
        return (
          <View style={[styles.singleButton, { backgroundColor: '#FF3B30' + '20', borderColor: '#FF3B30' + '40' }]}>
            <Ionicons name="close-circle-outline" size={iconSize} color="#FF3B30" />
            <ThemedText style={[styles.buttonText, { fontSize, color: '#FF3B30' }]}>
              Rechazado
            </ThemedText>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { padding }]}>
      {renderButtons()}
    </View>
  );
};

// Separate component for pending requests (when user receives a request)
export const PendingRequestButtons: React.FC<{
  onAccept: () => void;
  onDecline: () => void;
  size?: 'small' | 'medium';
}> = ({ onAccept, onDecline, size = 'medium' }) => {
  const { fontSize, iconSize } = size === 'small' 
    ? { fontSize: 12, iconSize: 16 } 
    : { fontSize: 14, iconSize: 18 };

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <View style={styles.pendingRequestContainer}>
      <TouchableOpacity
        style={[styles.acceptButton, { backgroundColor: '#32D74B' + '20', borderColor: '#32D74B' + '40' }]}
        onPress={() => handlePress(onAccept)}
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark" size={iconSize} color="#32D74B" />
        <ThemedText style={[styles.buttonText, { fontSize, color: '#32D74B', fontWeight: '600' }]}>
          Aceptar
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.declineButton, { backgroundColor: '#FF3B30' + '20', borderColor: '#FF3B30' + '40' }]}
        onPress={() => handlePress(onDecline)}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={iconSize} color="#FF3B30" />
        <ThemedText style={[styles.buttonText, { fontSize, color: '#FF3B30', fontWeight: '600' }]}>
          Rechazar
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  singleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  disabledButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  connectedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    flex: 1,
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    flex: 1,
  },
  pendingRequestContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    flex: 1,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    flex: 1,
  },
  buttonText: {
    fontWeight: '500',
    textAlign: 'center',
  },
}); 