import { 
  Payment, 
  CreatePaymentData, 
  UpdatePaymentData, 
  PaymentsResponse, 
  PaymentQueryParams,
  EventPaymentSummary,
  PaymentAnalytics 
} from '@/types/payment';

const API_BASE = '/api/payments';

// Helper function for API requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const paymentService = {
  // Get all payments with pagination and search
  async getPayments(params: PaymentQueryParams = {}): Promise<PaymentsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
    if (params.eventId) searchParams.append('eventId', params.eventId);
    if (params.dueDateFrom) searchParams.append('dueDateFrom', params.dueDateFrom);
    if (params.dueDateTo) searchParams.append('dueDateTo', params.dueDateTo);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE}?${searchParams.toString()}`;
    console.log('🔍 Fetching payments:', url);
    
    return apiRequest(url);
  },

  // Get single payment by ID
  async getPayment(id: string): Promise<Payment> {
    console.log('🔍 Fetching payment:', id);
    return apiRequest(`${API_BASE}/${id}`);
  },

  // Create new payment
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    console.log('➕ Creating payment:', data);
    return apiRequest(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update existing payment
  async updatePayment(id: string, data: UpdatePaymentData): Promise<Payment> {
    console.log('✏️ Updating payment:', id, data);
    return apiRequest(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete payment
  async deletePayment(id: string): Promise<void> {
    console.log('🗑️ Deleting payment:', id);
    return apiRequest(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
  },

  // Get payments for specific event
  async getEventPayments(eventId: string): Promise<EventPaymentSummary> {
    console.log('💰 Fetching event payments:', eventId);
    return apiRequest(`${API_BASE}/event/${eventId}`);
  },

  // Get payment analytics
  async getPaymentAnalytics(period: string = '30'): Promise<PaymentAnalytics> {
    console.log('📊 Fetching payment analytics:', period);
    return apiRequest(`${API_BASE}/analytics/summary?period=${period}`);
  },

  // Get detailed payment analytics with filters
  async getDetailedAnalytics(filters: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    status?: string;
    paymentMethod?: string;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    
    if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
    if (filters.clientId && filters.clientId !== 'all') searchParams.append('clientId', filters.clientId);
    if (filters.status) searchParams.append('status', filters.status);
    if (filters.paymentMethod) searchParams.append('paymentMethod', filters.paymentMethod);

    const url = `${API_BASE}/analytics/detailed?${searchParams.toString()}`;
    console.log('📊 Fetching detailed payment analytics:', url);
    
    return apiRequest(url);
  },
};

export default paymentService;