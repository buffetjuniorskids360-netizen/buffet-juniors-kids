import { useState, useEffect, useCallback, useMemo } from 'react';
import { paymentService } from '@/services/paymentService';
import { eventService } from '@/services/eventService';
import { clientService } from '@/services/clientService';
import { 
  calculateFilteredMetrics,
  prepareExportData,
  generateCSVContent,
  downloadCSV,
  validateDateRange,
  generateTimePeriods,
  calculatePaymentDistribution,
  calculateEventStatusDistribution
} from '@/utils/reportUtils';

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  reportType: 'financial' | 'clients' | 'events' | 'payments';
  clientId?: string;
  status?: string;
  paymentMethod?: string;
}

interface ReportData {
  // Filtered KPIs
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  averageTicket: number;
  
  // Chart data
  revenueByPeriod: Array<{ period: string; revenue: number; expenses: number; profit: number; events: number }>;
  eventsByStatus: Array<{ status: string; count: number; color: string; percentage: number }>;
  paymentsByMethod: Array<{ method: string; count: number; amount: number; percentage: number }>;
  clientPerformance: Array<{ client: string; revenue: number; events: number; avgTicket: number }>;
  
  // Raw data for export
  rawPayments: any[];
  rawEvents: any[];
  rawClients: any[];
}

export function useReports() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    reportType: 'financial',
  });
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  // Auto-set date range based on period selection
  const setDateRange = useCallback((period: string) => {
    const today = new Date();
    const days = parseInt(period);
    const fromDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
    
    setFilters(prev => ({
      ...prev,
      dateFrom: fromDate.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
    }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch available clients for filtering
  const fetchClients = useCallback(async () => {
    try {
      const response = await clientService.getClients({ limit: 100 });
      setAvailableClients(response.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  // Main data fetching function
  const fetchReportData = useCallback(async () => {
    if (!filters.dateFrom || !filters.dateTo) return;

    setLoading(true);
    setError(null);

    try {
      // Build date range for API calls
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

      // Fetch data in parallel
      const [paymentsResponse, eventsResponse, clientsResponse] = await Promise.all([
        paymentService.getPayments({
          dueDateFrom: fromDate.toISOString(),
          dueDateTo: toDate.toISOString(),
          limit: 1000,
          ...(filters.status && { status: filters.status as any }),
          ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod as any }),
        }),
        eventService.getEvents({ 
          limit: 1000,
          sortBy: 'date',
          sortOrder: 'desc'
        }),
        clientService.getClients({ limit: 100 }),
      ]);

      const allPayments = paymentsResponse.payments || [];
      const allEvents = eventsResponse.events || [];
      const allClients = clientsResponse.clients || [];

      // Filter events by date range
      const filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= fromDate && eventDate <= toDate;
      });

      // Filter by client if specified
      let finalEvents = filteredEvents;
      let finalPayments = allPayments;

      if (filters.clientId && filters.clientId !== 'all') {
        finalEvents = filteredEvents.filter(event => event.clientId === filters.clientId);
        const eventIds = new Set(finalEvents.map(e => e.id));
        finalPayments = allPayments.filter(payment => eventIds.has(payment.eventId));
      }

      // Validate date range
      const dateValidationError = validateDateRange(filters.dateFrom, filters.dateTo);
      if (dateValidationError) {
        setError(dateValidationError);
        setLoading(false);
        return;
      }

      // Calculate financial metrics using utilities
      const metrics = calculateFilteredMetrics(finalPayments, finalEvents, filters.reportType);
      const { totalRevenue, totalExpenses, profit, averageTicket } = metrics;

      // Generate period-based data for charts
      const periods = generateTimePeriods(fromDate, toDate);
      const revenueByPeriod = periods.map(period => {
        const periodPayments = finalPayments.filter(payment => {
          const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.createdAt);
          return paymentDate >= period.start && paymentDate < period.end && payment.status === 'paid';
        });
        
        const periodEvents = finalEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= period.start && eventDate < period.end;
        });

        const revenue = periodPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const expenses = revenue * 0.3; // 30% estimated expense rate
        
        return {
          period: period.label,
          revenue,
          expenses,
          profit: revenue - expenses,
          events: periodEvents.length,
        };
      });

      // Event status distribution using utility
      const eventsByStatus = calculateEventStatusDistribution(finalEvents);

      // Payment method distribution using utility
      const paymentsByMethod = calculatePaymentDistribution(finalPayments);

      // Client performance (top 10)
      const clientPerformanceMap = finalEvents.reduce((acc, event) => {
        const clientId = event.clientId;
        const client = allClients.find(c => c.id === clientId);
        const clientName = client?.name || 'Cliente Desconhecido';
        
        if (!acc[clientId]) {
          acc[clientId] = { 
            client: clientName, 
            revenue: 0, 
            events: 0, 
            avgTicket: 0 
          };
        }
        
        acc[clientId].events += 1;
        acc[clientId].revenue += parseFloat(event.totalValue);
        acc[clientId].avgTicket = acc[clientId].revenue / acc[clientId].events;
        
        return acc;
      }, {} as Record<string, any>);

      const clientPerformance = Object.values(clientPerformanceMap)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

      const newReportData: ReportData = {
        totalRevenue,
        totalExpenses,
        profit,
        averageTicket,
        revenueByPeriod,
        eventsByStatus,
        paymentsByMethod,
        clientPerformance,
        rawPayments: finalPayments,
        rawEvents: finalEvents,
        rawClients: allClients,
      };

      setReportData(newReportData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch report data';
      setError(errorMessage);
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);


  // Export functionality using utilities
  const exportToCSV = useCallback(() => {
    if (!reportData) return;

    const exportData = prepareExportData(
      filters.reportType,
      reportData.rawPayments,
      reportData.rawEvents,
      reportData.rawClients,
      filters
    );

    const csvContent = generateCSVContent(exportData);
    downloadCSV(csvContent, exportData.filename);
  }, [reportData, filters]);

  // Initialize
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Refresh data when filters change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Memoized filtered data for performance
  const filteredReportData = useMemo(() => {
    if (!reportData) return null;

    // Apply report type specific filtering
    if (filters.reportType === 'financial') {
      return {
        ...reportData,
        // Only show financial metrics
      };
    }

    return reportData;
  }, [reportData, filters.reportType]);

  return {
    filters,
    reportData: filteredReportData,
    loading,
    error,
    availableClients,
    updateFilters,
    setDateRange,
    exportToCSV,
    refreshData: fetchReportData,
  };
}