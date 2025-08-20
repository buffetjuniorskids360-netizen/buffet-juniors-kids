import { 
  Event, 
  CreateEventData, 
  UpdateEventData, 
  EventsResponse, 
  EventQueryParams,
  CalendarResponse 
} from '@/types/event';

const API_BASE = '/api/events';

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

export const eventService = {
  // Get all events with pagination and search
  async getEvents(params: EventQueryParams = {}): Promise<EventsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.clientId) searchParams.append('clientId', params.clientId);
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.append('dateTo', params.dateTo);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE}?${searchParams.toString()}`;
    console.log('🔍 Fetching events:', url);
    
    return apiRequest(url);
  },

  // Get single event by ID
  async getEvent(id: string): Promise<Event> {
    console.log('🔍 Fetching event:', id);
    return apiRequest(`${API_BASE}/${id}`);
  },

  // Create new event
  async createEvent(data: CreateEventData): Promise<Event> {
    console.log('➕ Creating event:', data.title);
    return apiRequest(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update existing event
  async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
    console.log('✏️ Updating event:', id, data);
    return apiRequest(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    console.log('🗑️ Deleting event:', id);
    return apiRequest(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
  },

  // Get events for calendar view
  async getCalendarEvents(year: number, month: number): Promise<CalendarResponse> {
    console.log('📅 Fetching calendar events:', year, month);
    return apiRequest(`${API_BASE}/calendar/${year}/${month}`);
  },
};

export default eventService;