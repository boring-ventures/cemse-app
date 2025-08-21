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

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (international format)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+$/;

// Date validation regex (MM/YYYY or MM/YY format)
const DATE_REGEX = /^(0[1-9]|1[0-2])\/\d{2,4}$/;

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
 * Validate phone number
 */
export const validatePhone = (phone: string): FieldValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

/**
 * Validate URL format
 */
export const validateURL = (url: string, required: boolean = true): FieldValidationResult => {
  if (!url.trim()) {
    return required 
      ? { isValid: false, error: 'URL is required' }
      : { isValid: true };
  }
  
  if (!URL_REGEX.test(url.trim())) {
    return { isValid: false, error: 'Please enter a valid URL (must start with http:// or https://)' };
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
 * Validate required text field
 */
export const validateRequiredText = (text: string, fieldName: string, minLength: number = 1): FieldValidationResult => {
  if (!text.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (text.trim().length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
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
 * Validate personal information
 */
export const validatePersonalInfo = (personalInfo: Partial<CVData['personalInfo']>): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields
  const firstNameValidation = validateRequiredText(personalInfo.firstName || '', 'First name', 2);
  if (!firstNameValidation.isValid) errors.push(firstNameValidation.error!);
  
  const lastNameValidation = validateRequiredText(personalInfo.lastName || '', 'Last name', 2);
  if (!lastNameValidation.isValid) errors.push(lastNameValidation.error!);
  
  const emailValidation = validateEmail(personalInfo.email || '');
  if (!emailValidation.isValid) errors.push(emailValidation.error!);
  
  const phoneValidation = validatePhone(personalInfo.phone || '');
  if (!phoneValidation.isValid) errors.push(phoneValidation.error!);
  
  const addressValidation = validateRequiredText(personalInfo.address || '', 'Address', 5);
  if (!addressValidation.isValid) errors.push(addressValidation.error!);
  
  const municipalityValidation = validateRequiredText(personalInfo.municipality || '', 'Municipality', 2);
  if (!municipalityValidation.isValid) errors.push(municipalityValidation.error!);
  
  const departmentValidation = validateRequiredText(personalInfo.department || '', 'Department', 2);
  if (!departmentValidation.isValid) errors.push(departmentValidation.error!);
  
  const countryValidation = validateRequiredText(personalInfo.country || '', 'Country', 2);
  if (!countryValidation.isValid) errors.push(countryValidation.error!);
  
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
 * Validate social link item
 */
export const validateSocialLink = (socialLink: Partial<SocialLink>): ValidationResult => {
  const errors: string[] = [];
  
  const platformValidation = validateRequiredText(socialLink.platform || '', 'Platform');
  if (!platformValidation.isValid) errors.push(platformValidation.error!);
  
  const urlValidation = validateURL(socialLink.url || '');
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