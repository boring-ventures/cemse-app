# CEMSE Jobs, My Applications & News - Mobile Technical Specification

## Executive Summary
This document provides a comprehensive technical specification for implementing the CEMSE jobs, my-applications, and news features in React Native, based on the analysis of the existing Next.js web application. Focus is specifically on the YOUTH role features.

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [System Architecture](#system-architecture)
3. [API Integration](#api-integration)
4. [Data Models & Types](#data-models--types)
5. [User Interface Components](#user-interface-components)
6. [Navigation Flow](#navigation-flow)
7. [State Management](#state-management)
8. [Key Features Implementation](#key-features-implementation)
9. [News System](#news-system)
10. [Authentication & Authorization](#authentication--authorization)
11. [Mobile-Specific Considerations](#mobile-specific-considerations)
12. [Implementation Roadmap](#implementation-roadmap)

## Feature Overview

### Jobs System
The jobs system allows youth users to:
- Browse and search job opportunities
- Filter jobs by multiple criteria
- View detailed job information
- Apply to jobs with CV and cover letters
- Save/bookmark jobs for later

### My Applications System
The applications system allows youth users to:
- View all their job applications
- Filter applications by status
- Chat with employers
- Track application progress
- Withdraw applications
- View application documents

### News System
The news system allows youth users to:
- Browse latest news from companies and government institutions
- View news in categorized tabs (Company vs Institutional news)
- Read detailed news articles with rich content
- View engagement metrics (views, likes, comments)
- Navigate seamlessly between news listing and detail views
- Access news through dashboard carousel integration

## System Architecture

### Directory Structure Analysis
```
src/
├── app/(dashboard)/
│   ├── jobs/                    # Main jobs section
│   │   ├── page.tsx            # Jobs listing page
│   │   ├── [id]/               # Job detail pages
│   │   │   ├── page.tsx        # Job detail view
│   │   │   ├── edit/           # Job editing (company only)
│   │   │   ├── candidates/     # Candidates view (company only)
│   │   │   └── questions/      # Job questions management
│   │   ├── create/             # Job creation (company only)
│   │   └── manage/             # Job management (company only)
│   └── my-applications/        # Applications management
│       ├── page.tsx           # Applications listing
│       ├── layout.tsx         # Applications layout
│       └── new/               # Manual application creation
│           └── page.tsx
└── components/
    └── jobs/                   # Job-related components
        ├── job-card.tsx        # Job listing card
        ├── job-search-filters.tsx # Search & filter UI
        ├── job-application-form.tsx # Application form
        ├── job-application-modal.tsx # Application modal
        ├── cv-check-modal.tsx  # CV management modal
        └── company-gallery.tsx # Company image gallery
```

### Mobile Architecture Recommendation
```
src/
├── screens/
│   ├── jobs/
│   │   ├── JobsListScreen.tsx
│   │   ├── JobDetailScreen.tsx
│   │   ├── JobFiltersScreen.tsx
│   │   └── JobApplicationScreen.tsx
│   └── applications/
│       ├── MyApplicationsScreen.tsx
│       ├── ApplicationDetailScreen.tsx
│       └── ApplicationChatScreen.tsx
├── components/
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobSearchBar.tsx
│   │   ├── JobFilters.tsx
│   │   └── ApplicationForm.tsx
│   └── applications/
│       ├── ApplicationCard.tsx
│       ├── ApplicationStatusBadge.tsx
│       └── ChatMessage.tsx
├── services/
│   ├── jobService.ts
│   ├── applicationService.ts
│   └── messageService.ts
├── hooks/
│   ├── useJobSearch.ts
│   ├── useApplications.ts
│   └── useJobMessages.ts
└── types/
    ├── job.types.ts
    └── application.types.ts
```

## API Integration

### Base API Configuration
```typescript
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';

// Authentication headers
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});
```

### Job Offer Endpoints

#### GET `/api/joboffer` - Get All Job Offers
**Purpose**: Fetch job listings with optional filters
**Method**: GET
**Headers**: Authorization Bearer token
**Query Parameters**:
- `page`: number (pagination)
- `limit`: number (results per page)
- `search`: string (text search)
- `location`: string[] (location filters)
- `contractType`: string[] (contract type filters)
- `workModality`: string[] (work modality filters)
- `experienceLevel`: string[] (experience filters)
- `salaryMin`: number (minimum salary)
- `salaryMax`: number (maximum salary)
- `exclude`: string (exclude specific job ID)

**Response**:
```typescript
interface JobOfferResponse {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
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
  company?: {
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
  };
}
```

#### GET `/api/joboffer/{id}` - Get Job Detail
**Purpose**: Fetch detailed job information
**Method**: GET
**Headers**: Authorization Bearer token
**Response**: Same as above but single object

### Job Application Endpoints

#### GET `/api/jobapplication` - Get User's Applications
**Purpose**: Fetch current user's job applications
**Method**: GET
**Headers**: Authorization Bearer token
**Response**:
```typescript
interface JobApplicationResponse {
  items: JobApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### POST `/api/jobapplication` - Create Application
**Purpose**: Submit job application
**Method**: POST
**Headers**: Authorization Bearer token
**Body**:
```typescript
interface CreateApplicationRequest {
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
```

#### DELETE `/api/my-applications?applicationId={id}` - Withdraw Application
**Purpose**: Withdraw/cancel job application
**Method**: DELETE
**Headers**: Authorization Bearer token

#### GET `/api/check-application/{jobId}` - Check Application Status
**Purpose**: Check if user has already applied to a specific job
**Method**: GET
**Headers**: Authorization Bearer token
**Response**:
```typescript
interface CheckApplicationResponse {
  hasApplied: boolean;
  application?: {
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
  };
}
```

### Job Messages Endpoints

#### GET `/api/jobmessage/{applicationId}` - Get Chat Messages
**Purpose**: Fetch chat messages for job application
**Method**: GET
**Headers**: Authorization Bearer token

#### POST `/api/jobmessage/{applicationId}` - Send Message
**Purpose**: Send chat message
**Method**: POST
**Headers**: Authorization Bearer token
**Body**:
```typescript
interface SendMessageRequest {
  content: string;
  messageType: 'TEXT' | 'FILE';
}
```

### Job Questions Endpoint

#### GET `/api/jobquestion?jobOfferId={id}` - Get Job Questions
**Purpose**: Fetch custom questions for specific job
**Method**: GET
**Headers**: Authorization Bearer token
**Response**:
```typescript
interface JobQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'boolean';
  required: boolean;
  options?: string[];
  order: number;
}
```

### Profile & Document Endpoints

#### GET `/api/profile/cv-status` - Get CV and Cover Letter Status
**Purpose**: Check user's document status for applications
**Method**: GET
**Headers**: Authorization Bearer token
**Response**:
```typescript
interface CVStatusResponse {
  hasCV: boolean;
  hasCoverLetter: boolean;
  cvUrl?: string;
  coverLetterUrl?: string;
  cvData?: any;
  source?: 'builder' | 'file';
}
```

#### POST `/api/profile/upload-document` - Upload Document
**Purpose**: Upload CV or cover letter PDF
**Method**: POST
**Headers**: Authorization Bearer token, multipart/form-data
**Body**: FormData with file and type ('cv' | 'coverLetter')
**Response**: Document upload confirmation

## Data Models & Types

### Core Types
```typescript
// Job status enumeration
export type JobStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT";

// Contract types
export type ContractType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "VOLUNTEER" | "FREELANCE";

// Work modalities
export type WorkModality = "ON_SITE" | "REMOTE" | "HYBRID";

// Experience levels
export type ExperienceLevel = "NO_EXPERIENCE" | "ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR_LEVEL";

// Application statuses
export type ApplicationStatus = "SENT" | "UNDER_REVIEW" | "PRE_SELECTED" | "REJECTED" | "HIRED";
```

### Job Offer Model
```typescript
export interface JobOffer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
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
}
```

### Job Application Model
```typescript
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
}
```

### Job Question Answer Model
```typescript
export interface JobQuestionAnswer {
  id?: string;
  questionId: string;
  question: string;
  answer: string;
  type: 'text' | 'multiple_choice' | 'boolean';
}
```

### Search Filters Model
```typescript
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
```

### Company Model
```typescript
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
  location?: string;
  email?: string;
}
```

## User Interface Components

### Application Status Management
**Purpose**: Real-time application status checking and display
**Implementation Pattern**:
```typescript
const [applicationStatus, setApplicationStatus] = useState<{
  hasApplied: boolean;
  application?: any;
  loading: boolean;
}>({ hasApplied: false, loading: true });

// Check application status on component mount
useEffect(() => {
  const checkApplicationStatus = async () => {
    if (!user || !job) return;
    try {
      const result = await JobApplicationService.checkIfApplied(job.id);
      setApplicationStatus({
        hasApplied: result.hasApplied,
        application: result.application,
        loading: false
      });
    } catch (error) {
      setApplicationStatus({ hasApplied: false, loading: false });
    }
  };
  checkApplicationStatus();
}, [user, job]);
```

**Status Display Patterns**:
```typescript
const getApplicationStatusLabel = (status: string) => {
  switch (status) {
    case 'SENT': return 'Enviada';
    case 'UNDER_REVIEW': return 'En Revisión';
    case 'PRE_SELECTED': return 'Preseleccionado';
    case 'REJECTED': return 'Rechazado';
    case 'HIRED': return 'Contratado';
    default: return status;
  }
};

const getApplicationStatusColor = (status: string) => {
  switch (status) {
    case 'SENT': return 'bg-blue-100 text-blue-800';
    case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
    case 'PRE_SELECTED': return 'bg-orange-100 text-orange-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    case 'HIRED': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```

### Application Button States
**Purpose**: Dynamic button rendering based on application status
**Implementation**:
```typescript
// Loading State
<Button className="w-full mb-4" size="lg" disabled>
  <Loader2 className="w-5 h-5 animate-spin mr-2" />
  Verificando aplicación...
</Button>

// Applied State
<div className="space-y-4">
  <div className="text-center">
    <Badge className={`text-sm ${getApplicationStatusColor(status)}`}>
      <CheckCircle className="w-4 h-4 mr-1" />
      {getApplicationStatusLabel(status)}
    </Badge>
    <p className="text-sm text-gray-600 mt-2">
      Aplicaste el {new Date(applicationDate).toLocaleDateString('es-ES')}
    </p>
  </div>
  <Button onClick={handleCancelApplication} variant="outline">
    <XCircle className="w-5 h-5 mr-2" />
    Cancelar Aplicación
  </Button>
</div>

// Default State
<Button onClick={() => setShowApplicationModal(true)} size="lg">
  Aplicar a este empleo
</Button>
```

### JobCard Component
**Purpose**: Display job listing in grid/list format with application status integration
**Key Features**:
- Company logo and name
- Job title and description
- Location and work modality
- Salary range
- Contract type badge
- Application count
- Save/bookmark functionality
- **Dynamic application button with status**
- **Real-time application status checking**
- **Application cancellation functionality**

**Props**:
```typescript
interface JobCardProps {
  job: JobOffer;
  viewMode: "grid" | "list";
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
}
```

**Advanced State Management**:
```typescript
const [applicationStatus, setApplicationStatus] = useState<{
  hasApplied: boolean;
  application?: any;
  loading: boolean;
}>({ hasApplied: false, loading: true });

// Real-time application checking on card render
useEffect(() => {
  const checkApplicationStatus = async () => {
    const result = await JobApplicationService.checkIfApplied(job.id);
    setApplicationStatus({
      hasApplied: result.hasApplied,
      application: result.application,
      loading: false
    });
  };
  checkApplicationStatus();
}, [job.id]);
```

**Application Button Logic**:
```typescript
// Three distinct states rendered in job card:
{applicationStatus.loading ? (
  <Button disabled size="sm">
    <Loader2 className="w-4 h-4 animate-spin mr-1" />
    Verificando...
  </Button>
) : applicationStatus.hasApplied ? (
  <div className="space-y-2">
    <Badge className={getApplicationStatusColor(applicationStatus.application?.status)}>
      {getApplicationStatusLabel(applicationStatus.application?.status)}
    </Badge>
    <Button variant="outline" size="sm" onClick={handleCancelApplication}>
      Cancelar
    </Button>
  </div>
) : (
  <Button size="sm" onClick={() => onApply?.(job.id)}>
    Aplicar
  </Button>
)}
```

**Salary Formatting Utility**:
```typescript
const formatSalary = (min?: number, max?: number, currency = "BOB") => {
  if (!min && !max) return "Salario a convenir";
  if (min && max) return `Bs. ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min) return `Desde Bs. ${min.toLocaleString()}`;
  return `Hasta Bs. ${max!.toLocaleString()}`;
};
```

**Date Formatting for Relative Time**:
```typescript
const formatDate = (dateString: string) => {
  const now = new Date();
  const publishDate = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - publishDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return publishDate.toLocaleDateString("es-ES");
};
```

### JobSearchFilters Component
**Purpose**: Advanced filtering interface with expandable sections
**Key Features**:
- Location selection with municipalities
- Contract type multi-select
- Work modality multi-select
- Experience level multi-select
- Salary range slider (1,000 - 20,000 BOB)
- Date posted filter (last day/week/month/3 months)
- Sector filter
- **Expandable sections with state management**
- **Active filters counter with clear functionality**
- **Real-time filter application**

**Expandable Sections State**:
```typescript
const [expandedSections, setExpandedSections] = useState({
  location: true,
  contractType: true,
  workModality: true,
  experienceLevel: true,
  salary: false,
  datePosted: false,
  sector: false,
});

const toggleSection = (section: string) => {
  setExpandedSections(prev => ({
    ...prev,
    [section]: !prev[section]
  }));
};
```

**Filter State Management**:
```typescript
interface FilterState {
  query: string;
  location: string[];
  contractType: ContractType[];
  workModality: WorkModality[];
  experienceLevel: ExperienceLevel[];
  salaryMin: number;
  salaryMax: number;
  publishedInDays: number | null;
  sector: string[];
}

const [filters, setFilters] = useState<FilterState>({
  query: '',
  location: [],
  contractType: [],
  workModality: [],
  experienceLevel: [],
  salaryMin: 1000,
  salaryMax: 20000,
  publishedInDays: null,
  sector: []
});
```

**Active Filter Counter**:
```typescript
const getActiveFilterCount = () => {
  let count = 0;
  if (filters.location.length > 0) count++;
  if (filters.contractType.length > 0) count++;
  if (filters.workModality.length > 0) count++;
  if (filters.experienceLevel.length > 0) count++;
  if (filters.salaryMin > 1000 || filters.salaryMax < 20000) count++;
  if (filters.publishedInDays !== null) count++;
  if (filters.sector.length > 0) count++;
  return count;
};
```

**Clear All Filters**:
```typescript
const clearAllFilters = () => {
  setFilters({
    query: '',
    location: [],
    contractType: [],
    workModality: [],
    experienceLevel: [],
    salaryMin: 1000,
    salaryMax: 20000,
    publishedInDays: null,
    sector: []
  });
};
```

**Mobile Adaptation**:
- Bottom sheet or modal presentation
- Touch-friendly filter controls with 44pt minimum touch targets
- Collapsible sections with chevron indicators
- Dual-handle range slider for salary
- Native picker integration for multi-select
- Sticky apply/clear buttons at bottom
- Filter badge counter in header
- Smooth expand/collapse animations

### JobApplicationForm Component
**Purpose**: Job application submission form
**Key Features**:
- CV/Resume upload and management
- Cover letter upload
- Custom job questions
- Additional notes section
- Document validation
- Progress indicator
- Save draft capability

**Advanced Features**:
- **Dynamic Question Types**: text (textarea), multiple_choice (select), boolean (yes/no)
- **Required Question Validation**: Visual indicators and validation logic
- **Document Status Integration**: `useCVStatus()` hook for real-time document checking
- **CV Check Modal Trigger**: Opens document management when documents missing
- **Multi-Step Validation Flow**: Documents → Questions → Submission
- **Form State Management**: Complex state for questions, documents, and submission

**Question Rendering Pattern**:
```typescript
const renderQuestionInput = (question: JobQuestion) => {
  switch (question.type) {
    case "text": return <Textarea rows={4} placeholder="Escribe tu respuesta..." />;
    case "multiple_choice": return <Select> with question.options;
    case "boolean": return <Select> with Sí/No options;
  }
};
```

**Submission Flow**:
```typescript
const handleSubmit = async () => {
  // 1. Check document requirements
  if (!hasCV && !hasCoverLetter) {
    setShowCVCheck(true);
    return;
  }
  
  // 2. Validate required questions
  if (!validateForm()) return;
  
  // 3. Submit application with file URLs
  const applicationData = {
    jobOfferId: jobOffer.id,
    cvUrl: hasCV ? cvUrl : null,
    coverLetterUrl: hasCoverLetter ? coverLetterUrl : null,
    status: 'PENDING',
    message: formData.notes.trim() || '',
    questionAnswers: formData.questionAnswers.filter(qa => qa.answer.trim())
  };
};
```

**Mobile Considerations**:
- File picker integration with PDF validation
- Camera/gallery access for documents
- Form validation with clear error states
- Auto-save functionality for draft questions
- Offline draft storage
- Progress indicators for multi-step flow
- Native picker components for multiple choice questions
- Haptic feedback for validation errors

### ApplicationCard Component
**Purpose**: Display application status in my-applications
**Key Features**:
- Job title and company
- Application status badge with colors
- Application date
- Company contact information
- Action buttons (chat, view documents, withdraw)
- Status-specific information display

## Navigation Flow

### Job Discovery Flow
```
Jobs List Screen
    ↓ (tap job card)
Job Detail Screen
    ↓ (tap apply)
Application Form Screen
    ↓ (submit)
Application Confirmation
    ↓ (view applications)
My Applications Screen
```

### Application Management Flow
```
My Applications Screen
    ↓ (tap application)
Application Detail Screen
    ↓ (tap chat)
Chat Screen
    ↓ (back)
Application Detail Screen
```

### Job Search Flow
```
Jobs List Screen
    ↓ (tap filters)
Filter Bottom Sheet/Modal
    ↓ (apply filters)
Filtered Jobs List
    ↓ (search text)
Search Results
```

## State Management

### Recommended State Management Pattern
Use React Query (TanStack Query) for server state and React Context for UI state, following the web application pattern.

### Job Search State
```typescript
// Hook for job search with caching
export function useJobOfferSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cachedResults, setCachedResults] = useState<{ [key: string]: JobOffer[] }>({});

  const search = async (filters: JobSearchFilters): Promise<JobOffer[]> => {
    const searchKey = JSON.stringify(filters);
    
    if (cachedResults[searchKey]) {
      return cachedResults[searchKey];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await jobService.searchJobs(filters);
      setCachedResults(prev => ({
        ...prev,
        [searchKey]: response
      }));
      return response;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { search, loading, error };
}
```

### Application State
```typescript
// Hook for managing applications
export function useMyJobApplications() {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    ApplicationService.getMyApplications()
      .then((result) => {
        let applicationsArray: JobApplication[] = [];
        
        if (Array.isArray(result)) {
          applicationsArray = result;
        } else if (result && Array.isArray(result.items)) {
          applicationsArray = result.items;
        }
        
        setData(applicationsArray);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

## Key Features Implementation

### Job Search & Filtering

#### Search Implementation
```typescript
// Client-side filtering with caching
const filterJobs = (jobs: JobOffer[], filters: JobSearchFilters) => {
  return jobs.filter(job => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchableText = [
        job.title,
        job.description,
        job.company?.name,
        ...(job.skillsRequired || [])
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }
    
    // Location filter
    if (filters.location?.length) {
      const hasMatchingLocation = filters.location.some(loc => 
        job.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (!hasMatchingLocation) return false;
    }
    
    // Contract type filter
    if (filters.contractType?.length) {
      if (!filters.contractType.includes(job.contractType)) return false;
    }
    
    // Work modality filter
    if (filters.workModality?.length) {
      if (!filters.workModality.includes(job.workModality)) return false;
    }
    
    // Experience level filter
    if (filters.experienceLevel?.length) {
      if (!filters.experienceLevel.includes(job.experienceLevel)) return false;
    }
    
    // Salary filters
    if (filters.salaryMin && job.salaryMin && job.salaryMin < filters.salaryMin) {
      return false;
    }
    
    if (filters.salaryMax && job.salaryMax && job.salaryMax > filters.salaryMax) {
      return false;
    }
    
    return true;
  });
};
```

### Job Application Process

#### Application Validation
```typescript
const validateApplication = (application: CreateApplicationRequest) => {
  const errors: string[] = [];
  
  // Document validation
  if (!application.cvUrl && !application.coverLetterUrl) {
    errors.push("Necesitas al menos un CV o carta de presentación PDF");
  }
  
  // Required questions validation
  const requiredQuestions = questions.filter(q => q.required);
  for (const question of requiredQuestions) {
    const answer = application.questionAnswers?.find(qa => qa.questionId === question.id);
    if (!answer || !answer.answer.trim()) {
      errors.push(`Debes responder: "${question.question}"`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### Chat Functionality

#### Real-time Messaging with Auto-Refresh
```typescript
export function useJobMessages(applicationId: string) {
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, [applicationId]);

  const refreshMessages = async () => {
    if (!applicationId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/jobmessage/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const messagesArray = Array.isArray(data) ? data : [];
        setMessages(messagesArray);
        
        // Calculate unread count
        const unread = messagesArray.filter(msg => 
          !msg.readAt && msg.senderType !== 'APPLICANT'
        ).length;
        setUnreadCount(unread);
        setLastRefresh(Date.now());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData: { content: string; messageType: string }) => {
    setSending(true);
    try {
      const response = await fetch(`/api/jobmessage/${applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        await refreshMessages(); // Refresh to get the new message
      } else {
        throw new Error('Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/jobmessage/${applicationId}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      await refreshMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return { 
    messages, 
    loading, 
    sending, 
    unreadCount,
    lastRefresh,
    sendMessage, 
    refreshMessages,
    markAsRead
  };
}
```

#### Message Types and Rendering
```typescript
interface JobMessage {
  id: string;
  content: string;
  messageType: 'TEXT' | 'FILE' | 'INTERVIEW_INVITE' | 'STATUS_UPDATE';
  senderType: 'COMPANY' | 'APPLICANT' | 'ADMIN';
  sentAt: string;
  readAt?: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

const getMessageIcon = (messageType: string) => {
  switch (messageType) {
    case 'TEXT': return <MessageSquare className="w-4 h-4" />;
    case 'FILE': return <Paperclip className="w-4 h-4" />;
    case 'INTERVIEW_INVITE': return <Calendar className="w-4 h-4" />;
    case 'STATUS_UPDATE': return <Bell className="w-4 h-4" />;
    default: return <MessageSquare className="w-4 h-4" />;
  }
};
```

### Document Management

#### CV & Cover Letter Handling
```typescript
export function useCVStatus() {
  const [hasCV, setHasCV] = useState(false);
  const [hasCoverLetter, setHasCoverLetter] = useState(false);
  const [cvUrl, setCvUrl] = useState<string>('');
  const [coverLetterUrl, setCoverLetterUrl] = useState<string>('');
  const [cvData, setCvData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkCVStatus = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/profile/cv-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const status = await response.json();
        setHasCV(status.hasCV);
        setHasCoverLetter(status.hasCoverLetter);
        setCvUrl(status.cvUrl || '');
        setCoverLetterUrl(status.coverLetterUrl || '');
        setCvData(status.cvData);
      }
    } catch (error) {
      console.error('Error checking CV status:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasCV,
    hasCoverLetter,
    cvUrl,
    coverLetterUrl,
    cvData,
    checkCVStatus,
    loading
  };
}
```

#### CV Check Modal Component
**Purpose**: Document management modal for application preparation
**Key Features**:
- **Dual Document Workflow**: CV and Cover Letter management
- **Source Differentiation**: Handles 'builder' and 'file' document sources
- **Authentication Integration**: Secure file access with token verification
- **Error State Management**: Authentication errors, file access errors
- **File Operations**: View, replace, delete functionality

**Implementation Pattern**:
```typescript
const CVCheckModal = ({ isOpen, onClose, onDocumentsReady }) => {
  const { hasCV, hasCoverLetter, cvUrl, coverLetterUrl, checkCVStatus } = useCVStatus();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File, type: 'cv' | 'coverLetter') => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch('/api/profile/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData
      });
      
      if (response.ok) {
        await checkCVStatus(); // Refresh status
        if (hasCV || hasCoverLetter) {
          onDocumentsReady();
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setError('Error uploading document. Please try again.');
    } finally {
      setUploading(false);
    }
  };
};
```

**File Access Verification**:
```typescript
const checkFileAccess = async (fileUrl: string) => {
  try {
    const response = await fetch(fileUrl, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

## News System

The news system provides YOUTH users with access to published news articles from companies and government institutions. The system follows a read-only pattern for youth users with categorized content display.

### News Architecture

#### Route Structure
```
/news                    # News listing page with tabs
/news/[id]              # News detail page
```

#### File Structure Analysis
```
src/
├── app/news/
│   ├── page.tsx                    # News listing with tabs
│   └── [id]/
│       └── page.tsx               # News detail view
├── components/news/
│   ├── news-card.tsx             # Individual news card
│   ├── news-carousel.tsx         # Dashboard carousel
│   └── news-detail.tsx           # Detail view component
├── hooks/
│   └── useNewsArticleApi.ts       # News API hooks
├── services/
│   └── newsarticle.service.ts     # News API service
└── types/
    └── news.ts                    # News type definitions
```

### News Data Models

#### NewsArticle Interface
```typescript
export type NewsType = "COMPANY" | "GOVERNMENT" | "NGO";
export type NewsStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";
export type NewsPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface NewsArticle {
  id: string;
  title: string;
  content: string;                  // HTML content
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  authorId: string;
  authorName: string;
  authorType: NewsType;
  authorLogo?: string;
  status: NewsStatus;
  priority: NewsPriority;
  featured: boolean;
  tags: string[];
  category: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  expiresAt?: string;
  targetAudience: string[];          // ["YOUTH", "COMPANIES", "ALL"]
  region?: string;
  readTime: number;
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}
```

### News API Integration

#### Base Endpoints
```typescript
// For YOUTH users - all endpoints are read-only
GET /api/news/public              // Get public news (for youth)
GET /api/news/[id]               // Get specific news article
POST /api/news/[id]/views        // Increment view count
```

#### API Service Implementation
```typescript
export class NewsArticleService {
  // GET /api/news/public - Get public news for youth
  static async getPublicNews(): Promise<NewsArticle[]> {
    const result = await apiCall('/news/public');
    return result.news || result;
  }

  // GET /api/news/{id} - Get specific news article
  static async getById(id: string): Promise<NewsArticle> {
    return await apiCall(`/news/${id}`);
  }

  // POST /api/news/{id}/views - Increment views
  static async incrementViews(id: string): Promise<NewsArticle> {
    return await apiCall(`/news/${id}/views`, {
      method: 'POST'
    });
  }

  // Search and filtering
  static async searchNews(query: string): Promise<NewsArticle[]> {
    const result = await apiCall(`/news/public?search=${encodeURIComponent(query)}`);
    return result.news || result;
  }

  static async getByCategory(category: string): Promise<NewsArticle[]> {
    const result = await apiCall(`/news/public?category=${category}`);
    return result.news || result;
  }

  static async getFeatured(): Promise<NewsArticle[]> {
    const result = await apiCall('/news/public?featured=true');
    return result.news || result;
  }
}
```

#### React Query Hooks
```typescript
// Key hooks for YOUTH users
export const usePublicNews = () => {
  return useQuery({
    queryKey: ['news', 'public'],
    queryFn: NewsArticleService.getPublicNews,
  });
};

export const useNewsArticle = (id: string) => {
  return useQuery({
    queryKey: ['news', 'detail', id],
    queryFn: () => NewsArticleService.getById(id),
    enabled: !!id,
  });
};

export const useIncrementViews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: NewsArticleService.incrementViews,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['news', 'detail', id]);
    },
  });
};
```

### News UI Components

#### NewsCard Component
```typescript
interface NewsCardProps {
  news: {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    authorName: string;
    authorType: string;
    authorLogo: string;
    publishedAt: string;
    viewCount: number;
    category: string;
  };
}

// Key features:
// - Hover animations with framer-motion
// - Image overlay with gradient
// - Author badge with logo
// - Category display
// - View count and date formatting
// - Navigation to detail page
```

#### News Listing Page (Tabbed Interface)
```typescript
// Features:
// - Two tabs: "Noticias Empresariales" and "Noticias Institucionales"
// - Animated tab transitions with framer-motion
// - Grid layout (1 col mobile, 2 col tablet, 3 col desktop)
// - Same NewsCard component for both tabs
// - Loading and error states

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState("company");
  const { data: newsArticles, loading, error } = useNewsArticles();

  return (
    <Tabs defaultValue="company" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="company">
          <Building2 className="w-4 h-4" />
          Noticias Empresariales
        </TabsTrigger>
        <TabsTrigger value="institutional">
          <Landmark className="w-4 h-4" />
          Noticias Institucionales
        </TabsTrigger>
      </TabsList>
      
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}>
          <TabsContent value="company">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles?.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </TabsContent>
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
};
```

#### News Detail Page
```typescript
// Features:
// - Full article display with HTML content rendering
// - Featured image with proper aspect ratio
// - Author information with logo
// - Published date and read time
// - Engagement metrics (views, likes, comments)
// - Tags display
// - Related links
// - Loading skeleton
// - Error handling

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Manual fetch with useEffect (can be optimized with React Query)
  useEffect(() => {
    const fetchNewsDetail = async () => {
      const response = await fetch(`/api/news/${id}`);
      const data = await response.json();
      setNews(data);
    };
    fetchNewsDetail();
  }, [id]);

  return (
    <motion.div>
      {/* Header */}
      <div className="mb-8">
        <h1>{news.title}</h1>
        <div className="flex items-center gap-4">
          <Image src={news.authorLogo} alt={news.authorName} />
          <span>{news.authorName}</span>
          <span>{formatDate(news.publishedAt)}</span>
          <span>{news.readTime} min read</span>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative h-[400px] mb-8">
        <Image src={news.imageUrl} alt={news.title} fill />
      </div>

      {/* Content */}
      <Card className="p-8 mb-8">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </Card>

      {/* Engagement Metrics */}
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <Button variant="ghost">
            <ThumbsUp className="w-4 h-4" />
            <span>{news.likeCount}</span>
          </Button>
          <Button variant="ghost">
            <MessageCircle className="w-4 h-4" />
            <span>{news.commentCount}</span>
          </Button>
          <Button variant="ghost">
            <Share2 className="w-4 h-4" />
            <span>{news.shareCount}</span>
          </Button>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{news.viewCount} views</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6 flex flex-wrap gap-2">
        {news.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </motion.div>
  );
};
```

#### Dashboard News Carousel
```typescript
// Features:
// - Two-column layout (Company vs Government/NGO news)
// - Carousel navigation with prev/next buttons
// - Featured article + 2 compact articles per column
// - Manual data fetching with separate API calls
// - Loading skeletons
// - Empty states with icons

const NewsCarousel = () => {
  const [companyNews, setCompanyNews] = useState<NewsArticle[]>([]);
  const [governmentNews, setGovernmentNews] = useState<NewsArticle[]>([]);
  const [companyIndex, setCompanyIndex] = useState(0);
  const [governmentIndex, setGovernmentIndex] = useState(0);

  const fetchNews = async () => {
    // Fetch company news
    const companyResponse = await fetch(
      "/api/news?type=company&featured=true&targetAudience=YOUTH&limit=6"
    );
    const companyData = await companyResponse.json();

    // Fetch government news
    const govResponse = await fetch(
      "/api/news?type=government&targetAudience=YOUTH&limit=6"
    );
    const govData = await govResponse.json();

    setCompanyNews(companyData.news || []);
    setGovernmentNews(govData.news || []);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company News Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>Noticias Empresariales</h3>
          <div className="flex gap-1">
            <Button onClick={prevCompany}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button onClick={nextCompany}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Featured article */}
        <NewsCard article={companyNews[companyIndex]} />
        
        {/* Compact articles */}
        <div className="grid grid-cols-1 gap-3">
          {companyNews.slice(companyIndex + 1, companyIndex + 3)
            .map((article) => (
              <NewsCard key={article.id} article={article} compact />
            ))}
        </div>
      </div>

      {/* Government/NGO News Column */}
      <div className="space-y-4">
        {/* Similar structure for institutional news */}
      </div>
    </div>
  );
};
```

### Mobile Implementation Guidelines

#### React Native Components

**News Listing Screen**
```typescript
// Use react-native-tab-view for tab implementation
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const NewsListingScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'company', title: 'Empresariales' },
    { key: 'institutional', title: 'Institucionales' },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#3B82F6' }}
      style={{ backgroundColor: 'white' }}
      labelStyle={{ color: '#374151', fontWeight: '600' }}
      activeColor="#3B82F6"
      inactiveColor="#6B7280"
    />
  );

  const CompanyRoute = () => (
    <FlatList
      data={companyNews}
      renderItem={({ item }) => <NewsCard news={item} />}
      numColumns={1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16 }}
    />
  );

  const InstitutionalRoute = () => (
    <FlatList
      data={institutionalNews}
      renderItem={({ item }) => <NewsCard news={item} />}
      numColumns={1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16 }}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={SceneMap({
        company: CompanyRoute,
        institutional: InstitutionalRoute,
      })}
      onIndexChange={setIndex}
      renderTabBar={renderTabBar}
    />
  );
};
```

**News Card Component**
```typescript
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const NewsCard = ({ news, onPress, compact = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity onPress={() => onPress(news.id)}>
      <Card style={[styles.card, compact && styles.compactCard]}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: news.imageUrl }} 
            style={[styles.image, compact && styles.compactImage]}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
          <View style={styles.overlayContent}>
            <Badge 
              text={news.category}
              style={styles.categoryBadge}
            />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Author Info */}
          <View style={styles.authorRow}>
            <Image 
              source={{ uri: news.authorLogo }} 
              style={styles.authorLogo}
            />
            <Text style={styles.authorName}>{news.authorName}</Text>
          </View>

          {/* Title */}
          <Text 
            style={[styles.title, compact && styles.compactTitle]}
            numberOfLines={2}
          >
            {news.title}
          </Text>

          {/* Summary */}
          <Text 
            style={[styles.summary, compact && styles.compactSummary]}
            numberOfLines={2}
          >
            {news.summary}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.dateContainer}>
              <Icon name="calendar" size={14} color="#6B7280" />
              <Text style={styles.date}>{formatDate(news.publishedAt)}</Text>
            </View>
            <View style={styles.viewsContainer}>
              <Icon name="eye" size={14} color="#6B7280" />
              <Text style={styles.views}>{news.viewCount}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactCard: {
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    height: 192,
  },
  compactImage: {
    height: 128,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  compactTitle: {
    fontSize: 16,
  },
  summary: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  compactSummary: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  views: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});
