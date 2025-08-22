/**
 * CV Builder Types - Mobile First Architecture
 * Comprehensive type definitions for CV Builder module
 * Target: YOUTH users only
 */

// Core CV Data Types
export type SkillLevel = 'Beginner' | 'Skillful' | 'Experienced' | 'Expert';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  profileImageUrl?: string;
  personalDescription: string;
  dateOfBirth?: string;
  nationality?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrentlyStudying: boolean;
  description?: string;
  gpa?: string;
  achievements?: string[];
}

export interface Education {
  educationHistory: EducationItem[];
  certifications?: Certification[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  url?: string;
  repositoryUrl?: string;
  images?: string[];
}

export interface Skill {
  name: string;
  experienceLevel: SkillLevel;
  category: 'Technical' | 'Language' | 'Soft Skill' | 'Industry Knowledge';
  yearsOfExperience?: number;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
  certifications?: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface CVFormData {
  personalInfo: PersonalInfo;
  education?: Education;
  workExperience?: WorkExperience[];
  projects?: Project[];
  skills?: Skill[];
  languages?: Language[];
  socialLinks?: SocialLink[];
  lastUpdated: string;
  completionPercentage: number;
}

// PDF Generation Types
export type CVTemplateType = 'modern' | 'creative' | 'minimalist' | 'professional';

export interface CVTemplate {
  id: CVTemplateType;
  name: string;
  description: string;
  thumbnailUrl: string;
  isPopular: boolean;
  isPremium: boolean;
  colorScheme: string[];
}

export interface PDFGenerationOptions {
  template: CVTemplate;
  colorScheme?: string;
  fontSize?: 'small' | 'medium' | 'large';
  includePhoto?: boolean;
  sections: {
    education: boolean;
    experience: boolean;
    skills: boolean;
    projects: boolean;
    languages: boolean;
    socialLinks: boolean;
  };
}

// State Management Types
export interface CVState {
  // Core data
  formData: CVFormData;
  
  // UI state
  ui: {
    activeSection: keyof CVFormData;
    collapsedSections: Record<string, boolean>;
    isEditing: boolean;
    hasUnsavedChanges: boolean;
    validationErrors: ValidationErrors;
    isPreviewMode: boolean;
  };
  
  // File handling
  files: {
    profileImage: {
      uri: string | null;
      uploading: boolean;
      uploadProgress: number;
      error: string | null;
    };
  };
  
  // PDF generation
  pdf: {
    isGenerating: boolean;
    selectedTemplate: CVTemplate;
    availableTemplates: CVTemplate[];
    lastGeneratedUri: string | null;
    generationProgress: number;
  };
  
  // Network state
  network: {
    isOnline: boolean;
    pendingUpdates: Partial<CVFormData>[];
    lastSyncTime: Date | null;
    syncError: string | null;
  };
}

export type CVAction = 
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'ADD_EDUCATION'; payload: EducationItem }
  | { type: 'REMOVE_EDUCATION'; payload: { index: number } }
  | { type: 'UPDATE_EDUCATION'; payload: { index: number; data: Partial<EducationItem> } }
  | { type: 'ADD_EXPERIENCE'; payload: WorkExperience }
  | { type: 'UPDATE_EXPERIENCE'; payload: { index: number; data: Partial<WorkExperience> } }
  | { type: 'REMOVE_EXPERIENCE'; payload: { index: number } }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { index: number; data: Partial<Project> } }
  | { type: 'REMOVE_PROJECT'; payload: { index: number } }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'REMOVE_SKILL'; payload: { skillName: string } }
  | { type: 'UPDATE_SKILL_LEVEL'; payload: { skillName: string; level: SkillLevel } }
  | { type: 'ADD_LANGUAGE'; payload: Language }
  | { type: 'UPDATE_LANGUAGE'; payload: { index: number; data: Partial<Language> } }
  | { type: 'REMOVE_LANGUAGE'; payload: { index: number } }
  | { type: 'SET_PROFILE_IMAGE'; payload: { uri: string } }
  | { type: 'SET_IMAGE_UPLOAD_PROGRESS'; payload: { progress: number } }
  | { type: 'SET_IMAGE_UPLOAD_ERROR'; payload: { error: string } }
  | { type: 'TOGGLE_SECTION_COLLAPSE'; payload: { section: string } }
  | { type: 'SET_ACTIVE_SECTION'; payload: { section: keyof CVFormData } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationErrors }
  | { type: 'MARK_CHANGES_SAVED' }
  | { type: 'MARK_CHANGES_UNSAVED' }
  | { type: 'SET_PDF_GENERATING'; payload: { isGenerating: boolean } }
  | { type: 'SET_PDF_GENERATION_PROGRESS'; payload: { progress: number } }
  | { type: 'SET_PDF_TEMPLATE'; payload: { template: CVTemplate } }
  | { type: 'SET_PDF_GENERATED'; payload: { uri: string } }
  | { type: 'SET_NETWORK_STATUS'; payload: { isOnline: boolean } }
  | { type: 'ADD_PENDING_UPDATE'; payload: Partial<CVFormData> }
  | { type: 'CLEAR_PENDING_UPDATES' }
  | { type: 'SET_LAST_SYNC_TIME'; payload: { time: Date } }
  | { type: 'SET_SYNC_ERROR'; payload: { error: string | null } }
  | { type: 'LOAD_CV_DATA'; payload: CVFormData }
  | { type: 'RESET_CV_DATA' }
  | { type: 'SET_PREVIEW_MODE'; payload: { isPreviewMode: boolean } };

