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