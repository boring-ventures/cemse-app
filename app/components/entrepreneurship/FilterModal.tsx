import { useThemeColor } from '@/app/hooks/useThemeColor';
import { ResourceFilter } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: ResourceFilter;
  onFiltersChange: (filters: ResourceFilter) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const [localFilters, setLocalFilters] = useState<ResourceFilter>(filters);

  const filterCategories = [
    {
      id: 'types',
      title: 'Tipo de Recurso',
      options: [
        { id: 'Video', label: 'Video' },
        { id: 'Plantilla', label: 'Plantilla' },
        { id: 'Guía', label: 'Guía' },
        { id: 'Herramienta', label: 'Herramienta' },
        { id: 'Podcast', label: 'Podcast' },
      ]
    },
    {
      id: 'levels',
      title: 'Nivel de Dificultad',
      options: [
        { id: 'Principiante', label: 'Principiante' },
        { id: 'Intermedio', label: 'Intermedio' },
        { id: 'Avanzado', label: 'Avanzado' },
      ]
    },
    {
      id: 'categories',
      title: 'Categoría',
      options: [
        { id: 'Finanzas', label: 'Finanzas' },
        { id: 'Planificación', label: 'Planificación' },
        { id: 'Marketing', label: 'Marketing' },
        { id: 'Validación', label: 'Validación' },
        { id: 'Fundraising', label: 'Fundraising' },
        { id: 'Inspiración', label: 'Inspiración' },
      ]
    },
    {
      id: 'durations',
      title: 'Duración',
      options: [
        { id: 'short', label: 'Menos de 30 min' },
        { id: 'medium', label: '30 min - 1 hora' },
        { id: 'long', label: '1-2 horas' },
        { id: 'extra_long', label: 'Más de 2 horas' },
      ]
    },
    {
      id: 'dateRanges',
      title: 'Fecha de Publicación',
      options: [
        { id: 'week', label: 'Última semana' },
        { id: 'month', label: 'Último mes' },
        { id: 'quarter', label: 'Últimos 3 meses' },
        { id: 'year', label: 'Último año' },
      ]
    },
  ];

  const handleOptionToggle = (categoryId: string, optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setLocalFilters(prev => {
      const categoryKey = categoryId as keyof ResourceFilter;
      const currentValues = prev[categoryKey] as string[];
      const isSelected = currentValues.includes(optionId);
      
      return {
        ...prev,
        [categoryKey]: isSelected
          ? currentValues.filter(id => id !== optionId)
          : [...currentValues, optionId]
      };
    });
  };

  const handleClearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const clearedFilters: ResourceFilter = {
      types: [],
      levels: [],
      categories: [],
      durations: [],
      dateRanges: [],
      searchQuery: localFilters.searchQuery, // Keep search query
    };
    
    setLocalFilters(clearedFilters);
  };

  const handleApplyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFiltersChange(localFilters);
    onClose();
  };

  const getSelectedCount = () => {
    return Object.values(localFilters).reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count;
    }, 0);
  };

  const renderFilterGroup = (category: any) => {
    const categoryKey = category.id as keyof ResourceFilter;
    const selectedValues = localFilters[categoryKey] as string[];

    return (
      <View key={category.id} style={styles.filterGroup}>
        <ThemedText style={[styles.filterTitle, { color: textColor }]}>
          {category.title}
        </ThemedText>
        
        <View style={styles.optionsContainer}>
          {category.options.map((option: any) => {
            const isSelected = selectedValues.includes(option.id);
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterOption,
                  isSelected && { backgroundColor: iconColor + '20', borderColor: iconColor + '60' }
                ]}
                onPress={() => handleOptionToggle(category.id, option.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isSelected ? "checkbox" : "checkbox-outline"} 
                  size={20} 
                  color={isSelected ? iconColor : secondaryTextColor} 
                />
                <ThemedText style={[
                  styles.filterText, 
                  { 
                    color: isSelected ? iconColor : textColor,
                    fontWeight: isSelected ? '600' : '500'
                  }
                ]}>
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor: cardBackground }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <ThemedText type="subtitle" style={[styles.modalTitle, { color: textColor }]}>
                Filtros
              </ThemedText>
              {getSelectedCount() > 0 && (
                <View style={[styles.selectedBadge, { backgroundColor: iconColor + '20' }]}>
                  <ThemedText style={[styles.selectedText, { color: iconColor }]}>
                    {getSelectedCount()}
                  </ThemedText>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Filter Content */}
          <ScrollView 
            style={styles.filterContent}
            showsVerticalScrollIndicator={false}
          >
            {filterCategories.map(renderFilterGroup)}
            
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Actions */}
          <View style={[styles.modalActions, { borderTopColor: borderColor + '40' }]}>
            <ThemedButton
              title="Limpiar Filtros"
              onPress={handleClearFilters}
              type="outline"
              style={styles.actionButton}
            />
            <ThemedButton
              title="Aplicar Filtros"
              onPress={handleApplyFilters}
              type="primary"
              style={styles.actionButton}
            />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterGroup: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  filterText: {
    fontSize: 14,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
}); 