```

**News Detail Screen**
```typescript
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';

const NewsDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { newsId } = route.params;
  
  const { data: news, loading, error } = useNewsArticle(newsId);
  const incrementViewsMutation = useIncrementViews();

  useEffect(() => {
    if (news) {
      incrementViewsMutation.mutate(newsId);
    }
  }, [news]);

  if (loading) return <NewsDetailSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{news.title}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.authorInfo}>
            <Image 
              source={{ uri: news.authorLogo }} 
              style={styles.authorLogo}
            />
            <Text style={styles.authorName}>{news.authorName}</Text>
          </View>
          <Text style={styles.publishDate}>
            {formatDate(news.publishedAt)}
          </Text>
          <Text style={styles.readTime}>
            {news.readTime} min read
          </Text>
        </View>
      </View>

      {/* Featured Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: news.imageUrl }} 
          style={styles.featuredImage}
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <WebView
          source={{ html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #374151;
                    margin: 0;
                    padding: 16px;
                  }
                  h1, h2, h3 { color: #111827; }
                  img { max-width: 100%; height: auto; }
                  a { color: #3B82F6; }
                </style>
              </head>
              <body>${news.content}</body>
            </html>
          `}}
          style={styles.webView}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Engagement Metrics */}
      <View style={styles.engagementContainer}>
        <View style={styles.engagementRow}>
          <TouchableOpacity style={styles.engagementButton}>
            <Icon name="thumb-up" size={20} color="#6B7280" />
            <Text style={styles.engagementText}>{news.likeCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.engagementButton}>
            <Icon name="message-circle" size={20} color="#6B7280" />
            <Text style={styles.engagementText}>{news.commentCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.engagementButton}>
            <Icon name="share" size={20} color="#6B7280" />
            <Text style={styles.engagementText}>{news.shareCount}</Text>
          </TouchableOpacity>
          
          <View style={styles.viewsContainer}>
            <Icon name="eye" size={20} color="#6B7280" />
            <Text style={styles.viewsText}>{news.viewCount} views</Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {news.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Related Links */}
      {news.relatedLinks && news.relatedLinks.length > 0 && (
        <View style={styles.relatedLinksContainer}>
          <Text style={styles.relatedLinksTitle}>Enlaces Relacionados</Text>
          {news.relatedLinks.map((link, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.relatedLink}
              onPress={() => Linking.openURL(link.url)}
            >
              <Text style={styles.relatedLinkText}>{link.title}</Text>
              <Icon name="external-link" size={16} color="#3B82F6" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    color: '#6B7280',
  },
  publishDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  readTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  imageContainer: {
    height: 240,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  webView: {
    minHeight: 200,
    backgroundColor: 'transparent',
  },
  engagementContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  engagementText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  relatedLinksContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  relatedLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  relatedLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  relatedLinkText: {
    fontSize: 14,
    color: '#3B82F6',
    flex: 1,
  },
});
```

**Dashboard News Carousel**
```typescript
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';

const DashboardNewsCarousel = () => {
  const [companyNews, setCompanyNews] = useState([]);
  const [governmentNews, setGovernmentNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const [companyResponse, govResponse] = await Promise.all([
        fetch('/api/news?type=company&featured=true&targetAudience=YOUTH&limit=6'),
        fetch('/api/news?type=government&targetAudience=YOUTH&limit=6')
      ]);
      
      const companyData = await companyResponse.json();
      const govData = await govResponse.json();
      
      setCompanyNews(companyData.news || []);
      setGovernmentNews(govData.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNewsSection = (title, data, iconName, color) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Icon name={iconName} size={16} color="white" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      <FlatList
        data={data.slice(0, 3)}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <CompactNewsCard 
            news={item} 
            featured={index === 0}
            onPress={(id) => navigation.navigate('NewsDetail', { newsId: id })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  if (loading) return <NewsCarouselSkeleton />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Centro de Noticias</Text>
        <Text style={styles.subtitle}>
          Mantente informado sobre las últimas novedades
        </Text>
      </View>

      {renderNewsSection(
        'Noticias Empresariales',
        companyNews,
        'building',
        '#3B82F6'
      )}

      {renderNewsSection(
        'Noticias Institucionales',
        governmentNews,
        'shield',
        '#10B981'
      )}

      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={() => navigation.navigate('NewsList')}
      >
        <Text style={styles.viewAllText}>Ver Todas las Noticias</Text>
        <Icon name="arrow-right" size={16} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );
};

const CompactNewsCard = ({ news, featured, onPress }) => (
  <TouchableOpacity 
    style={[styles.compactCard, featured && styles.featuredCard]}
    onPress={() => onPress(news.id)}
  >
    <Image 
      source={{ uri: news.imageUrl }} 
      style={[styles.compactImage, featured && styles.featuredImage]}
    />
    <View style={styles.compactContent}>
      <Text 
        style={[styles.compactTitle, featured && styles.featuredTitle]}
        numberOfLines={featured ? 3 : 2}
      >
        {news.title}
      </Text>
      <View style={styles.compactMeta}>
        <Text style={styles.compactAuthor}>{news.authorName}</Text>
        <Text style={styles.compactDate}>
          {formatTimeAgo(news.publishedAt)}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);
```

### Navigation Integration

#### React Navigation Setup
```typescript
// News Stack Navigator
const NewsStack = createStackNavigator();

const NewsNavigator = () => (
  <NewsStack.Navigator>
    <NewsStack.Screen 
      name="NewsList" 
      component={NewsListingScreen}
      options={{
        title: 'Centro de Noticias',
        headerStyle: { backgroundColor: '#3B82F6' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <NewsStack.Screen 
      name="NewsDetail" 
      component={NewsDetailScreen}
      options={({ route }) => ({
        title: 'Noticia',
        headerStyle: { backgroundColor: '#3B82F6' },
        headerTintColor: 'white',
        headerBackTitleVisible: false,
      })}
    />
  </NewsStack.Navigator>
);

// Integration with main tab navigator
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="News" 
      component={NewsNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="newspaper" size={size} color={color} />
        ),
        headerShown: false,
      }}
    />
    {/* Other tabs */}
  </Tab.Navigator>
);
```

### Performance Optimizations

#### Image Optimization
```typescript
// Use react-native-fast-image for better image performance
import FastImage from 'react-native-fast-image';

const OptimizedNewsCard = ({ news }) => (
  <FastImage
    source={{
      uri: news.imageUrl,
      priority: FastImage.priority.normal,
    }}
    style={styles.image}
    resizeMode={FastImage.resizeMode.cover}
  />
);

// Implement image placeholder and error handling
const NewsImage = ({ uri, style, ...props }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={style}>
      {loading && (
        <View style={[style, styles.placeholder]}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}
      
      <FastImage
        source={{ uri }}
        style={[style, { opacity: loading ? 0 : 1 }]}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
      
      {error && (
        <View style={[style, styles.errorState]}>
          <Icon name="image" size={24} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
};
```

#### List Performance
```typescript
// Implement FlatList optimizations
const NewsListing = ({ data }) => {
  const renderItem = useCallback(({ item }) => (
    <NewsCard news={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
    />
  );
};
```

### Key Implementation Notes

1. **Read-Only Access**: YOUTH users have read-only access to published news
2. **Categorized Display**: Two main categories (Company vs Institutional)
3. **Rich Content**: HTML content rendering with WebView
4. **Engagement Metrics**: Display views, likes, comments (read-only for youth)
5. **Image Handling**: Proper image optimization and error states
6. **Navigation**: Seamless between listing and detail views
7. **Dashboard Integration**: Featured news carousel on dashboard
8. **Performance**: Optimized for mobile with lazy loading and caching

The news system provides YOUTH users with access to relevant information from companies and government institutions, supporting their engagement with opportunities and staying informed about relevant developments.

## Authentication & Authorization

### Authentication Flow
The application uses JWT token-based authentication:

```typescript
// Token storage and retrieval
const getToken = () => {
  return localStorage.getItem('token'); // Use AsyncStorage for React Native
};

// Protected API calls
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
```

### Role-Based Access
Youth users ('JOVENES') have access to:
- Browse and search jobs
- Apply to jobs
- Manage applications
- Chat with employers
- View job details

### Toast Notification System
**Purpose**: Comprehensive user feedback for all operations
**Implementation Pattern**:
```typescript
const { toast } = useToast();

// Success notifications
toast({
  title: "¡Aplicación enviada!",
  description: "Tu aplicación ha sido enviada exitosamente.",
  variant: "default"
});

toast({
  title: "¡Aplicación cancelada!", 
  description: "Tu aplicación ha sido cancelada exitosamente",
  variant: "default"
});

toast({
  title: "¡CV subido exitosamente!",
  description: "Tu CV ha sido guardado correctamente",
  variant: "default"
});

// Error notifications
toast({
  title: "Error",
  description: "No se pudo cancelar la aplicación",
  variant: "destructive"
});

toast({
  title: "Documentos requeridos",
  description: "Necesitas al menos un CV o carta de presentación PDF para aplicar",
  variant: "destructive"
});

toast({
  title: "Preguntas incompletas",
  description: "Debes responder todas las preguntas obligatorias",
  variant: "destructive"
});
```

**Mobile Toast Adaptations**:
- Bottom toast positioning for thumb accessibility
- Auto-dismiss after 4-6 seconds
- Swipe to dismiss functionality
- Haptic feedback on success/error
- Queue management for multiple toasts

### Error Boundary and Recovery Patterns
**Purpose**: Graceful error handling with user recovery options
**Implementation**:
```typescript
const handleNetworkError = (error: Error, retryFunction?: () => void) => {
  if (error.message.includes('401') || error.message.includes('token')) {
    // Token expired - redirect to login
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      variant: "destructive"
    });
    // Redirect to login
    router.push('/login');
  } else if (error.message.includes('network') || error.message.includes('fetch')) {
    // Network error - offer retry
    toast({
      title: "Error de conexión",
      description: "Verifica tu conexión e intenta nuevamente.",
      action: retryFunction ? (
        <Button variant="outline" onClick={retryFunction}>
          Reintentar
        </Button>
      ) : undefined,
      variant: "destructive"
    });
  } else {
    // Generic error
    toast({
      title: "Error inesperado",
      description: "Algo salió mal. Por favor, intenta nuevamente.",
      variant: "destructive"
    });
  }
};
```

### Form Validation Patterns
**Purpose**: Real-time validation with clear user feedback
**Implementation**:
```typescript
const [formErrors, setFormErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const errors: Record<string, string> = {};
  
  // Document validation
  if (!hasCV && !hasCoverLetter) {
    errors.documents = "Necesitas al menos un CV o carta de presentación PDF";
  }
  
  // Required questions validation
  const requiredQuestions = questions.filter(q => q.required);
  for (const question of requiredQuestions) {
    const answer = formData.questionAnswers?.find(qa => qa.questionId === question.id);
    if (!answer || !answer.answer.trim()) {
      errors[`question_${question.id}`] = `Debes responder: "${question.question}"`;
    }
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const canSubmit = () => {
  return (hasCV || hasCoverLetter) && 
         validateRequiredQuestions() && 
         !isSubmitting;
};
```

## Mobile-Specific Considerations

### Performance Optimizations
1. **Lazy Loading**: Implement virtualized lists for job listings
2. **Image Optimization**: Company logos and images should be cached
3. **Search Debouncing**: 300ms delay for search queries
4. **Pagination**: Implement infinite scroll for job listings
5. **Offline Support**: Cache job data for offline viewing

### UI/UX Adaptations
1. **Touch Targets**: Minimum 44pt touch targets
2. **Gestures**: Pull-to-refresh, swipe actions
3. **Navigation**: Stack-based navigation with proper back button handling
4. **Loading States**: Skeleton screens for better perceived performance
5. **Error Handling**: User-friendly error messages with retry options

### File Upload Considerations
1. **Document Picker**: Native file picker integration
2. **Camera Integration**: Photo capture for documents
3. **File Validation**: Size and format validation
4. **Progress Indicators**: Upload progress feedback
5. **Compression**: Image compression before upload

### Push Notifications
Implement push notifications for:
- **Application status updates**: When status changes from SENT → UNDER_REVIEW → PRE_SELECTED/REJECTED/HIRED
- **New job matches**: Based on user's filter preferences and saved searches
- **Chat messages**: Real-time notifications for employer messages with unread count
- **Application deadlines**: 24-48 hours before application deadlines
- **Document reminders**: Prompts to complete CV/cover letter when browsing jobs

**Notification Payload Structure**:
```typescript
interface PushNotificationPayload {
  type: 'STATUS_UPDATE' | 'NEW_MESSAGE' | 'JOB_MATCH' | 'DEADLINE' | 'DOCUMENT_REMINDER';
  title: string;
  body: string;
  data: {
    jobId?: string;
    applicationId?: string;
    messageId?: string;
    deepLink: string;
  };
}
```

### Share Functionality
**Purpose**: Native sharing integration for job opportunities
**Implementation**:
```typescript
const handleShare = async (job: JobOffer) => {
  const shareContent = {
    title: job.title,
    text: `Mira esta oportunidad laboral: ${job.title} en ${job.company?.name || 'Empresa'}`,
    url: `https://cemse.app/jobs/${job.id}`
  };

  if (navigator.share) {
    try {
      await navigator.share(shareContent);
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed');
    }
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(shareContent.url);
    toast({
      title: "Enlace copiado",
      description: "El enlace del empleo ha sido copiado al portapapeles"
    });
  }
};
```

### Application Cancellation Flow
**Purpose**: Allow users to withdraw applications with confirmation
**Implementation**:
```typescript
const handleCancelApplication = async () => {
  // Show confirmation dialog first
  const confirmed = await showConfirmDialog({
    title: "¿Cancelar aplicación?",
    message: "Esta acción no se puede deshacer. ¿Estás seguro de que quieres cancelar tu aplicación?",
    confirmText: "Sí, cancelar",
    cancelText: "No, mantener"
  });
  
  if (!confirmed) return;
  
  try {
    await JobApplicationService.deleteApplication(applicationStatus.application.id);
    
    toast({
      title: "¡Aplicación cancelada!",
      description: "Tu aplicación ha sido cancelada exitosamente"
    });

    // Update UI state immediately
    setApplicationStatus({
      hasApplied: false,
      application: undefined,
      loading: false
    });
  } catch (error) {
    console.error('Error canceling application:', error);
    toast({
      title: "Error",
      description: "No se pudo cancelar la aplicación",
      variant: "destructive"
    });
  }
};
```

## Implementation Roadmap

### Phase 1: Core Job Features
- [ ] Job listing screen with search and view mode toggle (grid/list)
- [ ] Job detail screen with complete company information
- [ ] Job card component with application status integration
- [ ] Basic filtering with expandable sections
- [ ] Job application form with dynamic question support
- [ ] Document upload functionality with CV check modal
- [ ] Application status checking and display system
- [ ] Toast notification system for user feedback

### Phase 2: Application Management
- [ ] My Applications screen with status filtering
- [ ] Application detail view with company information
- [ ] Real-time status tracking with color-coded badges
- [ ] Application withdrawal with confirmation dialog
- [ ] Application cancellation from job detail view
- [ ] Document management (view CV/cover letter)
- [ ] Application date and status history display

### Phase 3: Advanced Features
- [ ] Chat functionality with auto-refresh and unread count
- [ ] Advanced filtering with salary range and date posted
- [ ] Job bookmarking with save/unsave functionality
- [ ] Native share functionality for job opportunities
- [ ] Push notifications for status updates and messages
- [ ] Offline support with cached job data
- [ ] Search functionality with debouncing
- [ ] Dynamic job questions with multiple question types

### Phase 4: Polish & Testing
- [ ] Performance optimization with lazy loading and caching
- [ ] UI/UX refinements with haptic feedback and animations
- [ ] Comprehensive error handling with retry mechanisms
- [ ] Form validation with real-time feedback
- [ ] Accessibility improvements (screen reader support, touch targets)
- [ ] Network error recovery patterns
- [ ] Testing and bug fixes
- [ ] Token expiration handling and auto-refresh
- [ ] File access verification and error handling
- [ ] Offline state management and sync

## Critical Implementation Notes

### Document Requirements
**CRITICAL**: All job applications MUST have at least one document (CV or cover letter PDF) to be submitted successfully. The mobile app must enforce this requirement and guide users through document upload when missing.

### Application Status Flow
The complete application lifecycle follows this flow:
1. **SENT** - Initial application submission
2. **UNDER_REVIEW** - Company is reviewing the application
3. **PRE_SELECTED** - Candidate has been shortlisted
4. **REJECTED** - Application was not successful
5. **HIRED** - Candidate was selected for the position

### Real-time Features
The web application implements several real-time features that must be replicated:
- **Application Status Checking**: Every job card checks if the user has already applied
- **Chat Auto-refresh**: Messages refresh every 30 seconds
- **Document Status Verification**: Real-time checking of CV/cover letter availability

### Error Handling Priorities
1. **Authentication errors** (401) - Redirect to login
2. **Document validation errors** - Open CV check modal
3. **Required question errors** - Highlight missing required fields
4. **Network errors** - Provide retry functionality
5. **File upload errors** - Clear feedback with retry options

## Testing Strategy

### Unit Tests
- API service functions
- Utility functions
- State management hooks
- Form validation logic

### Integration Tests
- Job search flow
- Application submission flow
- Chat functionality
- Document upload

### E2E Tests
- Complete job application process
- Application status updates
- Search and filtering workflow

## Conclusion

This specification provides a comprehensive blueprint for implementing the CEMSE jobs, my-applications, and news features in React Native. The mobile implementation should maintain feature parity with the web version while optimizing for mobile-specific patterns and user experience.

Key success factors:
1. **Faithful Replication**: Maintain all existing functionality
2. **Mobile Optimization**: Adapt UI/UX patterns for mobile
3. **Performance**: Ensure smooth performance with large job datasets
4. **Offline Support**: Provide reasonable offline functionality
5. **User Experience**: Intuitive navigation and clear feedback

The provided code examples and architectural patterns should guide the development team in creating a robust, scalable mobile application that serves the youth demographic effectively.