// Validation Types
export interface ValidationErrors {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  education?: {
    [index: number]: {
      institution?: string;
      degree?: string;
      startDate?: string;
      endDate?: string;
    };
  };
  experience?: {
    [index: number]: {
      jobTitle?: string;
      company?: string;
      description?: string;
    };
  };
  projects?: {
    [index: number]: {
      name?: string;
      description?: string;
    };
  };
}

// Navigation Types
export type CVBuilderStackParamList = {
  CVDashboard: undefined;
  CVEditor: { initialSection?: keyof CVFormData };
  CVPreview: { 
    templateId: CVTemplateType;
    data: CVFormData;
  };
  PDFViewer: { 
    pdfUri: string;
    fileName: string;
  };
  TemplateSelector: {
    currentTemplate: CVTemplate;
    onTemplateSelect: (template: CVTemplate) => void;
  };
};

export type CVEditorTabParamList = {
  PersonalInfo: undefined;
  Education: undefined;
  Experience: undefined;
  Projects: undefined;
  Skills: undefined;
  Languages: undefined;
  Preview: undefined;
};

// API Types
export interface CVApiResponse {
  id: string;
  userId: string;
  data: CVFormData;
  createdAt: string;
  updatedAt: string;
}

export interface CVUploadResponse {
  success: boolean;
  cv?: CVApiResponse;
  error?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Component Props Types
export interface CVFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  required?: boolean;
  testID?: string;
  maxLength?: number;
  editable?: boolean;
}

export interface SkillTagProps {
  skill: Skill;
  onRemove: (skillName: string) => void;
  onLevelChange: (skillName: string, level: SkillLevel) => void;
  editable?: boolean;
}

export interface SectionProgressProps {
  title: string;
  completed: boolean;
  itemCount?: number;
  onPress: () => void;
}

// Utility Types
export type CVSectionKey = keyof CVFormData;

export interface CVProgress {
  sections: Array<{
    key: CVSectionKey;
    name: string;
    completed: boolean;
    required: boolean;
  }>;
  completedSections: number;
  totalSections: number;
  progressPercentage: number;
}

// Hook Types
export interface UseCVReturn {
  state: CVState;
  dispatch: React.Dispatch<CVAction>;
  actions: {
    updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
    addEducation: (education: EducationItem) => void;
    updateEducation: (index: number, data: Partial<EducationItem>) => void;
    removeEducation: (index: number) => void;
    addExperience: (experience: WorkExperience) => void;
    updateExperience: (index: number, data: Partial<WorkExperience>) => void;
    removeExperience: (index: number) => void;
    addProject: (project: Project) => void;
    updateProject: (index: number, data: Partial<Project>) => void;
    removeProject: (index: number) => void;
    addSkill: (skill: Skill) => void;
    removeSkill: (skillName: string) => void;
    updateSkillLevel: (skillName: string, level: SkillLevel) => void;
    addLanguage: (language: Language) => void;
    updateLanguage: (index: number, data: Partial<Language>) => void;
    removeLanguage: (index: number) => void;
    uploadProfileImage: (imageUri: string) => Promise<void>;
    generatePDF: (template: CVTemplate, options?: PDFGenerationOptions) => Promise<string>;
    saveCVData: () => Promise<void>;
    loadCVData: () => Promise<void>;
    toggleSectionCollapse: (section: string) => void;
    setActiveSection: (section: keyof CVFormData) => void;
    validateSection: (section: keyof CVFormData) => boolean;
    getProgress: () => CVProgress;
  };
}