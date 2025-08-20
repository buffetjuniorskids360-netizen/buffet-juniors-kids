// Analytics categories and specialized metrics types

export type AnalyticsCategory = 'todas' | 'clientes' | 'eventos';

export interface CategoryMetrics {
  todas: OverallMetrics;
  clientes: ClientMetrics;
  eventos: EventMetrics;
}

// Overall analytics metrics (existing structure enhanced)
export interface OverallMetrics {
  // Financial overview
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  growthRate: number;
  
  // Business performance
  totalEvents: number;
  totalClients: number;
  conversionRate: number;
  averageEventValue: number;
  
  // Quick insights
  topPerformingPackage: string;
  busyMonth: string;
  revenueProjection: number;
}

// Client-focused analytics
export interface ClientMetrics {
  // Client acquisition
  totalClients: number;
  newClientsThisMonth: number;
  newClientsLastMonth: number;
  clientGrowthRate: number;
  
  // Client retention and value
  activeClients: number;
  retentionRate: number;
  averageClientLifetime: number;
  clientLifetimeValue: number;
  repeatClientRate: number;
  
  // Client demographics and behavior
  topClientsByRevenue: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    eventCount: number;
    averageEventValue: number;
  }>;
  
  clientAcquisitionTrend: Array<{
    month: string;
    newClients: number;
    retainedClients: number;
    churnedClients: number;
  }>;
  
  clientValueDistribution: Array<{
    segment: string; // 'Alto Valor', 'Médio Valor', 'Baixo Valor'
    count: number;
    totalRevenue: number;
    percentage: number;
  }>;
  
  // Client preferences
  preferredPackages: Array<{
    packageType: string;
    clientCount: number;
    averageValue: number;
  }>;
  
  averageTimeBetweenEvents: number; // in days
  seasonalClientActivity: Array<{
    month: string;
    activeClients: number;
    newEvents: number;
  }>;
}

// Event-focused analytics
export interface EventMetrics {
  // Event performance
  totalEvents: number;
  monthlyEvents: number;
  confirmedEvents: number;
  pendingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  cancellationRate: number;
  
  // Event value and booking patterns
  averageEventValue: number;
  totalEventRevenue: number;
  monthlyEventRevenue: number;
  revenuePerEvent: Array<{
    month: string;
    revenue: number;
    eventCount: number;
    averageValue: number;
  }>;
  
  // Booking conversion and efficiency
  bookingConversionRate: number;
  averageLeadTime: number; // days between booking and event
  peakBookingDays: Array<{
    dayOfWeek: string;
    bookingCount: number;
    percentage: number;
  }>;
  
  // Event types and packages
  packagePerformance: Array<{
    packageType: string;
    count: number;
    revenue: number;
    averageValue: number;
    growthRate: number;
    profitMargin?: number;
  }>;
  
  // Capacity and utilization
  averageGuestsPerEvent: number;
  capacityUtilization: number; // percentage
  guestCountDistribution: Array<{
    range: string; // '1-50', '51-100', etc.
    count: number;
    percentage: number;
    averageRevenue: number;
  }>;
  
  // Seasonal and temporal patterns
  seasonalEventPatterns: Array<{
    month: string;
    eventCount: number;
    revenue: number;
    averageGuestCount: number;
    popularPackages: string[];
  }>;
  
  eventTimingAnalysis: Array<{
    timeSlot: string; // 'Manhã', 'Tarde', 'Noite'
    count: number;
    averageRevenue: number;
    popularDays: string[];
  }>;
  
  // Event status progression
  statusConversion: {
    pendingToConfirmed: number;
    confirmedToCompleted: number;
    cancellationsByStage: Array<{
      stage: string;
      count: number;
      rate: number;
    }>;
  };
}

// Category configuration
export interface CategoryConfig {
  id: AnalyticsCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  primaryMetrics: string[];
  chartTypes: string[];
}

export const ANALYTICS_CATEGORIES: CategoryConfig[] = [
  {
    id: 'todas',
    name: 'Todas Analytics',
    description: 'Visão geral completa de todos os indicadores de negócio',
    icon: 'BarChart3',
    color: 'blue',
    primaryMetrics: ['revenue', 'events', 'clients', 'growth'],
    chartTypes: ['revenue', 'events', 'packages', 'payments']
  },
  {
    id: 'clientes',
    name: 'Clientes',
    description: 'Análise completa de aquisição, retenção e valor dos clientes',
    icon: 'Users',
    color: 'purple',
    primaryMetrics: ['acquisition', 'retention', 'lifetime_value', 'satisfaction'],
    chartTypes: ['acquisition', 'retention', 'value_distribution', 'behavior']
  },
  {
    id: 'eventos',
    name: 'Eventos',
    description: 'Performance detalhada de eventos, bookings e conversões',
    icon: 'Calendar',
    color: 'green',
    primaryMetrics: ['bookings', 'conversion', 'capacity', 'revenue_per_event'],
    chartTypes: ['booking_trends', 'package_performance', 'capacity', 'seasonal']
  }
];

// Helper functions for category metrics
export const getCategoryConfig = (category: AnalyticsCategory): CategoryConfig => {
  return ANALYTICS_CATEGORIES.find(cat => cat.id === category) || ANALYTICS_CATEGORIES[0];
};

export const formatMetricValue = (value: number, type: 'currency' | 'percentage' | 'number' | 'days'): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'days':
      return `${Math.round(value)} dias`;
    case 'number':
    default:
      return value.toLocaleString('pt-BR');
  }
};

export const getMetricTrend = (current: number, previous: number): {
  value: number;
  direction: 'up' | 'down' | 'stable';
  color: 'green' | 'red' | 'gray';
} => {
  if (previous === 0) {
    return { value: 0, direction: 'stable', color: 'gray' };
  }
  
  const percentChange = ((current - previous) / previous) * 100;
  
  if (Math.abs(percentChange) < 1) {
    return { value: percentChange, direction: 'stable', color: 'gray' };
  }
  
  return {
    value: percentChange,
    direction: percentChange > 0 ? 'up' : 'down',
    color: percentChange > 0 ? 'green' : 'red'
  };
};