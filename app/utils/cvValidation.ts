import { CVData, WorkExperience, Project, Language, SocialLink, Activity, EducationHistoryItem, AcademicAchievement } from '@/app/types/cv';

/**
 * CV Form Validation Utilities
 * Comprehensive validation for all CV form fields
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Enhanced email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Enhanced phone validation regex (international format with country codes)
const PHONE_REGEX = /^[\+]?[1-9]\d{1,14}$/;

// Bolivian phone validation regex
const BOLIVIA_PHONE_REGEX = /^(\+591|591)?[67]\d{7}$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+$/;

// Date validation regex (MM/YYYY or MM/YY format)
const DATE_REGEX = /^(0[1-9]|1[0-2])\/\d{2,4}$/;

// Character limits for various fields
export const CHARACTER_LIMITS = {
  firstName: { min: 2, max: 50 },
  lastName: { min: 2, max: 50 },
  address: { min: 5, max: 200 },
  municipality: { min: 2, max: 100 },
  department: { min: 2, max: 100 },
  country: { min: 2, max: 100 },
  jobTitle: { min: 2, max: 100 },
  company: { min: 2, max: 100 },
  institution: { min: 2, max: 100 },
  degree: { min: 2, max: 100 },
  projectTitle: { min: 2, max: 100 },
  activityTitle: { min: 2, max: 100 },
  achievementTitle: { min: 2, max: 100 },
  language: { min: 2, max: 50 },
  skill: { min: 2, max: 50 },
  interest: { min: 2, max: 50 },
  description: { min: 10, max: 1000 },
  professionalSummary: { min: 50, max: 2000 },
  coverLetterSubject: { min: 5, max: 200 },
  coverLetterContent: { min: 100, max: 5000 },
};

// Image validation constraints
export const IMAGE_VALIDATION = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
  minDimensions: { width: 100, height: 100 },
  maxDimensions: { width: 2048, height: 2048 },
  recommendedDimensions: { width: 400, height: 400 }
};

// Social media platform-specific URL validation
const SOCIAL_PLATFORMS = {
  linkedin: {
    regex: /^https?:\/\/(www\.)?linkedin\.com\/(in|profile)\/[\w\-_%]+\/?$/,
    placeholder: 'https://linkedin.com/in/your-profile'
  },
  github: {
    regex: /^https?:\/\/(www\.)?github\.com\/[\w\-_.]+\/?$/,
    placeholder: 'https://github.com/your-username'
  },
  twitter: {
    regex: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w]+\/?$/,
    placeholder: 'https://twitter.com/your-handle'
  },
  facebook: {
    regex: /^https?:\/\/(www\.)?facebook\.com\/[\w\-.]+\/?$/,
    placeholder: 'https://facebook.com/your-profile'
  },
  instagram: {
    regex: /^https?:\/\/(www\.)?instagram\.com\/[\w\-.]+\/?$/,
    placeholder: 'https://instagram.com/your-handle'
  },
  youtube: {
    regex: /^https?:\/\/(www\.)?youtube\.com\/(channel\/|c\/|user\/)?[\w\-_]+\/?$/,
    placeholder: 'https://youtube.com/channel/your-channel'
  },
  portfolio: {
    regex: /^https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+$/,
    placeholder: 'https://your-portfolio.com'
  },
  other: {
    regex: /^https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+$/,
    placeholder: 'https://your-website.com'
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): FieldValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number with international format support
 */
export const validatePhone = (phone: string, countryCode?: string): FieldValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Special validation for Bolivia
  if (countryCode === 'BO' || countryCode === '591') {
    if (!BOLIVIA_PHONE_REGEX.test(cleanPhone)) {
      return { isValid: false, error: 'Please enter a valid Bolivian phone number (+591 followed by 8 digits starting with 6 or 7)' };
    }
    return { isValid: true };
  }
  
  // General international phone validation
  if (!PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid international phone number (e.g., +591 12345678)' };
  }
  
  // Additional validation for length
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Phone number must be between 7 and 15 digits' };
  }
  
  return { isValid: true };
};

/**
 * Validate URL format with platform-specific validation
 */
