import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { VideoPlayer } from '@/app/components/training/VideoPlayer';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { CourseModule, Lesson } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LearnScreen() {
  const { id, lesson } = useLocalSearchParams<{ id: string; lesson: string }>();
  const router = useRouter();
  const [currentLessonId, setCurrentLessonId] = useState(lesson || 'lesson1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(['module1']);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  // Mock course data with curriculum
  const courseTitle = 'Habilidades Blandas y Empoderamiento Personal';
  const totalLessons = 30;
  const totalDuration = '20h 15min';
  
  const curriculum: CourseModule[] = [
    {
      id: 'module1',
      title: 'Introducción a las Habilidades Laborales',
      duration: '2h 30min',
      isCompleted: false,
      lessons: [
        {
          id: 'lesson1',
          title: 'Bienvenida al curso',
          duration: '5 min',
          type: 'video',
          isCompleted: true,
          isLocked: false,
          description: 'Introducción general al curso y metodología de aprendizaje.',
        },
        {
          id: 'lesson2',
          title: 'Fundamentos de las habilidades blandas',
          duration: '25 min',
          type: 'video',
          isCompleted: false,
          isLocked: false,
        },
        {
          id: 'lesson3',
          title: 'Autoevaluación inicial',
          duration: '15 min',
          type: 'quiz',
          isCompleted: false,
          isLocked: false,
        }
      ]
    },
    {
      id: 'module2',
      title: 'Comunicación Efectiva',
      duration: '6h 15min',
      isCompleted: false,
      lessons: [
        {
          id: 'lesson4',
          title: 'Principios de comunicación asertiva',
          duration: '30 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        },
        {
          id: 'lesson5',
          title: 'Escucha activa en el trabajo',
          duration: '25 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        },
        {
          id: 'lesson6',
          title: 'Práctica de comunicación',
          duration: '20 min',
          type: 'exercise',
          isCompleted: false,
          isLocked: true,
        }
      ]
    },
    {
      id: 'module3',
      title: 'Liderazgo y Trabajo en Equipo',
      duration: '4h 45min',
      isCompleted: false,
      lessons: [
        {
          id: 'lesson7',
          title: 'Estilos de liderazgo',
          duration: '35 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        },
        {
          id: 'lesson8',
          title: 'Trabajo colaborativo',
          duration: '30 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        }
      ]
    }
  ];

  // Find current lesson
  const currentLesson = curriculum
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === currentLessonId);

  // Calculate progress
  const completedLessons = curriculum
    .flatMap(module => module.lessons)
    .filter(lesson => lesson.isCompleted).length;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

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

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (lessonId: string) => {
    const lesson = curriculum
      .flatMap(module => module.lessons)
      .find(l => l.id === lessonId);
    
    if (lesson && !lesson.isLocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentLessonId(lessonId);
      setIsPlaying(false);
    }
  };

  const getNextLesson = () => {
    const allLessons = curriculum.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const allLessons = curriculum.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const handleNextLesson = () => {
    const nextLesson = getNextLesson();
    if (nextLesson && !nextLesson.isLocked) {
      setCurrentLessonId(nextLesson.id);
      setIsPlaying(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePreviousLesson = () => {
    const previousLesson = getPreviousLesson();
    if (previousLesson) {
      setCurrentLessonId(previousLesson.id);
      setIsPlaying(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleMarkComplete = () => {
    Alert.alert(
      'Marcar como completada',
      '¿Has terminado esta lección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Completar', 
          onPress: () => {
            // Here you would update the lesson status
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            console.log('Lesson completed:', currentLessonId);
          }
        }
      ]
    );
  };

  if (!currentLesson) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText>Lección no encontrada</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: courseTitle,
          headerShown: true,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Course Progress Header */}
        <View style={[styles.progressHeader, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.progressInfo}>
            <ThemedText style={[styles.progressText, { color: textColor }]}>
              {completedLessons} de {totalLessons} lecciones • {totalDuration}
            </ThemedText>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      backgroundColor: iconColor,
                      width: `${progressPercentage}%`
                    }
                  ]} 
                />
              </View>
              <ThemedText style={[styles.progressPercentage, { color: iconColor }]}>
                {progressPercentage}%
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Video Player */}
        <View style={styles.videoSection}>
          <VideoPlayer
            videoTitle={currentLesson.title}
            duration={currentLesson.duration}
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(!isPlaying)}
            onFullscreen={() => console.log('Fullscreen')}
          />
        </View>

        {/* Current Lesson Info */}
        <View style={[styles.lessonInfoCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonTitleSection}>
              <ThemedText type="subtitle" style={[styles.lessonTitle, { color: textColor }]}>
                {currentLesson.title}
              </ThemedText>
              <View style={styles.lessonMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getLessonStatusColor(currentLesson) + '20' }]}>
                  <ThemedText style={[styles.statusText, { color: getLessonStatusColor(currentLesson) }]}>
                    {currentLesson.isCompleted ? 'Completado' : 'En progreso'}
                  </ThemedText>
                </View>
                <View style={styles.lessonDetails}>
                  <Ionicons name="time-outline" size={14} color={secondaryTextColor} />
                  <ThemedText style={[styles.lessonDuration, { color: secondaryTextColor }]}>
                    {currentLesson.duration}
                  </ThemedText>
                  <Ionicons name={getLessonIcon(currentLesson.type)} size={14} color={secondaryTextColor} />
                  <ThemedText style={[styles.lessonType, { color: secondaryTextColor }]}>
                    {currentLesson.type === 'video' ? 'Video' : 
                     currentLesson.type === 'quiz' ? 'Cuestionario' :
                     currentLesson.type === 'exercise' ? 'Ejercicio' : 'Lectura'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {currentLesson.description && (
            <ThemedText style={[styles.lessonDescription, { color: secondaryTextColor }]}>
              {currentLesson.description}
            </ThemedText>
          )}

          {/* Lesson Navigation */}
          <View style={styles.lessonNavigation}>
            <ThemedButton
              title="Lección anterior"
              onPress={handlePreviousLesson}
              type="outline"
              style={[styles.navButton, { opacity: getPreviousLesson() ? 1 : 0.5 }]}
              disabled={!getPreviousLesson()}
            />
            <ThemedButton
              title="Siguiente lección"
              onPress={handleNextLesson}
              type="primary"
              style={[styles.navButton, { opacity: getNextLesson() && !getNextLesson()?.isLocked ? 1 : 0.5 }]}
              disabled={!getNextLesson() || getNextLesson()?.isLocked}
            />
          </View>

          {!currentLesson.isCompleted && (
            <ThemedButton
              title="Marcar como completada"
              onPress={handleMarkComplete}
              type="outline"
              style={styles.completeButton}
            />
          )}
        </View>

        {/* Course Content Panel */}
        <View style={[styles.contentPanel, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.contentTitle, { color: textColor }]}>
            Contenido del curso
          </ThemedText>

          {curriculum.map((module, moduleIndex) => (
            <View key={module.id} style={styles.moduleContainer}>
              <TouchableOpacity 
                style={styles.moduleHeader}
                onPress={() => toggleModule(module.id)}
              >
                <View style={styles.moduleInfo}>
                  <ThemedText style={[styles.moduleTitle, { color: textColor }]}>
                    {moduleIndex + 1}. {module.title}
                  </ThemedText>
                  <ThemedText style={[styles.moduleDuration, { color: secondaryTextColor }]}>
                    {module.lessons.filter(l => l.isCompleted).length}/{module.lessons.length} • {module.duration}
                  </ThemedText>
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
                      onPress={() => selectLesson(lesson.id)}
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

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressHeader: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  progressInfo: {
    gap: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 35,
  },
  videoSection: {
    marginBottom: 16,
  },
  lessonInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lessonHeader: {
    marginBottom: 16,
  },
  lessonTitleSection: {
    gap: 12,
  },
  lessonTitle: {
    lineHeight: 24,
  },
  lessonMeta: {
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lessonDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonType: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  lessonNavigation: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
  },
  completeButton: {
    alignSelf: 'center',
  },
  contentPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentTitle: {
    marginBottom: 20,
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
  bottomSpacing: {
    height: 40,
  },
}); 