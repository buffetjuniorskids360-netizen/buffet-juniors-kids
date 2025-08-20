// Event types for the frontend
export interface Event {
  id: string;
  clientId: string;
  title: string;
  date: Date;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  guestsCount: number;
  packageType: string;
  totalValue: string; // Decimal as string for precision
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

export interface CreateEventData {
  clientId: string;
  title: string;
  date: string; // ISO string format
  startTime: string;
  endTime: string;
  guestsCount: number;
  packageType: string;
  totalValue: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface EventFilters {
  search?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EventQueryParams extends EventFilters {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'title' | 'createdAt' | 'totalValue';
  sortOrder?: 'asc' | 'desc';
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guestsCount: number;
  packageType: string;
  totalValue: string;
  clientName: string;
}

export interface CalendarResponse {
  year: number;
  month: number;
  events: CalendarEvent[];
}

// Package types commonly used in buffet business
export const PACKAGE_TYPES = [
  { value: 'basic', label: 'Básico', description: 'Festa simples com decoração padrão' },
  { value: 'standard', label: 'Padrão', description: 'Festa com decoração temática e animação' },
  { value: 'premium', label: 'Premium', description: 'Festa completa com decoração personalizada' },
  { value: 'deluxe', label: 'Deluxe', description: 'Festa de luxo com todos os extras inclusos' },
  { value: 'custom', label: 'Personalizado', description: 'Pacote sob medida para o cliente' },
] as const;

// Event status options with colors for UI
export const EVENT_STATUS = [
  { value: 'pending', label: 'Pendente', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  { value: 'completed', label: 'Concluído', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
] as const;

// Time slots commonly used for events
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
] as const;

// Utility functions
export const formatEventTime = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

export const formatEventDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatEventValue = (value: string): string => {
  const numValue = parseFloat(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

export const getStatusInfo = (status: Event['status']) => {
  return EVENT_STATUS.find(s => s.value === status) || EVENT_STATUS[0];
};

export const getPackageInfo = (packageType: string) => {
  return PACKAGE_TYPES.find(p => p.value === packageType) || { 
    value: packageType, 
    label: packageType, 
    description: 'Pacote personalizado' 
  };
};