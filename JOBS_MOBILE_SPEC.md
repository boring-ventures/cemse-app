# CEMSE Jobs & My Applications - Mobile Technical Specification

## Executive Summary
This document provides a comprehensive technical specification for implementing the CEMSE jobs and my-applications features in React Native, based on the analysis of the existing Next.js web application.

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [System Architecture](#system-architecture)
3. [API Integration](#api-integration)
4. [Data Models & Types](#data-models--types)
5. [User Interface Components](#user-interface-components)
6. [Navigation Flow](#navigation-flow)
7. [State Management](#state-management)
8. [Key Features Implementation](#key-features-implementation)
9. [Authentication & Authorization](#authentication--authorization)
10. [Mobile-Specific Considerations](#mobile-specific-considerations)
11. [Implementation Roadmap](#implementation-roadmap)

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

This specification provides a comprehensive blueprint for implementing the CEMSE jobs and my-applications features in React Native. The mobile implementation should maintain feature parity with the web version while optimizing for mobile-specific patterns and user experience.

Key success factors:
1. **Faithful Replication**: Maintain all existing functionality
2. **Mobile Optimization**: Adapt UI/UX patterns for mobile
3. **Performance**: Ensure smooth performance with large job datasets
4. **Offline Support**: Provide reasonable offline functionality
5. **User Experience**: Intuitive navigation and clear feedback

The provided code examples and architectural patterns should guide the development team in creating a robust, scalable mobile application that serves the youth demographic effectively.