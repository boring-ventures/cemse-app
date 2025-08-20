// Core job status enumeration
export type JobStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT";

// Contract types
export type ContractType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "VOLUNTEER" | "FREELANCE";

// Work modalities
export type WorkModality = "ON_SITE" | "REMOTE" | "HYBRID";

// Experience levels
export type ExperienceLevel = "NO_EXPERIENCE" | "ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR_LEVEL";

// Application statuses
export type ApplicationStatus = "SENT" | "UNDER_REVIEW" | "PRE_SELECTED" | "REJECTED" | "HIRED";

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  sector?: string;
  size?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  contractType: ContractType;
  workSchedule: string;
  workModality: WorkModality;
  location: string;
  latitude?: number;
  longitude?: number;
  municipality: string;
  department: string;
  experienceLevel: ExperienceLevel;
  educationRequired?: string;
  skillsRequired: string[];
  desiredSkills: string[];
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  featured: boolean;
  expiresAt?: string;
  publishedAt: string;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
  // UI-specific properties for compatibility with existing components
  companyRating: number;
  workMode: 'Presencial' | 'Híbrido' | 'Remoto';
  skills: string[];
  jobType: 'Tiempo completo' | 'Medio tiempo' | 'Prácticas';
  currency: string;
  publishedDate: string;
  applicantCount: number;
  viewCount: number;
  isFeatured: boolean;
  isFavorite: boolean;
  responsibilities?: string[];
  companySize?: string;
  industry?: string;
  companyDescription?: string;
}

export interface JobQuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface JobApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  coverLetter?: string;
  rating?: number;
  notes?: string;
  cvFile?: string;
  coverLetterFile?: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    location?: string;
    phone?: string;
  };
  jobOffer: {
    id: string;
    title: string;
    company?: {
      name: string;
      email: string;
    };
  };
  questionAnswers?: JobQuestionAnswer[];
  // UI-specific properties for compatibility with existing components
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  applicationDate: string;
  lastUpdate: string;
  employerNotes?: string;
  interviewDate?: string;
  interviewType?: 'Presencial' | 'Virtual';
  offerAmount?: number;
  responseDeadline?: string;
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

export interface CreateApplicationRequest {
  jobOfferId: string;
  cvUrl?: string;
  coverLetterUrl?: string;
  status: 'PENDING';
  message?: string;
  questionAnswers?: Array<{
    questionId: string;
    question: string;
    answer: string;
  }>;
}

export interface JobSearchFilters {
  query?: string;
  location?: string[];
  contractType?: ContractType[];
  workModality?: WorkModality[];
  experienceLevel?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  publishedInDays?: number;
  sector?: string[];
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

// Job Messages
export interface JobMessage {
  id: string;
  applicationId: string;
  senderId: string;
  senderType: 'USER' | 'COMPANY';
  content: string;
  messageType: 'TEXT' | 'FILE';
  fileUrl?: string;
  fileName?: string;
  sentAt: string;
  readAt?: string;
}

export interface SendMessageRequest {
  content: string;
  messageType: 'TEXT' | 'FILE';
}

// Job Questions
export interface JobQuestion {
  id: string;
  jobOfferId: string;
  question: string;
  required: boolean;
  type: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'MULTISELECT';
  options?: string[];
  order: number;
}

// API Response types
export interface JobOfferResponse {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  contractType: ContractType;
  workSchedule: string;
  workModality: WorkModality;
  location: string;
  municipality: string;
  department: string;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  desiredSkills: string[];
  applicationDeadline?: string;
  publishedAt: string;
  expiresAt?: string;
  viewsCount: number;
  applicationsCount: number;
  featured: boolean;
  isActive: boolean;
  status: JobStatus;
  companyId: string;
  company?: Company;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplicationResponse {
  items: JobApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper functions for mapping enums to Spanish display text
export const mapApplicationStatusToSpanish = (status: ApplicationStatus): string => {
  switch (status) {
    case 'SENT': return 'Enviada';
    case 'UNDER_REVIEW': return 'En revisión';
    case 'PRE_SELECTED': return 'Preseleccionado';
    case 'REJECTED': return 'Rechazada';
    case 'HIRED': return 'Oferta recibida';
    default: return status;
  }
};

export const mapSpanishToApplicationStatus = (spanish: string): ApplicationStatus | null => {
  switch (spanish) {
    case 'Enviada': return 'SENT';
    case 'En revisión': return 'UNDER_REVIEW';
    case 'Preseleccionado': return 'PRE_SELECTED';
    case 'Rechazada': return 'REJECTED';
    case 'Oferta recibida': return 'HIRED';
    default: return null;
  }
};

export const mapExperienceLevelToSpanish = (level: ExperienceLevel): string => {
  switch (level) {
    case 'NO_EXPERIENCE': return 'Sin experiencia';
    case 'ENTRY_LEVEL': return 'Principiante';
    case 'MID_LEVEL': return 'Intermedio';
    case 'SENIOR_LEVEL': return 'Avanzado';
    default: return level;
  }
};

export const mapSpanishToExperienceLevel = (spanish: string): ExperienceLevel | null => {
  switch (spanish) {
    case 'Sin experiencia': return 'NO_EXPERIENCE';
    case 'Principiante': return 'ENTRY_LEVEL';
    case 'Intermedio': return 'MID_LEVEL';
    case 'Avanzado': return 'SENIOR_LEVEL';
    default: return null;
  }
};

export const mapContractTypeToSpanish = (contractType: ContractType): string => {
  switch (contractType) {
    case 'FULL_TIME': return 'Tiempo completo';
    case 'PART_TIME': return 'Medio tiempo';
    case 'INTERNSHIP': return 'Prácticas';
    case 'VOLUNTEER': return 'Voluntariado';
    case 'FREELANCE': return 'Freelance';
    default: return contractType;
  }
}; 