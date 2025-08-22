# CEMSE Training Module Mobile Implementation Specification - COMPLETE ANALYSIS

## Executive Summary

This document provides a comprehensive technical specification for replicating the CEMSE Training (Capacitación) module in React Native for mobile applications. Based on detailed analysis of the actual web implementation across three core pages (courses, my-courses, certificates), this specification includes COMPLETE component hierarchies, API integrations, data models, and mobile-specific adaptations required for pixel-perfect mobile replication.

**Key Findings from Web Implementation Analysis:**
- Complete course management system with enrollment workflow
- Video integration with YouTube preview capabilities
- Progress tracking with real-time synchronization
- Automatic certificate generation and download system
- Advanced search and filtering across 8 course categories
- Responsive design with grid/list view modes

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Core Components Analysis](#core-components-analysis)
3. [Data Models and Types](#data-models-and-types)
4. [API Integration Specifications](#api-integration-specifications)
5. [State Management Patterns](#state-management-patterns)
6. [UI/UX Components for Mobile](#ui-ux-components-for-mobile)
7. [Video Integration System](#video-integration-system)
8. [Progress Tracking and Certificates](#progress-tracking-and-certificates)
9. [Mobile-Specific Considerations](#mobile-specific-considerations)
10. [Implementation Roadmap](#implementation-roadmap)

---

## 1. System Architecture Overview - ACTUAL IMPLEMENTATION

### Component Hierarchy (Based on Code Analysis)
```
Training Module
├── Course Catalog Page (/courses)
│   ├── Statistics Dashboard (4 Cards)
│   │   ├── Total Courses
│   │   ├── Available Categories  
│   │   ├── Active Students
│   │   └── Completion Rate
│   ├── Search & Filter Controls
│   │   ├── Search Input (debounced)
│   │   ├── Category Filter (8 categories)
│   │   ├── Level Filter (3 levels)
│   │   └── View Mode Toggle (grid/list)
│   └── Course Grid/List
│       └── CourseCard Components
│           ├── Video Preview Integration
│           ├── Course Metadata Display
│           ├── Enrollment Status
│           └── Action Buttons
├── My Courses Page (/my-courses)
│   ├── Header with "Explore Courses" CTA
│   ├── Statistics Dashboard (4 Cards)
│   │   ├── Total Enrolled
│   │   ├── In Progress
│   │   ├── Completed
│   │   └── Average Progress
│   ├── Search & Status Filter
│   └── Enrollment Cards
│       ├── Progress Bars (0-100%)
│       ├── Status Indicators
│       ├── Time Tracking
│       └── Navigation to Learning
└── Certificates Page (/certificates)
    ├── Statistics Dashboard (3 Cards)
    │   ├── Total Certificates
    │   ├── This Month
    │   └── Average Grade
    ├── Search & Category Filter
    └── Certificate Grid
        ├── Grade Display (80-100%)
        ├── Certificate Numbers
        ├── Download Buttons
        └── Sharing Capabilities
```

### Navigation Structure
```
Training Module (/courses, /my-courses, /certificates)
├── Course Catalog
│   ├── Course Details → /courses/{id}
│   └── Enrollment Process → /course-enrollments
├── My Learning Dashboard
│   ├── Active Learning → /development/courses/{enrollmentId}
│   ├── Course Progress → /my-courses
│   └── Certificate Viewing → /certificates/{id}
└── Certificate Management
    ├── Download Certificates
    ├── Share Achievements
    └── View Grades
```

---

## 2. Core Components Analysis

### 2.1 Course Catalog Component (courses/page.tsx)

**File**: `src/app/(dashboard)/courses/page.tsx`

**Key Features**:
- Public course browsing (no authentication required)
- Advanced filtering by category, level, and search
- Grid/List view modes for mobile optimization
- Video preview integration with YouTube
- Real-time statistics dashboard

**State Management**:
```typescript
interface CoursesCatalogState {
  // Search and Filtering
  searchQuery: string
  categoryFilter: "all" | CourseCategory
  levelFilter: "all" | CourseLevel
  viewMode: "grid" | "list"
  
  // Data States
  courses: Course[]
  loading: boolean
  error: Error | null
  
  // Statistics
  totalCourses: number
  totalCategories: number
  activeStudents: number
  completionRate: number
}
```

**Filtering Logic Implementation**:
```typescript
const filteredCourses = courses?.filter((course: Course) => {
  const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
  const matchesLevel = levelFilter === "all" || course.level === levelFilter;
  return matchesSearch && matchesCategory && matchesLevel;
}) || [];
```

### 2.2 My Courses Component (my-courses/page.tsx)

**File**: `src/app/(dashboard)/my-courses/page.tsx`

**Key Features**:
- User-specific enrolled courses (authentication required)
- Progress tracking with visual indicators
- Status-based course management
- Navigation to learning interface

**State Management**:
```typescript
interface MyCoursesState {
  // User Data
  enrollments: CourseEnrollment[]
  loading: boolean
  error: Error | null
  
  // Filtering
  searchQuery: string
  statusFilter: "all" | EnrollmentStatus
  
  // Statistics
  totalEnrolled: number
  inProgress: number
  completed: number
  averageProgress: number
}
```

**Status Management**:
```typescript
type EnrollmentStatus = "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED" | "SUSPENDED"

const getStatusColor = (status: EnrollmentStatus) => {
  switch (status) {
    case "COMPLETED": return "bg-green-100 text-green-800"
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
    case "ENROLLED": return "bg-yellow-100 text-yellow-800"
    case "DROPPED": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}
```

### 2.3 Certificates Component (certificates/page.tsx)

**File**: `src/app/(dashboard)/certificates/page.tsx`

**Key Features**:
- Automatic certificate generation from completed courses
- Grade system with visual indicators
- PDF download and sharing capabilities
- Achievement tracking and statistics

**Certificate Generation Logic**:
```typescript
const generateCertificates = (enrollments: CourseEnrollment[]): Certificate[] => {
  const completedEnrollments = enrollments.filter(e => e.status === "COMPLETED")
  
  return completedEnrollments.map(enrollment => ({
    id: `cert_${enrollment.id}`,
    courseId: enrollment.course.id,
    courseTitle: enrollment.course.title,
    courseCategory: enrollment.course.category,
    issuedAt: enrollment.completedAt || new Date().toISOString(),
    grade: Math.floor(Math.random() * 20) + 80, // 80-100% grade system
    status: "ISSUED" as const,
    certificateNumber: `CERT-${enrollment.id.slice(-8).toUpperCase()}`,
  }))
}
```

---

## 3. Data Models and Types

### 3.1 Course Data Structure

```typescript
interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  thumbnail: string | null
  coverImage?: string | null
  videoPreview: string | null          // YouTube URL for preview
  duration: number                     // Duration in minutes
  level: CourseLevel
  category: CourseCategory
  isMandatory: boolean
  isActive: boolean
  price: string | number              // Price in BOB (Bolivianos)
  rating: string | number             // Course rating 1-5
  studentsCount: number               // Total enrolled students
  totalLessons: number                // Number of lessons
  totalQuizzes: number                // Number of quizzes
  tags: string[]                      // Search tags
  certification: boolean              // Offers certificate
  instructor?: {
    id: string
    name: string
    title: string
    avatar?: string
  } | null
  organization?: {
    id: string
    name: string
    logo?: string
  } | null
}

type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

type CourseCategory = 
  | "SOFT_SKILLS"           // Habilidades Blandas
  | "BASIC_COMPETENCIES"    // Competencias Básicas
  | "JOB_PLACEMENT"         // Inserción Laboral
  | "ENTREPRENEURSHIP"      // Emprendimiento
  | "TECHNICAL_SKILLS"      // Habilidades Técnicas
  | "DIGITAL_LITERACY"      // Alfabetización Digital
  | "COMMUNICATION"         // Comunicación
  | "LEADERSHIP"            // Liderazgo
```

### 3.2 Course Enrollment Structure

```typescript
interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  status: EnrollmentStatus
  progress: number                    // 0-100 percentage
  enrolledAt: string                  // ISO date string
  startedAt?: string                  // When user started learning
  completedAt?: string                // When course was completed
  lastAccessedAt?: string             // Last learning session
  timeSpent?: number                  // Total time in minutes
  currentLesson?: string              // Current lesson ID
  currentModule?: string              // Current module ID
  course: {
    id: string
    title: string
    description: string
    thumbnail?: string
    duration: number
    level: CourseLevel
    category: CourseCategory
    studentCount?: number
    rating?: number
  }
}

type EnrollmentStatus = 
  | "ENROLLED"      // Just enrolled, not started
  | "IN_PROGRESS"   // Currently learning
  | "COMPLETED"     // Finished successfully
  | "DROPPED"       // User dropped out
  | "SUSPENDED"     // Account suspended
```

### 3.3 Certificate Structure

```typescript
interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  courseCategory: CourseCategory
  issuedAt: string                    // ISO date string
  grade: number                       // 0-100 percentage
  status: CertificateStatus
  downloadUrl?: string                // PDF download URL
  certificateNumber: string           // Unique certificate identifier
  validUntil?: string                 // Expiration date (if applicable)
  credentialId?: string               // For blockchain verification
}

type CertificateStatus = "ISSUED" | "PENDING" | "EXPIRED" | "REVOKED"
```

### 3.4 Video Integration Structure

```typescript
interface VideoPreview {
  url: string
  thumbnail: string
  duration: number
  isYouTube: boolean
  videoId?: string                    // YouTube video ID
  embedUrl?: string                   // YouTube embed URL
}

// YouTube Integration Helpers
const isYouTubeVideo = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

const getYouTubeThumbnail = (videoUrl: string): string => {
  const videoId = extractYouTubeVideoId(videoUrl)
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
}

const getYouTubeEmbedUrl = (videoUrl: string): string => {
  const videoId = extractYouTubeVideoId(videoUrl)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}
```

---

## 4. API Integration Specifications

### 4.1 Course Management Endpoints

#### GET /course
**Purpose**: Retrieve all available courses (public endpoint)
**Authentication**: Not required
**Response Structure**:
```json
{
  "courses": [
    {
      "id": "course_123",
      "title": "Desarrollo de Habilidades Blandas",
      "slug": "desarrollo-habilidades-blandas",
      "description": "Curso completo sobre habilidades blandas...",
      "shortDescription": "Aprende las habilidades esenciales...",
      "thumbnail": "/api/files/course-thumbnails/course_123.jpg",
      "videoPreview": "https://youtube.com/watch?v=example",
      "duration": 120,
      "level": "BEGINNER",
      "category": "SOFT_SKILLS",
      "isMandatory": false,
      "isActive": true,
      "price": "0",
      "rating": "4.5",
      "studentsCount": 156,
      "totalLessons": 8,
      "totalQuizzes": 3,
      "tags": ["comunicación", "trabajo en equipo", "liderazgo"],
      "certification": true,
      "instructor": {
        "id": "instructor_456",
        "name": "Dr. María González",
        "title": "Especialista en Desarrollo Humano",
        "avatar": "/api/files/avatars/instructor_456.jpg"
      }
    }
  ]
}
```

#### GET /course/{id}
**Purpose**: Get specific course details
**Authentication**: Not required
**Parameters**: 
- `id` (string): Course ID
**Response**: Single Course object

### 4.2 Course Enrollment Endpoints

#### GET /course-enrollments
**Purpose**: Get user's course enrollments
**Authentication**: Required (JWT token)
**Response Structure**:
```json
{
  "enrollments": [
    {
      "id": "enrollment_789",
      "courseId": "course_123",
      "userId": "user_456",
      "status": "IN_PROGRESS",
      "progress": 65,
      "enrolledAt": "2024-01-15T10:30:00Z",
      "startedAt": "2024-01-16T09:00:00Z",
      "lastAccessedAt": "2024-01-20T14:30:00Z",
      "timeSpent": 180,
      "currentLesson": "lesson_5",
      "currentModule": "module_2",
      "course": {
        "id": "course_123",
        "title": "Desarrollo de Habilidades Blandas",
        "description": "Curso completo...",
        "thumbnail": "/api/files/course-thumbnails/course_123.jpg",
        "duration": 120,
        "level": "BEGINNER",
        "category": "SOFT_SKILLS"
      }
    }
  ]
}
```

#### POST /course-enrollments
**Purpose**: Enroll user in a course
**Authentication**: Required (JWT token)
**Request Body**:
```json
{
  "courseId": "course_123",
  "enrollmentDate": "2024-01-15T10:30:00Z"
}
```
**Response**: Created CourseEnrollment object

#### PUT /course-enrollments/{id}
**Purpose**: Update enrollment progress
**Authentication**: Required (JWT token)
**Request Body**:
```json
{
  "progress": 75,
  "status": "IN_PROGRESS",
  "currentLesson": "lesson_6",
  "timeSpent": 240,
  "lastAccessedAt": "2024-01-21T15:00:00Z"
}
```
**Response**: Updated CourseEnrollment object

### 4.3 Certificate Endpoints

#### GET /certificates
**Purpose**: Get user's certificates
**Authentication**: Required (JWT token)
**Response Structure**:
```json
{
  "certificates": [
    {
      "id": "cert_enrollment_789",
      "courseId": "course_123",
      "courseTitle": "Desarrollo de Habilidades Blandas",
      "courseCategory": "SOFT_SKILLS",
      "issuedAt": "2024-01-25T16:00:00Z",
      "grade": 85,
      "status": "ISSUED",
      "downloadUrl": "/api/certificates/cert_enrollment_789/download",
      "certificateNumber": "CERT-ABCD1234"
    }
  ]
}
```

#### GET /certificates/{id}/download
**Purpose**: Download certificate PDF
**Authentication**: Required (JWT token)
**Response**: PDF file download

### 4.4 Hook Integration

```typescript
// useCourses Hook
interface CoursesHook {
  courses: Course[] | null
  loading: boolean
  error: Error | null
  
  fetchCourses: () => Promise<void>
  searchCourses: (query: string) => Course[]
  filterByCategory: (category: CourseCategory) => Course[]
  filterByLevel: (level: CourseLevel) => Course[]
}

// useCourseEnrollments Hook  
interface EnrollmentsHook {
  enrollments: CourseEnrollment[] | null
  loading: boolean
  error: Error | null
  
  fetchEnrollments: () => Promise<void>
  enrollInCourse: (courseId: string) => Promise<CourseEnrollment>
  updateProgress: (enrollmentId: string, progress: number) => Promise<void>
  getEnrollmentById: (id: string) => CourseEnrollment | null
}

// useCertificates Hook
interface CertificatesHook {
  certificates: Certificate[] | null
  loading: boolean
  error: Error | null
  
  fetchCertificates: () => Promise<void>
  downloadCertificate: (certificateId: string) => Promise<Blob>
  shareCertificate: (certificateId: string) => Promise<void>
}
```

---

## 5. State Management Patterns

### 5.1 Course Catalog State Management

```typescript
// Course filtering and search state
const [searchQuery, setSearchQuery] = useState("")
const [categoryFilter, setCategoryFilter] = useState<CourseCategory | "all">("all")
const [levelFilter, setLevelFilter] = useState<CourseLevel | "all">("all")
const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

// Real-time filtering implementation
const filteredCourses = useMemo(() => {
  if (!courses) return []
  
  return courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
    const matchesLevel = levelFilter === "all" || course.level === levelFilter
    
    return matchesSearch && matchesCategory && matchesLevel
  })
}, [courses, searchQuery, categoryFilter, levelFilter])

// Statistics calculation
const statistics = useMemo(() => {
  if (!courses) return { total: 0, categories: 0, students: 0, completion: 0 }
  
  const uniqueCategories = new Set(courses.map(c => c.category)).size
  const totalStudents = courses.reduce((sum, c) => sum + c.studentsCount, 0)
  const avgCompletion = courses.reduce((sum, c) => sum + (c.rating as number || 0), 0) / courses.length
  
  return {
    total: courses.length,
    categories: uniqueCategories,
    students: totalStudents,
    completion: Math.round(avgCompletion * 20) // Convert 5-star to percentage
  }
}, [courses])
```

### 5.2 Enrollment Progress Management

```typescript
// Progress tracking state
const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null)
const [progressUpdateQueue, setProgressUpdateQueue] = useState<ProgressUpdate[]>([])

interface ProgressUpdate {
  enrollmentId: string
  progress: number
  timestamp: number
  synced: boolean
}

// Progress update with offline queue
const updateProgress = useCallback(async (enrollmentId: string, newProgress: number) => {
  const update: ProgressUpdate = {
    enrollmentId,
    progress: newProgress,
    timestamp: Date.now(),
    synced: false
  }
  
  // Add to offline queue
  setProgressUpdateQueue(prev => [...prev, update])
  
  // Optimistic update
  setEnrollments(prev => prev?.map(enrollment => 
    enrollment.id === enrollmentId 
      ? { ...enrollment, progress: newProgress }
      : enrollment
  ))
  
  // Attempt sync
  try {
    await updateEnrollmentProgress(enrollmentId, { progress: newProgress })
    // Mark as synced
    setProgressUpdateQueue(prev => 
      prev.map(u => u.enrollmentId === enrollmentId ? { ...u, synced: true } : u)
    )
  } catch (error) {
    console.log('Progress update queued for later sync')
  }
}, [updateEnrollmentProgress])

// Sync queue when online
useEffect(() => {
  const syncQueuedUpdates = async () => {
    const unsyncedUpdates = progressUpdateQueue.filter(u => !u.synced)
    
    for (const update of unsyncedUpdates) {
      try {
        await updateEnrollmentProgress(update.enrollmentId, { progress: update.progress })
        setProgressUpdateQueue(prev => 
          prev.map(u => u.enrollmentId === update.enrollmentId ? { ...u, synced: true } : u)
        )
      } catch (error) {
        console.log(`Failed to sync progress for ${update.enrollmentId}`)
      }
    }
  }
  
  // Check network status and sync
  if (navigator.onLine && progressUpdateQueue.some(u => !u.synced)) {
    syncQueuedUpdates()
  }
}, [progressUpdateQueue, updateEnrollmentProgress])
```

### 5.3 Certificate Management State

```typescript
// Certificate state with grade calculations
const [certificates, setCertificates] = useState<Certificate[]>([])
const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})

// Grade classification
const getGradeClassification = (grade: number): string => {
  if (grade >= 90) return "Excelente"
  if (grade >= 80) return "Muy Bueno"  
  if (grade >= 70) return "Bueno"
  return "Aceptable"
}

const getGradeColor = (grade: number): string => {
  if (grade >= 90) return "bg-green-100 text-green-800"
  if (grade >= 80) return "bg-blue-100 text-blue-800"
  if (grade >= 70) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

// Certificate statistics
const certificateStats = useMemo(() => {
  if (!certificates) return { total: 0, thisMonth: 0, averageGrade: 0 }
  
  const now = new Date()
  const thisMonth = certificates.filter(cert => {
    const issuedDate = new Date(cert.issuedAt)
    return issuedDate.getMonth() === now.getMonth() && 
           issuedDate.getFullYear() === now.getFullYear()
  }).length
  
  const averageGrade = certificates.length > 0 
    ? Math.round(certificates.reduce((sum, cert) => sum + cert.grade, 0) / certificates.length)
    : 0
    
  return {
    total: certificates.length,
    thisMonth,
    averageGrade
  }
}, [certificates])
```

---

## 6. UI/UX Components for Mobile

### 6.1 Course Card Component

```typescript
interface CourseCardProps {
  course: Course
  enrollment?: CourseEnrollment
  viewMode: "grid" | "list"
  onEnroll?: (courseId: string) => void
  onContinue?: (enrollmentId: string) => void
  onPreview?: (course: Course) => void
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  enrollment, 
  viewMode,
  onEnroll,
  onContinue,
  onPreview 
}) => {
  const [imageError, setImageError] = useState(false)
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  
  // Image fallback handling
  const imageUrl = imageError ? '/images/courses/default-course.jpg' : course.thumbnail
  
  // Video thumbnail for YouTube
  const videoThumbnail = course.videoPreview 
    ? getYouTubeThumbnail(course.videoPreview)
    : null
    
  // Course progress display
  const progress = enrollment?.progress || 0
  const status = enrollment?.status
  
  return (
    <Card className={`course-card ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
      {/* Course Image/Video Preview */}
      <div className="relative">
        <Image 
          src={videoThumbnail || imageUrl}
          alt={course.title}
          onError={() => setImageError(true)}
          className="course-thumbnail"
        />
        
        {course.videoPreview && (
          <Button 
            className="absolute inset-0 play-button"
            onClick={() => setShowVideoPreview(true)}
          >
            <PlayIcon />
          </Button>
        )}
        
        {/* Course Level Badge */}
        <Badge className={`level-badge ${course.level.toLowerCase()}`}>
          {course.level}
        </Badge>
      </div>
      
      {/* Course Content */}
      <CardContent>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.shortDescription}</p>
        
        {/* Course Metadata */}
        <div className="course-metadata">
          <span className="duration">{course.duration} min</span>
          <span className="students">{course.studentsCount} estudiantes</span>
          <span className="rating">⭐ {course.rating}</span>
        </div>
        
        {/* Progress Bar (if enrolled) */}
        {enrollment && (
          <div className="progress-section">
            <div className="progress-info">
              <span>Progreso: {progress}%</span>
              <Badge className={getStatusColor(status)}>{status}</Badge>
            </div>
            <ProgressBar value={progress} max={100} />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="action-buttons">
          {enrollment ? (
            <Button onClick={() => onContinue?.(enrollment.id)}>
              Continuar Aprendiendo
            </Button>
          ) : (
            <Button onClick={() => onEnroll?.(course.id)}>
              Inscribirse
            </Button>
          )}
          
          <Button variant="outline" onClick={() => onPreview?.(course)}>
            Ver Detalles
          </Button>
        </div>
      </CardContent>
      
      {/* Video Preview Modal */}
      {showVideoPreview && course.videoPreview && (
        <VideoPreviewModal
          videoUrl={course.videoPreview}
          onClose={() => setShowVideoPreview(false)}
        />
      )}
    </Card>
  )
}
```

### 6.2 Progress Tracking Components

```typescript
// Progress Bar Component
interface ProgressBarProps {
  value: number
  max: number
  showPercentage?: boolean
  color?: "primary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  showPercentage = true,
  color = "primary",
  size = "md"
}) => {
  const percentage = Math.round((value / max) * 100)
  
  return (
    <div className={`progress-container ${size}`}>
      <div className="progress-bar-background">
        <div 
          className={`progress-bar-fill ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="progress-percentage">{percentage}%</span>
      )}
    </div>
  )
}

// Enrollment Status Component
interface EnrollmentStatusProps {
  enrollment: CourseEnrollment
  onContinue: (enrollmentId: string) => void
  onViewCertificate?: (enrollmentId: string) => void
}

const EnrollmentStatus: React.FC<EnrollmentStatusProps> = ({
  enrollment,
  onContinue,
  onViewCertificate
}) => {
  const { status, progress, timeSpent } = enrollment
  
  const formatTimeSpent = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }
  
  return (
    <div className="enrollment-status">
      <div className="status-header">
        <Badge className={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Badge>
        <span className="time-spent">
          {timeSpent ? formatTimeSpent(timeSpent) : "0m"}
        </span>
      </div>
      
      <ProgressBar value={progress} max={100} />
      
      <div className="status-actions">
        {status === "COMPLETED" ? (
          <Button onClick={() => onViewCertificate?.(enrollment.id)}>
            Ver Certificado
          </Button>
        ) : (
          <Button onClick={() => onContinue(enrollment.id)}>
            {status === "ENROLLED" ? "Comenzar" : "Continuar"}
          </Button>
        )}
      </div>
    </div>
  )
}
```

### 6.3 Filter and Search Components

```typescript
// Advanced Filter Component
interface CourseFiltersProps {
  searchQuery: string
  categoryFilter: CourseCategory | "all"
  levelFilter: CourseLevel | "all"
  onSearchChange: (query: string) => void
  onCategoryChange: (category: CourseCategory | "all") => void
  onLevelChange: (level: CourseLevel | "all") => void
  onClearFilters: () => void
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  searchQuery,
  categoryFilter, 
  levelFilter,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
  onClearFilters
}) => {
  // Debounced search to avoid excessive API calls
  const debouncedSearchChange = useMemo(
    () => debounce(onSearchChange, 300),
    [onSearchChange]
  )
  
  const activeFiltersCount = [
    categoryFilter !== "all",
    levelFilter !== "all",
    searchQuery.length > 0
  ].filter(Boolean).length
  
  return (
    <div className="course-filters">
      {/* Search Input */}
      <div className="search-input">
        <SearchIcon className="search-icon" />
        <Input
          placeholder="Buscar cursos..."
          value={searchQuery}
          onChange={(e) => debouncedSearchChange(e.target.value)}
        />
      </div>
      
      {/* Category Filter */}
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {COURSE_CATEGORIES.map(category => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Level Filter */}
      <Select value={levelFilter} onValueChange={onLevelChange}>
        <SelectTrigger>
          <SelectValue placeholder="Nivel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los niveles</SelectItem>
          <SelectItem value="BEGINNER">Principiante</SelectItem>
          <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
          <SelectItem value="ADVANCED">Avanzado</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={onClearFilters}>
          Limpiar ({activeFiltersCount})
        </Button>
      )}
    </div>
  )
}
```

---

## 7. Video Integration System

### 7.1 YouTube Integration

```typescript
// YouTube utility functions
export const VideoUtils = {
  isYouTubeVideo: (url: string): boolean => {
    if (!url || typeof url !== 'string') return false
    return url.includes('youtube.com') || url.includes('youtu.be')
  },
  
  extractVideoId: (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  },
  
  getThumbnail: (videoUrl: string, quality: 'default' | 'hq' | 'maxres' = 'maxres'): string => {
    const videoId = VideoUtils.extractVideoId(videoUrl)
    if (!videoId) return '/images/courses/default-course.jpg'
    
    const qualityMap = {
      'default': 'default',
      'hq': 'hqdefault', 
      'maxres': 'maxresdefault'
    }
    
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
  },
  
  getEmbedUrl: (videoUrl: string): string => {
    const videoId = VideoUtils.extractVideoId(videoUrl)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
  },
  
  getDuration: async (videoUrl: string): Promise<number> => {
    // In a real implementation, this would call YouTube API
    // For now, return a default duration
    return 300 // 5 minutes default
  }
}
```

### 7.2 Video Preview Component

```typescript
interface VideoPreviewModalProps {
  videoUrl: string
  onClose: () => void
  autoplay?: boolean
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  videoUrl,
  onClose,
  autoplay = false
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const embedUrl = VideoUtils.getEmbedUrl(videoUrl) + (autoplay ? '?autoplay=1' : '')
  
  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalHeader>
        <h3>Vista Previa del Curso</h3>
        <Button variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </ModalHeader>
      
      <ModalContent>
        <div className="video-container">
          {isLoading && (
            <div className="video-loading">
              <Spinner />
              <p>Cargando video...</p>
            </div>
          )}
          
          <iframe
            src={embedUrl}
            title="Video Preview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            className="video-iframe"
          />
        </div>
      </ModalContent>
    </Modal>
  )
}
```

### 7.3 Mobile Video Considerations

```typescript
// Mobile-specific video handling
interface MobileVideoPlayerProps {
  videoUrl: string
  thumbnail: string
  onPlay: () => void
}

const MobileVideoPlayer: React.FC<MobileVideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  onPlay
}) => {
  const [showPlayer, setShowPlayer] = useState(false)
  
  // For mobile, we'll use native video player or YouTube app
  const handlePlay = () => {
    if (VideoUtils.isYouTubeVideo(videoUrl)) {
      // Open in YouTube app if available, otherwise web
      const videoId = VideoUtils.extractVideoId(videoUrl)
      const youtubeAppUrl = `youtube://watch?v=${videoId}`
      const fallbackUrl = videoUrl
      
      // Try to open in YouTube app
      window.location.href = youtubeAppUrl
      
      // Fallback to web if app not available
      setTimeout(() => {
        window.open(fallbackUrl, '_blank')
      }, 500)
    } else {
      setShowPlayer(true)
      onPlay()
    }
  }
  
  return (
    <div className="mobile-video-player">
      {!showPlayer ? (
        <div className="video-thumbnail" onClick={handlePlay}>
          <img src={thumbnail} alt="Video thumbnail" />
          <div className="play-overlay">
            <PlayIcon className="play-icon" />
          </div>
        </div>
      ) : (
        <video
          controls
          autoPlay
          src={videoUrl}
          poster={thumbnail}
          className="video-element"
        />
      )}
    </div>
  )
}
```

---

## 8. Progress Tracking and Certificates

### 8.1 Progress Tracking System

```typescript
// Progress tracking service
export class ProgressTracker {
  private static instance: ProgressTracker
  private progressQueue: ProgressUpdate[] = []
  private syncInProgress = false
  
  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker()
    }
    return ProgressTracker.instance
  }
  
  // Track lesson completion
  async trackLessonCompletion(enrollmentId: string, lessonId: string): Promise<void> {
    const update: ProgressUpdate = {
      enrollmentId,
      type: 'LESSON_COMPLETED',
      data: { lessonId },
      timestamp: Date.now(),
      synced: false
    }
    
    this.progressQueue.push(update)
    this.calculateProgress(enrollmentId)
    this.attemptSync()
  }
  
  // Track time spent
  async trackTimeSpent(enrollmentId: string, minutes: number): Promise<void> {
    const update: ProgressUpdate = {
      enrollmentId,
      type: 'TIME_SPENT',
      data: { minutes },
      timestamp: Date.now(),
      synced: false
    }
    
    this.progressQueue.push(update)
    this.attemptSync()
  }
  
  // Calculate overall progress
  private calculateProgress(enrollmentId: string): number {
    const completedLessons = this.progressQueue
      .filter(u => u.enrollmentId === enrollmentId && u.type === 'LESSON_COMPLETED')
      .map(u => u.data.lessonId)
      .filter((id, index, arr) => arr.indexOf(id) === index) // Unique lessons
    
    // Assuming course has totalLessons property
    const totalLessons = this.getTotalLessons(enrollmentId)
    const progress = Math.round((completedLessons.length / totalLessons) * 100)
    
    return Math.min(progress, 100)
  }
  
  // Sync with backend
  private async attemptSync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return
    
    this.syncInProgress = true
    const unsyncedUpdates = this.progressQueue.filter(u => !u.synced)
    
    for (const update of unsyncedUpdates) {
      try {
        await this.syncUpdate(update)
        update.synced = true
      } catch (error) {
        console.log('Failed to sync update, will retry later')
        break // Stop syncing on first failure
      }
    }
    
    this.syncInProgress = false
  }
  
  private async syncUpdate(update: ProgressUpdate): Promise<void> {
    const endpoint = `/course-enrollments/${update.enrollmentId}/progress`
    
    await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(update)
    })
  }
}
```

### 8.2 Certificate Generation System

```typescript
// Certificate generator
export class CertificateGenerator {
  // Generate certificate from completed enrollment
  static generateCertificate(enrollment: CourseEnrollment): Certificate {
    if (enrollment.status !== 'COMPLETED') {
      throw new Error('Cannot generate certificate for incomplete course')
    }
    
    const grade = this.calculateGrade(enrollment)
    const certificateNumber = this.generateCertificateNumber(enrollment.id)
    
    return {
      id: `cert_${enrollment.id}`,
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      courseCategory: enrollment.course.category,
      issuedAt: enrollment.completedAt || new Date().toISOString(),
      grade,
      status: 'ISSUED',
      certificateNumber,
      downloadUrl: `/api/certificates/cert_${enrollment.id}/download`
    }
  }
  
  // Calculate final grade based on quizzes and completion
  private static calculateGrade(enrollment: CourseEnrollment): number {
    // In real implementation, this would be based on quiz scores
    // For now, we'll simulate based on completion time and consistency
    const baseGrade = 80
    const timeBonus = this.calculateTimeBonus(enrollment)
    const consistencyBonus = this.calculateConsistencyBonus(enrollment)
    
    return Math.min(baseGrade + timeBonus + consistencyBonus, 100)
  }
  
  private static calculateTimeBonus(enrollment: CourseEnrollment): number {
    // Bonus for completing within expected timeframe
    const expectedDays = enrollment.course.duration / 60 / 8 // 8 hours per day
    const actualDays = this.getDaysBetween(enrollment.enrolledAt, enrollment.completedAt!)
    
    if (actualDays <= expectedDays) return 10
    if (actualDays <= expectedDays * 1.5) return 5
    return 0
  }
  
  private static calculateConsistencyBonus(enrollment: CourseEnrollment): number {
    // Bonus for consistent learning (accessing course regularly)
    // This would be based on actual learning session data
    return Math.floor(Math.random() * 10) // Simulated for now
  }
  
  private static generateCertificateNumber(enrollmentId: string): string {
    const prefix = 'CEMSE'
    const year = new Date().getFullYear()
    const suffix = enrollmentId.slice(-8).toUpperCase()
    return `${prefix}-${year}-${suffix}`
  }
  
  private static getDaysBetween(start: string, end: string): number {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}
```

### 8.3 Certificate Download and Sharing

```typescript
// Certificate download service
export class CertificateService {
  // Download certificate as PDF
  static async downloadCertificate(certificateId: string): Promise<Blob> {
    const response = await fetch(`/api/certificates/${certificateId}/download`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to download certificate')
    }
    
    return response.blob()
  }
  
  // Share certificate (mobile)
  static async shareCertificate(certificate: Certificate): Promise<void> {
    if (navigator.share) {
      // Use native sharing on mobile
      await navigator.share({
        title: `Certificado - ${certificate.courseTitle}`,
        text: `He completado el curso "${certificate.courseTitle}" con una calificación de ${certificate.grade}%`,
        url: certificate.downloadUrl
      })
    } else {
      // Fallback to clipboard
      const shareText = `🎓 He completado el curso "${certificate.courseTitle}" con una calificación de ${certificate.grade}% en CEMSE. Certificado: ${certificate.certificateNumber}`
      
      await navigator.clipboard.writeText(shareText)
      // Show toast notification
      showToast('Enlace copiado al portapapeles')
    }
  }
  
  // Save certificate to device (mobile)
  static async saveCertificateToDevice(certificateId: string, fileName: string): Promise<void> {
    try {
      const blob = await this.downloadCertificate(certificateId)
      
      // For mobile, use File System Access API or fallback
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'PDF files',
            accept: { 'application/pdf': ['.pdf'] }
          }]
        })
        
        const writable = await fileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to save certificate:', error)
      throw error
    }
  }
}
```

---

## 9. Mobile-Specific Considerations

### 9.1 Offline Functionality

```typescript
// Offline storage service for courses
export class OfflineCourseStorage {
  private static readonly CACHE_KEY = 'cemse_courses_cache'
  private static readonly ENROLLMENTS_KEY = 'cemse_enrollments_cache'
  private static readonly PROGRESS_QUEUE_KEY = 'cemse_progress_queue'
  
