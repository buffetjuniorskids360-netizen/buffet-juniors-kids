import { useState, useEffect, useCallback } from 'react';
import { 
  Payment, 
  CreatePaymentData, 
  UpdatePaymentData, 
  PaymentFilters, 
  PaymentsResponse,
  EventPaymentSummary,
  PaymentAnalytics
} from '@/types/payment';

const API_BASE = '/api/payments';

export function usePayments(filters: PaymentFilters = {}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaymentsResponse['pagination'] | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [methodFilter, setMethodFilter] = useState(filters.paymentMethod || '');
  const [eventFilter, setEventFilter] = useState(filters.eventId || '');
  const [dueDateFromFilter, setDueDateFromFilter] = useState(filters.dueDateFrom || '');
  const [dueDateToFilter, setDueDateToFilter] = useState(filters.dueDateTo || '');
  const [sortBy, setSortBy] = useState<'dueDate' | 'paymentDate' | 'amount' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (methodFilter) params.append('paymentMethod', methodFilter);
      if (eventFilter) params.append('eventId', eventFilter);
      if (dueDateFromFilter) params.append('dueDateFrom', dueDateFromFilter);
      if (dueDateToFilter) params.append('dueDateTo', dueDateToFilter);

      const response = await fetch(`${API_BASE}?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: PaymentsResponse = await response.json();
      
      // Convert date strings to Date objects
      const processedPayments = data.payments.map(payment => ({
        ...payment,
        ...(payment.paymentDate && { paymentDate: new Date(payment.paymentDate) }),
        ...(payment.dueDate && { dueDate: new Date(payment.dueDate) }),
        createdAt: new Date(payment.createdAt),
        updatedAt: new Date(payment.updatedAt),
        ...(payment.event && {
          event: {
            ...payment.event,
            date: new Date(payment.event.date),
          }
        }),
      }));

      setPayments(processedPayments);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pagamentos';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery, 
    statusFilter, 
    methodFilter, 
    eventFilter, 
    dueDateFromFilter, 
    dueDateToFilter, 
    sortBy, 
    sortOrder
  ]);

  // Load payments on mount and when filters change
  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const createPayment = async (paymentData: CreatePaymentData): Promise<Payment> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const newPayment = await response.json();
    
    // Convert date strings to Date objects
    const processedPayment = {
      ...newPayment,
      ...(newPayment.paymentDate && { paymentDate: new Date(newPayment.paymentDate) }),
      ...(newPayment.dueDate && { dueDate: new Date(newPayment.dueDate) }),
      createdAt: new Date(newPayment.createdAt),
      updatedAt: new Date(newPayment.updatedAt),
    };

    // Refresh the payments list
    await fetchPayments(currentPage);
    
    return processedPayment;
  };

  const updatePayment = async (paymentId: string, paymentData: UpdatePaymentData): Promise<Payment> => {
    const response = await fetch(`${API_BASE}/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const updatedPayment = await response.json();
    
    // Convert date strings to Date objects
    const processedPayment = {
      ...updatedPayment,
      ...(updatedPayment.paymentDate && { paymentDate: new Date(updatedPayment.paymentDate) }),
      ...(updatedPayment.dueDate && { dueDate: new Date(updatedPayment.dueDate) }),
      createdAt: new Date(updatedPayment.createdAt),
      updatedAt: new Date(updatedPayment.updatedAt),
    };

    // Refresh the payments list
    await fetchPayments(currentPage);
    
    return processedPayment;
  };

  const deletePayment = async (paymentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${paymentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Refresh the payments list
    await fetchPayments(currentPage);
  };

  const getPayment = async (paymentId: string): Promise<Payment> => {
    const response = await fetch(`${API_BASE}/${paymentId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const payment = await response.json();
    
    // Convert date strings to Date objects
    return {
      ...payment,
      ...(payment.paymentDate && { paymentDate: new Date(payment.paymentDate) }),
      ...(payment.dueDate && { dueDate: new Date(payment.dueDate) }),
      createdAt: new Date(payment.createdAt),
      updatedAt: new Date(payment.updatedAt),
      ...(payment.event && {
        event: {
          ...payment.event,
          date: new Date(payment.event.date),
        }
      }),
    };
  };

  const setSorting = (field: 'dueDate' | 'paymentDate' | 'amount' | 'createdAt', order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  const setPage = (page: number) => {
    fetchPayments(page);
  };

  const refreshPayments = () => {
    fetchPayments(currentPage);
  };

  return {
    payments,
    loading,
    error,
    pagination,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    eventFilter,
    setEventFilter,
    dueDateFromFilter,
    setDueDateFromFilter,
    dueDateToFilter,
    setDueDateToFilter,
    setSorting,
    setPage,
    createPayment,
    updatePayment,
    deletePayment,
    getPayment,
    refreshPayments,
  };
}

export function useEventPayments(eventId: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<EventPaymentSummary['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventPayments = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/event/${eventId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: EventPaymentSummary = await response.json();
      
      // Convert date strings to Date objects
      const processedPayments = data.payments.map(payment => ({
        ...payment,
        ...(payment.paymentDate && { paymentDate: new Date(payment.paymentDate) }),
        ...(payment.dueDate && { dueDate: new Date(payment.dueDate) }),
        createdAt: new Date(payment.createdAt),
        updatedAt: new Date(payment.updatedAt),
      }));

      setPayments(processedPayments);
      setSummary(data.summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pagamentos do evento';
      setError(errorMessage);
      console.error('Error fetching event payments:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventPayments();
  }, [fetchEventPayments]);

  const refreshEventPayments = () => {
    fetchEventPayments();
  };

  return {
    payments,
    summary,
    loading,
    error,
    refreshEventPayments,
  };
}

export function usePaymentAnalytics(period: string = '30') {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/analytics/summary?period=${period}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: PaymentAnalytics = await response.json();
      setAnalytics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar analytics de pagamentos';
      setError(errorMessage);
      console.error('Error fetching payment analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  return {
    analytics,
    loading,
    error,
    refreshAnalytics,
  };
}