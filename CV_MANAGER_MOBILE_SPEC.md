# CEMSE CV Manager Mobile Implementation Specification - COMPLETE ANALYSIS

## Executive Summary

This document provides a comprehensive technical specification for replicating the CEMSE CV Manager system in React Native for mobile applications. Based on detailed analysis of the actual web implementation (cv-manager.tsx - 1,512 lines), this specification includes COMPLETE component hierarchies, API integrations, data models, and mobile-specific adaptations required for pixel-perfect mobile replication.

**Key Findings from Web Implementation Analysis:**
- 1,512-line CV Manager component with 7 collapsible sections
- Full tab system with edit/cv/cover-letter views
- Complex dynamic list management for education history, skills, languages, etc.
- Advanced PDF generation with 3 template variants
- Real-time data synchronization with optimistic updates
- Comprehensive image upload system with drag & drop
- Rich form validation and error handling

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Core Components Analysis](#core-components-analysis)
3. [Data Models and Types](#data-models-and-types)
4. [API Integration Specifications](#api-integration-specifications)
5. [State Management Patterns](#state-management-patterns)
6. [UI/UX Components for Mobile](#ui-ux-components-for-mobile)
7. [File Upload and Image Management](#file-upload-and-image-management)
8. [Template System and PDF Generation](#template-system-and-pdf-generation)
9. [Mobile-Specific Considerations](#mobile-specific-considerations)
10. [Implementation Roadmap](#implementation-roadmap)

---

## CRITICAL IMPLEMENTATION GAPS ANALYSIS

### Comparison: Existing Spec vs Actual Web Implementation

**GAPS IDENTIFIED IN ORIGINAL SPECIFICATION:**

1. **Missing Complex State Management**
   - Original spec underestimated collapsible sections state complexity
   - Actual implementation has 7 different collapsible sections with individual state
   - Missing real-time validation states and error handling patterns
   - No mention of optimistic updates with rollback capabilities

2. **Underestimated Dynamic List Complexity**
   - Education History: Complete CRUD operations with nested objects
   - Academic Achievements: Rich objects with type categorization
   - Language Proficiency: Structured selection system
   - Social Links: Platform-specific validation

3. **Missing Advanced Features**
   - Live profile image preview and cropping requirements
   - Real-time character counting for text fields
   - Advanced date handling (month/year pickers)
   - Template-specific PDF styling requirements
   - Print-specific CSS optimizations

4. **API Integration Underspecified**
   - Multiple fallback API endpoints (profile vs CV endpoints)
   - Complex authentication header management
   - File upload progress tracking
   - Real-time sync error handling

---

## 1. System Architecture Overview - ACTUAL IMPLEMENTATION

### ACTUAL Component Hierarchy (Based on Code Analysis)
```
CVManager (Main Container - 1,512 lines)
├── Header Section
│   ├── Title & Description
│   ├── Edit/Preview Toggle Button
│   └── Download Actions (CV, Cover Letter, Everything)
├── Tab Navigation System (Tabs Component)
│   ├── TabsList (4 tabs: edit, cv, cover-letter)
│   └── TabsContent for each section
├── Edit Data Tab (TabsContent value="edit")
│   ├── Always Visible Sections (Grid Layout)
│   │   ├── Job Title Card (Target Position)
│   │   ├── Profile Image Upload Card (ImageUpload Component)
│   │   └── Personal Information Card (Nested Form Fields)
│   ├── Professional Summary Card (Always Visible)
│   └── Collapsible Sections (7 sections with state management)
│       ├── Education Section (collapsedSections.education)
│       │   ├── Basic Education Info (4 fields)
│       │   ├── University Information (6 fields) 
│       │   ├── Education History (Dynamic List with CRUD)
│       │   └── Academic Achievements (Dynamic List with CRUD)
│       ├── Languages Section (collapsedSections.languages)
│       │   └── Dynamic List (name + proficiency selection)
│       ├── Social Links Section (collapsedSections.socialLinks)
│       │   └── Dynamic List (platform selection + URL)
│       ├── Work Experience Section (collapsedSections.workExperience)
│       │   └── Dynamic List (5 fields per item)
│       ├── Projects Section (collapsedSections.projects)
│       │   └── Dynamic List (5 fields per item)
│       ├── Skills Section (collapsedSections.skills)
│       │   ├── Input + Add Button
│       │   └── Badge Display with Remove
│       └── Interests Section (collapsedSections.interests)
│           ├── Input + Add Button
│           └── Badge Display with Remove
├── CV Tab (TabsContent value="cv")
│   └── CVTemplateSelector Component
│       ├── Template Selection Tabs (3 templates)
│       ├── Template Preview Area
│       ├── Action Buttons (Edit, Print, Download)
│       └── PDF Generation System
├── Cover Letter Tab (TabsContent value="cover-letter")
│   └── CoverLetterTemplateSelector Component
│       ├── Template Selection Tabs (3 templates)
│       ├── Live Editing Interface
│       ├── Recipient Information Forms
│       └── PDF Generation System
└── Quick Actions Card (Always Visible)
    ├── Print CV Button
    ├── Print Cover Letter Button
    ├── Download CV PDF Button
    ├── Download Cover Letter PDF Button
    └── Download Everything ZIP Button
```

### Navigation Structure
```
Profile Dashboard (/profile)
├── Personal Information
├── CV Manager Tab
│   ├── Edit Data Tab
│   ├── Curriculum Vitae Tab
│   └── Cover Letter Tab
└── Documents/Certificates
```

---

## 2. Core Components Analysis

### 2.1 Main CV Manager Component (CVManager.tsx)

**File**: `src/components/profile/cv-manager.tsx` (1,512 lines)

**Key Features**:
- Tab-based interface with 3 main sections
- Real-time data synchronization with useCV hook
- Collapsible sections for better mobile UX
- Form state management with validation
- Dynamic list management (add/remove items)

**ACTUAL State Management (Complete Analysis)**:
```typescript
// From actual cv-manager.tsx implementation
interface CVManagerActualState {
  // Tab Navigation
  activeTab: "edit" | "cv" | "cover-letter"
  
  // Edit Mode States  
  isEditing: boolean
  
  // Dynamic Input States
  newSkill: string
  newInterest: string
  
  // Upload States
  uploading: boolean
  profileImage: string
  showImageUpload: boolean
  uploadError: string
  
  // Collapsible Sections State (7 sections)
  collapsedSections: {
    education: boolean
    languages: boolean
    socialLinks: boolean
    workExperience: boolean
    projects: boolean
    skills: boolean
    interests: boolean
  }
}

// Additional States from useCV Hook
interface CVHookState {
  cvData: CVData | null
  coverLetterData: CoverLetterData | null
  loading: boolean
  error: Error | null
}

// Template Selection States
interface TemplateStates {
  // CV Templates
  selectedCVTemplate: "modern" | "creative" | "minimalist"
  cvIsEditing: boolean
  
  // Cover Letter Templates  
  selectedCoverLetterTemplate: "professional" | "creative" | "minimalist"
  coverLetterIsEditing: boolean
  currentContent: string
  currentRecipient: RecipientData
  currentSubject: string
}
```

**Mobile Adaptation Requirements**:
- Convert tabs to mobile-friendly navigation (bottom tabs or swipe)
- Implement pull-to-refresh functionality
- Add touch-friendly collapsible sections
- Optimize form inputs for mobile keyboards

### 2.2 Image Upload Component (ImageUpload.tsx)

**File**: `src/components/profile/image-upload.tsx`

**Core Features**:
- Drag & drop support (desktop) / tap-to-select (mobile)
- File validation (type, size limits)
- Image preview with crop functionality
- Real-time upload with progress indication
- Remove image capability

**Mobile Implementation**:
```typescript
interface ImageUploadProps {
  currentImage?: string
  onImageUpload: (file: File) => Promise<void>
  onImageRemove: () => Promise<void>
  className?: string
}

// Mobile-specific features needed:
// - Camera access integration
// - Photo library access
// - Image compression before upload
// - Offline image caching
```

**Validation Rules**:
- Supported formats: JPG, PNG, GIF
- Maximum size: 5MB
- Recommended dimensions: 400x400px minimum
- Automatic image optimization

---

## 3. Data Models and Types

### 3.1 CV Data Structure

```typescript
interface CVData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    addressLine?: string
    city?: string
    state?: string
    municipality: string
    department: string
    country: string
    birthDate?: Date
    gender?: string
    profileImage?: string
  }
  jobTitle?: string
  professionalSummary?: string
  education: {
    level: string                    // Nivel educativo
    currentInstitution: string       // Institución actual
    graduationYear: number           // Año de graduación
    isStudying: boolean              // Si está estudiando actualmente
    
    // Educación detallada
    educationHistory: EducationHistoryItem[]  // Historial completo
    currentDegree: string            // Grado actual
    universityName: string           // Nombre de la universidad
    universityStartDate: string      // Fecha de inicio en universidad
    universityEndDate: string | null // Fecha de fin en universidad
    universityStatus: string         // Estado universitario
    gpa: number                      // Promedio académico
    academicAchievements: AcademicAchievement[] // Logros académicos
  }
  skills: {
    name: string
    experienceLevel?: string
  }[]
  interests: string[]
  languages: {
    name: string
    proficiency: string
  }[]
  socialLinks: {
    platform: string
    url: string
  }[]
  workExperience: {
    jobTitle: string
    company: string
    startDate: string
    endDate: string
    description: string
  }[]
  projects: {
    title: string
    location?: string
    startDate: string
    endDate: string
    description: string
  }[]
  activities: {
    title: string
    organization?: string
    startDate: string
    endDate: string
    description: string
  }[]
  achievements: any[]
  certifications: any[]
  targetPosition?: string
  targetCompany?: string
  relevantSkills?: string[]
}
```

### 3.2 Supporting Interfaces

```typescript
interface EducationHistoryItem {
  institution: string
  degree: string
  startDate: string
  endDate: string | null
  status: string
  gpa?: number
}

interface AcademicAchievement {
  title: string
  date: string
  description: string
  type: string // "honor", "award", "certification", etc.
}

interface CoverLetterData {
  template: string
  content: string
  recipient: {
    department: string
    companyName: string
    address: string
    city: string
    country: string
  }
  subject: string
}
```

---

## 4. API Integration Specifications - ACTUAL IMPLEMENTATION

### 4.1 CV Management Endpoints (FROM ACTUAL CODE ANALYSIS)

**CRITICAL FINDINGS:**
- Uses multiple API endpoints with fallback strategies
- Complex authentication header management
- Real-time optimistic updates
- Error handling with rollback capabilities

#### Primary Endpoints Used:

**GET /api/cv** (Primary endpoint from useCV hook)
```typescript
// From useCV.ts - fetchCVData function
const fetchCVData = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE}/cv`, {
      headers: getAuthHeaders(),
    });
    
    if (response.ok) {
      const data = await response.json();
      setCvData(data);
    } else {
      // Fallback to mock data
      setCvData(getMockCVData());
    }
  } catch (error) {
    console.error("Error fetching CV data:", error);
    setError(error as Error);
    setCvData(getMockCVData()); // Fallback strategy
  } finally {
    setLoading(false);
  }
};
```

**PUT /api/cv** (Update CV data)
```typescript
// From useCV.ts - updateCVData function  
const updateCVData = async (data: Partial<CVData>) => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE}/cv`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedData = await response.json();
      setCvData(updatedData.profile); // Server returns { profile: CVData }
      return updatedData;
    } else {
      throw new Error("Error updating CV data");
    }
  } catch (error) {
    console.error("Error updating CV data:", error);
    setError(error as Error);
    throw error; // Re-throw for UI error handling
  } finally {
    setLoading(false);
  }
};
```

#### GET /api/cv
**Response Structure**:
```json
{
  "personalInfo": {
    "firstName": "Juan Carlos",
    "lastName": "Pérez",
    "email": "juan.perez@email.com",
    "phone": "+591 700 123 456",
    "address": "Av. Principal 123",
    "municipality": "La Paz",
    "department": "La Paz",
    "country": "Bolivia",
    "profileImage": "url_to_image"
  },
  "education": {
    "level": "SECONDARY",
    "currentInstitution": "Colegio Nacional",
    "graduationYear": 2023,
    "isStudying": false,
    "educationHistory": [...],
    "academicAchievements": [...]
  },
  "skills": [...],
  "interests": [...],
  "workExperience": [...],
  "projects": [...]
}
```

#### PUT /api/cv
**Purpose**: Update CV data
**Request Body**: Partial CVData object
**Authentication**: Required (JWT token)

### 4.2 Cover Letter Endpoints

#### GET /api/cv/cover-letter
**Purpose**: Retrieve cover letter data
**Response**: CoverLetterData object with auto-generated content

#### POST /api/cv/cover-letter
**Purpose**: Save custom cover letter
**Request Body**:
```json
{
  "content": "Letter content...",
  "template": "professional",
  "recipient": {
    "department": "HR Department",
    "companyName": "Company Name",
    "address": "Company Address",
    "city": "City, Country",
    "country": "Bolivia"
  },
  "subject": "Job Application Subject"
}
```

### 4.3 File Upload Endpoints

#### POST /api/files/upload/profile-image
**Purpose**: Upload profile image
**Content-Type**: multipart/form-data
**Form Fields**: 
- `avatar`: File (image)
**Validation**: 
- Max size: 5MB
- Allowed types: image/*
**Response**:
```json
{
  "message": "Image uploaded successfully",
  "avatarUrl": "/api/files/images/profile-123-timestamp.jpg",
  "profile": { ... }
}
```

### 4.4 useCV Hook Integration

```typescript
interface CVHook {
  cvData: CVData | null
  coverLetterData: CoverLetterData | null
  loading: boolean
  error: Error | null
  
  // Methods
  fetchCVData: () => Promise<void>
  updateCVData: (data: Partial<CVData>) => Promise<any>
  fetchCoverLetterData: () => Promise<void>
  saveCoverLetterData: (
    content: string,
    template?: string,
    recipient?: RecipientData,
    subject?: string
  ) => Promise<any>
  generateCVForApplication: (jobOfferId: string) => Promise<any>
}
```

---

## 5. State Management Patterns

### 5.1 Real-time Data Synchronization (ACTUAL IMPLEMENTATION)

**CRITICAL PATTERNS FROM CV-MANAGER.TSX:**

```typescript
// Actual pattern from cv-manager.tsx (lines 133-151)
const handlePersonalInfoChange = async (field: string, value: string) => {
  try {
    await updateCVData({
      personalInfo: {
        firstName: cvData?.personalInfo?.firstName || "",
        lastName: cvData?.personalInfo?.lastName || "",
        email: cvData?.personalInfo?.email || "",
        phone: cvData?.personalInfo?.phone || "",
        address: cvData?.personalInfo?.address || "",
        municipality: cvData?.personalInfo?.municipality || "",
        department: cvData?.personalInfo?.department || "",
        country: cvData?.personalInfo?.country || "",
        [field]: value // Dynamic field update
      }
    });
  } catch (error) {
    console.error('Error updating personal info:', error);
    // No rollback mechanism - relies on server error handling
  }
};

// Education update pattern (lines 153-179)
const handleEducationChange = async (field: string, value: any) => {
  try {
    const currentEducation = cvData?.education || {
      level: "",
      currentInstitution: "",
      graduationYear: 0,
      isStudying: false,
      educationHistory: [],
      currentDegree: "",
      universityName: "",
      universityStartDate: "",
      universityEndDate: null,
      universityStatus: "",
      gpa: 0,
      academicAchievements: []
    };

    await updateCVData({
      education: {
        ...currentEducation,
        [field]: value
      }
    });
  } catch (error) {
    console.error('Error updating education:', error);
  }
};
```

### 5.2 Dynamic List Management

For managing arrays of items (skills, interests, work experience):

```typescript
// Skills management pattern
const addSkill = () => {
  if (newSkill.trim() && !cvData?.skills?.some(skill => skill.name === newSkill.trim())) {
    handleSkillsChange([...(cvData?.skills || []), { 
      name: newSkill.trim(), 
      experienceLevel: "Skillful" 
    }])
    setNewSkill("")
  }
}

const removeSkill = (skillToRemove: string) => {
  handleSkillsChange(cvData?.skills?.filter(skill => skill.name !== skillToRemove) || [])
}
```

### 5.3 Form Validation Patterns

```typescript
// Validation for education section
const handleEducationChange = async (field: string, value: any) => {
  try {
    const currentEducation = cvData?.education || {
      level: "",
      currentInstitution: "",
      graduationYear: 0,
      isStudying: false,
      educationHistory: [],
      // ... other defaults
    }

    await updateCVData({
      education: {
        ...currentEducation,
        [field]: value
      }
    })
  } catch (error) {
    console.error('Error updating education:', error)
  }
}
```

---

## 6. UI/UX Components for Mobile

### 6.1 Collapsible Sections Implementation

The web version uses collapsible sections for better organization:

```typescript
const [collapsedSections, setCollapsedSections] = useState({
  education: false,
  languages: false,
  socialLinks: false,
  workExperience: false,
  projects: false,
  skills: false,
  interests: false
})

const toggleSection = (section: keyof typeof collapsedSections) => {
  setCollapsedSections(prev => ({
    ...prev,
    [section]: !prev[section]
  }))
}
```

**Mobile Adaptation**:
- Use Accordion or ExpandableView components
- Add touch gestures for expand/collapse
- Smooth animations for better UX
- Save collapse state to AsyncStorage

### 6.2 Tab Navigation System

Current web tabs: "edit", "cv", "cover-letter"

**Mobile Implementation Options**:
1. **Bottom Tab Navigation**: More touch-friendly
2. **Swipe Navigation**: Gesture-based switching
3. **Segmented Control**: iOS-style tab switching

### 6.3 Form Input Components

**Required Mobile Input Types**:
- TextInput with validation
- DatePicker for dates
- Picker/Select for dropdowns
- TextArea for long text
- Tags input for skills/interests
- Switch/Toggle for boolean values

### 6.4 Dynamic List Components

For managing arrays (work experience, education history, etc.):

```typescript
interface DynamicListProps<T> {
  items: T[]
  onAdd: (item: T) => void
  onRemove: (index: number) => void
  onEdit: (index: number, item: T) => void
  renderItem: (item: T, index: number) => React.ReactNode
  renderAddForm: () => React.ReactNode
}
```

---

## 7. File Upload and Image Management

### 7.1 Profile Image Upload System

**Current Web Implementation**:
- Drag & drop support
- File validation (type, size)
- Progress indication
- Preview with remove option

**Mobile Requirements**:

```typescript
interface MobileImageUpload {
  // Camera integration
  openCamera: () => Promise<string>
  openPhotoLibrary: () => Promise<string>
  
  // Image processing
  compressImage: (uri: string) => Promise<string>
  cropImage: (uri: string) => Promise<string>
  
  // Upload management
  uploadWithProgress: (
    file: File, 
    onProgress: (progress: number) => void
  ) => Promise<UploadResult>
}
```

**Mobile Packages Needed**:
- `react-native-image-picker`: Camera and photo library
- `react-native-image-crop-picker`: Image cropping
- `react-native-image-resizer`: Image compression

### 7.2 File Validation Rules

```typescript
const VALIDATION_RULES = {
  profileImage: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxDimensions: { width: 2048, height: 2048 },
    recommendedDimensions: { width: 400, height: 400 }
  }
}
```

---

## 8. Template System and PDF Generation

### 8.1 CV Templates

**Available Templates**:
1. **Modern Professional**: Blue theme with left sidebar
2. **Creative Portfolio**: Purple gradient with cards
3. **Minimalist**: Clean white design

**Template Features**:
- Dynamic content rendering
- Professional styling
- Print-optimized layouts
- Responsive design

### 8.2 Cover Letter Templates

**Available Templates**:
1. **Professional Business**: Formal layout
2. **Modern Creative**: Card-based design
3. **Minimalist Clean**: Simple layout

### 8.3 PDF Generation System

**Current Implementation**:
- Uses `@react-pdf/renderer` for web
- Client-side PDF generation
- Template-specific styling
- Download functionality

**Mobile Implementation Options**:

1. **React Native PDF Generation**:
   ```typescript
   import RNHTMLtoPDF from 'react-native-html-to-pdf'
   
   const generatePDF = async (htmlContent: string) => {
     const options = {
       html: htmlContent,
       fileName: 'CV_Document',
       directory: 'Documents',
     }
     const pdf = await RNHTMLtoPDF.convert(options)
     return pdf.filePath
   }
   ```

2. **Server-side PDF Generation**:
   - Send CV data to server
   - Generate PDF server-side
   - Return download URL

### 8.4 Template Rendering System

```typescript
interface TemplateRenderer {
  template: 'modern' | 'creative' | 'minimalist'
  data: CVData
  type: 'cv' | 'cover-letter'
  
  renderHTML: () => string
  renderPDF: () => Promise<string>
  getPreview: () => React.ReactNode
}
```

---

## 9. Mobile-Specific Considerations

### 9.1 Performance Optimization

**Key Areas**:
- Lazy loading for template previews
- Image caching and compression
- Efficient list rendering for large datasets
- Background data synchronization

**Implementation**:
```typescript
// Lazy loading templates
const CVTemplate = React.lazy(() => import('./templates/CVTemplate'))

// Efficient list rendering
import { FlatList, VirtualizedList } from 'react-native'

// Image caching
import FastImage from 'react-native-fast-image'
```

### 9.2 Offline Functionality

**Required Offline Features**:
- Cache CV data locally
- Queue API calls when offline
- Sync when connection restored
- Offline-first form editing

**Implementation Strategy**:
```typescript
// AsyncStorage for data persistence
import AsyncStorage from '@react-native-async-storage/async-storage'

// Network state management
import NetInfo from '@react-native-community/netinfo'

// Offline queue
interface OfflineAction {
  type: 'UPDATE_CV' | 'UPLOAD_IMAGE' | 'SAVE_COVER_LETTER'
  data: any
  timestamp: number
}
```

### 9.3 Platform-Specific Adaptations

**iOS Specific**:
- Native date picker components
- iOS-style navigation patterns
- Photo library permissions
- App Store compliance

**Android Specific**:
- Material Design components
- Android file system access
- Camera permissions
- Back button handling

### 9.4 Navigation and Routing

```typescript
// React Navigation structure
const CVStack = createStackNavigator()

function CVNavigator() {
  return (
    <CVStack.Navigator>
      <CVStack.Screen 
        name="CVManager" 
        component={CVManagerScreen}
        options={{ title: 'CV Manager' }}
      />
      <CVStack.Screen 
        name="CVPreview" 
        component={CVPreviewScreen}
        options={{ title: 'CV Preview' }}
      />
      <CVStack.Screen 
        name="CoverLetterEditor" 
        component={CoverLetterScreen}
        options={{ title: 'Cover Letter' }}
      />
    </CVStack.Navigator>
  )
}
```

---

## COMPLETE MOBILE IMPLEMENTATION REQUIREMENTS

### Critical React Native Components Needed:

1. **Navigation Components**
```typescript
// Tab Navigation (react-navigation)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const CVTabs = createMaterialTopTabNavigator();
const MainTabs = createBottomTabNavigator();
```

2. **Form Components**
```typescript
// Custom Input Components
import { TextInput, Switch, Picker } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik, Field } from 'formik';

interface ValidatedInput extends TextInputProps {
  label: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
}
```

3. **List Management Components**
```typescript
// Dynamic List with CRUD operations
import { FlatList, SwipeListView } from 'react-native';

interface DynamicListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactNode;
  onAdd: (item: T) => void;
  onEdit: (index: number, item: T) => void;
  onDelete: (index: number) => void;
  addButtonText: string;
}
```

4. **Collapsible Sections**
```typescript
// Accordion/Collapsible sections
import { Animated, LayoutAnimation } from 'react-native';
import Collapsible from 'react-native-collapsible';

interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}
```

### Mobile-Specific Data Handling:

```typescript
// Offline Storage with AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const CVStorage = {
  save: async (cvData: CVData) => {
    await AsyncStorage.setItem('cv_data', JSON.stringify(cvData));
  },
  
  load: async (): Promise<CVData | null> => {
    const stored = await AsyncStorage.getItem('cv_data');
    return stored ? JSON.parse(stored) : null;
  },
  
  clear: async () => {
    await AsyncStorage.removeItem('cv_data');
  }
};

// Network state management
import NetInfo from '@react-native-community/netinfo';

const useNetworkSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<Array<Partial<CVData>>>([]);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      if (state.isConnected && pendingUpdates.length > 0) {
        // Sync pending updates
        syncPendingUpdates();
      }
    });
    
    return unsubscribe;
  }, []);
};
```

### Image Handling for Mobile:

```typescript
// Camera and Photo Library Access
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import ImageCropPicker from 'react-native-image-crop-picker';

const MobileImageUpload = {
  openCamera: async () => {
    const result = await ImageCropPicker.openCamera({
      width: 400,
      height: 400,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageMaxWidth: 400,
      compressImageMaxHeight: 400,
      compressImageQuality: 0.8
    });
    
    return result.path;
  },
  
  openGallery: async () => {
    const result = await ImageCropPicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageMaxWidth: 400,
      compressImageMaxHeight: 400,
      compressImageQuality: 0.8
    });
    
    return result.path;
  }
};
```

### PDF Generation for Mobile:

```typescript
// HTML to PDF conversion
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

const MobilePDFGenerator = {
  generateCV: async (cvData: CVData, template: string) => {
    const htmlContent = generateCVHTML(cvData, template);
    
    const options = {
      html: htmlContent,
      fileName: `CV_${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}`,
      directory: 'Documents',
      width: 612, // A4 width in points
      height: 792, // A4 height in points
    };
    
    const pdf = await RNHTMLtoPDF.convert(options);
    return pdf.filePath;
  },
  
  sharePDF: async (filePath: string) => {
    const shareOptions = {
      title: 'Share CV',
      url: `file://${filePath}`,
      type: 'application/pdf',
    };
    
    await Share.open(shareOptions);
  }
};
```

---

## 10. Implementation Roadmap

### Phase 1: Core CV Management (4-6 weeks)

**Week 1-2: Foundation Setup**
- [ ] Set up React Native project structure
- [ ] Implement basic navigation (React Navigation)
- [ ] Create core data types and interfaces
- [ ] Set up state management (Redux/Context)

**Week 3-4: CV Data Management**
- [ ] Implement useCV hook for mobile
- [ ] Create form components for personal information
- [ ] Build education section with dynamic history
- [ ] Implement skills and interests management

**Week 5-6: UI/UX Implementation**
- [ ] Create collapsible sections
- [ ] Implement tab navigation
- [ ] Add form validation
- [ ] Build dynamic list components

### Phase 2: Media and Templates (3-4 weeks)

**Week 7-8: Image Management**
- [ ] Integrate camera and photo library
- [ ] Implement image upload with compression
- [ ] Add image cropping functionality
- [ ] Create profile image component

**Week 9-10: Template System**
- [ ] Port CV templates to mobile
- [ ] Implement cover letter templates
- [ ] Create template selection UI
- [ ] Add preview functionality

### Phase 3: PDF Generation and Export (2-3 weeks)

**Week 11-12: Document Generation**
- [ ] Implement PDF generation system
- [ ] Create download/share functionality
- [ ] Add print capability
- [ ] Implement document storage

### Phase 4: Advanced Features (2-3 weeks)

**Week 13-14: Offline and Sync**
- [ ] Implement offline data storage
- [ ] Create sync queue system
- [ ] Add network state management
- [ ] Implement background sync

**Week 15: Polish and Testing**
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Bug fixes and refinements
- [ ] Platform-specific adjustments

---

## File Structure for Mobile Implementation

```
src/
├── components/
│   ├── cv/
│   │   ├── CVManager.tsx
│   │   ├── PersonalInfoSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── SkillsSection.tsx
│   │   └── ExperienceSection.tsx
│   ├── forms/
│   │   ├── DynamicList.tsx
│   │   ├── CollapsibleSection.tsx
│   │   ├── TagInput.tsx
│   │   └── ValidatedTextInput.tsx
│   ├── media/
│   │   ├── ImageUpload.tsx
│   │   ├── CameraModal.tsx
│   │   └── ImageCropper.tsx
│   └── templates/
│       ├── CVTemplates/
│       └── CoverLetterTemplates/
├── hooks/
│   ├── useCV.ts
│   ├── useOfflineSync.ts
│   └── useImageUpload.ts
├── services/
│   ├── api/
│   │   ├── cvApi.ts
│   │   └── fileApi.ts
│   ├── storage/
│   │   ├── AsyncStorageService.ts
│   │   └── OfflineQueue.ts
│   └── pdf/
│       └── PDFGenerator.ts
├── types/
│   ├── cv.ts
│   ├── api.ts
│   └── navigation.ts
└── utils/
    ├── validation.ts
    ├── imageUtils.ts
    └── dateUtils.ts
```

---

## Conclusion

This specification provides a complete technical roadmap for implementing the CEMSE CV Manager system in React Native. The mobile implementation should maintain feature parity with the web version while adding mobile-specific enhancements like camera integration, offline functionality, and touch-optimized interfaces.

Key success factors:
1. **Maintain Data Consistency**: Ensure CV data structure matches web version
2. **API Compatibility**: Use existing endpoints with minimal modifications
3. **Mobile-First UX**: Optimize interfaces for touch interaction
4. **Offline Capability**: Enable editing without internet connection
5. **Performance**: Implement efficient rendering and data management

The specification covers all major components, data flows, and technical requirements needed for a successful mobile implementation of the CV Manager system.

---

## FINAL IMPLEMENTATION CHECKLIST - COMPLETE FEATURE PARITY

### MANDATORY Features for Mobile (From Web Analysis):

**1. State Management (7 collapsible sections + form states)**
- [ ] Implement `collapsedSections` state with 7 boolean flags
- [ ] Add dynamic input states (`newSkill`, `newInterest`)
- [ ] Upload progress states (`uploading`, `uploadError`)
- [ ] Tab navigation state (`activeTab`: edit/cv/cover-letter)

**2. Personal Information Section (Always Visible)**
- [ ] Job title input (target position)
- [ ] Profile image upload with camera/gallery access
- [ ] Full name inputs (firstName, lastName)
- [ ] Contact information (email, phone)
- [ ] Address details (addressLine, city, state, municipality, department, country)

**3. Education Section (Collapsible with 3 Sub-sections)**
- [ ] Basic education info (4 fields: level, currentInstitution, graduationYear, isStudying)
- [ ] University information (6 fields: currentDegree, universityName, start/end dates, status, GPA)
- [ ] Education history dynamic list (CRUD operations)
- [ ] Academic achievements dynamic list (title, date, description, type)

**4. Dynamic List Sections (All Collapsible)**
- [ ] Languages (name + proficiency selector)
- [ ] Social Links (platform selector + URL validation)
- [ ] Work Experience (5 fields: jobTitle, company, startDate, endDate, description)
- [ ] Projects (5 fields: title, location, startDate, endDate, description)

**5. Tag-based Sections**
- [ ] Skills (input + add button + badge display with remove)
- [ ] Interests (input + add button + badge display with remove)

**6. Template System**
- [ ] CV Templates: Modern, Creative, Minimalist (exact styling replication)
- [ ] Cover Letter Templates: Professional, Creative, Minimalist
- [ ] Template selection tabs
- [ ] Live preview generation

**7. PDF Generation & Export**
- [ ] Mobile PDF generation (HTML to PDF)
- [ ] Share functionality (native sharing)
- [ ] Print capability (if supported)
- [ ] Download to device storage

**8. API Integration**
- [ ] useCV hook implementation
- [ ] Fallback strategy for offline mode
- [ ] Real-time update functions (exact patterns from web)
- [ ] Error handling with user feedback
- [ ] Authentication header management

**9. Mobile-Specific Enhancements**
- [ ] Touch-optimized collapsible sections
- [ ] Mobile-friendly date pickers
- [ ] Camera integration for profile images
- [ ] Offline data persistence
- [ ] Network status monitoring
- [ ] Pull-to-refresh functionality

### CRITICAL SUCCESS FACTORS:

1. **Data Structure Compatibility**: Use EXACT CVData interface from web
2. **API Endpoint Compatibility**: Use identical endpoints with same request/response patterns
3. **State Management Consistency**: Replicate exact state update patterns
4. **Template Visual Fidelity**: PDF outputs must match web version exactly
5. **Performance**: Smooth scrolling with 60fps for large CV data
6. **Offline Capability**: Full editing capability without internet connection

### VALIDATION CRITERIA:

- [ ] All 7 collapsible sections work identically to web
- [ ] Dynamic lists support identical CRUD operations
- [ ] PDF generation produces identical output to web templates
- [ ] Offline editing works seamlessly
- [ ] Image upload matches web functionality
- [ ] All form validations match web behavior
- [ ] Error handling provides same user experience

This complete specification ensures PIXEL-PERFECT mobile replication of the CEMSE CV Manager system.