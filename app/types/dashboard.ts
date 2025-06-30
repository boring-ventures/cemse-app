export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export interface QuickActionButton {
  id: string;
  title: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

export interface QuickAccessCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  metrics: string[];
  actions: QuickActionButton[];
  route: string;
}

export interface UserDashboardData {
  welcomeMessage: string;
  subtitle: string;
  metrics: DashboardMetric[];
  quickAccessCards: QuickAccessCard[];
}

export type UserRole = 'estudiante' | 'emprendedor' | 'profesional' | 'admin';

export interface DashboardState {
  isLoading: boolean;
  data: UserDashboardData | null;
  lastUpdated: Date | null;
  error: string | null;
} 