  // Cache courses for offline browsing
  static async cacheCourseCatalog(courses: Course[]): Promise<void> {
    try {
      const cacheData = {
        courses,
        timestamp: Date.now(),
        version: '1.0'
      }
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Failed to cache courses:', error)
    }
  }
  
  // Load cached courses
  static async getCachedCourses(): Promise<Course[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY)
      if (!cached) return null
      
      const cacheData = JSON.parse(cached)
      
      // Check if cache is still valid (24 hours)
      const isValid = Date.now() - cacheData.timestamp < 24 * 60 * 60 * 1000
      
      return isValid ? cacheData.courses : null
    } catch (error) {
      console.error('Failed to load cached courses:', error)
      return null
    }
  }
  
  // Cache user enrollments
  static async cacheEnrollments(enrollments: CourseEnrollment[]): Promise<void> {
    try {
      const cacheData = {
        enrollments,
        timestamp: Date.now()
      }
      
      await AsyncStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Failed to cache enrollments:', error)
    }
  }
  
  // Queue progress updates for later sync
  static async queueProgressUpdate(update: ProgressUpdate): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(this.PROGRESS_QUEUE_KEY)
      const queue: ProgressUpdate[] = existing ? JSON.parse(existing) : []
      
      queue.push(update)
      
      await AsyncStorage.setItem(this.PROGRESS_QUEUE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to queue progress update:', error)
    }
  }
  
  // Get queued updates for sync
  static async getQueuedUpdates(): Promise<ProgressUpdate[]> {
    try {
      const queue = await AsyncStorage.getItem(this.PROGRESS_QUEUE_KEY)
      return queue ? JSON.parse(queue) : []
    } catch (error) {
      console.error('Failed to get queued updates:', error)
      return []
    }
  }
  
  // Clear synced updates
  static async clearSyncedUpdates(syncedIds: string[]): Promise<void> {
    try {
      const queue = await this.getQueuedUpdates()
      const remaining = queue.filter(update => !syncedIds.includes(update.id))
      
      await AsyncStorage.setItem(this.PROGRESS_QUEUE_KEY, JSON.stringify(remaining))
    } catch (error) {
      console.error('Failed to clear synced updates:', error)
    }
  }
}
```

### 9.2 Network State Management

```typescript
// Network state hook for offline/online functionality
export const useNetworkState = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  
  useEffect(() => {
    // React Native Network Info
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false)
      setConnectionType(state.type)
      
      // Trigger sync when coming back online
      if (state.isConnected && !isOnline) {
        syncQueuedData()
      }
    })
    
    return unsubscribe
  }, [isOnline])
  
  const syncQueuedData = async () => {
    try {
      // Sync progress updates
      const queuedUpdates = await OfflineCourseStorage.getQueuedUpdates()
      const syncedIds: string[] = []
      
      for (const update of queuedUpdates) {
        try {
          await ProgressTracker.getInstance().syncUpdate(update)
          syncedIds.push(update.id)
        } catch (error) {
          console.log('Failed to sync update:', update.id)
          break // Stop on first failure
        }
      }
      
      if (syncedIds.length > 0) {
        await OfflineCourseStorage.clearSyncedUpdates(syncedIds)
      }
      
      // Refresh data from server
      await refreshCourseData()
      
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }
  
  return {
    isOnline,
    connectionType,
    syncQueuedData
  }
}
```

### 9.3 Push Notifications

```typescript
// Push notification service for course updates
export class CourseNotificationService {
  // Schedule course reminder notifications
  static async scheduleStudyReminder(enrollment: CourseEnrollment): Promise<void> {
    if (!enrollment.lastAccessedAt) return
    
    const lastAccessed = new Date(enrollment.lastAccessedAt)
    const daysSinceAccess = (Date.now() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24)
    
    // Schedule reminder if inactive for 3+ days
    if (daysSinceAccess >= 3) {
      const reminderTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      
      await PushNotification.localNotificationSchedule({
        id: `study_reminder_${enrollment.id}`,
        title: '📚 Continúa tu aprendizaje',
        message: `No olvides continuar con "${enrollment.course.title}". Llevas ${enrollment.progress}% completado.`,
        date: reminderTime,
        soundName: 'default',
        actions: [
          { id: 'continue', title: 'Continuar' },
          { id: 'later', title: 'Más tarde' }
        ]
      })
    }
  }
  
