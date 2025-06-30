import { useThemeColor } from '@/app/hooks/useThemeColor';
import { CourseModule, Lesson } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface LessonListProps {
  modules: CourseModule[];
  currentLessonId?: string;
  onLessonSelect?: (lessonId: string) => void;
  showProgress?: boolean;
}

export const LessonList: React.FC<LessonListProps> = ({
  modules,
  currentLessonId,
  onLessonSelect,
  showProgress = false
}) => {
  const [expandedModules, setExpandedModules] = useState<string[]>(['module1']);
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const toggleModule = (moduleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onLessonSelect?.(lesson.id);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle-outline';
      case 'quiz': return 'help-circle-outline';
      case 'exercise': return 'create-outline';
      case 'reading': return 'document-text-outline';
      default: return 'ellipse-outline';
    }
  };

  const getLessonStatusIcon = (lesson: Lesson) => {
    if (lesson.isCompleted) return 'checkmark-circle';
    if (lesson.id === currentLessonId) return 'time-outline';
    if (lesson.isLocked) return 'lock-closed';
    return 'ellipse-outline';
  };

  const getLessonStatusColor = (lesson: Lesson) => {
    if (lesson.isCompleted) return '#32D74B';
    if (lesson.id === currentLessonId) return '#FF9500';
    if (lesson.isLocked) return secondaryTextColor;
    return iconColor;
  };

  return (
    <View style={styles.container}>
      {modules.map((module, moduleIndex) => (
        <View key={module.id} style={styles.moduleContainer}>
          <TouchableOpacity 
            style={styles.moduleHeader}
            onPress={() => toggleModule(module.id)}
          >
            <View style={styles.moduleInfo}>
              <ThemedText style={[styles.moduleTitle, { color: textColor }]}>
                {moduleIndex + 1}. {module.title}
              </ThemedText>
              <View style={styles.moduleStats}>
                {showProgress && (
                  <ThemedText style={[styles.moduleProgress, { color: secondaryTextColor }]}>
                    {module.lessons.filter(l => l.isCompleted).length}/{module.lessons.length} completadas
                  </ThemedText>
                )}
                <ThemedText style={[styles.moduleDuration, { color: secondaryTextColor }]}>
                  {module.duration}
                </ThemedText>
              </View>
            </View>
            <Ionicons 
              name={expandedModules.includes(module.id) ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={secondaryTextColor} 
            />
          </TouchableOpacity>

          {expandedModules.includes(module.id) && (
            <View style={styles.lessonsContainer}>
              {module.lessons.map((lesson, lessonIndex) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    lesson.id === currentLessonId && [styles.currentLessonItem, { backgroundColor: iconColor + '10' }]
                  ]}
                  onPress={() => selectLesson(lesson)}
                  disabled={lesson.isLocked}
                >
                  <View style={styles.lessonItemContent}>
                    <View style={styles.lessonItemLeft}>
                      <Ionicons 
                        name={getLessonStatusIcon(lesson)} 
                        size={20} 
                        color={getLessonStatusColor(lesson)} 
                      />
                      <View style={styles.lessonItemInfo}>
                        <ThemedText 
                          style={[
                            styles.lessonItemTitle, 
                            { 
                              color: lesson.isLocked ? secondaryTextColor : textColor,
                              fontWeight: lesson.id === currentLessonId ? '600' : '500'
                            }
                          ]}
                        >
                          {lessonIndex + 1}. {lesson.title}
                        </ThemedText>
                        <View style={styles.lessonItemMeta}>
                          <Ionicons name={getLessonIcon(lesson.type)} size={12} color={secondaryTextColor} />
                          <ThemedText style={[styles.lessonItemDuration, { color: secondaryTextColor }]}>
                            {lesson.duration}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    <Ionicons 
                      name="play-circle-outline" 
                      size={20} 
                      color={lesson.isLocked ? secondaryTextColor : iconColor} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  moduleContainer: {
    marginBottom: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleProgress: {
    fontSize: 12,
    fontWeight: '500',
  },
  moduleDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonsContainer: {
    paddingLeft: 16,
    marginTop: 8,
  },
  lessonItem: {
    borderRadius: 8,
    marginBottom: 4,
  },
  currentLessonItem: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  lessonItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  lessonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  lessonItemTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  lessonItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonItemDuration: {
    fontSize: 11,
  },
}); 