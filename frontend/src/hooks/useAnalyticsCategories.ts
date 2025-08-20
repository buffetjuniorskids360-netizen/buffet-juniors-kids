import { useState, useCallback, useMemo } from 'react';
import { 
  AnalyticsCategory, 
  CategoryMetrics, 
  OverallMetrics, 
  ClientMetrics, 
  EventMetrics 
} from '@/types/analytics';
import { useDashboardMetrics } from './useDashboardMetrics';
import { Event } from '@/types/event';
import { Client } from '@/types/client';

interface UseAnalyticsCategoriesState {
  selectedCategory: AnalyticsCategory;
  categoryMetrics: CategoryMetrics | null;
  loading: boolean;
  error: string | null;
}

export function useAnalyticsCategories() {
  const [selectedCategory, setSelectedCategory] = useState<AnalyticsCategory>('todas');
  const { metrics, loading, error, refreshMetrics } = useDashboardMetrics();

  // Calculate category-specific metrics
  const categoryMetrics = useMemo((): CategoryMetrics | null => {
    if (!metrics) return null;

    // Overall metrics (existing dashboard metrics enhanced)
    const overall: OverallMetrics = {
      totalRevenue: metrics.totalRevenue,
      monthlyRevenue: metrics.monthlyRevenue,
      quarterlyRevenue: metrics.quarterProjection,
      growthRate: metrics.growthRate,
      totalEvents: metrics.totalEvents,
      totalClients: metrics.totalClients,
      conversionRate: metrics.conversionRate,
      averageEventValue: metrics.averageEventValue,
      topPerformingPackage: metrics.popularPackages[0]?.package || 'N/A',
      busyMonth: getBusyMonth(metrics.revenueByMonth),
      revenueProjection: metrics.nextMonthProjection,
    };

    // Client-focused metrics
    const clients: ClientMetrics = calculateClientMetrics(metrics);

    // Event-focused metrics  
    const eventos: EventMetrics = calculateEventMetrics(metrics);

    return {
      todas: overall,
      clientes: clients,
      eventos: eventos,
    };
  }, [metrics]);

  const handleCategoryChange = useCallback((category: AnalyticsCategory) => {
    setSelectedCategory(category);
  }, []);

  const getCurrentCategoryMetrics = useCallback(() => {
    if (!categoryMetrics) return null;
    return categoryMetrics[selectedCategory];
  }, [categoryMetrics, selectedCategory]);

  return {
    selectedCategory,
    categoryMetrics,
    currentMetrics: getCurrentCategoryMetrics(),
    loading,
    error,
    handleCategoryChange,
    refreshMetrics,
  };
}

// Helper function to get the busiest month
function getBusyMonth(revenueByMonth: Array<{ month: string; revenue: number; events: number }>): string {
  if (!revenueByMonth.length) return 'N/A';
  
  const busiest = revenueByMonth.reduce((max, current) => 
    current.events > max.events ? current : max
  );
  
  return busiest.month;
}

// Calculate client-specific metrics
function calculateClientMetrics(dashboardMetrics: any): ClientMetrics {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = new Date(currentYear, currentMonth - 1);
  const monthStart = new Date(currentYear, currentMonth, 1);
  
  // Mock data for now - in real implementation, these would come from enhanced API calls
  // These calculations assume enhanced data structure from the backend
  
  const clientGrowthRate = dashboardMetrics.newClientsThisMonth > 0 && dashboardMetrics.totalClients > 0
    ? ((dashboardMetrics.newClientsThisMonth / dashboardMetrics.totalClients) * 100)
    : 0;

  const repeatClientRate = dashboardMetrics.totalClients > 0 && dashboardMetrics.totalEvents > 0
    ? Math.min(100, (dashboardMetrics.totalEvents / dashboardMetrics.totalClients) * 20) // Approximation
    : 0;

  const averageClientLifetime = 365; // Mock - would be calculated from real data
  const clientLifetimeValue = dashboardMetrics.totalRevenue / Math.max(1, dashboardMetrics.totalClients);

  return {
    totalClients: dashboardMetrics.totalClients,
    newClientsThisMonth: dashboardMetrics.newClientsThisMonth,
    newClientsLastMonth: Math.max(0, dashboardMetrics.newClientsThisMonth - 2), // Mock
    clientGrowthRate,
    activeClients: dashboardMetrics.activeClients,
    retentionRate: dashboardMetrics.clientRetentionRate,
    averageClientLifetime,
    clientLifetimeValue,
    repeatClientRate,
    
    // Top clients (mock data - would come from enhanced API)
    topClientsByRevenue: generateMockTopClients(dashboardMetrics),
    
    // Client acquisition trend (mock data)
    clientAcquisitionTrend: generateMockAcquisitionTrend(),
    
    // Client value distribution
    clientValueDistribution: generateClientValueDistribution(dashboardMetrics),
    
    // Preferred packages
    preferredPackages: dashboardMetrics.popularPackages.map((pkg: any) => ({
      packageType: pkg.package,
      clientCount: Math.round(pkg.count * 0.8), // Approximation
      averageValue: pkg.revenue / pkg.count,
    })),
    
    averageTimeBetweenEvents: 45, // Mock - would be calculated from real data
    seasonalClientActivity: generateSeasonalActivity(dashboardMetrics),
  };
}