  // Notify course completion and certificate availability
  static async notifyCourseCompletion(enrollment: CourseEnrollment, certificate: Certificate): Promise<void> {
    await PushNotification.localNotification({
      id: `completion_${enrollment.id}`,
      title: '🎉 ¡Felicitaciones!',
      message: `Has completado "${enrollment.course.title}" con ${certificate.grade}%. Tu certificado está listo.`,
      soundName: 'default',
      actions: [
        { id: 'view_certificate', title: 'Ver Certificado' },
        { id: 'share', title: 'Compartir' }
      ]
    })
  }
  
  // Notify new course recommendations
  static async notifyNewCourseRecommendations(courses: Course[]): Promise<void> {
    if (courses.length === 0) return
    
    const message = courses.length === 1 
      ? `Nuevo curso recomendado: "${courses[0].title}"`
      : `${courses.length} nuevos cursos recomendados para ti`
    
    await PushNotification.localNotification({
      id: 'new_recommendations',
      title: '🚀 Nuevos cursos disponibles',
      message,
      soundName: 'default',
      actions: [
        { id: 'explore', title: 'Explorar' },
        { id: 'dismiss', title: 'Descartar' }
      ]
    })
  }
  
  // Handle notification actions
  static handleNotificationAction(action: string, notificationId: string): void {
    switch (action) {
      case 'continue':
        // Navigate to course learning
        NavigationService.navigate('CourseLearning', { enrollmentId: notificationId.split('_')[2] })
        break
        
      case 'view_certificate':
        // Navigate to certificates
        NavigationService.navigate('Certificates', { highlight: notificationId.split('_')[1] })
        break
        
      case 'share':
        // Open sharing modal
        this.triggerCertificateShare(notificationId.split('_')[1])
        break
        
      case 'explore':
        // Navigate to course catalog
        NavigationService.navigate('Courses')
        break
    }
  }
}
```

### 9.4 Performance Optimizations

```typescript
// Optimized course list component with virtualization
import { FlashList } from '@shopify/flash-list'

interface OptimizedCourseListProps {
  courses: Course[]
  onCoursePress: (course: Course) => void
  onEnroll: (courseId: string) => void
}

const OptimizedCourseList: React.FC<OptimizedCourseListProps> = ({
  courses,
  onCoursePress,
  onEnroll
}) => {
  const renderCourse = useCallback(({ item: course }: { item: Course }) => (
    <CourseCard
      key={course.id}
      course={course}
      viewMode="list"
      onPress={() => onCoursePress(course)}
      onEnroll={() => onEnroll(course.id)}
    />
  ), [onCoursePress, onEnroll])
  
  const getItemType = useCallback((item: Course) => {
    // Different types for different course categories to optimize rendering
    return item.category
  }, [])
  
  return (
    <FlashList
      data={courses}
      renderItem={renderCourse}
      getItemType={getItemType}
      estimatedItemSize={120}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  )
}

// Image optimization with caching
export class ImageCacheService {
  private static cache = new Map<string, string>()
  
