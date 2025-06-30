export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  status: 'Obligatorio' | 'Gratis' | 'Premium';
  price?: string;
  rating: number;
  studentCount: number;
  skills: string[];
  thumbnail?: string;
  isFavorite: boolean;
}

export interface EnrolledCourse extends Course {
  enrollmentDate: string;
  progress: number;
  state: 'En progreso' | 'Inscrito' | 'Completado';
  completionDate?: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  timeInvested: string;
  hasCertificate: boolean;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  completionDate: string;
  instructor: string;
  grade: number;
  credentialId: string;
}

export interface FilterOptions {
  level: string[];
  price: string[];
  duration: string[];
  category: string[];
}

export interface TrainingMetric {
  id: string;
  title: string;
  value: number | string;
  icon: string;
}

export interface TabConfig {
  id: number;
  title: string;
  icon: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  duration: string;
  isCompleted: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'exercise' | 'reading';
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl?: string;
  description?: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo?: string;
  rating: number;
  courseCount: number;
  experience: string;
}

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface DetailedCourse extends Omit<Course, 'instructor'> {
  videoPreviewUrl?: string;
  curriculum: CourseModule[];
  learningObjectives: string[];
  materialsIncluded: string[];
  tags: string[];
  instructor: Instructor;
  reviews: Review[];
  includes: string[];
  totalLessons: number;
  certificateIncluded: boolean;
  lifetimeAccess: boolean;
} 