// Calculate event-specific metrics
function calculateEventMetrics(dashboardMetrics: any): EventMetrics {
  const cancellationRate = dashboardMetrics.totalEvents > 0 
    ? (dashboardMetrics.cancelledEvents / dashboardMetrics.totalEvents) * 100
    : 0;

  const bookingConversionRate = dashboardMetrics.totalClients > 0
    ? (dashboardMetrics.totalEvents / dashboardMetrics.totalClients) * 100
    : 0;

  return {
    totalEvents: dashboardMetrics.totalEvents,
    monthlyEvents: dashboardMetrics.monthlyEvents,
    confirmedEvents: dashboardMetrics.confirmedEvents,
    pendingEvents: dashboardMetrics.pendingEvents,
    completedEvents: dashboardMetrics.completedEvents,
    cancelledEvents: dashboardMetrics.cancelledEvents,
    cancellationRate,
    
    averageEventValue: dashboardMetrics.averageEventValue,
    totalEventRevenue: dashboardMetrics.totalRevenue,
    monthlyEventRevenue: dashboardMetrics.monthlyRevenue,
    
    revenuePerEvent: dashboardMetrics.revenueByMonth.map((month: any) => ({
      month: month.month,
      revenue: month.revenue,
      eventCount: month.events,
      averageValue: month.events > 0 ? month.revenue / month.events : 0,
    })),
    
    bookingConversionRate,
    averageLeadTime: 14, // Mock - would be calculated from real booking data
    
    peakBookingDays: generatePeakBookingDays(),
    
    packagePerformance: dashboardMetrics.popularPackages.map((pkg: any) => ({
      packageType: pkg.package,
      count: pkg.count,
      revenue: pkg.revenue,
      averageValue: pkg.revenue / pkg.count,
      growthRate: Math.random() * 20 - 5, // Mock growth rate
    })),
    
    averageGuestsPerEvent: dashboardMetrics.averageGuestsPerEvent,
    capacityUtilization: 75, // Mock - would be calculated based on venue capacity
    
    guestCountDistribution: generateGuestDistribution(),
    
    seasonalEventPatterns: generateSeasonalPatterns(dashboardMetrics),
    
    eventTimingAnalysis: generateTimingAnalysis(),
    
    statusConversion: {
      pendingToConfirmed: 85, // Mock percentage
      confirmedToCompleted: 92, // Mock percentage
      cancellationsByStage: [
        { stage: 'Pending', count: Math.round(dashboardMetrics.cancelledEvents * 0.3), rate: 5 },
        { stage: 'Confirmed', count: Math.round(dashboardMetrics.cancelledEvents * 0.7), rate: 8 },
      ],
    },
  };
}

// Mock data generators (in real implementation, these would fetch from enhanced APIs)
function generateMockTopClients(metrics: any) {
  const clientNames = ['Maria Silva', 'João Santos', 'Ana Costa', 'Carlos Oliveira', 'Lucia Ferreira'];
  
  return clientNames.slice(0, 5).map((name, index) => ({
    id: `client-${index + 1}`,
    name,
    totalRevenue: (metrics.totalRevenue / 5) * (1 - index * 0.2),
    eventCount: Math.max(1, 5 - index),
    averageEventValue: metrics.averageEventValue * (1 + index * 0.1),
  }));
}

function generateMockAcquisitionTrend() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  
  return months.map(month => ({
    month,
    newClients: Math.floor(Math.random() * 10) + 5,
    retainedClients: Math.floor(Math.random() * 20) + 15,
    churnedClients: Math.floor(Math.random() * 3) + 1,
  }));
}

function generateClientValueDistribution(metrics: any) {
  const total = metrics.totalClients;
  
  return [
    {
      segment: 'Alto Valor',
      count: Math.round(total * 0.2),
      totalRevenue: metrics.totalRevenue * 0.6,
      percentage: 20,
    },
    {
      segment: 'Médio Valor',
      count: Math.round(total * 0.5),
      totalRevenue: metrics.totalRevenue * 0.3,
      percentage: 50,
    },
    {
      segment: 'Baixo Valor',
      count: Math.round(total * 0.3),
      totalRevenue: metrics.totalRevenue * 0.1,
      percentage: 30,
    },
  ];
}

function generateSeasonalActivity(metrics: any) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  
  return months.map(month => ({
    month,
    activeClients: Math.floor(Math.random() * 20) + 10,
    newEvents: Math.floor(Math.random() * 15) + 5,
  }));
}

function generatePeakBookingDays() {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const bookings = [10, 15, 12, 18, 25, 45, 35];
  const total = bookings.reduce((sum, count) => sum + count, 0);
  
  return days.map((day, index) => ({
    dayOfWeek: day,
    bookingCount: bookings[index],
    percentage: (bookings[index] / total) * 100,
  }));
}

function generateGuestDistribution() {
  return [
    { range: '1-25', count: 15, percentage: 25, averageRevenue: 1200 },
    { range: '26-50', count: 20, percentage: 33, averageRevenue: 2500 },
    { range: '51-100', count: 18, percentage: 30, averageRevenue: 4500 },
    { range: '100+', count: 7, percentage: 12, averageRevenue: 8000 },
  ];
}

function generateSeasonalPatterns(metrics: any) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  
  return months.map(month => ({
    month,
    eventCount: Math.floor(Math.random() * 15) + 5,
    revenue: Math.floor(Math.random() * 50000) + 20000,
    averageGuestCount: Math.floor(Math.random() * 30) + 40,
    popularPackages: ['Premium', 'Standard', 'Deluxe'],
  }));
}

function generateTimingAnalysis() {
  return [
    {
      timeSlot: 'Manhã',
      count: 8,
      averageRevenue: 2200,
      popularDays: ['Sábado', 'Domingo'],
    },
    {
      timeSlot: 'Tarde',
      count: 25,
      averageRevenue: 3500,
      popularDays: ['Sábado', 'Domingo'],
    },
    {
      timeSlot: 'Noite',
      count: 12,
      averageRevenue: 4200,
      popularDays: ['Sexta', 'Sábado'],
    },
  ];
}