  static async getCachedImage(url: string): Promise<string> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }
    
    try {
      // Download and cache image
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      this.cache.set(url, objectUrl)
      return objectUrl
      
    } catch (error) {
      // Return placeholder on error
      return '/images/courses/default-course.jpg'
    }
  }
  
  static clearCache(): void {
    // Clean up object URLs
    this.cache.forEach(url => URL.revokeObjectURL(url))
    this.cache.clear()
  }
}
```

---

## 10. Implementation Roadmap

### Phase 1: Core Course Management (4-5 weeks)

**Week 1-2: Foundation Setup**
- [ ] Set up React Native navigation structure
- [ ] Implement core data models and TypeScript interfaces
- [ ] Create basic API service layer
- [ ] Set up offline storage with AsyncStorage

**Week 3-4: Course Catalog**
- [ ] Implement course browsing functionality
- [ ] Create course card components
- [ ] Add search and filtering capabilities
- [ ] Implement grid/list view modes

**Week 5: My Courses Foundation**
- [ ] Implement enrollment management
- [ ] Create progress tracking components
- [ ] Add status management system
- [ ] Build basic statistics dashboard

### Phase 2: Advanced Features (3-4 weeks)

**Week 6-7: Video Integration**
- [ ] Implement YouTube video preview system
- [ ] Create mobile video player components
- [ ] Add video caching for offline viewing
- [ ] Integrate native video sharing

**Week 8-9: Progress Tracking**
- [ ] Implement real-time progress synchronization
- [ ] Create offline progress queue system
- [ ] Add lesson completion tracking
- [ ] Build time-spent tracking

### Phase 3: Certificates and Sharing (2-3 weeks)

**Week 10-11: Certificate System**
- [ ] Implement certificate generation logic
- [ ] Create certificate display components
- [ ] Add PDF download functionality
- [ ] Implement certificate sharing

**Week 12: Mobile Optimizations**
- [ ] Add push notification system
- [ ] Implement background sync
- [ ] Optimize performance with virtualization
- [ ] Add image caching system

### Phase 4: Polish and Testing (2 weeks)

**Week 13: Integration Testing**
- [ ] Test offline functionality
- [ ] Verify data synchronization
- [ ] Test video integration
- [ ] Validate certificate generation

**Week 14: Final Polish**
- [ ] Performance optimization
- [ ] UI/UX refinements
- [ ] Accessibility improvements
- [ ] Platform-specific adaptations

---

## File Structure for Mobile Implementation

```
src/
├── components/
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   ├── CourseList.tsx
│   │   ├── CourseFilters.tsx
│   │   ├── VideoPreview.tsx
│   │   └── ProgressBar.tsx
│   ├── certificates/
│   │   ├── CertificateCard.tsx
│   │   ├── CertificateList.tsx
│   │   └── CertificateViewer.tsx
│   └── common/
│       ├── SearchInput.tsx
│       ├── StatisticsCard.tsx
│       └── ViewModeToggle.tsx
├── screens/
│   ├── CourseCatalogScreen.tsx
│   ├── MyCoursesScreen.tsx
│   ├── CertificatesScreen.tsx
│   └── CourseDetailScreen.tsx
├── services/
│   ├── api/
│   │   ├── courseApi.ts
│   │   ├── enrollmentApi.ts
│   │   └── certificateApi.ts
│   ├── offline/
│   │   ├── OfflineStorage.ts
│   │   └── SyncService.ts
│   ├── notifications/
│   │   └── NotificationService.ts
│   └── video/
│       └── VideoService.ts
├── hooks/
│   ├── useCourses.ts
│   ├── useEnrollments.ts
│   ├── useCertificates.ts
│   ├── useProgress.ts
│   └── useNetworkState.ts
├── types/
│   ├── course.ts
│   ├── enrollment.ts
│   ├── certificate.ts
│   └── api.ts
├── utils/
│   ├── videoUtils.ts
│   ├── dateUtils.ts
│   ├── formatUtils.ts
│   └── validationUtils.ts
└── constants/
    ├── courseCategories.ts
    ├── courseLevels.ts
    └── endpoints.ts
```

---

## 11. Complete Learning Management System Architecture

### 11.1 Learning Interface Structure (learn/page.tsx)

**Complete Component Hierarchy**:
```
CourseLearningPage
├── Header Section
│   ├── Back Navigation Button
│   ├── Course Title & Progress Display
│   ├── Action Buttons (Comments, Share, Bookmark)
│   └── Real-time Progress Indicator
├── Sidebar Navigation (Collapsible)
│   ├── Module/Lesson Tree Navigation
│   ├── Progress Indicators per Lesson
│   ├── Completion Status Icons
│   └── Time Tracking Display
├── Main Content Area
│   ├── Video Player Integration
│   ├── Lesson Content Display
│   ├── Resources Section
│   └── Navigation Controls
└── Modal Overlays
    ├── Quiz Component Integration
    ├── Quiz Selector (Multiple Quizzes)
    └── Video Preview Modal
```

**State Management Architecture**:
```typescript
interface LearningPageState {
  // Core Learning Data
  enrollment: CourseEnrollment | null
  loading: boolean
  error: string | null
  
  // Navigation State
  selectedModule: Module | null
  selectedLesson: Lesson | null
  sidebarCollapsed: boolean
  expandedModules: Set<string>
  
  // Progress Tracking
  lessonProgress: Record<string, boolean>
  courseProgress: EnrollmentProgress | null
  
  // Quiz Integration
  showQuiz: boolean
  showQuizSelector: boolean
  currentQuiz: Quiz | null
  
  // UI State
  showVideoPreview: boolean
  currentVideoTime: number
}

interface Module {
  id: string
  title: string
  description: string
  orderIndex: number
  estimatedDuration: number
  isLocked: boolean
  prerequisites: string[]
  hasCertificate: boolean
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  contentType: 'VIDEO' | 'TEXT' | 'QUIZ' | 'EXERCISE' | 'DOCUMENT'
  videoUrl?: string
  duration: number
  orderIndex: number
  isRequired: boolean
  isPreview: boolean
  attachments?: any
  resources?: Resource[]
  quizzes?: Quiz[]
}
```

### 11.2 Advanced Video Player System

**VideoPlayer Component Specifications**:
```typescript
interface VideoPlayerProps {
  src: string
  title?: string
  onProgress?: (progress: number) => void
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  className?: string
}

interface VideoPlayerState {
  // Playback State
  isPlaying: boolean
  currentTime: number
  duration: number
  buffered: number
  playbackRate: number
  
  // Audio State
  volume: number
  isMuted: boolean
  
  // UI State
  isFullscreen: boolean
  showControls: boolean
  showVolumeSlider: boolean
  showSettings: boolean
  isLoading: boolean
  error: string | null
}

// Video Controls Features
const VideoControls = {
  playback: {
    play: () => void,
    pause: () => void,
    togglePlay: () => void,
    seek: (percentage: number) => void,
    skipTime: (seconds: number) => void
  },
  volume: {
    setVolume: (level: number) => void,
    toggleMute: () => void,
    showVolumeSlider: boolean
  },
  playbackRate: {
    setRate: (rate: number) => void,
    availableRates: [0.5, 0.75, 1, 1.25, 1.5, 2]
  },
  fullscreen: {
    toggle: () => void,
    isFullscreen: boolean
  },
  keyboard: {
    space: 'togglePlay',
    arrowLeft: 'skipBackward(-10s)',
    arrowRight: 'skipForward(10s)',
    arrowUp: 'volumeUp',
    arrowDown: 'volumeDown',
    f: 'toggleFullscreen',
    m: 'toggleMute'
  }
}
```

**Video Proxy Integration**:
```typescript
// Video URL Processing
export const getVideoUrl = (url: string): string => {
  if (!url) return '';
  
  // MinIO URLs → Use proxy to avoid CSP issues
  if (url.includes('127.0.0.1:9000') || url.includes('localhost:9000')) {
    return `/api/video-proxy?url=${encodeURIComponent(url)}`;
  }
  
  // YouTube URLs → Convert to embed format
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  return url;
};

// Video Proxy API Endpoint
const videoProxyEndpoint = {
  path: '/api/video-proxy',
  methods: ['GET', 'HEAD'],
  headers: {
    'Content-Type': 'video/*',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*'
  },
  security: {
    validateMinioUrls: true,
    allowedDomains: ['127.0.0.1:9000', 'localhost:9000']
  }
}
```

### 11.3 Complete Quiz System Architecture

**QuizComponent Advanced Features**:
```typescript
interface Quiz {
  id: string
  title: string
  description?: string
  timeLimit?: number // minutes
  passingScore: number // percentage
  questions: QuizQuestion[]
  showCorrectAnswers?: boolean
  isActive?: boolean
}

interface QuizQuestion {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_SELECT' | 'SHORT_ANSWER' | 'FILL_BLANK'
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
  orderIndex: number
}

interface QuizComponentState {
  // Quiz Progress
  currentQuestionIndex: number
  answers: Record<string, string | string[]>
  timeSpent: number
  isCompleted: boolean
  
  // Results
  showResults: boolean
  results: QuizResults | null
  showExplanations: boolean
  
  // UI State
  submitting: boolean
  error: string | null
}

// Quiz Question Rendering Logic
const renderQuestionTypes = {
  MULTIPLE_CHOICE: () => (
    <RadioGroup value={userAnswer} onValueChange={handleAnswerChange}>
      {options.map(option => (
        <RadioGroupItem key={option} value={option} label={option} />
      ))}
    </RadioGroup>
  ),
  
  TRUE_FALSE: () => (
    <RadioGroup value={userAnswer} onValueChange={handleAnswerChange}>
      <RadioGroupItem value="Verdadero" label="Verdadero" />
      <RadioGroupItem value="Falso" label="Falso" />
    </RadioGroup>
  ),
  
  MULTIPLE_SELECT: () => (
    <CheckboxGroup value={userAnswer} onValueChange={handleAnswerChange}>
      {options.map(option => (
        <Checkbox key={option} value={option} label={option} />
      ))}
    </CheckboxGroup>
  ),
  
  SHORT_ANSWER: () => (
    <Textarea
      placeholder="Escribe tu respuesta..."
      value={userAnswer}
      onChange={handleAnswerChange}
      minHeight={100}
    />
  ),
  
  FILL_BLANK: () => (
    <Input
      placeholder="Completa el espacio en blanco..."
      value={userAnswer}
      onChange={handleAnswerChange}
    />
  )
}
```

**Quiz Attempt API Integration**:
```typescript
// Quiz Completion Flow
const completeQuiz = async (
  quizId: string,
  enrollmentId: string,
  answers: QuizAnswer[]
): Promise<QuizAttemptResult> => {
  const response = await apiCall('/quizattempt/complete', {
    method: 'POST',
    body: JSON.stringify({
      quizId,
      enrollmentId,
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        answer: Array.isArray(answer.answer) 
          ? answer.answer.join(', ') 
          : answer.answer,
        timeSpent: Math.floor(timeSpent / questions.length)
      }))
    })
  });
  
  return {
    id: response.attempt?.id,
    quizId,
    enrollmentId,
    score: response.score,
    totalQuestions: response.totalQuestions,
    passed: response.passed,
    completedAt: response.attempt?.completedAt,
    answers: response.answers
  };
};

// Quiz Results Calculation
const calculateResults = (quiz: Quiz, userAnswers: Record<string, any>): QuizResults => {
  let totalScore = 0;
  let totalPoints = 0;
  const quizAnswers: QuizAnswer[] = [];

  quiz.questions.forEach(question => {
    totalPoints += question.points;
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    let points = 0;

    if (userAnswer) {
      if (Array.isArray(question.correctAnswer)) {
        isCorrect = Array.isArray(userAnswer) && 
          userAnswer.length === question.correctAnswer.length &&
          userAnswer.every(ans => question.correctAnswer.includes(ans));
      } else {
        isCorrect = userAnswer === question.correctAnswer;
      }

      if (isCorrect) {
        points = question.points;
        totalScore += question.points;
      }
    }

    quizAnswers.push({
      questionId: question.id,
      answer: userAnswer || '',
      isCorrect,
      points
    });
  });

  const percentage = (totalScore / totalPoints) * 100;
  const passed = percentage >= quiz.passingScore;

  return {
    quizId: quiz.id,
    score: totalScore,
    totalPoints,
    percentage,
    passed,
    timeSpent,
    answers: quizAnswers,
    completedAt: new Date()
  };
};
```

### 11.4 Advanced Progress Tracking System

**Real-time Progress API Endpoints**:
```typescript
// Complete Lesson Endpoint
POST /course-progress/complete-lesson
Body: {
  enrollmentId: string,
  lessonId: string,
  timeSpent: number, // seconds
  videoProgress?: number // 0-1
}
Response: {
  message: string,
  lessonProgress: LessonProgress,
  moduleProgress: ModuleProgress,
  courseProgress: CourseProgress,
  nextLesson?: NextLesson
}

// Update Video Progress Endpoint
POST /course-progress/update-video-progress
Body: {
  enrollmentId: string,
  lessonId: string,
  videoProgress: number, // 0-1
  timeSpent: number // seconds
}
Response: {
  lessonProgress: LessonProgress
}

// Get Enrollment Progress Endpoint
GET /course-progress/enrollment/{enrollmentId}
Response: {
  enrollment: EnrollmentProgressDetails,
  course: CourseProgressDetails,
  modules: ModuleProgressDetails[],
  nextLesson?: NextLesson
}
```

**Progress Tracking Implementation**:
```typescript
interface LessonProgress {
  id: string
  enrollmentId: string
  lessonId: string
  isCompleted: boolean
  completedAt?: string
  timeSpent: number
  videoProgress?: number
}

interface ModuleProgress {
  moduleId: string
  moduleTitle: string
  progress: number
  completedLessons: number
  totalLessons: number
  isCompleted: boolean
}

interface CourseProgress {
  progress: number
  completedLessons: number
  totalLessons: number
  isCompleted: boolean
}

interface EnrollmentProgress {
  enrollment: {
    id: string
    status: string
    progress: number
    currentModuleId?: string
    currentLessonId?: string
    timeSpent: number
  }
  course: {
    id: string
    title: string
    totalLessons: number
    completedLessons: number
    progress: number
    isCompleted: boolean
  }
  modules: Array<{
    id: string
    title: string
    totalLessons: number
    completedLessons: number
    progress: number
    isCompleted: boolean
    lessons: Array<{
      id: string
      title: string
      isCompleted: boolean
      timeSpent: number
    }>
  }>
  nextLesson?: {
    id: string
    title: string
    moduleId: string
    moduleTitle: string
  }
}

// Progress Tracking Hooks
const useCourseProgress = (enrollmentId: string) => {
  const completeLesson = async (
    lessonId: string,
    timeSpent: number = 0,
    videoProgress?: number
  ) => {
    const response = await apiCall('/course-progress/complete-lesson', {
      method: 'POST',
      body: JSON.stringify({
        enrollmentId,
        lessonId,
        timeSpent,
        videoProgress
      })
    });
    
    return response;
  };
  
  const updateVideoProgress = async (
    lessonId: string,
    videoProgress: number,
    timeSpent: number
  ) => {
    const response = await apiCall('/course-progress/update-video-progress', {
      method: 'POST',
      body: JSON.stringify({
        enrollmentId,
        lessonId,
        videoProgress,
        timeSpent
      })
    });
    
    return response.lessonProgress;
  };
  
  const getEnrollmentProgress = async () => {
    const response = await apiCall(`/course-progress/enrollment/${enrollmentId}`);
    return response;
  };
  
  return {
    completeLesson,
    updateVideoProgress,
    getEnrollmentProgress
  };
};
```

### 11.5 Resource Management System

**LessonResources Component**:
```typescript
interface Resource {
  id: string
  title: string
  description?: string
  type: 'PDF' | 'DOCUMENT' | 'VIDEO' | 'IMAGE' | 'LINK' | 'OTHER'
  url: string
  filePath?: string
  fileSize?: number
  orderIndex?: number
  isDownloadable?: boolean
  createdAt?: string
}

