/**
 * Skills Form Organism
 * Form for managing skills with levels and categories
 */

import { Skill, SkillLevel } from '@/app/types/cv';
import { CVFormField } from '../atoms/CVFormField';
import { SkillTag } from '../atoms/SkillTag';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SkillsFormProps {
  skills: Skill[];
  onAdd: (skill: Skill) => void;
  onUpdate: (skillName: string, level: SkillLevel) => void;
  onRemove: (skillName: string) => void;
}

const SKILL_CATEGORIES = [
  'Technical',
  'Language', 
  'Soft Skill',
  'Industry Knowledge'
] as const;

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Skillful', 'Experienced', 'Expert'];

export const SkillsForm = React.memo<SkillsFormProps>(({
  skills,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Skill['category']>('Technical');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('Skillful');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<Skill['category'] | 'All'>('All');
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const errorColor = '#FF3B30';
  
  const resetForm = useCallback(() => {
    setNewSkillName('');
    setSelectedCategory('Technical');
    setSelectedLevel('Skillful');
    setYearsOfExperience('');
    setValidationErrors({});
  }, []);
  
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newSkillName.trim()) {
      errors.skillName = 'El nombre de la habilidad es requerido';
    } else if (skills.some(skill => skill.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      errors.skillName = 'Esta habilidad ya existe';
    }
    
    if (yearsOfExperience && (isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0)) {
      errors.yearsOfExperience = 'Los años de experiencia deben ser un número válido';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newSkillName, yearsOfExperience, skills]);
  
  const handleAddSkill = useCallback(() => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const newSkill: Skill = {
      name: newSkillName.trim(),
      experienceLevel: selectedLevel,
      category: selectedCategory,
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
    };
    
    onAdd(newSkill);
    setShowModal(false);
    resetForm();
  }, [newSkillName, selectedLevel, selectedCategory, yearsOfExperience, validateForm, onAdd, resetForm]);
  
  const handleRemoveSkill = useCallback((skillName: string) => {
    Alert.alert(
      'Eliminar habilidad',
      `¿Estás seguro de que quieres eliminar "${skillName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onRemove(skillName);
          }
        }
      ]
    );
  }, [onRemove]);
  
  const getFilteredSkills = useCallback(() => {
    if (activeCategory === 'All') {
      return skills;
    }
    return skills.filter(skill => skill.category === activeCategory);
  }, [skills, activeCategory]);
  
  const getSkillsByCategory = useCallback(() => {
    const categorizedSkills: Record<string, Skill[]> = {};
    
    SKILL_CATEGORIES.forEach(category => {
      categorizedSkills[category] = skills.filter(skill => skill.category === category);
    });
    
    return categorizedSkills;
  }, [skills]);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: secondaryTextColor,
      lineHeight: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: `${borderColor}20`,
      borderRadius: 12,
      paddingVertical: 16,
      marginBottom: 20,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: primaryColor,
    },
    statLabel: {
      fontSize: 12,
      color: secondaryTextColor,
      marginTop: 4,
    },
    categoryFilters: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    categoryFilter: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: `${borderColor}30`,
      marginRight: 8,
    },
    categoryFilterActive: {
      backgroundColor: primaryColor,
    },
    categoryFilterText: {
      fontSize: 14,
      fontWeight: '500',
      color: textColor,
    },
    categoryFilterTextActive: {
      color: '#FFFFFF',
    },
    skillsContainer: {
      flex: 1,
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryIcon: {
      marginRight: 8,
    },
    skillsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: secondaryTextColor,
      textAlign: 'center',
      lineHeight: 20,
    },
    addButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: backgroundColor,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
    },
    closeButton: {
      padding: 8,
    },
    modalScrollContent: {
      padding: 20,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    option: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: borderColor,
    },
    optionSelected: {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    },
    optionText: {
      fontSize: 14,
      color: textColor,
    },
    optionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    saveButton: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
      marginTop: 16,
    },
  });
  
  const categoryIcons: Record<Skill['category'], string> = {
    'Technical': 'code-slash',
    'Language': 'language',
    'Soft Skill': 'people',
    'Industry Knowledge': 'business',
  };
  
  const filteredSkills = getFilteredSkills();
  const skillsByCategory = getSkillsByCategory();
  
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Habilidades</Text>
        <Text style={styles.subtitle}>
          Agrega las habilidades más relevantes para tu perfil profesional
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{skills.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {skills.filter(s => s.category === 'Technical').length}
            </Text>
            <Text style={styles.statLabel}>Técnicas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {skills.filter(s => s.experienceLevel === 'Expert').length}
            </Text>
            <Text style={styles.statLabel}>Experto</Text>
          </View>
        </View>
      </Animated.View>
      
      <ScrollView
        horizontal
        style={styles.categoryFilters}
        showsHorizontalScrollIndicator={false}
      >
        <Pressable
          style={[
            styles.categoryFilter,
            activeCategory === 'All' && styles.categoryFilterActive
          ]}
          onPress={() => setActiveCategory('All')}
        >
          <Text style={[
            styles.categoryFilterText,
            activeCategory === 'All' && styles.categoryFilterTextActive
          ]}>
            Todas
          </Text>
        </Pressable>
        {SKILL_CATEGORIES.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryFilter,
              activeCategory === category && styles.categoryFilterActive
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[
              styles.categoryFilterText,
              activeCategory === category && styles.categoryFilterTextActive
            ]}>
              {category === 'Technical' ? 'Técnicas' :
               category === 'Language' ? 'Idiomas' :
               category === 'Soft Skill' ? 'Blandas' :
               'Industria'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      
      <ScrollView style={styles.skillsContainer} showsVerticalScrollIndicator={false}>
        {skills.length === 0 ? (
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <Ionicons 
              name="school-outline" 
              size={64} 
              color={secondaryTextColor} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No hay habilidades</Text>
            <Text style={styles.emptyText}>
              Comienza agregando las habilidades que mejor representen tu perfil profesional
            </Text>
          </Animated.View>
        ) : activeCategory === 'All' ? (
          // Show skills by category
          Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            categorySkills.length > 0 && (
              <Animated.View 
                key={category}
                entering={FadeInDown}
                style={styles.categorySection}
              >
                <View style={styles.categoryTitle}>
                  <Ionicons 
                    name={categoryIcons[category as Skill['category']] as any}
                    size={20} 
                    color={primaryColor} 
                    style={styles.categoryIcon}
                  />
                  <Text style={styles.categoryTitle}>
                    {category === 'Technical' ? 'Habilidades Técnicas' :
                     category === 'Language' ? 'Idiomas' :
                     category === 'Soft Skill' ? 'Habilidades Blandas' :
                     'Conocimiento de Industria'} ({categorySkills.length})
                  </Text>
                </View>
                <View style={styles.skillsGrid}>
                  {categorySkills.map((skill) => (
                    <SkillTag
                      key={skill.name}
                      skill={skill}
                      onRemove={handleRemoveSkill}
                      onLevelChange={onUpdate}
                      editable
                    />
                  ))}
                </View>
              </Animated.View>
            )
          ))
        ) : (
          // Show filtered skills
          <Animated.View entering={FadeInDown} style={styles.skillsGrid}>
            {filteredSkills.map((skill) => (
              <SkillTag
                key={skill.name}
                skill={skill}
                onRemove={handleRemoveSkill}
                onLevelChange={onUpdate}
                editable
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>
      
      <Pressable
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
      
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Habilidad</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </Pressable>
            </View>
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <CVFormField
                  label="Nombre de la Habilidad"
                  value={newSkillName}
                  onChangeText={setNewSkillName}
                  placeholder="Ej: React Native, Photoshop, Liderazgo..."
                  required
                  error={validationErrors.skillName}
                  maxLength={50}
                />
                
                <Text style={styles.sectionLabel}>Categoría</Text>
                <View style={styles.optionRow}>
                  {SKILL_CATEGORIES.map((category) => (
                    <Pressable
                      key={category}
                      style={[
                        styles.option,
                        selectedCategory === category && styles.optionSelected
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedCategory === category && styles.optionTextSelected
                      ]}>
                        {category === 'Technical' ? 'Técnica' :
                         category === 'Language' ? 'Idioma' :
                         category === 'Soft Skill' ? 'Blanda' :
                         'Industria'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                
                <Text style={styles.sectionLabel}>Nivel de Experiencia</Text>
                <View style={styles.optionRow}>
                  {SKILL_LEVELS.map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.option,
                        selectedLevel === level && styles.optionSelected
                      ]}
                      onPress={() => setSelectedLevel(level)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedLevel === level && styles.optionTextSelected
                      ]}>
                        {level === 'Beginner' ? 'Principiante' :
                         level === 'Skillful' ? 'Competente' :
                         level === 'Experienced' ? 'Experimentado' :
                         'Experto'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                
                <CVFormField
                  label="Años de Experiencia (Opcional)"
                  value={yearsOfExperience}
                  onChangeText={setYearsOfExperience}
                  placeholder="Ej: 2"
                  keyboardType="numeric"
                  error={validationErrors.yearsOfExperience}
                  maxLength={2}
                />
                
                <Pressable
                  style={styles.saveButton}
                  onPress={handleAddSkill}
                >
                  <Text style={styles.saveButtonText}>Agregar Habilidad</Text>
                </Pressable>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
});

SkillsForm.displayName = 'SkillsForm';