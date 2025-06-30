import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Course, EnrolledCourse } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface CourseCardProps {
  course: Course | EnrolledCourse;
  variant?: 'available' | 'enrolled';
  onPress?: () => void;
  onFavoritePress?: () => void;
  onActionPress?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = 'available',
  onPress,
  onFavoritePress,
  onActionPress
}) => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const isEnrolled = variant === 'enrolled';
  const enrolledCourse = isEnrolled ? course as EnrolledCourse : null;

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress?.();
  };

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (onActionPress) {
      onActionPress();
      return;
    }

    // Default navigation behavior
    if (!isEnrolled) {
      // Go to course detail for non-enrolled courses
      router.push(`/training/course-detail?id=${course.id}`);
    } else {
      // Go to learning screen for enrolled courses
      switch (enrolledCourse?.state) {
        case 'En progreso':
        case 'Inscrito':
        case 'Completado':
          router.push(`/training/learn?id=${course.id}&lesson=lesson1`);
          break;
        default:
          router.push(`/training/course-detail?id=${course.id}`);
      }
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
      return;
    }

    // Default navigation to course detail
    router.push(`/training/course-detail?id=${course.id}`);
  };

  const getActionButtonText = () => {
    if (!isEnrolled) return 'Ver curso';
    
    switch (enrolledCourse?.state) {
      case 'En progreso':
        return 'Continuar';
      case 'Inscrito':
        return 'Comenzar curso';
      case 'Completado':
        return 'Revisar curso';
      default:
        return 'Ver curso';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={12}
          color="#FFD60A"
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {/* Header with badges */}
      <View style={styles.header}>
        <View style={styles.badges}>
          <StatusBadge status={isEnrolled ? enrolledCourse!.state : course.status} />
          {!isEnrolled && (
            <StatusBadge status={course.level} size="small" />
          )}
        </View>
        {!isEnrolled && (
          <TouchableOpacity onPress={handleFavoritePress}>
            <Ionicons
              name={course.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={course.isFavorite ? '#FF453A' : secondaryTextColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Course info */}
      <View style={styles.courseInfo}>
        <View style={[styles.courseIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name="book-outline" size={32} color={iconColor} />
        </View>
        
        <View style={styles.courseDetails}>
          {!isEnrolled && (
            <View style={styles.rating}>
              <View style={styles.stars}>
                {renderStars(course.rating)}
              </View>
              <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
                {course.rating} ({course.studentCount})
              </ThemedText>
            </View>
          )}
          
          <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
            {course.title}
          </ThemedText>
          
          <ThemedText style={[styles.description, { color: secondaryTextColor }]}>
            {course.description}
          </ThemedText>
        </View>
      </View>

      {/* Meta info */}
      <View style={styles.metaInfo}>
        <View style={styles.instructor}>
          <View style={[styles.instructorInitial, { backgroundColor: iconColor + '20' }]}>
            <ThemedText style={[styles.initialText, { color: iconColor }]}>
              {course.instructor.charAt(0)}
            </ThemedText>
          </View>
          <ThemedText style={[styles.instructorName, { color: secondaryTextColor }]}>
            {course.instructor}
          </ThemedText>
        </View>
        
        <View style={styles.duration}>
          <Ionicons name="time-outline" size={16} color={secondaryTextColor} />
          <ThemedText style={[styles.durationText, { color: secondaryTextColor }]}>
            {course.duration}
          </ThemedText>
        </View>
      </View>

      {/* Progress for enrolled courses */}
      {isEnrolled && enrolledCourse!.progress > 0 && (
        <View style={styles.progressSection}>
          <ProgressBar progress={enrolledCourse!.progress} />
        </View>
      )}

      {/* Skills or enrollment info */}
      {!isEnrolled ? (
        <View style={styles.skills}>
          {course.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={[styles.skillTag, { backgroundColor: iconColor + '15' }]}>
              <ThemedText style={[styles.skillText, { color: iconColor }]}>
                {skill}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.enrollmentInfo}>
          <ThemedText style={[styles.enrollmentText, { color: secondaryTextColor }]}>
            {enrolledCourse!.enrollmentDate}
          </ThemedText>
          {enrolledCourse!.hasCertificate && (
            <Ionicons name="trophy-outline" size={16} color="#FFD60A" />
          )}
        </View>
      )}

      {/* Action button */}
      <ThemedButton
        title={getActionButtonText()}
        onPress={handleActionPress}
        style={styles.actionButton}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  courseInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseDetails: {
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructorInitial: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  initialText: {
    fontSize: 12,
    fontWeight: '600',
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 12,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  enrollmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  enrollmentText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButton: {
    minHeight: 44,
    marginTop: 4,
  },
}); 