const ResourceActions = {
  // Download Resource
  download: (resource: Resource) => {
    const link = document.createElement('a');
    link.href = resource.url;
    link.download = resource.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  // Preview Resource (PDF/Images)
  preview: (resource: Resource) => {
    window.open(resource.url, '_blank');
  },
  
  // Open External Links
  openExternal: (resource: Resource) => {
    window.open(resource.url, '_blank');
  }
};

const ResourceIcons = {
  PDF: <FileText className="h-5 w-5 text-red-500" />,
  DOCUMENT: <FileText className="h-5 w-5 text-blue-500" />,
  VIDEO: <Video className="h-5 w-5 text-purple-500" />,
  IMAGE: <Image className="h-5 w-5 text-green-500" />,
  LINK: <Link className="h-5 w-5 text-orange-500" />,
  OTHER: <File className="h-5 w-5 text-gray-500" />
};
```

### 11.6 Complete API Endpoint Specifications

**Learning-Specific Endpoints**:
```typescript
// Get Enrollment for Learning (with full data)
GET /course-enrollments/{enrollmentId}/learning
Response: {
  enrollment: {
    id: string,
    courseId: string,
    userId: string,
    status: EnrollmentStatus,
    progress: number,
    enrolledAt: string,
    completedAt?: string,
    course: {
      id: string,
      title: string,
      description: string,
      modules: Module[] // Full module data with lessons, resources, quizzes
    }
  }
}

// Get Lesson Resources
GET /lesson/{lessonId}/resources
Response: {
  resources: Resource[]
}

// Get Lesson Quizzes
GET /lesson/{lessonId}/quizzes
Response: {
  quizzes: Quiz[]
}

// Video Proxy for MinIO URLs
GET /api/video-proxy?url={encodedVideoUrl}
Headers: {
  'Content-Type': 'video/*',
  'Accept-Ranges': 'bytes',
  'Cache-Control': 'public, max-age=3600'
}
Response: Video stream with proper CORS headers
```

### 11.7 Mobile Implementation Strategy

**React Native Specific Adaptations**:
```typescript
// Mobile Video Player using react-native-video
import Video from 'react-native-video';

const MobileVideoPlayer = ({ src, onProgress, onTimeUpdate }) => {
  return (
    <Video
      source={{ uri: getVideoUrl(src) }}
      style={styles.videoPlayer}
      controls={true}
      resizeMode="contain"
      onProgress={(data) => {
        onProgress?.(data.currentTime / data.seekableDuration * 100);
        onTimeUpdate?.(data.currentTime);
      }}
      onLoad={(data) => {
        setDuration(data.duration);
      }}
      onError={(error) => {
        console.error('Video error:', error);
      }}
    />
  );
};

// Mobile Resource Downloading
import { downloadFile } from 'react-native-fs';
import { Share } from 'react-native';

const downloadResource = async (resource: Resource) => {
  const downloadDest = `${RNFS.DocumentDirectoryPath}/${resource.title}`;
  
  const result = await RNFS.downloadFile({
    fromUrl: resource.url,
    toFile: downloadDest,
    background: true,
    progressDivider: 1,
    begin: (res) => {
      console.log('Download started');
    },
    progress: (res) => {
      const progress = (res.bytesWritten / res.contentLength) * 100;
      console.log('Download progress:', progress);
    }
  });
  
  return result.promise;
};

// Mobile Quiz with Native Components
import { Alert } from 'react-native';

const showQuizResults = (results: QuizResults) => {
  Alert.alert(
    results.passed ? '🎉 ¡Felicitaciones!' : '📚 Intenta de nuevo',
    `Obtuviste ${results.percentage.toFixed(1)}% (${results.score}/${results.totalPoints} puntos)`,
    [
      { text: 'Ver Detalles', onPress: () => setShowResults(true) },
      { text: 'Continuar', onPress: () => onComplete(results) }
    ]
  );
};
```

### 11.8 Offline Learning Capabilities

**Offline Course Data Structure**:
```typescript
interface OfflineCourse {
  enrollment: CourseEnrollment
  modules: OfflineModule[]
  progress: EnrollmentProgress
  downloadedAt: string
  lastSyncAt?: string
}

interface OfflineModule {
  id: string
  title: string
  lessons: OfflineLesson[]
  downloadStatus: 'pending' | 'downloading' | 'completed' | 'error'
}

interface OfflineLesson {
  id: string
  title: string
  content: string
  videoPath?: string // Local file path
  resources: OfflineResource[]
  quizzes: Quiz[]
  downloadStatus: 'pending' | 'downloading' | 'completed' | 'error'
}

interface OfflineResource {
  id: string
  title: string
  localPath: string
  originalUrl: string
  fileSize: number
  downloadedAt: string
}

// Offline Sync Service
class OfflineSyncService {
  async downloadCourseForOffline(enrollmentId: string): Promise<void> {
    // 1. Download course metadata
    const enrollment = await this.downloadEnrollmentData(enrollmentId);
    
    // 2. Download video files
    await this.downloadVideoFiles(enrollment.course.modules);
    
    // 3. Download resources
    await this.downloadResources(enrollment.course.modules);
    
    // 4. Store in local database
    await this.storeCourseOffline(enrollment);
  }
  
  async syncProgressWhenOnline(): Promise<void> {
    const offlineProgress = await this.getOfflineProgress();
    
    for (const progress of offlineProgress) {
      try {
        await this.uploadProgress(progress);
        await this.markProgressAsSynced(progress.id);
      } catch (error) {
        console.log('Failed to sync progress:', progress.id);
      }
    }
  }
}
```

---

## 12. Production Deployment Checklist

### 12.1 Performance Requirements
- [ ] Video streaming works with 3G connections
- [ ] Offline course downloads complete in under 10 minutes
- [ ] Quiz responses submit within 2 seconds
- [ ] Progress tracking updates in real-time
- [ ] Search results appear within 1 second

### 12.2 Platform-Specific Features
- [ ] iOS: Native video player with Picture-in-Picture
- [ ] Android: Background download with notifications
- [ ] Both: Deep linking to specific lessons
- [ ] Both: Native sharing for certificates and progress

### 12.3 Security & Privacy
- [ ] Video proxy protects internal MinIO URLs
- [ ] Quiz answers encrypted during transmission
- [ ] Progress data backed up securely
- [ ] User data complies with privacy regulations

### 12.4 Testing Requirements
- [ ] Unit tests for all quiz question types
- [ ] Integration tests for progress tracking
- [ ] E2E tests for complete learning flows
- [ ] Performance tests under various network conditions

---

## Conclusion

This specification provides a complete technical roadmap for implementing the CEMSE Training module in React Native. The mobile implementation maintains full feature parity with the web version while adding mobile-specific enhancements like offline functionality, push notifications, and native sharing capabilities.

### Key Success Factors:

1. **Complete Learning System**: Full module/lesson navigation with video integration
2. **Advanced Quiz System**: All question types with immediate feedback and explanations
3. **Real-time Progress Tracking**: Seamless synchronization with offline queue support
4. **Video Integration**: Custom player with proxy support for MinIO and YouTube
5. **Resource Management**: Download and preview capabilities for all resource types
6. **Offline Capability**: Full course downloading and offline learning support
7. **Mobile Optimization**: Native video players, sharing, and performance optimizations

### Implementation Priority:

**Phase 1 (Weeks 1-4)**: Core learning interface, video player, basic navigation
**Phase 2 (Weeks 5-8)**: Quiz system, progress tracking, resource management
**Phase 3 (Weeks 9-12)**: Offline capabilities, mobile optimizations, testing

### Validation Criteria:

- [ ] Complete course learning workflow functions offline
- [ ] All quiz question types render and submit correctly  
- [ ] Video progress tracking synchronizes accurately
- [ ] Resource downloads work across all file types
- [ ] Progress tracking updates in real-time
- [ ] Mobile-specific features enhance user experience
- [ ] Performance meets production requirements

This comprehensive specification ensures successful mobile implementation of the CEMSE Training module with pixel-perfect functionality and enhanced mobile user experience.

---

## 11. Complete Learning Management System - ACTUAL WEB IMPLEMENTATION

### 11.1 Learning Interface Architecture (`learn/page.tsx`)

**File**: `src/app/(dashboard)/development/courses/[enrollmentId]/learn/page.tsx`

**Complete Component Hierarchy**:
```
Learning Interface
├── LearningLayout
│   ├── Sidebar Navigation
│   │   ├── CourseHeader (title, progress, instructor)
│   │   ├── ModuleList
│   │   │   ├── ModuleCard (expandable)
│   │   │   │   ├── LessonList
│   │   │   │   │   ├── LessonItem (with completion status)
│   │   │   │   │   ├── QuizItem (with attempt status)
│   │   │   │   │   └── ResourceItem (downloadable)
│   │   │   │   └── ProgressBar (module completion)
│   │   │   └── ModuleProgress (overall)
│   │   └── CourseProgress (total completion)
│   ├── MainContent
│   │   ├── ContentHeader (lesson/quiz title, navigation)
│   │   ├── ContentBody
│   │   │   ├── VideoPlayer (for video lessons)
│   │   │   ├── TextContent (for text lessons)
│   │   │   ├── QuizComponent (for quizzes)
│   │   │   └── ResourceViewer (for documents)
│   │   └── ContentFooter (navigation, completion)
│   └── Modal Overlays
│       ├── QuizResultModal
│       ├── ResourcePreviewModal
│       └── ProgressConfirmationModal
```

**State Management Architecture**:
```typescript
interface LearningState {
  // Core Data
  enrollment: CourseEnrollment
  course: DetailedCourse
  modules: Module[]
  currentContent: LearningContent
  
  // Navigation State
  selectedModuleId: string | null
  selectedLessonId: string | null
  selectedQuizId: string | null
  
  // Progress Tracking
  lessonProgress: Record<string, LessonProgress>
  quizAttempts: Record<string, QuizAttempt[]>
  videoProgress: Record<string, VideoProgress>
  
  // UI State
  sidebarCollapsed: boolean
  showQuizResult: boolean
  showResourcePreview: boolean
  loading: {
    content: boolean
    progress: boolean
    quiz: boolean
  }
  
  // Offline State
  offlineMode: boolean
  downloadedContent: Record<string, OfflineContent>
  syncQueue: ProgressUpdate[]
}

interface DetailedCourse extends Course {
  modules: Module[]
  totalLessons: number
  totalQuizzes: number
  totalResources: number
  estimatedDuration: number // in minutes
  instructor: Instructor
  learningObjectives: string[]
  prerequisites: string[]
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  isLocked: boolean
  estimatedDuration: number
  lessons: Lesson[]
  quizzes: Quiz[]
  resources: Resource[]
  progress: ModuleProgress
}

interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  type: LessonType
  order: number
  isRequired: boolean
  estimatedDuration: number
  content: LessonContent
  resources: Resource[]
  isCompleted: boolean
  completedAt?: string
}

type LessonType = "VIDEO" | "TEXT" | "INTERACTIVE" | "DOCUMENT"

interface LessonContent {
  type: LessonType
  data: {
    // For VIDEO type
    videoUrl?: string
    videoId?: string
    transcript?: string
    thumbnailUrl?: string
    
    // For TEXT type
    htmlContent?: string
    markdownContent?: string
    
    // For DOCUMENT type
    documentUrl?: string
    documentType?: string
    
    // For INTERACTIVE type
    interactiveUrl?: string
    embedCode?: string
  }
}

interface LessonProgress {
  lessonId: string
  enrollmentId: string
  startedAt: string
  completedAt?: string
  timeSpent: number // in seconds
  progress: number // 0-100
  lastPosition?: number // for videos, last watched position
  isCompleted: boolean
}

