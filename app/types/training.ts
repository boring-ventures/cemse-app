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