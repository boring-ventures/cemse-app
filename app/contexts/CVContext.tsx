/**
 * CV Builder Context Provider
 * State management using Context API + Reducers following existing CEMSE patterns
 * Includes offline-first approach and auto-save functionality
 */

import { CVState, CVAction, CVFormData, UseCVReturn, CVTemplate, PersonalInfo, EducationItem, WorkExperience, Project, Skill, Language, SkillLevel, CVProgress, PDFGenerationOptions } from '@/app/types/cv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

// Storage keys
const CV_DATA_KEY = '@cv_builder_data';
const PENDING_UPDATES_KEY = '@cv_builder_pending_updates';

// Initial state
const initialCVState: CVState = {
  formData: {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Chile',
      personalDescription: '',
    },
    education: {
      educationHistory: [],
    },
    workExperience: [],
    projects: [],
    skills: [],
    languages: [],
    socialLinks: [],
    lastUpdated: new Date().toISOString(),
    completionPercentage: 0,
  },
  ui: {
    activeSection: 'personalInfo',
    collapsedSections: {},
    isEditing: false,
    hasUnsavedChanges: false,
    validationErrors: {},
    isPreviewMode: false,
  },
  files: {
    profileImage: {
      uri: null,
      uploading: false,
      uploadProgress: 0,
      error: null,
    },
  },
  pdf: {
    isGenerating: false,
    selectedTemplate: {
      id: 'modern',
      name: 'Moderno',
      description: 'Diseño moderno y profesional',
      thumbnailUrl: '',
      isPopular: true,
      isPremium: false,
      colorScheme: ['#0066CC', '#FFFFFF'],
    },
    availableTemplates: [
      {
        id: 'modern',
        name: 'Moderno',
        description: 'Diseño moderno y profesional',
        thumbnailUrl: '',
        isPopular: true,
        isPremium: false,
        colorScheme: ['#0066CC', '#FFFFFF'],
      },
      {
        id: 'creative',
        name: 'Creativo',
        description: 'Diseño creativo con colores vibrantes',
        thumbnailUrl: '',
        isPopular: false,
        isPremium: true,
        colorScheme: ['#FF6B6B', '#4ECDC4'],
      },
      {
        id: 'minimalist',
        name: 'Minimalista',
        description: 'Diseño limpio y minimalista',
        thumbnailUrl: '',
        isPopular: true,
        isPremium: false,
        colorScheme: ['#2C3E50', '#ECF0F1'],
      },
    ],
    lastGeneratedUri: null,
    generationProgress: 0,
  },
  network: {
    isOnline: true,
    pendingUpdates: [],
    lastSyncTime: null,
    syncError: null,
  },
};

// Utility function to calculate completion percentage
const calculateCompletionPercentage = (formData: CVFormData): number => {
  const sections = [
    { key: 'personalInfo', weight: 25, completed: !!formData.personalInfo?.firstName && !!formData.personalInfo?.lastName },
    { key: 'education', weight: 20, completed: (formData.education?.educationHistory?.length || 0) > 0 },
    { key: 'experience', weight: 25, completed: (formData.workExperience?.length || 0) > 0 },
    { key: 'skills', weight: 15, completed: (formData.skills?.length || 0) > 0 },
    { key: 'projects', weight: 10, completed: (formData.projects?.length || 0) > 0 },
    { key: 'languages', weight: 5, completed: (formData.languages?.length || 0) > 0 },
  ];

  const totalWeight = sections.reduce((sum, section) => sum + (section.completed ? section.weight : 0), 0);
  return Math.round(totalWeight);
};