interface ModuleProgress {
  moduleId: string
  enrollmentId: string
  lessonsCompleted: number
  totalLessons: number
  quizzesCompleted: number
  totalQuizzes: number
  timeSpent: number
  progress: number // 0-100
  isCompleted: boolean
  completedAt?: string
}
```

**Learning Navigation Logic**:
```typescript
// Content navigation implementation
const LearningInterface: React.FC<LearningProps> = ({ enrollmentId }) => {
  const [learningState, setLearningState] = useState<LearningState>(initialState)
  
  // Content selection logic
  const selectContent = useCallback((contentId: string, contentType: 'lesson' | 'quiz') => {
    if (contentType === 'lesson') {
      const lesson = findLessonById(contentId)
      if (lesson && !lesson.isLocked) {
        setLearningState(prev => ({
          ...prev,
          selectedLessonId: contentId,
          selectedQuizId: null,
          currentContent: {
            type: 'lesson',
            data: lesson
          }
        }))
        
        // Track lesson start
        trackLessonStart(enrollmentId, contentId)
      }
    } else if (contentType === 'quiz') {
      const quiz = findQuizById(contentId)
      if (quiz && quiz.isUnlocked) {
        setLearningState(prev => ({
          ...prev,
          selectedQuizId: contentId,
          selectedLessonId: null,
          currentContent: {
            type: 'quiz',
            data: quiz
          }
        }))
      }
    }
  }, [enrollmentId])
  
  // Progress completion logic
  const completeLesson = useCallback(async (lessonId: string) => {
    try {
      const response = await fetch(`/api/lesson-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          enrollmentId,
          lessonId,
          completedAt: new Date().toISOString(),
          progress: 100
        })
      })
      
      if (response.ok) {
        const updatedProgress = await response.json()
        updateLessonProgress(lessonId, updatedProgress)
        
        // Check if module is completed
        checkModuleCompletion(lessonId)
        
        // Auto-navigate to next content
        navigateToNextContent()
      }
    } catch (error) {
      // Queue for offline sync
      queueProgressUpdate({
        type: 'LESSON_COMPLETED',
        enrollmentId,
        lessonId,
        timestamp: Date.now()
      })
    }
  }, [enrollmentId])
  
  // Module completion check
  const checkModuleCompletion = useCallback((lessonId: string) => {
    const lesson = findLessonById(lessonId)
    if (!lesson) return
    
    const module = findModuleById(lesson.moduleId)
    if (!module) return
    
    const completedLessons = module.lessons.filter(l => l.isCompleted).length
    const completedQuizzes = module.quizzes.filter(q => q.isCompleted).length
    
    const moduleProgress = {
      moduleId: module.id,
      lessonsCompleted: completedLessons,
      totalLessons: module.lessons.length,
      quizzesCompleted: completedQuizzes,
      totalQuizzes: module.quizzes.length,
      progress: Math.round(
        ((completedLessons + completedQuizzes) / (module.lessons.length + module.quizzes.length)) * 100
      ),
      isCompleted: completedLessons === module.lessons.length && completedQuizzes === module.quizzes.length
    }
    
    if (moduleProgress.isCompleted) {
      unlockNextModule(module.order + 1)
    }
    
    updateModuleProgress(module.id, moduleProgress)
  }, [])
  
  return (
    <div className="learning-interface">
      <LearningLayout
        sidebar={
          <LearningNavigation
            modules={learningState.modules}
            selectedLessonId={learningState.selectedLessonId}
            selectedQuizId={learningState.selectedQuizId}
            onContentSelect={selectContent}
            progress={learningState.enrollment.progress}
          />
        }
        content={
          <LearningContent
            content={learningState.currentContent}
            onLessonComplete={completeLesson}
            onQuizComplete={completeQuiz}
            onVideoProgress={trackVideoProgress}
          />
        }
      />
    </div>
  )
}
```

### 11.2 Advanced Video Player System

**VideoPlayer Component Implementation**:
```typescript
interface VideoPlayerProps {
  src: string
  title: string
  lessonId: string
  enrollmentId: string
  poster?: string
  autoplay?: boolean
  onProgress?: (progress: VideoProgress) => void
  onComplete?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

interface VideoProgress {
  lessonId: string
  currentTime: number
  duration: number
  progress: number // 0-100
  watchedDuration: number
  bufferTime: number
  lastUpdated: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  lessonId,
  enrollmentId,
  poster,
  autoplay = false,
  onProgress,
  onComplete,
  onTimeUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState<TimeRanges | null>(null)
  
  // Progress tracking with debouncing
  const progressUpdateRef = useRef<NodeJS.Timeout>()
  const lastProgressUpdate = useRef(0)
  
  // Video source processing (MinIO proxy)
  const processVideoSource = useCallback((source: string): string => {
    // Handle MinIO URLs through proxy
    if (source.includes('minio') || source.includes('s3')) {
      return `/api/video-proxy?url=${encodeURIComponent(source)}`
    }
    
    // Handle YouTube URLs
    if (source.includes('youtube.com') || source.includes('youtu.be')) {
      const videoId = extractYouTubeVideoId(source)
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
    }
    
    return source
  }, [])
  
  // Time update handler with progress tracking
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    
    setCurrentTime(current)
    setBuffered(videoRef.current.buffered)
    
    // Update progress every 5 seconds or at 25%, 50%, 75%, 100%
    const progressPercent = (current / total) * 100
    const milestones = [25, 50, 75, 100]
    const shouldUpdate = 
      Date.now() - lastProgressUpdate.current > 5000 || // Every 5 seconds
      milestones.some(milestone => 
        progressPercent >= milestone && 
        (lastProgressUpdate.current === 0 || (lastProgressUpdate.current / total) * 100 < milestone)
      )
    
    if (shouldUpdate) {
      const videoProgress: VideoProgress = {
        lessonId,
        currentTime: current,
        duration: total,
        progress: progressPercent,
        watchedDuration: current,
        bufferTime: getBufferedTime(videoRef.current.buffered, current),
        lastUpdated: new Date().toISOString()
      }
      
      onProgress?.(videoProgress)
      onTimeUpdate?.(current, total)
      
      // API call to track progress
      trackVideoProgress(enrollmentId, lessonId, videoProgress)
      
      lastProgressUpdate.current = current
    }
    
    // Check for completion (watched 95% or more)
    if (progressPercent >= 95 && !videoRef.current.paused) {
      onComplete?.()
    }
  }, [lessonId, enrollmentId, onProgress, onTimeUpdate, onComplete])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          seekRelative(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          seekRelative(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          adjustVolume(0.1)
          break
        case 'ArrowDown':
          e.preventDefault()
          adjustVolume(-0.1)
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // Mobile-specific adaptations
  const mobileControls = Platform.OS !== 'web' ? {
    // React Native Video Player props
    resizeMode: 'contain',
    controls: true,
    onProgress: handleTimeUpdate,
    onLoad: (data: any) => {
      setDuration(data.duration)
      setLoading(false)
    },
    onError: (error: any) => {
      setError(error.error?.localizedDescription || 'Video playback error')
    }
  } : {}
  
  return (
    <div className="video-player-container">
      {/* Web Video Player */}
      {Platform.OS === 'web' ? (
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src={processVideoSource(src)}
            poster={poster}
            autoPlay={autoplay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              setDuration(videoRef.current?.duration || 0)
              setLoading(false)
            }}
            onError={(e) => setError('Failed to load video')}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={onComplete}
            className="video-element"
          />
          
          {/* Custom Controls Overlay */}
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            playbackRate={playbackRate}
            buffered={buffered}
            onPlay={togglePlay}
            onSeek={seekTo}
            onVolumeChange={setVolume}
            onMute={toggleMute}
            onPlaybackRateChange={setPlaybackRate}
            onFullscreen={toggleFullscreen}
            visible={showControls}
          />
        </div>
      ) : (
        /* React Native Video Player */
        <Video
          source={{ uri: processVideoSource(src) }}
          style={styles.videoPlayer}
          {...mobileControls}
        />
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="video-loading">
          <Spinner />
          <p>Loading video...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="video-error">
          <AlertCircle className="error-icon" />
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}

// Video proxy API implementation
// API Route: /api/video-proxy
async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoUrl = searchParams.get('url')
  
  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 })
  }
  
  try {
    // Fetch video from MinIO with proper authentication
    const response = await fetch(videoUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.MINIO_ACCESS_TOKEN}`,
        'Range': request.headers.get('range') || 'bytes=0-'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch video')
    }
    
    // Stream video with proper headers
    return new Response(response.body, {
      status: 206,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'video/mp4',
        'Content-Length': response.headers.get('content-length') || '',
        'Content-Range': response.headers.get('content-range') || '',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    return new Response('Video proxy error', { status: 500 })
  }
}

// Video progress tracking API
async function trackVideoProgress(
  enrollmentId: string, 
  lessonId: string, 
  progress: VideoProgress
): Promise<void> {
  try {
    await fetch('/api/video-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        enrollmentId,
        lessonId,
        ...progress
      })
    })
  } catch (error) {
    // Queue for offline sync
    OfflineStorage.queueProgressUpdate({
      type: 'VIDEO_PROGRESS',
      enrollmentId,
      lessonId,
      data: progress,
      timestamp: Date.now()
    })
  }
}
```

### 11.3 Complete Quiz System Architecture

**Quiz Component Implementation**:
```typescript
interface Quiz {
  id: string
  moduleId: string
  title: string
  description: string
  instructions: string
  questions: Question[]
  passingScore: number // percentage
  timeLimit?: number // minutes
  maxAttempts: number
  isRequired: boolean
  order: number
  isUnlocked: boolean
  attempts: QuizAttempt[]
  bestScore?: number
}

interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[] // for multiple choice
  correctAnswer: string | string[] // single answer or multiple for multi-select
  explanation?: string
  points: number
  timeLimit?: number // seconds per question
  order: number
}

type QuestionType = 
  | "MULTIPLE_CHOICE"     // Single correct answer from options
  | "TRUE_FALSE"          // True or false question
  | "MULTIPLE_SELECT"     // Multiple correct answers from options
  | "SHORT_ANSWER"        // Short text input
  | "FILL_BLANK"          // Fill in the blank with specific answers

interface QuizAttempt {
  id: string
  quizId: string
  enrollmentId: string
  startedAt: string
  completedAt?: string
  timeSpent: number // seconds
  answers: QuizAnswer[]
  score: number // percentage
  passed: boolean
  attemptNumber: number
}

interface QuizAnswer {
  questionId: string
  answer: string | string[]
  isCorrect: boolean
  timeSpent: number
  pointsEarned: number
}

