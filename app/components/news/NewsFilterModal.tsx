/**
 * News Filter Modal Component
 * Provides filtering options for news articles
 * Based on NEWS_MOBILE_SPEC.md specification
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { NewsFilters, NewsType, NewsPriority, TargetAudience } from '@/app/types/news';
import { useThemeColor } from '@/app/hooks/useThemeColor';

interface NewsFilterModalProps {
  visible: boolean;
  filters: NewsFilters;
  onApply: (filters: NewsFilters) => void;
  onClose: () => void;
}

const NEWS_CATEGORIES = [
  'Educación y Becas',
  'Empleo y Trabajo',
  'Emprendimiento',
  'Tecnología',
  'Salud',
  'Medio Ambiente',
  'Cultura y Arte',
  'Deportes',
  'Voluntariado',
  'Otros'
];

export const NewsFilterModal: React.FC<NewsFilterModalProps> = ({
  visible,
  filters,
  onApply,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<NewsFilters>(filters);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  // Handle author type toggle
  const handleAuthorTypeToggle = useCallback((type: NewsType) => {
    setLocalFilters(prev => {
      const currentTypes = prev.type || [];
      const isSelected = currentTypes.includes(type);
      
      if (isSelected) {
        return {
          ...prev,
          type: currentTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          type: [...currentTypes, type]
        };
      }
    });
  }, []);

  // Handle priority toggle
  const handlePriorityToggle = useCallback((priority: NewsPriority) => {
    setLocalFilters(prev => {
      const currentPriorities = prev.priority || [];
      const isSelected = currentPriorities.includes(priority);
      
      if (isSelected) {
        return {
          ...prev,
          priority: currentPriorities.filter(p => p !== priority)
        };
      } else {
        return {
          ...prev,
          priority: [...currentPriorities, priority]
        };
      }
    });
  }, []);

  // Handle category toggle
  const handleCategoryToggle = useCallback((category: string) => {
    setLocalFilters(prev => {
      const currentCategories = prev.category || [];
      const isSelected = currentCategories.includes(category);
      
      if (isSelected) {
        return {
          ...prev,
          category: currentCategories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          category: [...currentCategories, category]
        };
      }
    });
  }, []);

  // Handle featured toggle
  const handleFeaturedToggle = useCallback((value: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      featured: value ? true : undefined
    }));
  }, []);

  // Apply filters
  const handleApply = useCallback(() => {
    onApply(localFilters);
    onClose();
  }, [localFilters, onApply, onClose]);

  // Clear all filters
  const handleClear = useCallback(() => {
    const clearedFilters: NewsFilters = {};
    setLocalFilters(clearedFilters);
    onApply(clearedFilters);
    onClose();
  }, [onApply, onClose]);

  // Reset to current filters
  const handleReset = useCallback(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Get priority color
  const getPriorityColor = (priority: NewsPriority): string => {
    switch (priority) {
      case "URGENT": return "#ef4444";
      case "HIGH": return "#f97316";
      case "MEDIUM": return "#3b82f6";
      case "LOW": return "#6b7280";
      default: return "#6b7280";
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: NewsPriority): string => {
    switch (priority) {
      case "URGENT": return "Urgente";
      case "HIGH": return "Alta";
      case "MEDIUM": return "Media";
      case "LOW": return "Baja";
      default: return "Media";
    }
  };

  const FilterSection: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <View style={styles.filterSection}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const FilterChip: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
    color?: string;
  }> = ({ label, selected, onPress, color = tintColor }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { 
          borderColor: selected ? color : borderColor,
          backgroundColor: selected ? color + '20' : 'transparent'
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        { color: selected ? color : textColor }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: cardBackgroundColor, borderBottomColor: borderColor }]}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Filtros de Noticias
          </Text>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
            <Text style={[styles.resetText, { color: tintColor }]}>
              Restablecer
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Author Type Filter */}
          <FilterSection title="Tipo de Autor">
            <View style={styles.chipContainer}>
              <FilterChip
                label="Empresas"
                selected={(localFilters.type || []).includes('COMPANY')}
                onPress={() => handleAuthorTypeToggle('COMPANY')}
                color="#3b82f6"
              />
              <FilterChip
                label="Gobierno"
                selected={(localFilters.type || []).includes('GOVERNMENT')}
                onPress={() => handleAuthorTypeToggle('GOVERNMENT')}
                color="#16a34a"
              />
              <FilterChip
                label="ONGs"
                selected={(localFilters.type || []).includes('NGO')}
                onPress={() => handleAuthorTypeToggle('NGO')}
                color="#dc2626"
              />
            </View>
          </FilterSection>

          {/* Priority Filter */}
          <FilterSection title="Prioridad">
            <View style={styles.chipContainer}>
              {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as NewsPriority[]).map(priority => (
                <FilterChip
                  key={priority}
                  label={getPriorityLabel(priority)}
                  selected={(localFilters.priority || []).includes(priority)}
                  onPress={() => handlePriorityToggle(priority)}
                  color={getPriorityColor(priority)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Category Filter */}
          <FilterSection title="Categorías">
            <View style={styles.chipContainer}>
              {NEWS_CATEGORIES.map(category => (
                <FilterChip
                  key={category}
                  label={category}
                  selected={(localFilters.category || []).includes(category)}
                  onPress={() => handleCategoryToggle(category)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Featured Filter */}
          <FilterSection title="Noticias Destacadas">
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: textColor }]}>
                Solo noticias destacadas
              </Text>
              <Switch
                value={localFilters.featured === true}
                onValueChange={handleFeaturedToggle}
                trackColor={{ false: '#767577', true: tintColor + '50' }}
                thumbColor={localFilters.featured ? tintColor : '#f4f3f4'}
              />
            </View>
          </FilterSection>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: cardBackgroundColor, borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor }]}
            onPress={handleClear}
          >
            <Text style={[styles.clearButtonText, { color: textColor }]}>
              Limpiar Todo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: tintColor }]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Aplicar Filtros
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewsFilterModal;