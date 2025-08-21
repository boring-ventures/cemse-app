/**
 * Complete CV Data Types for CEMSE Mobile Application
 * Based on the comprehensive specification analysis
 * Ensures exact feature parity with web implementation
 */

// Personal Information Interface
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressLine?: string;
  city?: string;
  state?: string;
  municipality: string;
  department: string;
  country: string;
  birthDate?: Date;
  gender?: string;
  profileImage?: string;
}

// Education Related Interfaces
export interface EducationHistoryItem {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  status: string;
  gpa?: number;
}

export interface AcademicAchievement {
  title: string;
  date: string;
  description: string;
  type: string; // "honor", "award", "certification", etc.
}

export interface Education {
  // Basic education info (4 fields)
  level: string;                    // Nivel educativo
  currentInstitution: string;       // Institución actual
  graduationYear: number;           // Año de graduación
  isStudying: boolean;              // Si está estudiando actualmente
  
  // University information (6 fields)
  currentDegree: string;            // Grado actual
  universityName: string;           // Nombre de la universidad
  universityStartDate: string;      // Fecha de inicio en universidad
  universityEndDate: string | null; // Fecha de fin en universidad
  universityStatus: string;         // Estado universitario
  gpa: number;                      // Promedio académico
  
  // Dynamic lists
  educationHistory: EducationHistoryItem[];  // Historial completo
  academicAchievements: AcademicAchievement[]; // Logros académicos
}

// Skills and Competencies
export interface Skill {
  name: string;
  experienceLevel?: string;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

// Work Experience and Projects
export interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Activity {
  title: string;
  organization?: string;
  startDate: string;
  endDate: string;
  description: string;
}

// Main CV Data Interface
export interface CVData {
  personalInfo: PersonalInfo;
  jobTitle?: string;
  professionalSummary?: string;
  education: Education;
  skills: Skill[];
  interests: string[];
  languages: Language[];
  socialLinks: SocialLink[];
  workExperience: WorkExperience[];
  projects: Project[];
  activities: Activity[];
  achievements: any[];
  certifications: any[];
  targetPosition?: string;
  targetCompany?: string;
  relevantSkills?: string[];
}

// Cover Letter Related Interfaces
export interface RecipientData {
  department: string;
  companyName: string;
  address: string;
  city: string;
  country: string;
}

export interface CoverLetterData {
  template: string;
  content: string;
  recipient: RecipientData;
  subject: string;
}

// State Management Interfaces
export interface CollapsedSections {
  education: boolean;
  languages: boolean;
  socialLinks: boolean;
  workExperience: boolean;
  projects: boolean;
  activities: boolean;
  skills: boolean;
  interests: boolean;
}

export interface CVManagerState {
  // Tab Navigation
  activeTab: 'edit' | 'cv' | 'cover-letter';
  
  // Edit Mode States  
  isEditing: boolean;
  
  // Dynamic Input States
  newSkill: string;
  newInterest: string;
  
  // Upload States
  uploading: boolean;
  profileImage: string;
  showImageUpload: boolean;
  uploadError: string;
  
  // Collapsible Sections State (7 sections)
  collapsedSections: CollapsedSections;
}

// Template Selection States
export interface TemplateStates {
  // CV Templates
  selectedCVTemplate: 'modern' | 'creative' | 'minimalist';
  cvIsEditing: boolean;
  
  // Cover Letter Templates  
  selectedCoverLetterTemplate: 'professional' | 'creative' | 'minimalist';
  coverLetterIsEditing: boolean;
  currentContent: string;
  currentRecipient: RecipientData;
  currentSubject: string;
}

// Hook Return Types
export interface CVHookReturn {
  cvData: CVData | null;
  coverLetterData: CoverLetterData | null;
  loading: boolean;
  error: Error | null;
  
  // Methods
  fetchCVData: () => Promise<void>;
  updateCVData: (data: Partial<CVData>) => Promise<any>;
  fetchCoverLetterData: () => Promise<void>;
  saveCoverLetterData: (
    content: string,
    template?: string,
    recipient?: RecipientData,
    subject?: string
  ) => Promise<any>;
  generateCVForApplication: (jobOfferId: string) => Promise<any>;
}

// API Response Types
export interface CVApiResponse {
  success: boolean;
  data?: CVData;
  profile?: CVData;
  error?: {
    message: string;
    code?: string;
  };
}

export interface CoverLetterApiResponse {
  success: boolean;
  data?: CoverLetterData;
  error?: {
    message: string;
    code?: string;
  };
}

// Validation Types
export interface ValidationRules {
  profileImage: {
    maxSize: number;
    allowedTypes: string[];
    maxDimensions: { width: number; height: number };
    recommendedDimensions: { width: number; height: number };
  };
}

// Form Component Props
export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export interface DynamicListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd: (item: T) => void;
  onEdit: (index: number, item: T) => void;
  onDelete: (index: number) => void;
  addButtonText: string;
  emptyMessage?: string;
}

export interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

// Mobile-Specific Types
export interface MobileImageUpload {
  openCamera: () => Promise<string>;
  openPhotoLibrary: () => Promise<string>;
  compressImage: (uri: string) => Promise<string>;
  cropImage: (uri: string) => Promise<string>;
  uploadWithProgress: (
    file: File, 
    onProgress: (progress: number) => void
  ) => Promise<UploadResult>;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Offline Storage Types
export interface OfflineAction {
  type: 'UPDATE_CV' | 'UPLOAD_IMAGE' | 'SAVE_COVER_LETTER';
  data: any;
  timestamp: number;
  id: string;
}

export interface CVStorageService {
  save: (cvData: CVData) => Promise<void>;
  load: () => Promise<CVData | null>;
  clear: () => Promise<void>;
  queueAction: (action: OfflineAction) => Promise<void>;
  getQueuedActions: () => Promise<OfflineAction[]>;
  clearQueue: () => Promise<void>;
}

// PDF Generation Types
export interface PDFGenerationOptions {
  html: string;
  fileName: string;
  directory: string;
  width?: number;
  height?: number;
}

export interface MobilePDFGenerator {
  generateCV: (cvData: CVData, template: string) => Promise<string>;
  generateCoverLetter: (coverLetterData: CoverLetterData, template: string) => Promise<string>;
  sharePDF: (filePath: string) => Promise<void>;
}

// Template Renderer Types
export interface TemplateRenderer {
  template: 'modern' | 'creative' | 'minimalist';
  data: CVData;
  type: 'cv' | 'cover-letter';
  
  renderHTML: () => string;
  renderPDF: () => Promise<string>;
  getPreview: () => React.ReactNode;
}

// Network and Sync Types
export interface NetworkSyncHook {
  isOnline: boolean;
  pendingUpdates: Array<Partial<CVData>>;
  syncPendingUpdates: () => Promise<void>;
  queueUpdate: (update: Partial<CVData>) => void;
  forceSync: () => Promise<void>;
  clearPendingUpdates: () => Promise<void>;
}

// Constants for validation
export const VALIDATION_RULES: ValidationRules = {
  profileImage: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxDimensions: { width: 2048, height: 2048 },
    recommendedDimensions: { width: 400, height: 400 }
  }
};

// Default states
export const DEFAULT_COLLAPSED_SECTIONS: CollapsedSections = {
  education: false,
  languages: false,
  socialLinks: false,
  workExperience: false,
  projects: false,
  activities: false,
  skills: false,
  interests: false
};

export const DEFAULT_CV_DATA: Partial<CVData> = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    municipality: '',
    department: '',
    country: 'Bolivia'
  },
  education: {
    level: '',
    currentInstitution: '',
    graduationYear: new Date().getFullYear(),
    isStudying: false,
    educationHistory: [],
    currentDegree: '',
    universityName: '',
    universityStartDate: '',
    universityEndDate: null,
    universityStatus: '',
    gpa: 0,
    academicAchievements: []
  },
  skills: [],
  interests: [],
  languages: [],
  socialLinks: [],
  workExperience: [],
  projects: [],
  activities: [],
  achievements: [],
  certifications: []
};