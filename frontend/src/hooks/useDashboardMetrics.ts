import { useState, useEffect, useCallback, useMemo } from 'react';
import { paymentService } from '@/services/paymentService';
import { eventService } from '@/services/eventService';
import { clientService } from '@/services/clientService';

interface DashboardMetrics {
  // Financial KPIs
  totalRevenue: number;
  monthlyRevenue: number;
  projectedRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  paymentRate: number;
  averageEventValue: number;
  
  // Event KPIs
  totalEvents: number;
  monthlyEvents: number;
  confirmedEvents: number;
  pendingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  
  // Client KPIs
  totalClients: number;
  newClientsThisMonth: number;
  activeClients: number;
  clientRetentionRate: number;
  
  // Business Performance
  conversionRate: number;
  averageGuestsPerEvent: number;
  popularPackages: Array<{ package: string; count: number; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; events: number }>;
  paymentMethodDistribution: Array<{ method: string; count: number; amount: number }>;
  
  // Forecasting
  nextMonthProjection: number;
  quarterProjection: number;
  growthRate: number;
  seasonalTrends: Array<{ month: string; factor: number }>;
}

interface UseDashboardMetricsState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Cache for dashboard data to prevent unnecessary API calls
const metricsCache = {
  data: null as DashboardMetrics | null,
  timestamp: 0,
  maxAge: 2 * 60 * 1000, // 2 minutes cache
};

const isCacheValid = () => {
  return metricsCache.data && (Date.now() - metricsCache.timestamp) < metricsCache.maxAge;
};

