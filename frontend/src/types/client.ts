// Client types for frontend
export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface ClientListResponse {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Form validation types
export interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface ClientFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}