export const validateURL = (url: string, platform?: string, required: boolean = true): FieldValidationResult => {
  if (!url.trim()) {
    return required 
      ? { isValid: false, error: 'URL is required' }
      : { isValid: true };
  }
  
  // Platform-specific validation
  if (platform && SOCIAL_PLATFORMS[platform.toLowerCase() as keyof typeof SOCIAL_PLATFORMS]) {
    const platformValidation = SOCIAL_PLATFORMS[platform.toLowerCase() as keyof typeof SOCIAL_PLATFORMS];
    if (!platformValidation.regex.test(url.trim())) {
      return { 
        isValid: false, 
        error: `Please enter a valid ${platform} URL (e.g., ${platformValidation.placeholder})` 
      };
    }
  } else {
    // General URL validation
    if (!URL_REGEX.test(url.trim())) {
      return { isValid: false, error: 'Please enter a valid URL (must start with http:// or https://)' };
    }
  }
  
  // Additional URL length validation
  if (url.trim().length > 2000) {
    return { isValid: false, error: 'URL is too long (maximum 2000 characters)' };
  }
  
  return { isValid: true };
};

/**
 * Validate date format (MM/YYYY)
 */
export const validateDate = (date: string, required: boolean = true): FieldValidationResult => {
  if (!date.trim()) {
    return required 
      ? { isValid: false, error: 'Date is required' }
      : { isValid: true };
  }
  
  if (!DATE_REGEX.test(date.trim())) {
    return { isValid: false, error: 'Please enter date in MM/YYYY format' };
  }
  
  // Validate month
  const [month] = date.split('/');
  const monthNum = parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Please enter a valid month (01-12)' };
  }
  
  return { isValid: true };
};

/**
 * Validate required text field with character limits
 */
