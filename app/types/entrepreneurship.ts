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
  type: 'Planificación' | 'Validación' | 'Finanzas' | 'Marketing' | 'Legal' | 'Operaciones';
  title: string;
  description: string;
  rating: number;
  downloads: number;
  category: string;
  fileType: 'document' | 'video' | 'template' | 'calculator' | 'guide';
  thumbnail?: string;
  duration?: string;
  fileSize?: string;
  author: string;
  tags: string[];
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