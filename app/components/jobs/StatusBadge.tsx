import { useThemeColor } from '@/app/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface StatusBadgeProps {
  status: 'Enviada' | 'En revisión' | 'Preseleccionado' | 'Rechazada' | 'Entrevista programada' | 'Oferta recibida' | 'Tiempo completo' | 'Medio tiempo' | 'Prácticas' | 'Principiante' | 'Intermedio' | 'Avanzado' | 'Sin experiencia';
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'Enviada':
        return { background: '#0A84FF', text: '#FFFFFF' };
      case 'En revisión':
        return { background: '#FF9500', text: '#FFFFFF' };
      case 'Preseleccionado':
        return { background: '#32D74B', text: '#FFFFFF' };
      case 'Rechazada':
        return { background: '#FF453A', text: '#FFFFFF' };
      case 'Entrevista programada':
        return { background: '#AF52DE', text: '#FFFFFF' };
      case 'Oferta recibida':
        return { background: '#FFD60A', text: '#000000' };
      case 'Tiempo completo':
        return { background: '#32D74B', text: '#FFFFFF' };
      case 'Medio tiempo':
        return { background: '#FF9500', text: '#FFFFFF' };
      case 'Prácticas':
        return { background: '#0A84FF', text: '#FFFFFF' };
      case 'Principiante':
        return { background: '#32D74B', text: '#FFFFFF' };
      case 'Intermedio':
        return { background: '#FF9500', text: '#FFFFFF' };
      case 'Avanzado':
        return { background: '#FF453A', text: '#FFFFFF' };
      case 'Sin experiencia':
        return { background: '#0A84FF', text: '#FFFFFF' };
      default:
        return { background: useThemeColor({}, 'backgroundSecondary'), text: useThemeColor({}, 'text') };
    }
  };

  const colors = getStatusColors();
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.background,
        paddingHorizontal: isSmall ? 6 : 8,
        paddingVertical: isSmall ? 2 : 4,
      }
    ]}>
      <ThemedText style={[
        styles.text,
        {
          color: colors.text,
          fontSize: isSmall ? 10 : 12,
        }
      ]}>
        {status}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
}); 