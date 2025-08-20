import { useState, useEffect, useCallback } from 'react';
import { Event, CreateEventData, UpdateEventData, EventFilters, EventsResponse, CalendarResponse } from '@/types/event';

const API_BASE = '/api/events';

export function useEvents(filters: EventFilters = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<EventsResponse['pagination'] | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [clientFilter, setClientFilter] = useState(filters.clientId || '');
  const [dateFromFilter, setDateFromFilter] = useState(filters.dateFrom || '');
  const [dateToFilter, setDateToFilter] = useState(filters.dateTo || '');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'createdAt' | 'totalValue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEvents = useCallback(async (page = 1) => {
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
      if (clientFilter) params.append('clientId', clientFilter);
      if (dateFromFilter) params.append('dateFrom', dateFromFilter);
      if (dateToFilter) params.append('dateTo', dateToFilter);

      const response = await fetch(`${API_BASE}?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: EventsResponse = await response.json();
      
      // Convert date strings to Date objects
      const processedEvents = data.events.map(event => ({
        ...event,
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      }));

      setEvents(processedEvents);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, clientFilter, dateFromFilter, dateToFilter, sortBy, sortOrder]);

  // Load events on mount and when filters change
  useEffect(() => {
    fetchEvents(1);
  }, [fetchEvents]);

  const createEvent = async (eventData: CreateEventData): Promise<Event> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const newEvent = await response.json();
    
    // Convert date strings to Date objects
    const processedEvent = {
      ...newEvent,
      date: new Date(newEvent.date),
      createdAt: new Date(newEvent.createdAt),
      updatedAt: new Date(newEvent.updatedAt),
    };

    // Optimistic update: Add new event to the list
    setEvents(currentEvents => [processedEvent, ...currentEvents]);
    
    return processedEvent;
  };

  const updateEvent = async (eventId: string, eventData: UpdateEventData): Promise<Event> => {
    // Store previous state for rollback
    const previousEvents = events;
    
    // Optimistic update: Update event in the list immediately
    setEvents(currentEvents => 
      currentEvents.map(event => 
        event.id === eventId 
          ? { ...event, ...eventData, date: eventData.date ? new Date(eventData.date) : event.date, updatedAt: new Date() }
          : event
      )
    );

    try {
      const response = await fetch(`${API_BASE}/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        // Rollback on error
        setEvents(previousEvents);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const updatedEvent = await response.json();
      
      // Convert date strings to Date objects
      const processedEvent = {
        ...updatedEvent,
        date: new Date(updatedEvent.date),
        createdAt: new Date(updatedEvent.createdAt),
        updatedAt: new Date(updatedEvent.updatedAt),
      };

      // Update with server response (in case server modified the data)
      setEvents(currentEvents => 
        currentEvents.map(event => 
          event.id === eventId ? processedEvent : event
        )
      );
      
      return processedEvent;
    } catch (error) {
      // Rollback already happened above if network error
      throw error;
    }
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    // Store previous state for rollback
    const previousEvents = events;
    const deletedEvent = events.find(event => event.id === eventId);
    
    // Optimistic update: Remove event from the list immediately
    setEvents(currentEvents => 
      currentEvents.filter(event => event.id !== eventId)
    );

    try {
      const response = await fetch(`${API_BASE}/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        // Rollback on error
        setEvents(previousEvents);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      // Delete successful - no need to update state, already removed optimistically
    } catch (error) {
      // Rollback already happened above if network error
      throw error;
    }
  };

  const getEvent = async (eventId: string): Promise<Event> => {
    const response = await fetch(`${API_BASE}/${eventId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const event = await response.json();
    
    // Convert date strings to Date objects
    return {
      ...event,
      date: new Date(event.date),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    };
  };

  const setSorting = (field: 'date' | 'title' | 'createdAt' | 'totalValue', order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  const setPage = (page: number) => {
    fetchEvents(page);
  };

  const refreshEvents = () => {
    fetchEvents(currentPage);
  };

  return {
    events,
    loading,
    error,
    pagination,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    setSorting,
    setPage,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    refreshEvents,
  };
}

export function useCalendarEvents(year: number, month: number) {
  const [events, setEvents] = useState<CalendarResponse['events']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/calendar/${year}/${month}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: CalendarResponse = await response.json();
      
      // Convert date strings to Date objects
      const processedEvents = data.events.map(event => ({
        ...event,
        date: new Date(event.date),
      }));

      setEvents(processedEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos do calendário';
      setError(errorMessage);
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  const refreshCalendarEvents = () => {
    fetchCalendarEvents();
  };

  return {
    events,
    loading,
    error,
    refreshCalendarEvents,
  };
}