// Reducer function
const cvReducer = (state: CVState, action: CVAction): CVState => {
  switch (action.type) {
    case 'UPDATE_PERSONAL_INFO':
      const updatedPersonalInfo = {
        ...state.formData.personalInfo,
        ...action.payload,
      };
      const updatedFormDataPersonal = {
        ...state.formData,
        personalInfo: updatedPersonalInfo,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataPersonal,
          completionPercentage: calculateCompletionPercentage(updatedFormDataPersonal),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'ADD_EDUCATION':
      const updatedEducationHistory = [
        ...(state.formData.education?.educationHistory || []),
        action.payload,
      ];
      const updatedFormDataEducation = {
        ...state.formData,
        education: {
          ...state.formData.education,
          educationHistory: updatedEducationHistory,
        },
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataEducation,
          completionPercentage: calculateCompletionPercentage(updatedFormDataEducation),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'UPDATE_EDUCATION':
      const educationList = [...(state.formData.education?.educationHistory || [])];
      educationList[action.payload.index] = {
        ...educationList[action.payload.index],
        ...action.payload.data,
      };
      const updatedFormDataEducationUpdate = {
        ...state.formData,
        education: {
          ...state.formData.education,
          educationHistory: educationList,
        },
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataEducationUpdate,
          completionPercentage: calculateCompletionPercentage(updatedFormDataEducationUpdate),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'REMOVE_EDUCATION':
      const filteredEducation = (state.formData.education?.educationHistory || []).filter(
        (_, index) => index !== action.payload.index
      );
      const updatedFormDataEducationRemove = {
        ...state.formData,
        education: {
          ...state.formData.education,
          educationHistory: filteredEducation,
        },
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataEducationRemove,
          completionPercentage: calculateCompletionPercentage(updatedFormDataEducationRemove),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'ADD_EXPERIENCE':
      const updatedExperience = [
        ...(state.formData.workExperience || []),
        action.payload,
      ];
      const updatedFormDataExperience = {
        ...state.formData,
        workExperience: updatedExperience,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataExperience,
          completionPercentage: calculateCompletionPercentage(updatedFormDataExperience),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'UPDATE_EXPERIENCE':
      const experienceList = [...(state.formData.workExperience || [])];
      experienceList[action.payload.index] = {
        ...experienceList[action.payload.index],
        ...action.payload.data,
      };
      const updatedFormDataExperienceUpdate = {
        ...state.formData,
        workExperience: experienceList,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataExperienceUpdate,
          completionPercentage: calculateCompletionPercentage(updatedFormDataExperienceUpdate),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'REMOVE_EXPERIENCE':
      const filteredExperience = (state.formData.workExperience || []).filter(
        (_, index) => index !== action.payload.index
      );
      const updatedFormDataExperienceRemove = {
        ...state.formData,
        workExperience: filteredExperience,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataExperienceRemove,
          completionPercentage: calculateCompletionPercentage(updatedFormDataExperienceRemove),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'ADD_SKILL':
      const updatedSkills = [
        ...(state.formData.skills || []),
        action.payload,
      ];
      const updatedFormDataSkills = {
        ...state.formData,
        skills: updatedSkills,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataSkills,
          completionPercentage: calculateCompletionPercentage(updatedFormDataSkills),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'REMOVE_SKILL':
      const filteredSkills = (state.formData.skills || []).filter(
        skill => skill.name !== action.payload.skillName
      );
      const updatedFormDataSkillsRemove = {
        ...state.formData,
        skills: filteredSkills,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataSkillsRemove,
          completionPercentage: calculateCompletionPercentage(updatedFormDataSkillsRemove),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'UPDATE_SKILL_LEVEL':
      const skillsList = [...(state.formData.skills || [])];
      const skillIndex = skillsList.findIndex(skill => skill.name === action.payload.skillName);
      if (skillIndex !== -1) {
        skillsList[skillIndex] = {
          ...skillsList[skillIndex],
          experienceLevel: action.payload.level,
        };
      }
      
      return {
        ...state,
        formData: {
          ...state.formData,
          skills: skillsList,
          lastUpdated: new Date().toISOString(),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'ADD_PROJECT':
      const updatedProjects = [
        ...(state.formData.projects || []),
        action.payload,
      ];
      const updatedFormDataProjects = {
        ...state.formData,
        projects: updatedProjects,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataProjects,
          completionPercentage: calculateCompletionPercentage(updatedFormDataProjects),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'UPDATE_PROJECT':
      const projectsList = [...(state.formData.projects || [])];
      projectsList[action.payload.index] = {
        ...projectsList[action.payload.index],
        ...action.payload.data,
      };
      const updatedFormDataProjectsUpdate = {
        ...state.formData,
        projects: projectsList,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataProjectsUpdate,
          completionPercentage: calculateCompletionPercentage(updatedFormDataProjectsUpdate),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'REMOVE_PROJECT':
      const filteredProjects = (state.formData.projects || []).filter(
        (_, index) => index !== action.payload.index
      );
      const updatedFormDataProjectsRemove = {
        ...state.formData,
        projects: filteredProjects,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataProjectsRemove,
          completionPercentage: calculateCompletionPercentage(updatedFormDataProjectsRemove),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'ADD_LANGUAGE':
      const updatedLanguages = [
        ...(state.formData.languages || []),
        action.payload,
      ];
      const updatedFormDataLanguages = {
        ...state.formData,
        languages: updatedLanguages,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataLanguages,
          completionPercentage: calculateCompletionPercentage(updatedFormDataLanguages),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'UPDATE_LANGUAGE':
      const languagesList = [...(state.formData.languages || [])];
      languagesList[action.payload.index] = {
        ...languagesList[action.payload.index],
        ...action.payload.data,
      };
      const updatedFormDataLanguagesUpdate = {
        ...state.formData,
        languages: languagesList,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataLanguagesUpdate,
          completionPercentage: calculateCompletionPercentage(updatedFormDataLanguagesUpdate),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'REMOVE_LANGUAGE':
      const filteredLanguages = (state.formData.languages || []).filter(
        (_, index) => index !== action.payload.index
      );
      const updatedFormDataLanguagesRemove = {
        ...state.formData,
        languages: filteredLanguages,
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        ...state,
        formData: {
          ...updatedFormDataLanguagesRemove,
          completionPercentage: calculateCompletionPercentage(updatedFormDataLanguagesRemove),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'SET_PROFILE_IMAGE':
      return {
        ...state,
        formData: {
          ...state.formData,
          personalInfo: {
            ...state.formData.personalInfo,
            profileImageUrl: action.payload.uri,
          },
          lastUpdated: new Date().toISOString(),
        },
        files: {
          ...state.files,
          profileImage: {
            ...state.files.profileImage,
            uri: action.payload.uri,
            uploading: false,
            uploadProgress: 0,
            error: null,
          },
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'SET_IMAGE_UPLOAD_PROGRESS':
      return {
        ...state,
        files: {
          ...state.files,
          profileImage: {
            ...state.files.profileImage,
            uploadProgress: action.payload.progress,
            uploading: action.payload.progress > 0 && action.payload.progress < 1,
          },
        },
      };

    case 'SET_IMAGE_UPLOAD_ERROR':
      return {
        ...state,
        files: {
          ...state.files,
          profileImage: {
            ...state.files.profileImage,
            error: action.payload.error,
            uploading: false,
            uploadProgress: 0,
          },
        },
      };

    case 'TOGGLE_SECTION_COLLAPSE':
      return {
        ...state,
        ui: {
          ...state.ui,
          collapsedSections: {
            ...state.ui.collapsedSections,
            [action.payload.section]: !state.ui.collapsedSections[action.payload.section],
          },
        },
      };

    case 'SET_ACTIVE_SECTION':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeSection: action.payload.section,
        },
      };

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        ui: {
          ...state.ui,
          validationErrors: action.payload,
        },
      };

    case 'MARK_CHANGES_SAVED':
      return {
        ...state,
        ui: {
          ...state.ui,
          hasUnsavedChanges: false,
        },
        network: {
          ...state.network,
          lastSyncTime: new Date(),
          syncError: null,
        },
      };

    case 'MARK_CHANGES_UNSAVED':
      return {
        ...state,
        ui: {
          ...state.ui,
          hasUnsavedChanges: true,
        },
      };

    case 'SET_PDF_GENERATING':
      return {
        ...state,
        pdf: {
          ...state.pdf,
          isGenerating: action.payload.isGenerating,
          generationProgress: action.payload.isGenerating ? 0 : state.pdf.generationProgress,
        },
      };

    case 'SET_PDF_GENERATION_PROGRESS':
      return {
        ...state,
        pdf: {
          ...state.pdf,
          generationProgress: action.payload.progress,
        },
      };

    case 'SET_PDF_TEMPLATE':
      return {
        ...state,
        pdf: {
          ...state.pdf,
          selectedTemplate: action.payload.template,
        },
      };

    case 'SET_PDF_GENERATED':
      return {
        ...state,
        pdf: {
          ...state.pdf,
          lastGeneratedUri: action.payload.uri,
          isGenerating: false,
          generationProgress: 100,
        },
      };

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        network: {
          ...state.network,
          isOnline: action.payload.isOnline,
        },
      };

    case 'ADD_PENDING_UPDATE':
      return {
        ...state,
        network: {
          ...state.network,
          pendingUpdates: [...state.network.pendingUpdates, action.payload],
        },
      };

    case 'CLEAR_PENDING_UPDATES':
      return {
        ...state,
        network: {
          ...state.network,
          pendingUpdates: [],
        },
      };

    case 'SET_SYNC_ERROR':
      return {
        ...state,
        network: {
          ...state.network,
          syncError: action.payload.error,
        },
      };

    case 'LOAD_CV_DATA':
      return {
        ...state,
        formData: {
          ...action.payload,
          completionPercentage: calculateCompletionPercentage(action.payload),
        },
        ui: {
          ...state.ui,
          hasUnsavedChanges: false,
        },
      };

    case 'RESET_CV_DATA':
      return {
        ...initialCVState,
        pdf: state.pdf, // Keep template settings
        network: state.network, // Keep network state
      };

    case 'SET_PREVIEW_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isPreviewMode: action.payload.isPreviewMode,
        },
      };

    default:
      return state;
  }
};

// Context
const CVContext = createContext<UseCVReturn | undefined>(undefined);

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Provider component
export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cvReducer, initialCVState);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-save functionality with debouncing
  const debouncedSave = useMemo(
    () => debounce(async (data: CVFormData) => {
      try {
        await AsyncStorage.setItem(CV_DATA_KEY, JSON.stringify(data));
        console.log('CV data auto-saved locally');
        
        // If online, also save to server
        if (state.network.isOnline) {
          // TODO: Implement API call to save CV data
          dispatch({ type: 'MARK_CHANGES_SAVED' });
        } else {
          // Add to pending updates if offline
          dispatch({ type: 'ADD_PENDING_UPDATE', payload: data });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        dispatch({ type: 'SET_SYNC_ERROR', payload: { error: 'Failed to save changes' } });
      }
    }, 2000),
    [state.network.isOnline]
  );

  // Auto-save effect
  useEffect(() => {
    if (state.ui.hasUnsavedChanges) {
      debouncedSave(state.formData);
    }
  }, [state.formData, state.ui.hasUnsavedChanges, debouncedSave]);

  // Network state monitoring - simplified for React Native
  useEffect(() => {
    // Set initial online status as true for React Native
    dispatch({ 
      type: 'SET_NETWORK_STATUS', 
      payload: { isOnline: true } 
    });
    
    // In a real implementation, you would use @react-native-netinfo/netinfo
    // For now, we'll assume the device is always online
  }, []);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(CV_DATA_KEY);
        if (savedData) {
          const parsedData: CVFormData = JSON.parse(savedData);
          dispatch({ type: 'LOAD_CV_DATA', payload: parsedData });
        }
      } catch (error) {
        console.error('Failed to load saved CV data:', error);
      }
    };
    
    loadSavedData();
  }, []);

  // Action creators
  const actions = useMemo(() => ({
    updatePersonalInfo: (data: Partial<PersonalInfo>) => {
      dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: data });
    },
    
    addEducation: (education: EducationItem) => {
      dispatch({ type: 'ADD_EDUCATION', payload: education });
    },
    
    updateEducation: (index: number, data: Partial<EducationItem>) => {
      dispatch({ type: 'UPDATE_EDUCATION', payload: { index, data } });
    },
    
    removeEducation: (index: number) => {
      dispatch({ type: 'REMOVE_EDUCATION', payload: { index } });
    },
    
    addExperience: (experience: WorkExperience) => {
      dispatch({ type: 'ADD_EXPERIENCE', payload: experience });
    },
    
    updateExperience: (index: number, data: Partial<WorkExperience>) => {
      dispatch({ type: 'UPDATE_EXPERIENCE', payload: { index, data } });
    },
    
    removeExperience: (index: number) => {
      dispatch({ type: 'REMOVE_EXPERIENCE', payload: { index } });
    },
    
    addProject: (project: Project) => {
      dispatch({ type: 'ADD_PROJECT', payload: project });
    },
    
    updateProject: (index: number, data: Partial<Project>) => {
      dispatch({ type: 'UPDATE_PROJECT', payload: { index, data } });
    },
    
    removeProject: (index: number) => {
      dispatch({ type: 'REMOVE_PROJECT', payload: { index } });
    },
    
    addSkill: (skill: Skill) => {
      dispatch({ type: 'ADD_SKILL', payload: skill });
    },
    
    removeSkill: (skillName: string) => {
      dispatch({ type: 'REMOVE_SKILL', payload: { skillName } });
    },
    
    updateSkillLevel: (skillName: string, level: SkillLevel) => {
      dispatch({ type: 'UPDATE_SKILL_LEVEL', payload: { skillName, level } });
    },
    
    addLanguage: (language: Language) => {
      dispatch({ type: 'ADD_LANGUAGE', payload: language });
    },
    
    updateLanguage: (index: number, data: Partial<Language>) => {
      dispatch({ type: 'UPDATE_LANGUAGE', payload: { index, data } });
    },
    
    removeLanguage: (index: number) => {
      dispatch({ type: 'REMOVE_LANGUAGE', payload: { index } });
    },
    
    uploadProfileImage: async (imageUri: string): Promise<void> => {
      dispatch({ type: 'SET_IMAGE_UPLOAD_PROGRESS', payload: { progress: 0.1 } });
      
      try {
        // TODO: Get token from auth context
        const token = 'temp-token'; // This should come from auth context
        
        // Create FormData for the image
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
        
        // Import and use CV service
        const { cvService } = await import('@/app/services/cvService');
        
        const uploadedUrl = await cvService.uploadProfileImage(
          token,
          formData,
          (progress) => {
            dispatch({ type: 'SET_IMAGE_UPLOAD_PROGRESS', payload: { progress } });
          }
        );
        
        if (uploadedUrl) {
          dispatch({ type: 'SET_PROFILE_IMAGE', payload: { uri: uploadedUrl } });
        } else {
          throw new Error('Upload failed - no URL returned');
        }
      } catch (error) {
        dispatch({ 
          type: 'SET_IMAGE_UPLOAD_ERROR', 
          payload: { error: error instanceof Error ? error.message : 'Upload failed' } 
        });
        throw error;
      }
    },
    
    generatePDF: async (template: CVTemplate, options?: PDFGenerationOptions): Promise<string> => {
      dispatch({ type: 'SET_PDF_GENERATING', payload: { isGenerating: true } });
      
      try {
        // TODO: Implement actual PDF generation
        // For now, simulate the process
        const simulatePDFGeneration = () => {
          return new Promise<string>((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              dispatch({ type: 'SET_PDF_GENERATION_PROGRESS', payload: { progress } });
              
              if (progress >= 100) {
                clearInterval(interval);
                const mockPdfUri = `file:///${Date.now()}_cv.pdf`;
                resolve(mockPdfUri);
              }
            }, 300);
          });
        };
        
        const pdfUri = await simulatePDFGeneration();
        dispatch({ type: 'SET_PDF_GENERATED', payload: { uri: pdfUri } });
        
        return pdfUri;
      } catch (error) {
        dispatch({ type: 'SET_PDF_GENERATING', payload: { isGenerating: false } });
        throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    saveCVData: async (): Promise<void> => {
      try {
        // Save locally first
        await AsyncStorage.setItem(CV_DATA_KEY, JSON.stringify(state.formData));
        
        // Save to API if online
        if (state.network.isOnline) {
          const token = 'temp-token'; // TODO: Get from auth context
          const { cvService } = await import('@/app/services/cvService');
          
          const success = await cvService.saveCV(token, state.formData);
          if (!success) {
            // If API save fails, add to pending updates
            dispatch({ type: 'ADD_PENDING_UPDATE', payload: state.formData });
            throw new Error('Failed to save to server, saved locally');
          }
        } else {
          // Add to pending updates when offline
          dispatch({ type: 'ADD_PENDING_UPDATE', payload: state.formData });
        }
        
        dispatch({ type: 'MARK_CHANGES_SAVED' });
      } catch (error) {
        throw new Error(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    loadCVData: async (): Promise<void> => {
      try {
        const savedData = await AsyncStorage.getItem(CV_DATA_KEY);
        if (savedData) {
          const parsedData: CVFormData = JSON.parse(savedData);
          dispatch({ type: 'LOAD_CV_DATA', payload: parsedData });
        }
      } catch (error) {
        throw new Error(`Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    toggleSectionCollapse: (section: string) => {
      dispatch({ type: 'TOGGLE_SECTION_COLLAPSE', payload: { section } });
    },
    
    setActiveSection: (section: keyof CVFormData) => {
      dispatch({ type: 'SET_ACTIVE_SECTION', payload: { section } });
    },
    
    validateSection: (section: keyof CVFormData): boolean => {
      // TODO: Implement validation logic for each section
      const errors = {};
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
      return Object.keys(errors).length === 0;
    },
    
    getProgress: (): CVProgress => {
      const sections = [
        { 
          key: 'personalInfo' as keyof CVFormData, 
          name: 'Información Personal', 
          completed: !!state.formData.personalInfo?.firstName && !!state.formData.personalInfo?.lastName,
          required: true,
        },
        { 
          key: 'education' as keyof CVFormData, 
          name: 'Educación', 
          completed: (state.formData.education?.educationHistory?.length || 0) > 0,
          required: true,
        },
        { 
          key: 'workExperience' as keyof CVFormData, 
          name: 'Experiencia Laboral', 
          completed: (state.formData.workExperience?.length || 0) > 0,
          required: false,
        },
        { 
          key: 'skills' as keyof CVFormData, 
          name: 'Habilidades', 
          completed: (state.formData.skills?.length || 0) > 0,
          required: true,
        },
        { 
          key: 'projects' as keyof CVFormData, 
          name: 'Proyectos', 
          completed: (state.formData.projects?.length || 0) > 0,
          required: false,
        },
        { 
          key: 'languages' as keyof CVFormData, 
          name: 'Idiomas', 
          completed: (state.formData.languages?.length || 0) > 0,
          required: false,
        },
      ];
      
      const completedSections = sections.filter(section => section.completed).length;
      const totalSections = sections.length;
      const progressPercentage = Math.round((completedSections / totalSections) * 100);
      
      return {
        sections,
        completedSections,
        totalSections,
        progressPercentage,
      };
    },
  }), [state.formData, state.network.isOnline]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      actions,
    }),
    [state, actions]
  );

  return (
    <CVContext.Provider value={contextValue}>
      {children}
    </CVContext.Provider>
  );
};

// Hook to use CV context
export const useCV = (): UseCVReturn => {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};