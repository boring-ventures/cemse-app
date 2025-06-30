export interface BusinessPlan {
  id: string;
  userId: string;
  title: string;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  completionPercentage: number;
  lastModified: string;
  createdAt: string;
  steps: BusinessPlanStep[];
}

export interface BusinessPlanStep {
  id: number;
  title: string;
  description: string;
  fields: FormField[];
  isCompleted: boolean;
  data: Record<string, any>;
  tips?: string[];
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'currency' | 'percentage';
  label: string;
  placeholder: string;
  required: boolean;
  value: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Resource {
  id: string;
  type: 'Video' | 'Plantilla' | 'Guía' | 'Herramienta' | 'Podcast';
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  title: string;
  description: string;
  category: string;
  duration: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  fileInfo: string;
  fileSize: string;
  publishDate: string;
  tags: string[];
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  isFavorite: boolean;
  author?: string;
}

export interface ResourceFilter {
  types: string[];
  levels: string[];
  categories: string[];
  durations: string[];
  dateRanges: string[];
  searchQuery: string;
}

export interface ResourceMetrics {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export interface EntrepreneurshipMetric {
  id: string;
  title: string;
  value: number | string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  isAvailable: boolean;
}

export interface BusinessModelCanvas {
  id: string;
  businessPlanId: string;
  blocks: CanvasBlock[];
  lastModified: string;
}

export interface CanvasBlock {
  id: string;
  title: string;
  content: string[];
  position: {
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
  };
  color: string;
}

export interface FinancialProjection {
  id: string;
  businessPlanId: string;
  timeframe: 'monthly' | 'quarterly' | 'yearly';
  periods: number;
  revenue: FinancialEntry[];
  costs: FinancialEntry[];
  breakEvenPoint: number;
  totalInvestment: number;
  roi: number;
  netProfit: number[];
}

export interface FinancialEntry {
  id: string;
  category: string;
  amount: number;
  description: string;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
}

export interface TabConfig {
  id: number;
  title: string;
  icon: string;
}

export interface PlanFormData {
  [stepId: number]: Record<string, string>;
}

export interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

export interface SortOption {
  id: string;
  label: string;
  value: string;
}

export interface DownloadProgress {
  resourceId: string;
  progress: number;
  isComplete: boolean;
  error?: string;
}

// Network and Mentorship Types
export interface Entrepreneur {
  id: string;
  name: string;
  avatar?: string;
  company: string;
  location: string;
  isOnline: boolean;
  lastSeen?: string;
  rating: number;
  ratingCount: number;
  description: string;
  skills: string[];
  lookingFor: string[];
  connections: number;
  isAvailableForNetworking: boolean;
  industry: string;
  companyStage: 'Idea' | 'MVP' | 'Growth' | 'Scale';
  joinedDate: string;
  profileCompletion: number;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeen?: string;
  rating: number;
  reviewCount: number;
  menteeCount: number;
  description: string;
  expertise: string[];
  responseTime: string;
  pricing: 'Gratuito' | string;
  achievements: string[];
  availability: TimeSlot[];
  experience: string;
  language: string[];
  sessionTypes: string[];
  totalSessions: number;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  duration: number; // in minutes
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'file' | 'system' | 'connection_request';
  metadata?: {
    fileName?: string;
    fileSize?: string;
    connectionStatus?: 'pending' | 'accepted' | 'declined';
  };
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  menteeId: string;
  mentorName: string;
  menteeName: string;
  scheduledDate: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  meetingType: 'virtual' | 'presencial';
  notes?: string;
  agenda?: string;
  rating?: number;
  review?: string;
  price: number;
  meetingLink?: string;
}

export interface NetworkEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'networking' | 'workshop' | 'demo_day' | 'conference';
  attendeesCount: number;
  maxAttendees?: number;
  price: number;
  organizer: string;
  image?: string;
  tags: string[];
  isUserAttending: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  lastActivity: string;
  participantCount: number;
  messageCount: number;
  tags: string[];
  isUserParticipating: boolean;
  isPinned: boolean;
  category: string;
}

export interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "3 meses"
  price: number;
  mentorId: string;
  mentorName: string;
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  curriculum: string[];
  benefits: string[];
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  category: string;
  rating: number;
  reviewCount: number;
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface NetworkFilter {
  industry: string[];
  companyStage: string[];
  location: string[];
  lookingFor: string[];
  skills: string[];
  availability: boolean;
  searchQuery: string;
}

export interface MentorFilter {
  expertise: string[];
  experienceLevel: string[];
  priceRange: string[];
  availability: string[];
  language: string[];
  sessionType: string[];
  searchQuery: string;
} 