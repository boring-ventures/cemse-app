export interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyRating: number;
  location: string;
  workMode: 'Presencial' | 'Híbrido' | 'Remoto';
  description: string;
  requirements: string[];
  skills: string[];
  experienceLevel: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Sin experiencia';
  jobType: 'Tiempo completo' | 'Medio tiempo' | 'Prácticas';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  publishedDate: string;
  applicationDeadline?: string;
  applicantCount: number;
  viewCount: number;
  isFeatured: boolean;
  isFavorite: boolean;
  responsibilities?: string[];
  benefits?: string[];
  companySize?: string;
  industry?: string;
  companyDescription?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  applicationDate: string;
  lastUpdate: string;
  status: 'Enviada' | 'En revisión' | 'Preseleccionado' | 'Rechazada' | 'Entrevista programada' | 'Oferta recibida';
  rating?: number;
  employerNotes?: string;
  interviewDate?: string;
  interviewType?: 'Presencial' | 'Virtual';
  offerAmount?: number;
  responseDeadline?: string;
  coverLetter: string;
  cvAttached: boolean;
}

export interface ApplicationForm {
  coverLetter: string;
  cvFile?: string;
  additionalDocuments?: string[];
  customAnswers: Record<string, string>;
  availableStartDate: string;
  salaryExpectation?: number;
}

export interface FilterOptions {
  jobType: string[];
  experienceLevel: string[];
  workMode: string[];
  salaryRange: { min: number; max: number };
  location: string[];
  companySize: string[];
}

export interface JobsMetric {
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