export function useDashboardMetrics(refreshInterval: number = 5 * 60 * 1000) { // 5 minutes default
  const [state, setState] = useState<UseDashboardMetricsState>({
    metrics: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchMetrics = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh && isCacheValid()) {
        setState({
          metrics: metricsCache.data,
          loading: false,
          error: null,
          lastUpdated: new Date(metricsCache.timestamp),
        });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch data in parallel with optimized limits for better performance
      const [paymentAnalytics, events, clients] = await Promise.all([
        paymentService.getPaymentAnalytics('30'), // Reduced to 30 days for faster loading
        eventService.getEvents({ limit: 50, sortBy: 'date', sortOrder: 'desc' }), // Reduced limit
        clientService.getClients({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }), // Reduced limit
      ]);

      // Calculate current date ranges
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = new Date(currentYear, currentMonth - 1);
      const monthStart = new Date(currentYear, currentMonth, 1);
      
      // Process events data
      const allEvents = events.events || [];
      const monthlyEvents = allEvents.filter(event => 
        new Date(event.date) >= monthStart
      );
      
      // Financial calculations
      const totalRevenue = allEvents
        .filter(e => e.status === 'completed' || e.status === 'confirmed')
        .reduce((sum, event) => sum + parseFloat(event.totalValue), 0);
      
      const monthlyRevenue = monthlyEvents
        .filter(e => e.status === 'completed' || e.status === 'confirmed')
        .reduce((sum, event) => sum + parseFloat(event.totalValue), 0);
      
      const projectedRevenue = allEvents
        .filter(e => e.status === 'confirmed' || e.status === 'pending')
        .filter(e => new Date(e.date) > now)
        .reduce((sum, event) => sum + parseFloat(event.totalValue), 0);
      
      // Payment calculations
      const pendingPayments = paymentAnalytics.paymentsByStatus?.pending?.amount || 0;
      const overduePayments = paymentAnalytics.overduePayments?.totalAmount || 0;
      const paidAmount = paymentAnalytics.paymentsByStatus?.paid?.amount || 0;
      const paymentRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;
      
      // Event statistics
      const eventsByStatus = allEvents.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Client calculations
      const allClients = clients.clients || [];
      const newClientsThisMonth = allClients.filter(client => 
        new Date(client.createdAt) >= monthStart
      ).length;
      
      // Calculate client activity (clients with events in last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const activeClientIds = new Set(
        allEvents
          .filter(event => new Date(event.date) >= sixMonthsAgo)
          .map(event => event.clientId)
      );
      
      // Package popularity
      const packageCounts = allEvents.reduce((acc, event) => {
        const pkg = event.packageType;
        if (!acc[pkg]) {
          acc[pkg] = { count: 0, revenue: 0 };
        }
        acc[pkg].count += 1;
        acc[pkg].revenue += parseFloat(event.totalValue);
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);
      
      const popularPackages = Object.entries(packageCounts)
        .map(([pkg, data]) => ({ package: pkg, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Revenue by month (last 12 months)
      const revenueByMonth = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 1);
        
        const monthEvents = allEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= monthDate && eventDate < nextMonthDate;
        });
        
        const monthRevenue = monthEvents
          .filter(e => e.status === 'completed' || e.status === 'confirmed')
          .reduce((sum, event) => sum + parseFloat(event.totalValue), 0);
        
        revenueByMonth.push({
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          revenue: monthRevenue,
          events: monthEvents.length,
        });
      }
      
      // Payment method distribution
      const paymentMethodDistribution = Object.entries(paymentAnalytics.paymentsByMethod || {})
        .map(([method, data]) => ({
          method: method.toUpperCase(),
          count: data.count,
          amount: data.amount,
        }));
      
      // Growth calculations
      const lastMonthRevenue = revenueByMonth[revenueByMonth.length - 2]?.revenue || 0;
      const growthRate = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
      
      // Simple projections based on current trends
      const avgMonthlyRevenue = revenueByMonth
        .slice(-3)
        .reduce((sum, month) => sum + month.revenue, 0) / 3;
      
      const nextMonthProjection = avgMonthlyRevenue * (1 + (growthRate / 100));
      const quarterProjection = nextMonthProjection * 3;
      
      // Build metrics object
      const metrics: DashboardMetrics = {
        // Financial KPIs
        totalRevenue,
        monthlyRevenue,
        projectedRevenue,
        pendingPayments,
        overduePayments,
        paymentRate,
        averageEventValue: allEvents.length > 0 ? totalRevenue / allEvents.length : 0,
        
        // Event KPIs
        totalEvents: allEvents.length,
        monthlyEvents: monthlyEvents.length,
        confirmedEvents: eventsByStatus.confirmed || 0,
        pendingEvents: eventsByStatus.pending || 0,
        completedEvents: eventsByStatus.completed || 0,
        cancelledEvents: eventsByStatus.cancelled || 0,
        
        // Client KPIs
        totalClients: allClients.length,
        newClientsThisMonth,
        activeClients: activeClientIds.size,
        clientRetentionRate: allClients.length > 0 ? (activeClientIds.size / allClients.length) * 100 : 0,
        
        // Business Performance
        conversionRate: allClients.length > 0 ? (allEvents.length / allClients.length) * 100 : 0,
        averageGuestsPerEvent: allEvents.length > 0 
          ? allEvents.reduce((sum, event) => sum + event.guestsCount, 0) / allEvents.length 
          : 0,
        popularPackages,
        revenueByMonth,
        paymentMethodDistribution,
        
        // Forecasting
        nextMonthProjection,
        quarterProjection,
        growthRate,
        seasonalTrends: [], // Could be enhanced with more data
      };

      // Cache the results
      metricsCache.data = metrics;
      metricsCache.timestamp = Date.now();

      setState({
        metrics,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard metrics';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error('Error fetching dashboard metrics:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Set up refresh interval separately to handle refreshInterval changes properly
  useEffect(() => {
    if (refreshInterval <= 0) return; // No interval if refreshInterval is 0 or negative
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchMetrics, refreshInterval]);

  const refreshMetrics = useCallback((forceRefresh = false) => {
    fetchMetrics(forceRefresh);
  }, [fetchMetrics]);

  return {
    ...state,
    refreshMetrics,
  };
}