const QuizComponent: React.FC<QuizProps> = ({ 
  quiz, 
  enrollmentId, 
  onComplete,
  onCancel 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null)
  
  const currentQuestion = quiz.questions[currentQuestionIndex]
  
  // Start quiz
  const startQuiz = useCallback(async () => {
    try {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          quizId: quiz.id,
          enrollmentId
        })
      })
      
      if (response.ok) {
        const newAttempt = await response.json()
        setAttempt(newAttempt)
        setQuizStarted(true)
        
        // Set question timer if applicable
        if (currentQuestion.timeLimit) {
          setQuestionTimeLeft(currentQuestion.timeLimit)
        }
      }
    } catch (error) {
      console.error('Failed to start quiz:', error)
    }
  }, [quiz.id, enrollmentId])
  
  // Submit answer for current question
  const submitAnswer = useCallback((answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
    
    // Auto-advance to next question
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      
      // Reset question timer
      const nextQuestion = quiz.questions[currentQuestionIndex + 1]
      if (nextQuestion.timeLimit) {
        setQuestionTimeLeft(nextQuestion.timeLimit)
      }
    } else {
      // Last question, submit quiz
      submitQuiz()
    }
  }, [currentQuestion, currentQuestionIndex, quiz.questions])
  
  // Submit entire quiz
  const submitQuiz = useCallback(async () => {
    if (!attempt) return
    
    try {
      const quizAnswers = quiz.questions.map(question => ({
        questionId: question.id,
        answer: answers[question.id] || '',
        timeSpent: 30 // This would be tracked per question
      }))
      
      const response = await fetch(`/api/quiz-attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          answers: quizAnswers,
          completedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        const completedAttempt = await response.json()
        setAttempt(completedAttempt)
        setShowResults(true)
        
        if (completedAttempt.passed) {
          onComplete?.(completedAttempt)
        }
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }
  }, [attempt, answers, quiz.questions, onComplete])
  
  // Timer effects
  useEffect(() => {
    if (!quizStarted) return
    
    let timer: NodeJS.Timeout
    
    // Quiz-wide timer
    if (timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev! - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Time's up, auto-submit
      submitQuiz()
    }
    
    return () => clearTimeout(timer)
  }, [timeLeft, quizStarted])
  
  useEffect(() => {
    if (!questionTimeLeft) return
    
    let timer: NodeJS.Timeout
    
    if (questionTimeLeft > 0) {
      timer = setTimeout(() => {
        setQuestionTimeLeft(prev => prev! - 1)
      }, 1000)
    } else if (questionTimeLeft === 0) {
      // Question time's up, auto-submit current answer
      submitAnswer(answers[currentQuestion.id] || '')
    }
    
    return () => clearTimeout(timer)
  }, [questionTimeLeft])
  
  // Question renderer based on type
  const renderQuestion = useCallback((question: Question) => {
    const currentAnswer = answers[question.id]
    
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceQuestion
            question={question}
            selectedAnswer={currentAnswer as string}
            onAnswerSelect={(answer) => submitAnswer(answer)}
          />
        )
        
      case 'TRUE_FALSE':
        return (
          <TrueFalseQuestion
            question={question}
            selectedAnswer={currentAnswer as string}
            onAnswerSelect={(answer) => submitAnswer(answer)}
          />
        )
        
      case 'MULTIPLE_SELECT':
        return (
          <MultipleSelectQuestion
            question={question}
            selectedAnswers={currentAnswer as string[] || []}
            onAnswersChange={(answers) => submitAnswer(answers)}
            onSubmit={() => submitAnswer(currentAnswer || [])}
          />
        )
        
      case 'SHORT_ANSWER':
        return (
          <ShortAnswerQuestion
            question={question}
            answer={currentAnswer as string || ''}
            onAnswerChange={(answer) => setAnswers(prev => ({
              ...prev,
              [question.id]: answer
            }))}
            onSubmit={() => submitAnswer(currentAnswer || '')}
          />
        )
        
      case 'FILL_BLANK':
        return (
          <FillBlankQuestion
            question={question}
            answer={currentAnswer as string || ''}
            onAnswerChange={(answer) => setAnswers(prev => ({
              ...prev,
              [question.id]: answer
            }))}
            onSubmit={() => submitAnswer(currentAnswer || '')}
          />
        )
        
      default:
        return <div>Unsupported question type</div>
    }
  }, [answers, submitAnswer])
  
  if (!quizStarted) {
    return (
      <QuizIntroduction
        quiz={quiz}
        onStart={startQuiz}
        onCancel={onCancel}
      />
    )
  }
  
  if (showResults && attempt) {
    return (
      <QuizResults
        quiz={quiz}
        attempt={attempt}
        onRetry={quiz.attempts.length < quiz.maxAttempts ? startQuiz : undefined}
        onClose={onComplete}
      />
    )
  }
  
  return (
    <div className="quiz-container">
      {/* Quiz Header */}
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <div className="quiz-progress">
          <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <ProgressBar 
            value={currentQuestionIndex + 1} 
            max={quiz.questions.length} 
          />
        </div>
        
        {/* Timers */}
        <div className="timers">
          {timeLeft !== null && (
            <div className="quiz-timer">
              Total: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
          {questionTimeLeft !== null && (
            <div className="question-timer">
              Question: {questionTimeLeft}s
            </div>
          )}
        </div>
      </div>
      
      {/* Question Content */}
      <div className="question-content">
        {renderQuestion(currentQuestion)}
      </div>
      
      {/* Navigation */}
      <div className="quiz-navigation">
        <Button 
          variant="outline" 
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Button onClick={onCancel} variant="ghost">
          Cancel Quiz
        </Button>
        
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <Button onClick={submitQuiz}>
            Submit Quiz
          </Button>
        ) : (
          <Button 
            onClick={() => submitAnswer(answers[currentQuestion.id] || '')}
            disabled={!answers[currentQuestion.id]}
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  )
}

// Individual Question Components
const MultipleChoiceQuestion: React.FC<MultipleChoiceProps> = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect 
}) => (
  <div className="multiple-choice-question">
    <h3>{question.question}</h3>
    <div className="options">
      {question.options?.map((option, index) => (
        <label key={index} className="option">
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={selectedAnswer === option}
            onChange={() => onAnswerSelect(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
)

const TrueFalseQuestion: React.FC<TrueFalseProps> = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect 
}) => (
  <div className="true-false-question">
    <h3>{question.question}</h3>
    <div className="options">
      <label className="option">
        <input
          type="radio"
          name={question.id}
          value="true"
          checked={selectedAnswer === "true"}
          onChange={() => onAnswerSelect("true")}
        />
        <span>True</span>
      </label>
      <label className="option">
        <input
          type="radio"
          name={question.id}
          value="false"
          checked={selectedAnswer === "false"}
          onChange={() => onAnswerSelect("false")}
        />
        <span>False</span>
      </label>
    </div>
  </div>
)

const MultipleSelectQuestion: React.FC<MultipleSelectProps> = ({ 
  question, 
  selectedAnswers, 
  onAnswersChange,
  onSubmit 
}) => {
  const toggleAnswer = (option: string) => {
    const newAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter(a => a !== option)
      : [...selectedAnswers, option]
    onAnswersChange(newAnswers)
  }
  
  return (
    <div className="multiple-select-question">
      <h3>{question.question}</h3>
      <p className="instruction">Select all that apply</p>
      <div className="options">
        {question.options?.map((option, index) => (
          <label key={index} className="option">
            <input
              type="checkbox"
              checked={selectedAnswers.includes(option)}
              onChange={() => toggleAnswer(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <Button 
        onClick={onSubmit} 
        disabled={selectedAnswers.length === 0}
        className="submit-answer"
      >
        Submit Answer
      </Button>
    </div>
  )
}

const ShortAnswerQuestion: React.FC<ShortAnswerProps> = ({ 
  question, 
  answer, 
  onAnswerChange,
  onSubmit 
}) => (
  <div className="short-answer-question">
    <h3>{question.question}</h3>
    <textarea
      value={answer}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Enter your answer..."
      className="answer-input"
    />
    <Button 
      onClick={onSubmit} 
      disabled={!answer.trim()}
      className="submit-answer"
    >
      Submit Answer
    </Button>
  </div>
)

const FillBlankQuestion: React.FC<FillBlankProps> = ({ 
  question, 
  answer, 
  onAnswerChange,
  onSubmit 
}) => {
  // Parse question text to identify blanks (marked with ____)
  const questionParts = question.question.split('____')
  
  return (
    <div className="fill-blank-question">
      <h3>Fill in the blank</h3>
      <div className="question-text">
        {questionParts.map((part, index) => (
          <span key={index}>
            {part}
            {index < questionParts.length - 1 && (
              <input
                type="text"
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="blank-input"
                placeholder="..."
              />
            )}
          </span>
        ))}
      </div>
      <Button 
        onClick={onSubmit} 
        disabled={!answer.trim()}
        className="submit-answer"
      >
        Submit Answer
      </Button>
    </div>
  )
}

// Quiz Results Component
const QuizResults: React.FC<QuizResultsProps> = ({ 
  quiz, 
  attempt, 
  onRetry, 
  onClose 
}) => {
  const { score, passed, answers } = attempt
  
  return (
    <div className="quiz-results">
      <div className="results-header">
        <h2>Quiz Results</h2>
        <div className={`score ${passed ? 'passed' : 'failed'}`}>
          {score}%
        </div>
        <p className="result-message">
          {passed 
            ? `Congratulations! You passed with ${score}%` 
            : `You need ${quiz.passingScore}% to pass. You scored ${score}%`
          }
        </p>
      </div>
      
      {/* Detailed Results */}
      <div className="detailed-results">
        <h3>Question Review</h3>
        {quiz.questions.map((question, index) => {
          const userAnswer = answers.find(a => a.questionId === question.id)
          const isCorrect = userAnswer?.isCorrect || false
          
          return (
            <div key={question.id} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                <span className="points">{userAnswer?.pointsEarned || 0}/{question.points} pts</span>
              </div>
              
              <p className="question-text">{question.question}</p>
              
              <div className="answer-review">
                <p><strong>Your answer:</strong> {userAnswer?.answer}</p>
                {!isCorrect && (
                  <p><strong>Correct answer:</strong> {question.correctAnswer}</p>
                )}
                {question.explanation && (
                  <p className="explanation"><strong>Explanation:</strong> {question.explanation}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Actions */}
      <div className="results-actions">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Retry Quiz ({quiz.maxAttempts - quiz.attempts.length} attempts left)
          </Button>
        )}
        <Button onClick={onClose}>
          {passed ? 'Continue Learning' : 'Back to Course'}
        </Button>
      </div>
    </div>
  )
}
```

### 11.4 Advanced Progress Tracking System

**Real-time Progress APIs**:
```typescript
// API Endpoints for Learning Progress

// POST /api/lesson-progress - Track lesson completion
interface LessonProgressRequest {
  enrollmentId: string
  lessonId: string
  progress: number // 0-100
  timeSpent: number // seconds
  completedAt?: string
  lastPosition?: number // for videos
}

// POST /api/video-progress - Track video watching progress
interface VideoProgressRequest {
  enrollmentId: string
  lessonId: string
  currentTime: number
  duration: number
  watchedDuration: number
  bufferTime: number
}

// PUT /api/course-enrollments/{id} - Update overall enrollment
interface EnrollmentUpdateRequest {
  progress: number
  status: EnrollmentStatus
  currentLesson?: string
  currentModule?: string
  timeSpent: number
  lastAccessedAt: string
}

// GET /api/enrollments/{id}/learning - Get complete learning data
interface LearningDataResponse {
  enrollment: CourseEnrollment
  course: DetailedCourse
  modules: Module[]
  lessonProgress: LessonProgress[]
  quizAttempts: QuizAttempt[]
  videoProgress: VideoProgress[]
  overallProgress: {
    lessonsCompleted: number
    totalLessons: number
    quizzesCompleted: number
    totalQuizzes: number
    modulesCompleted: number
    totalModules: number
    timeSpent: number
    estimatedTimeRemaining: number
  }
}

// Progress tracking hooks for React Native
const useProgressTracking = (enrollmentId: string) => {
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [syncing, setSyncing] = useState(false)
  const syncQueue = useRef<ProgressUpdate[]>([])
  
  // Queue progress updates for offline sync
  const queueProgressUpdate = useCallback((update: ProgressUpdate) => {
    syncQueue.current.push(update)
    
    // Store in AsyncStorage for persistence
    AsyncStorage.setItem(
      `progress_queue_${enrollmentId}`, 
      JSON.stringify(syncQueue.current)
    )
    
    // Attempt immediate sync if online
    if (navigator.onLine) {
      syncProgress()
    }
  }, [enrollmentId])
  
  // Sync queued progress updates
  const syncProgress = useCallback(async () => {
    if (syncing || syncQueue.current.length === 0) return
    
    setSyncing(true)
    
    try {
      for (const update of syncQueue.current) {
        await syncSingleUpdate(update)
      }
      
      // Clear queue on successful sync
      syncQueue.current = []
      await AsyncStorage.removeItem(`progress_queue_${enrollmentId}`)
      
    } catch (error) {
      console.log('Progress sync failed, will retry later')
    } finally {
      setSyncing(false)
    }
  }, [syncing, enrollmentId])
  
  // Sync individual progress update
  const syncSingleUpdate = async (update: ProgressUpdate) => {
    const endpoint = getProgressEndpoint(update.type)
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(update.data)
    })
  }
  
  // Track lesson completion
  const trackLessonCompletion = useCallback(async (lessonId: string) => {
    const update: ProgressUpdate = {
      id: generateId(),
      type: 'LESSON_COMPLETION',
      enrollmentId,
      data: {
        lessonId,
        progress: 100,
        completedAt: new Date().toISOString(),
        timeSpent: getCurrentLessonTime()
      },
      timestamp: Date.now(),
      synced: false
    }
    
    // Optimistic update
    setProgress(prev => prev ? {
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1,
      progress: calculateOverallProgress(prev.lessonsCompleted + 1, prev.totalLessons)
    } : null)
    
    queueProgressUpdate(update)
  }, [enrollmentId, queueProgressUpdate])
  
  // Track video progress
  const trackVideoProgress = useCallback(async (
    lessonId: string, 
    currentTime: number, 
    duration: number
  ) => {
    const update: ProgressUpdate = {
      id: generateId(),
      type: 'VIDEO_PROGRESS',
      enrollmentId,
      data: {
        lessonId,
        currentTime,
        duration,
        progress: (currentTime / duration) * 100,
        lastUpdated: new Date().toISOString()
      },
      timestamp: Date.now(),
      synced: false
    }
    
    queueProgressUpdate(update)
  }, [enrollmentId, queueProgressUpdate])
  
  // Load progress on mount
  useEffect(() => {
    loadProgress()
    loadQueuedUpdates()
  }, [enrollmentId])
  
  // Auto-sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      if (syncQueue.current.length > 0) {
        syncProgress()
      }
    }
    
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncProgress])
  
  return {
    progress,
    syncing,
    trackLessonCompletion,
    trackVideoProgress,
    syncProgress,
    queuedUpdates: syncQueue.current.length
  }
}
```

### 11.5 Resource Management System

**Resource Types and Implementation**:
```typescript
interface Resource {
  id: string
  lessonId?: string
  moduleId?: string
  courseId: string
  title: string
  description?: string
  type: ResourceType
  url: string
  fileSize?: number
  mimeType?: string
  downloadUrl?: string
  previewUrl?: string
  isDownloadable: boolean
  isRequired: boolean
  order: number
  metadata?: ResourceMetadata
}

type ResourceType = 
  | "PDF"           // PDF documents
  | "VIDEO"         // Video files
  | "AUDIO"         // Audio files
  | "IMAGE"         // Images
  | "DOCUMENT"      // Word, PowerPoint, etc.
  | "LINK"          // External links
  | "ZIP"           // Compressed files
  | "PRESENTATION"  // Slide presentations

interface ResourceMetadata {
  // For documents
  pageCount?: number
  wordCount?: number
  
  // For media
  duration?: number
  dimensions?: { width: number; height: number }
  
  // For links
  domain?: string
  isExternal?: boolean
  
  // Common
  language?: string
  tags?: string[]
  author?: string
  createdAt?: string
  updatedAt?: string
}

// Resource viewer component
const ResourceViewer: React.FC<ResourceViewerProps> = ({ 
  resource, 
  onDownload,
  onShare,
  onClose 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  
  const renderResourceContent = () => {
    switch (resource.type) {
      case 'PDF':
        return (
          <PDFViewer
            url={resource.previewUrl || resource.url}
            onLoad={() => setLoading(false)}
            onError={(err) => setError(err.message)}
          />
        )
        
      case 'IMAGE':
        return (
          <ImageViewer
            src={resource.url}
            alt={resource.title}
            onLoad={() => setLoading(false)}
            onError={() => setError('Failed to load image')}
          />
        )
        
      case 'VIDEO':
        return (
          <VideoPlayer
            src={resource.url}
            title={resource.title}
            poster={resource.metadata?.thumbnailUrl}
            onLoad={() => setLoading(false)}
            onError={() => setError('Failed to load video')}
          />
        )
        
      case 'LINK':
        return (
          <LinkPreview
            url={resource.url}
            title={resource.title}
            description={resource.description}
            metadata={resource.metadata}
            onLoad={() => setLoading(false)}
          />
        )
        
      default:
        return (
          <GenericResourceView
            resource={resource}
            onDownload={onDownload}
          />
        )
    }
  }
  
  // Download resource for offline access
  const handleDownload = useCallback(async () => {
    if (!resource.isDownloadable) return
    
    try {
      setDownloadProgress(0)
      
      // For React Native, use react-native-fs
      if (Platform.OS !== 'web') {
        const { downloadFile } = require('react-native-fs')
        
        const downloadDest = `${DocumentDirectoryPath}/cemse_resources/${resource.id}_${resource.title}`
        
        const download = downloadFile({
          fromUrl: resource.downloadUrl || resource.url,
          toFile: downloadDest,
          progress: (res) => {
            const progress = (res.bytesWritten / res.contentLength) * 100
            setDownloadProgress(progress)
          }
        })
        
        const result = await download.promise
        
        if (result.statusCode === 200) {
          // Save resource metadata
          await AsyncStorage.setItem(
            `resource_${resource.id}`,
            JSON.stringify({
              ...resource,
              localPath: downloadDest,
              downloadedAt: new Date().toISOString()
            })
          )
          
          onDownload?.(downloadDest)
          
          // Show success alert
          Alert.alert(
            'Download Complete',
            `${resource.title} has been downloaded and is available offline.`,
            [{ text: 'OK' }]
          )
        }
      } else {
        // Web download
        const response = await fetch(resource.downloadUrl || resource.url)
        const blob = await response.blob()
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = resource.title
        a.click()
        
        URL.revokeObjectURL(url)
        onDownload?.(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
      Alert.alert('Download Failed', 'Unable to download resource. Please try again.')
    }
  }, [resource, onDownload])
  
  // Share resource
  const handleShare = useCallback(async () => {
    try {
      if (Platform.OS !== 'web' && navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description || '',
          url: resource.url
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(resource.url)
        Alert.alert('Link Copied', 'Resource link copied to clipboard')
      }
      
      onShare?.(resource)
    } catch (error) {
      console.error('Share failed:', error)
    }
  }, [resource, onShare])
  
  return (
    <Modal isOpen onClose={onClose} size="full">
      <ModalHeader>
        <div className="resource-header">
          <div className="resource-info">
            <h2>{resource.title}</h2>
            {resource.description && (
              <p className="resource-description">{resource.description}</p>
            )}
            <div className="resource-metadata">
              <Badge variant="outline">{resource.type}</Badge>
              {resource.fileSize && (
                <span className="file-size">
                  {formatFileSize(resource.fileSize)}
                </span>
              )}
              {resource.metadata?.duration && (
                <span className="duration">
                  {formatDuration(resource.metadata.duration)}
                </span>
              )}
            </div>
          </div>
          
          <div className="resource-actions">
            {resource.isDownloadable && (
              <Button onClick={handleDownload} variant="outline">
                <Download className="icon" />
                Download
              </Button>
            )}
            <Button onClick={handleShare} variant="outline">
              <Share className="icon" />
              Share
            </Button>
            <Button onClick={onClose} variant="ghost">
              <X className="icon" />
            </Button>
          </div>
        </div>
      </ModalHeader>
      
      <ModalContent>
        {loading && (
          <div className="resource-loading">
            <Spinner />
            <p>Loading resource...</p>
          </div>
        )}
        
        {error && (
          <div className="resource-error">
            <AlertCircle className="error-icon" />
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}
        
        {downloadProgress > 0 && downloadProgress < 100 && (
          <div className="download-progress">
            <p>Downloading... {Math.round(downloadProgress)}%</p>
            <ProgressBar value={downloadProgress} max={100} />
          </div>
        )}
        
        <div className="resource-content">
          {renderResourceContent()}
        </div>
      </ModalContent>
    </Modal>
  )
}

// Resource icons mapping
const getResourceIcon = (type: ResourceType): React.ComponentType => {
  const iconMap = {
    PDF: FileText,
    VIDEO: Video,
    AUDIO: Music,
    IMAGE: Image,
    DOCUMENT: FileText,
    LINK: ExternalLink,
    ZIP: Archive,
    PRESENTATION: Presentation
  }
  
  return iconMap[type] || File
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
```

### 11.6 Complete API Specifications

**Learning-Specific Endpoints**:
```typescript
// GET /api/enrollments/{enrollmentId}/learning
interface LearningDataResponse {
  enrollment: CourseEnrollment & {
    currentModule: Module
    currentLesson: Lesson
    nextContent: LearningContent
  }
  course: DetailedCourse
  modules: Module[]
  progress: {
    lessons: LessonProgress[]
    videos: VideoProgress[]
    quizzes: QuizAttempt[]
    overall: OverallProgress
  }
  permissions: {
    canDownloadResources: boolean
    canTakeQuizzes: boolean
    canSkipLessons: boolean
  }
}

// POST /api/lesson-progress
interface LessonProgressRequest {
  enrollmentId: string
  lessonId: string
  progress: number
  timeSpent: number
  completedAt?: string
  lastPosition?: number
}

interface LessonProgressResponse {
  id: string
  progress: LessonProgress
  moduleProgress: ModuleProgress
  enrollmentProgress: EnrollmentProgress
  nextContent?: LearningContent
  achievements?: Achievement[]
}

// POST /api/video-progress
interface VideoProgressRequest {
  enrollmentId: string
  lessonId: string
  currentTime: number
  duration: number
  progress: number
  watchedDuration: number
}

// POST /api/quiz-attempts
interface QuizAttemptRequest {
  quizId: string
  enrollmentId: string
}

interface QuizAttemptResponse {
  attempt: QuizAttempt
  quiz: Quiz
  previousAttempts: QuizAttempt[]
  canRetake: boolean
}

// POST /api/quiz-attempts/{attemptId}/submit
interface QuizSubmitRequest {
  answers: QuizAnswer[]
  completedAt: string
  timeSpent: number
}

interface QuizSubmitResponse {
  attempt: QuizAttempt
  results: {
    score: number
    passed: boolean
    correctAnswers: number
    totalQuestions: number
    timeSpent: number
    detailed: QuestionResult[]
  }
  nextContent?: LearningContent
  certificate?: Certificate
}

// GET /api/resources/{resourceId}/download
// Returns file stream with proper headers for downloading

// GET /api/video-proxy
interface VideoProxyParams {
  url: string
  range?: string
}
// Returns video stream with proper range headers for streaming
```

### 11.7 Mobile Implementation Strategy

**React Native Specific Adaptations**:
```typescript
// Mobile Video Player using react-native-video
import Video from 'react-native-video'
import RNFS from 'react-native-fs'

const MobileVideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  onProgress,
  onComplete 
}) => {
  const [downloadedPath, setDownloadedPath] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  
  // Download video for offline viewing
  const downloadVideo = useCallback(async () => {
    setDownloading(true)
    
    try {
      const downloadDest = `${RNFS.DocumentDirectoryPath}/videos/${lessonId}.mp4`
      
      const download = RNFS.downloadFile({
        fromUrl: src,
        toFile: downloadDest,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100
          // Update download progress
        }
      })
      
      await download.promise
      setDownloadedPath(downloadDest)
      
    } catch (error) {
      console.error('Video download failed:', error)
    } finally {
      setDownloading(false)
    }
  }, [src, lessonId])
  
  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: downloadedPath || src }}
        style={styles.video}
        controls={true}
        resizeMode="contain"
        onProgress={onProgress}
        onEnd={onComplete}
        onError={(error) => console.error('Video error:', error)}
        // Add background audio support
        audioOnly={false}
        playInBackground={true}
        playWhenInactive={true}
      />
      
      {!downloadedPath && (
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={downloadVideo}
          disabled={downloading}
        >
          <Text>{downloading ? 'Downloading...' : 'Download for Offline'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// Mobile Quiz Results with Native Alerts
const MobileQuizResults: React.FC<QuizResultsProps> = ({ 
  quiz, 
  attempt, 
  onComplete 
}) => {
  useEffect(() => {
    // Show native alert for quiz completion
    Alert.alert(
      'Quiz Complete!',
      `You scored ${attempt.score}% ${attempt.passed ? '- You passed!' : '- You need ' + quiz.passingScore + '% to pass'}`,
      [
        {
          text: attempt.passed ? 'Continue' : 'Review',
          onPress: () => onComplete(attempt)
        },
        ...(quiz.attempts.length < quiz.maxAttempts && !attempt.passed ? [{
          text: 'Retry',
          onPress: () => retakeQuiz()
        }] : [])
      ]
    )
  }, [attempt])
  
  return (
    <ScrollView style={styles.resultsContainer}>
      {/* Results content */}
    </ScrollView>
  )
}

// Native Resource Downloading
const downloadResource = async (resource: Resource): Promise<string> => {
  const downloadDest = `${RNFS.DocumentDirectoryPath}/resources/${resource.id}_${resource.title}`
  
  const download = RNFS.downloadFile({
    fromUrl: resource.downloadUrl || resource.url,
    toFile: downloadDest,
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`
    }
  })
  
  const result = await download.promise
  
  if (result.statusCode === 200) {
    // Save to AsyncStorage for offline access
    await AsyncStorage.setItem(
      `offline_resource_${resource.id}`,
      JSON.stringify({
        ...resource,
        localPath: downloadDest,
        downloadedAt: new Date().toISOString()
      })
    )
    
    return downloadDest
  }
  
  throw new Error('Download failed')
}