export const validateRequiredText = (text: string, fieldName: string, minLength?: number, maxLength?: number): FieldValidationResult => {
  if (!text.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedText = text.trim();
  const actualMinLength = minLength ?? 1;
  const actualMaxLength = maxLength ?? Infinity;
  
  if (trimmedText.length < actualMinLength) {
    return { isValid: false, error: `${fieldName} must be at least ${actualMinLength} characters long` };
  }
  
  if (trimmedText.length > actualMaxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${actualMaxLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate character limit for specific field types
 */
export const validateCharacterLimit = (text: string, fieldType: keyof typeof CHARACTER_LIMITS): FieldValidationResult => {
  const limits = CHARACTER_LIMITS[fieldType];
  if (!limits) {
    return { isValid: true }; // No limits defined for this field type
  }
  
  const trimmedText = text.trim();
  
  if (trimmedText.length < limits.min) {
    return { isValid: false, error: `This field must be at least ${limits.min} characters long` };
  }
  
  if (trimmedText.length > limits.max) {
    return { isValid: false, error: `This field must not exceed ${limits.max} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate image file
 */
export const validateImageFile = (fileUri: string, fileSize?: number, fileName?: string): FieldValidationResult => {
  if (!fileUri) {
    return { isValid: false, error: 'Image file is required' };
  }
  
  // Validate file extension
  if (fileName) {
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!IMAGE_VALIDATION.allowedExtensions.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Invalid file type. Allowed formats: ${IMAGE_VALIDATION.allowedExtensions.join(', ')}` 
      };
    }
  }
  
  // Validate file size
  if (fileSize && fileSize > IMAGE_VALIDATION.maxSize) {
    const maxSizeMB = IMAGE_VALIDATION.maxSize / (1024 * 1024);
    return { 
      isValid: false, 
      error: `File size too large. Maximum allowed size is ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (width: number, height: number): FieldValidationResult => {
  if (width < IMAGE_VALIDATION.minDimensions.width || height < IMAGE_VALIDATION.minDimensions.height) {
    return { 
      isValid: false, 
      error: `Image dimensions too small. Minimum size is ${IMAGE_VALIDATION.minDimensions.width}x${IMAGE_VALIDATION.minDimensions.height}px` 
    };
  }
  
  if (width > IMAGE_VALIDATION.maxDimensions.width || height > IMAGE_VALIDATION.maxDimensions.height) {
    return { 
      isValid: false, 
      error: `Image dimensions too large. Maximum size is ${IMAGE_VALIDATION.maxDimensions.width}x${IMAGE_VALIDATION.maxDimensions.height}px` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate year (must be reasonable year)
 */
export const validateYear = (year: number | string, required: boolean = true): FieldValidationResult => {
  if (!year) {
    return required 
      ? { isValid: false, error: 'Year is required' }
      : { isValid: true };
  }
  
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum)) {
    return { isValid: false, error: 'Please enter a valid year' };
  }
  
  if (yearNum < 1950 || yearNum > currentYear + 10) {
    return { isValid: false, error: `Year must be between 1950 and ${currentYear + 10}` };
  }
  
  return { isValid: true };
};

/**
 * Validate GPA (0.0 - 4.0 scale)
 */
export const validateGPA = (gpa: number | string, required: boolean = false): FieldValidationResult => {
  if (!gpa) {
    return required 
      ? { isValid: false, error: 'GPA is required' }
      : { isValid: true };
  }
  
  const gpaNum = typeof gpa === 'string' ? parseFloat(gpa) : gpa;
  
  if (isNaN(gpaNum)) {
    return { isValid: false, error: 'Please enter a valid GPA' };
  }
  
  if (gpaNum < 0 || gpaNum > 4.0) {
    return { isValid: false, error: 'GPA must be between 0.0 and 4.0' };
  }
  
  return { isValid: true };
};

/**
 * Validate personal information with enhanced character limits
 */
export const validatePersonalInfo = (personalInfo: Partial<CVData['personalInfo']>): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields with character limits
  const firstNameValidation = validateCharacterLimit(personalInfo.firstName || '', 'firstName');
  if (!firstNameValidation.isValid) errors.push(`First name: ${firstNameValidation.error!}`);
  else if (!personalInfo.firstName?.trim()) errors.push('First name is required');
  
  const lastNameValidation = validateCharacterLimit(personalInfo.lastName || '', 'lastName');
  if (!lastNameValidation.isValid) errors.push(`Last name: ${lastNameValidation.error!}`);
  else if (!personalInfo.lastName?.trim()) errors.push('Last name is required');
  
  const emailValidation = validateEmail(personalInfo.email || '');
  if (!emailValidation.isValid) errors.push(emailValidation.error!);
  
  const phoneValidation = validatePhone(personalInfo.phone || '', personalInfo.country);
  if (!phoneValidation.isValid) errors.push(phoneValidation.error!);
  
  const addressValidation = validateCharacterLimit(personalInfo.address || '', 'address');
  if (!addressValidation.isValid) errors.push(`Address: ${addressValidation.error!}`);
  else if (!personalInfo.address?.trim()) errors.push('Address is required');
  
  const municipalityValidation = validateCharacterLimit(personalInfo.municipality || '', 'municipality');
  if (!municipalityValidation.isValid) errors.push(`Municipality: ${municipalityValidation.error!}`);
  else if (!personalInfo.municipality?.trim()) errors.push('Municipality is required');
  
  const departmentValidation = validateCharacterLimit(personalInfo.department || '', 'department');
  if (!departmentValidation.isValid) errors.push(`Department: ${departmentValidation.error!}`);
  else if (!personalInfo.department?.trim()) errors.push('Department is required');
  
  const countryValidation = validateCharacterLimit(personalInfo.country || '', 'country');
  if (!countryValidation.isValid) errors.push(`Country: ${countryValidation.error!}`);
  else if (!personalInfo.country?.trim()) errors.push('Country is required');
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate work experience item
 */
export const validateWorkExperience = (experience: Partial<WorkExperience>): ValidationResult => {
  const errors: string[] = [];
  
  const jobTitleValidation = validateRequiredText(experience.jobTitle || '', 'Job title', 2);
  if (!jobTitleValidation.isValid) errors.push(jobTitleValidation.error!);
  
  const companyValidation = validateRequiredText(experience.company || '', 'Company', 2);
  if (!companyValidation.isValid) errors.push(companyValidation.error!);
  
  const startDateValidation = validateDate(experience.startDate || '');
  if (!startDateValidation.isValid) errors.push(startDateValidation.error!);
  
  // End date is optional if it's current job
  if (experience.endDate) {
    const endDateValidation = validateDate(experience.endDate, false);
    if (!endDateValidation.isValid) errors.push(endDateValidation.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate project item
 */
export const validateProject = (project: Partial<Project>): ValidationResult => {
  const errors: string[] = [];
  
  const titleValidation = validateRequiredText(project.title || '', 'Project title', 2);
  if (!titleValidation.isValid) errors.push(titleValidation.error!);
  
  const startDateValidation = validateDate(project.startDate || '');
  if (!startDateValidation.isValid) errors.push(startDateValidation.error!);
  
  // End date is optional if it's ongoing project
  if (project.endDate) {
    const endDateValidation = validateDate(project.endDate, false);
    if (!endDateValidation.isValid) errors.push(endDateValidation.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate language item
 */
export const validateLanguage = (language: Partial<Language>): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateRequiredText(language.name || '', 'Language name', 2);
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  
  const proficiencyValidation = validateRequiredText(language.proficiency || '', 'Proficiency level');
  if (!proficiencyValidation.isValid) errors.push(proficiencyValidation.error!);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate social link item with platform-specific URL validation
 */
export const validateSocialLink = (socialLink: Partial<SocialLink>): ValidationResult => {
  const errors: string[] = [];
  
  const platformValidation = validateRequiredText(socialLink.platform || '', 'Platform');
  if (!platformValidation.isValid) errors.push(platformValidation.error!);
  
  // Use platform-specific URL validation
  const urlValidation = validateURL(socialLink.url || '', socialLink.platform);
  if (!urlValidation.isValid) errors.push(urlValidation.error!);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate activity item
 */
export const validateActivity = (activity: Partial<Activity>): ValidationResult => {
  const errors: string[] = [];
  
  const titleValidation = validateRequiredText(activity.title || '', 'Activity title', 2);
  if (!titleValidation.isValid) errors.push(titleValidation.error!);
  
  const startDateValidation = validateDate(activity.startDate || '');
  if (!startDateValidation.isValid) errors.push(startDateValidation.error!);
  
  // End date is optional if it's current activity
  if (activity.endDate) {
    const endDateValidation = validateDate(activity.endDate, false);
    if (!endDateValidation.isValid) errors.push(endDateValidation.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate education history item
 */
export const validateEducationHistory = (education: Partial<EducationHistoryItem>): ValidationResult => {
  const errors: string[] = [];
  
  const institutionValidation = validateRequiredText(education.institution || '', 'Institution', 2);
  if (!institutionValidation.isValid) errors.push(institutionValidation.error!);
  
  const degreeValidation = validateRequiredText(education.degree || '', 'Degree/Program', 2);
  if (!degreeValidation.isValid) errors.push(degreeValidation.error!);
  
  const startDateValidation = validateDate(education.startDate || '');
  if (!startDateValidation.isValid) errors.push(startDateValidation.error!);
  
  // End date is optional if currently studying
  if (education.endDate) {
    const endDateValidation = validateDate(education.endDate, false);
    if (!endDateValidation.isValid) errors.push(endDateValidation.error!);
  }
  
  // GPA is optional
  if (education.gpa) {
    const gpaValidation = validateGPA(education.gpa, false);
    if (!gpaValidation.isValid) errors.push(gpaValidation.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate academic achievement item
 */
export const validateAcademicAchievement = (achievement: Partial<AcademicAchievement>): ValidationResult => {
  const errors: string[] = [];
  
  const titleValidation = validateRequiredText(achievement.title || '', 'Achievement title', 2);
  if (!titleValidation.isValid) errors.push(titleValidation.error!);
  
  const dateValidation = validateDate(achievement.date || '');
  if (!dateValidation.isValid) errors.push(dateValidation.error!);
  
  const typeValidation = validateRequiredText(achievement.type || '', 'Achievement type');
  if (!typeValidation.isValid) errors.push(typeValidation.error!);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate complete CV data
 */
export const validateCompleteCV = (cvData: Partial<CVData>): ValidationResult => {
  const errors: string[] = [];
  
  // Validate personal information
  if (cvData.personalInfo) {
    const personalInfoValidation = validatePersonalInfo(cvData.personalInfo);
    errors.push(...personalInfoValidation.errors);
  }
  
  // Validate work experience
  if (cvData.workExperience && cvData.workExperience.length > 0) {
    cvData.workExperience.forEach((exp, index) => {
      const expValidation = validateWorkExperience(exp);
      expValidation.errors.forEach(error => {
        errors.push(`Work Experience ${index + 1}: ${error}`);
      });
    });
  }
  
  // Validate projects
  if (cvData.projects && cvData.projects.length > 0) {
    cvData.projects.forEach((project, index) => {
      const projectValidation = validateProject(project);
      projectValidation.errors.forEach(error => {
        errors.push(`Project ${index + 1}: ${error}`);
      });
    });
  }
  
  // Validate languages
  if (cvData.languages && cvData.languages.length > 0) {
    cvData.languages.forEach((lang, index) => {
      const langValidation = validateLanguage(lang);
      langValidation.errors.forEach(error => {
        errors.push(`Language ${index + 1}: ${error}`);
      });
    });
  }
  
  // Validate social links
  if (cvData.socialLinks && cvData.socialLinks.length > 0) {
    cvData.socialLinks.forEach((link, index) => {
      const linkValidation = validateSocialLink(link);
      linkValidation.errors.forEach(error => {
        errors.push(`Social Link ${index + 1}: ${error}`);
      });
    });
  }
  
  // Validate activities
  if (cvData.activities && cvData.activities.length > 0) {
    cvData.activities.forEach((activity, index) => {
      const activityValidation = validateActivity(activity);
      activityValidation.errors.forEach(error => {
        errors.push(`Activity ${index + 1}: ${error}`);
      });
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};