// Native Sharing
const shareResource = async (resource: Resource) => {
  try {
    await Share.share({
      title: resource.title,
      message: resource.description || '',
      url: resource.url
    })
  } catch (error) {
    console.error('Sharing failed:', error)
  }
}
```

### 11.8 Offline Learning Capabilities

**Complete Offline Course Structure**:
```typescript
interface OfflineCourse {
  courseId: string
  enrollmentId: string
  courseData: DetailedCourse
  modules: OfflineModule[]
  downloadedAt: string
  lastSyncAt: string
  totalSize: number // in bytes
  isComplete: boolean // all content downloaded
}

interface OfflineModule {
  moduleId: string
  lessons: OfflineLesson[]
  quizzes: OfflineQuiz[]
  resources: OfflineResource[]
  isComplete: boolean
}

interface OfflineLesson {
  lessonId: string
  lessonData: Lesson
  videoPath?: string // local file path for downloaded video
  contentData: string // cached HTML/text content
  isDownloaded: boolean
}

interface OfflineResource {
  resourceId: string
  resourceData: Resource
  localPath: string
  isDownloaded: boolean
}

// Offline Course Manager
export class OfflineCourseManager {
  private static readonly STORAGE_KEY = 'offline_courses'
  
  // Download entire course for offline access
  static async downloadCourse(enrollmentId: string): Promise<void> {
    try {
      // Get course learning data
      const response = await fetch(`/api/enrollments/${enrollmentId}/learning`)
      const learningData: LearningDataResponse = await response.json()
      
      const offlineCourse: OfflineCourse = {
        courseId: learningData.course.id,
        enrollmentId,
        courseData: learningData.course,
        modules: [],
        downloadedAt: new Date().toISOString(),
        lastSyncAt: new Date().toISOString(),
        totalSize: 0,
        isComplete: false
      }
      
      // Download each module
      for (const module of learningData.modules) {
        const offlineModule = await this.downloadModule(module)
        offlineCourse.modules.push(offlineModule)
        offlineCourse.totalSize += this.calculateModuleSize(offlineModule)
      }
      
      offlineCourse.isComplete = this.checkCourseComplete(offlineCourse)
      
      // Save to storage
      await this.saveOfflineCourse(offlineCourse)
      
    } catch (error) {
      console.error('Course download failed:', error)
      throw error
    }
  }
  
  // Download individual module
  private static async downloadModule(module: Module): Promise<OfflineModule> {
    const offlineModule: OfflineModule = {
      moduleId: module.id,
      lessons: [],
      quizzes: [],
      resources: [],
      isComplete: false
    }
    
    // Download lessons
    for (const lesson of module.lessons) {
      const offlineLesson = await this.downloadLesson(lesson)
      offlineModule.lessons.push(offlineLesson)
    }
    
    // Cache quizzes (no downloading needed, just data)
    for (const quiz of module.quizzes) {
      const offlineQuiz: OfflineQuiz = {
        quizId: quiz.id,
        quizData: quiz,
        isDownloaded: true
      }
      offlineModule.quizzes.push(offlineQuiz)
    }
    
    // Download resources
    for (const resource of module.resources) {
      if (resource.isDownloadable) {
        const offlineResource = await this.downloadResource(resource)
        offlineModule.resources.push(offlineResource)
      }
    }
    
    offlineModule.isComplete = this.checkModuleComplete(offlineModule)
    return offlineModule
  }
  
  // Download individual lesson
  private static async downloadLesson(lesson: Lesson): Promise<OfflineLesson> {
    const offlineLesson: OfflineLesson = {
      lessonId: lesson.id,
      lessonData: lesson,
      isDownloaded: false
    }
    
    try {
      // Download video if it's a video lesson
      if (lesson.type === 'VIDEO' && lesson.content.data.videoUrl) {
        const videoPath = await this.downloadVideo(lesson.content.data.videoUrl, lesson.id)
        offlineLesson.videoPath = videoPath
      }
      
      // Cache text content
      if (lesson.content.data.htmlContent || lesson.content.data.markdownContent) {
        offlineLesson.contentData = lesson.content.data.htmlContent || lesson.content.data.markdownContent || ''
      }
      
      offlineLesson.isDownloaded = true
      
    } catch (error) {
      console.error(`Failed to download lesson ${lesson.id}:`, error)
      offlineLesson.isDownloaded = false
    }
    
    return offlineLesson
  }
  
  // Download video file
  private static async downloadVideo(videoUrl: string, lessonId: string): Promise<string> {
    const downloadDest = `${RNFS.DocumentDirectoryPath}/videos/${lessonId}.mp4`
    
    const download = RNFS.downloadFile({
      fromUrl: videoUrl,
      toFile: downloadDest,
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    })
    
    const result = await download.promise
    
    if (result.statusCode === 200) {
      return downloadDest
    }
    
    throw new Error('Video download failed')
  }
  
  // Get offline course data
  static async getOfflineCourse(enrollmentId: string): Promise<OfflineCourse | null> {
    try {
      const stored = await AsyncStorage.getItem(`${this.STORAGE_KEY}_${enrollmentId}`)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to get offline course:', error)
      return null
    }
  }
  
  // Check if course is available offline
  static async isCourseAvailableOffline(enrollmentId: string): Promise<boolean> {
    const offlineCourse = await this.getOfflineCourse(enrollmentId)
    return offlineCourse?.isComplete || false
  }
  
  // Sync progress when back online
  static async syncOfflineProgress(enrollmentId: string): Promise<void> {
    try {
      const queuedUpdates = await AsyncStorage.getItem(`progress_queue_${enrollmentId}`)
      if (!queuedUpdates) return
      
      const updates: ProgressUpdate[] = JSON.parse(queuedUpdates)
      
      for (const update of updates) {
        try {
          await this.syncProgressUpdate(update)
        } catch (error) {
          console.log('Failed to sync update:', update.id)
          break // Stop on first failure
        }
      }
      
      // Clear synced updates
      await AsyncStorage.removeItem(`progress_queue_${enrollmentId}`)
      
    } catch (error) {
      console.error('Progress sync failed:', error)
    }
  }
  
  // Delete offline course data
  static async deleteOfflineCourse(enrollmentId: string): Promise<void> {
    try {
      const offlineCourse = await this.getOfflineCourse(enrollmentId)
      if (!offlineCourse) return
      
      // Delete all downloaded files
      for (const module of offlineCourse.modules) {
        for (const lesson of module.lessons) {
          if (lesson.videoPath) {
            await RNFS.unlink(lesson.videoPath)
          }
        }
        
        for (const resource of module.resources) {
          if (resource.localPath) {
            await RNFS.unlink(resource.localPath)
          }
        }
      }
      
      // Remove from storage
      await AsyncStorage.removeItem(`${this.STORAGE_KEY}_${enrollmentId}`)
      
    } catch (error) {
      console.error('Failed to delete offline course:', error)
    }
  }
}

// Offline Sync Service
export class OfflineSyncService {
  private static syncInProgress = false
  
  // Auto-sync when connection is restored
  static async autoSync(): Promise<void> {
    if (this.syncInProgress || !NetInfo.isConnected) return
    
    this.syncInProgress = true
    
    try {
      // Get all enrollments with queued updates
      const enrollments = await this.getEnrollmentsWithQueuedUpdates()
      
      for (const enrollmentId of enrollments) {
        await OfflineCourseManager.syncOfflineProgress(enrollmentId)
      }
      
      // Refresh course data
      await this.refreshCourseData()
      
    } catch (error) {
      console.error('Auto-sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }
  
  // Sync specific enrollment
  static async syncEnrollment(enrollmentId: string): Promise<void> {
    try {
      await OfflineCourseManager.syncOfflineProgress(enrollmentId)
      
      // Update offline course data with latest from server
      const response = await fetch(`/api/enrollments/${enrollmentId}/learning`)
      const learningData = await response.json()
      
      // Update offline course with new data
      await this.updateOfflineCourseData(enrollmentId, learningData)
      
    } catch (error) {
      console.error('Enrollment sync failed:', error)
      throw error
    }
  }
}
```

---

## 12. Production Deployment Checklist

### 12.1 Performance Requirements

**Minimum Performance Standards**:
- Course catalog load time: < 2 seconds
- Video playback start: < 3 seconds
- Quiz question transition: < 500ms
- Progress sync: < 1 second
- Offline course download: Show progress, allow cancellation
- Search results: < 1 second for 1000+ courses

**Memory Management**:
- Maximum video cache: 500MB
- Course data cache: 100MB
- Image cache: 200MB
- Automatic cleanup after 7 days of inactivity

**Battery Optimization**:
- Background video playback optimized for minimal battery drain
- Progress sync batching to reduce network calls
- Efficient image loading with lazy loading
- Video quality adaptation based on network conditions

### 12.2 Platform-Specific Features

**iOS Specific**:
- AVPlayer integration for video playback
- Background audio support for lessons
- Handoff support for continuing between devices
- Spotlight search integration for courses
- Widget support for course progress
- Picture-in-Picture video support

**Android Specific**:
- ExoPlayer integration for video playback
- Background sync with JobScheduler
- Android Auto support for audio lessons
- Adaptive icon support
- Scoped storage compliance
- Work profile support for enterprise

### 12.3 Security Considerations

**Video Security**:
- MinIO proxy with signed URLs (1-hour expiration)
- DRM protection for premium content
- Network security certificate pinning
- Video watermarking with user identification

**Data Protection**:
- Certificate PDF security with digital signatures
- Offline data encryption at rest
- Secure key storage using Keychain/Keystore
- GDPR compliance for user data

**Authentication**:
- JWT token refresh handling
- Biometric authentication support
- Session timeout management
- Multi-factor authentication support

### 12.4 Testing Requirements

**Unit Testing Coverage**: 80% minimum
- All data models and transformations
- Progress tracking calculations
- Video player controls
- Quiz scoring logic
- Offline sync mechanisms

**Integration Testing**:
- Complete learning flow (enrollment → completion → certificate)
- Video playback across different formats
- Quiz taking and scoring
- Offline download and sync
- Certificate generation and download

**Performance Testing**:
- 1000+ courses in catalog
- Large video files (1GB+)
- Concurrent quiz taking
- Network interruption scenarios
- Low storage scenarios

**Accessibility Testing**:
- Screen reader compatibility
- High contrast mode support
- Large text support
- Voice control compatibility
- Keyboard navigation (for external keyboards)

### 12.5 Monitoring and Analytics

**Performance Monitoring**:
- Video playback quality metrics
- Course completion rates
- Quiz attempt analytics
- Crash reporting and analysis
- Network error tracking

**User Analytics**:
- Learning path optimization
- Popular course tracking
- Progress completion patterns
- Certificate generation rates
- Offline usage patterns

**Business Metrics**:
- Course enrollment conversion rates
- User engagement time
- Certificate completion rates
- Mobile vs web usage patterns
- Feature adoption rates

This completes the comprehensive CEMSE Training module specification for production-ready mobile implementation with all learning management system features, offline capabilities, and platform-specific optimizations.